import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Moon, Sun, Trash2, User, Globe, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { loadProfileName, saveProfileName } from "@/lib/mock-data";
import { useTheme } from "next-themes";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — VerifSnap Shelby" }] }),
  component: Settings,
});

function Settings() {
  const { account } = useWallet();
  const addr = account?.address?.toString() ?? "";
  const shortAddr = addr ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : "";

  const { theme, setTheme } = useTheme();
  const [confirm, setConfirm] = useState(false);
  const [network, setNetwork] = useState(() => {
    if (typeof window === "undefined") return "testnet";
    return localStorage.getItem("verifsnap_network") || "testnet";
  });

  // Profile name — loaded from Supabase
  const [displayName, setDisplayName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [loadingName, setLoadingName] = useState(true);

  useEffect(() => {
    if (!addr) {
      setLoadingName(false);
      return;
    }
    loadProfileName(addr).then((name) => {
      if (name) {
        setDisplayName(name);
        setSavedName(name);
      }
      setLoadingName(false);
    });
  }, [addr]);

  const handleSaveName = async () => {
    if (!addr || !displayName.trim()) return;
    setSavingName(true);
    await saveProfileName(addr, displayName.trim());
    setSavedName(displayName.trim());
    toast.success("Profile name saved!");
    setSavingName(false);
  };

  const isDirty = displayName.trim() !== savedName;

  return (
    <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Settings</h1>
      <p className="text-sm text-muted-foreground mt-1">Manage your profile and preferences.</p>

      {/* ── Profile ─────────────────────────────────────────────────────────── */}
      <Section title="Profile" icon={User}>
        {/* Avatar + wallet address */}
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 grid place-items-center text-base font-semibold uppercase select-none">
            {(displayName || shortAddr).slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{shortAddr || "Not connected"}</div>
            <div className="text-xs text-muted-foreground mt-0.5">Aptos Wallet</div>
          </div>
        </div>

        {/* Display name — synced to Supabase */}
        <div className="mt-5">
          <label className="block text-xs text-muted-foreground mb-1.5">Display Name</label>
          {loadingName ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
            </div>
          ) : (
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter a display name (optional)"
              className="w-full rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition max-w-sm"
            />
          )}
          <p className="text-[11px] text-muted-foreground mt-1.5">
            This name will appear in your sidebar instead of your wallet address. Synced across all
            devices.
          </p>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveName}
            disabled={!isDirty || savingName || !addr}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40 transition shadow-glow"
          >
            {savingName ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            {savingName ? "Saving…" : "Save profile"}
          </button>
        </div>
      </Section>

      {/* ── Theme ────────────────────────────────────────────────────────────── */}
      <Section title="Theme" icon={Moon}>
        <div className="grid grid-cols-3 gap-2 max-w-sm">
          {[
            { v: "system", l: "System", I: Sun },
            { v: "dark", l: "Dark", I: Moon },
            { v: "light", l: "Light", I: Sun },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => setTheme(o.v)}
              className={[
                "rounded-xl border px-3 py-3 text-xs transition flex flex-col items-center gap-1.5",
                theme === o.v
                  ? "border-primary/50 bg-primary/10 text-foreground"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:bg-card",
              ].join(" ")}
            >
              <o.I className="h-4 w-4" />
              {o.l}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Network ──────────────────────────────────────────────────────────── */}
      <Section title="Network Configuration" icon={Globe}>
        <p className="text-xs text-muted-foreground mb-3">
          Select the blockchain network to save and verify webpage snapshots. Default is{" "}
          <strong>Testnet</strong>.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
          {[
            {
              v: "testnet",
              l: "Testnet",
              desc: "Standard network for developer testing with free public faucets.",
              badge: "Stable Default",
            },
            {
              v: "shelbynet",
              l: "ShelbyNet",
              desc: "Decentralized high-performance storage network with optimized fees.",
              badge: "Shelby Protocol",
            },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => {
                if (network !== o.v) {
                  localStorage.setItem("verifsnap_network", o.v);
                  setNetwork(o.v);
                  toast.success(`Network changed to ${o.l}. Reloading…`);
                  setTimeout(() => window.location.reload(), 1200);
                }
              }}
              className={[
                "text-left rounded-xl border p-4 text-xs transition flex flex-col gap-2 cursor-pointer",
                network === o.v
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:bg-card/60 hover:text-foreground",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm">{o.l}</span>
                <span
                  className={[
                    "rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wide uppercase shrink-0",
                    network === o.v
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground",
                  ].join(" ")}
                >
                  {o.badge}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{o.desc}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Danger zone ──────────────────────────────────────────────────────── */}
      <Section title="Danger zone" icon={Trash2} danger>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium">Delete account</div>
            <div className="text-xs text-muted-foreground">
              All archives will be removed after 30 days.
            </div>
          </div>
          <button
            onClick={() => setConfirm(true)}
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/20"
          >
            Delete account
          </button>
        </div>
      </Section>

      {/* Confirm modal */}
      {confirm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4"
          onClick={() => setConfirm(false)}
        >
          <div
            className="w-full max-w-md glass-strong rounded-2xl p-6 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Are you sure?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This action is irreversible. Your archives will be queued for deletion.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirm(false)}
                className="rounded-lg border border-border/60 px-4 py-2 text-sm hover:bg-accent"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirm(false);
                  toast.error("Account scheduled for deletion");
                }}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90"
              >
                Delete forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  danger,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={`mt-6 rounded-2xl border ${
        danger ? "border-destructive/30 bg-destructive/5" : "border-border/60 bg-card/40"
      } p-6`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${danger ? "text-destructive" : "text-muted-foreground"}`} />
        <h2 className={`text-sm font-semibold ${danger ? "text-destructive" : ""}`}>{title}</h2>
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </section>
  );
}
