import { supabase } from "./supabase";

export type ArchiveStatus = "ready" | "capturing" | "failed";

export interface Archive {
  id: string;
  url: string;
  title: string;
  domain: string;
  favicon: string;
  thumbnail: string;
  timestamp: string;
  status: ArchiveStatus;
  tracking: boolean;
  collection?: string;
  sizeMb: number;
  versions: number;
}

// Legacy LocalStorage fallback for guests
export function getSavedArchives(): Archive[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("verifsnap_archives");
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveArchive(a: Archive) {
  if (typeof window === "undefined") return;
  const current = getSavedArchives();
  // Avoid duplicate ID
  const next = [a, ...current.filter((x) => x.id !== a.id)];
  localStorage.setItem("verifsnap_archives", JSON.stringify(next));
}

export function deleteArchive(id: string) {
  if (typeof window === "undefined") return;
  const current = getSavedArchives();
  const next = current.filter((x) => x.id !== id);
  localStorage.setItem("verifsnap_archives", JSON.stringify(next));
}

// Supabase Async Operations
export async function fetchArchives(walletAddress: string): Promise<Archive[]> {
  if (!walletAddress) return [];
  const { data, error } = await supabase
    .from("archives")
    .select("*")
    .eq("wallet_address", walletAddress)
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Error fetching archives:", error);
    return [];
  }
  return data as Archive[];
}

export async function insertArchive(archive: Archive, walletAddress: string) {
  if (!walletAddress) return;
  const { error } = await supabase.from("archives").insert({
    ...archive,
    wallet_address: walletAddress,
  });
  if (error) {
    console.error("Error inserting archive:", error);
    throw error;
  }
}

export async function insertActivity(
  walletAddress: string,
  status: "success" | "failed",
  details: string,
) {
  if (!walletAddress) return;
  const { error } = await supabase.from("activities").insert({
    wallet_address: walletAddress,
    status,
    details,
  });
  if (error) {
    console.error("Error inserting activity:", error);
  }
}

// Static export for compatibility and SSR fallback
export const archives: Archive[] = [];

// Default seed collections for new users (stored in localStorage on the client)
export const defaultCollections: { name: string; color: string; icon: string }[] = [
  { name: "Personal", color: "oklch(0.78 0.13 215)", icon: "User" },
  { name: "Work", color: "oklch(0.72 0.16 155)", icon: "Briefcase" },
  { name: "Shopping", color: "oklch(0.80 0.15 75)", icon: "ShoppingBag" },
  { name: "Research", color: "oklch(0.74 0.14 280)", icon: "Microscope" },
  { name: "Legal", color: "oklch(0.70 0.18 25)", icon: "Scale" },
];

// Preset colour palette for new collections
export const collectionColors = [
  "oklch(0.78 0.13 215)",
  "oklch(0.72 0.16 155)",
  "oklch(0.80 0.15 75)",
  "oklch(0.74 0.14 280)",
  "oklch(0.70 0.18 25)",
  "oklch(0.76 0.14 330)",
  "oklch(0.75 0.12 60)",
  "oklch(0.68 0.16 190)",
];

export const storageActivity: { day: string; snapshots: number }[] = [];

// ── Profile name sync via Supabase ────────────────────────────────────────────
const PROFILE_META_STATUS = "__profile_meta__";

export async function loadProfileName(walletAddress: string): Promise<string | null> {
  if (!walletAddress) return null;
  const { data, error } = await supabase
    .from("activities")
    .select("details")
    .eq("wallet_address", walletAddress)
    .eq("status", PROFILE_META_STATUS)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;
  try {
    const parsed = JSON.parse(data[0].details);
    return parsed.name ?? null;
  } catch {
    return null;
  }
}

export async function saveProfileName(walletAddress: string, name: string): Promise<void> {
  if (!walletAddress) return;
  const { error } = await supabase.from("activities").insert({
    wallet_address: walletAddress,
    status: PROFILE_META_STATUS,
    details: JSON.stringify({ name }),
  });
  if (error) console.error("Error saving profile name:", error);
}

// ── Collection metadata sync via Supabase ─────────────────────────────────────
// We piggyback on the existing `activities` table using a special internal status
// marker so that collection config (name / color / icon) is synced across devices
// without needing a new table.
const COL_META_STATUS = "__col_meta__";

export interface ColMeta {
  name: string;
  color: string;
  icon: string;
}

/**
 * Load the latest collection metadata snapshot for a wallet from Supabase.
 * Falls back to null so the caller can seed defaults on first use.
 */
export async function loadCollectionsMeta(walletAddress: string): Promise<ColMeta[] | null> {
  if (!walletAddress) return null;
  const { data, error } = await supabase
    .from("activities")
    .select("details")
    .eq("wallet_address", walletAddress)
    .eq("status", COL_META_STATUS)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error loading collection meta:", error);
    return null;
  }
  if (!data || data.length === 0) return null;
  try {
    return JSON.parse(data[0].details) as ColMeta[];
  } catch {
    return null;
  }
}

/**
 * Persist the full collection metadata list for a wallet to Supabase.
 * Each save appends a new row; the latest row always wins on read.
 */
export async function saveCollectionsMeta(walletAddress: string, cols: ColMeta[]): Promise<void> {
  if (!walletAddress) return;
  const { error } = await supabase.from("activities").insert({
    wallet_address: walletAddress,
    status: COL_META_STATUS,
    details: JSON.stringify(cols),
  });
  if (error) {
    console.error("Error saving collection meta:", error);
  }
}

export function relativeTime(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

export interface Activity {
  id: string;
  wallet_address: string;
  status: "success" | "failed";
  details: string;
  created_at: string;
}

export async function fetchActivities(walletAddress: string, limit = 20): Promise<Activity[]> {
  if (!walletAddress) return [];
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("wallet_address", walletAddress)
    .not("status", "in", '("__col_meta__","__profile_meta__")') // exclude internal config rows
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
  return data as Activity[];
}
