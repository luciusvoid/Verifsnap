import { createFileRoute, Link } from "@tanstack/react-router";
import {
  fetchArchives,
  loadCollectionsMeta,
  saveCollectionsMeta,
  defaultCollections,
  collectionColors,
  Archive,
  ColMeta,
  relativeTime,
} from "@/lib/mock-data";
import {
  User,
  Briefcase,
  ShoppingBag,
  Microscope,
  Scale,
  Plus,
  FolderOpen,
  ArrowLeft,
  Trash2,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { toast } from "sonner";

// ── Icon registry ─────────────────────────────────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
  User,
  Briefcase,
  ShoppingBag,
  Microscope,
  Scale,
  FolderOpen,
};

const iconOptions = [
  { value: "FolderOpen", label: "Folder", Icon: FolderOpen },
  { value: "User", label: "Personal", Icon: User },
  { value: "Briefcase", label: "Work", Icon: Briefcase },
  { value: "ShoppingBag", label: "Shopping", Icon: ShoppingBag },
  { value: "Microscope", label: "Research", Icon: Microscope },
  { value: "Scale", label: "Legal", Icon: Scale },
];

// ── Route ──────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/dashboard/collections")({
  head: () => ({ meta: [{ title: "Collections — VerifSnap Shelby" }] }),
  component: Collections,
});

// ── Component ──────────────────────────────────────────────────────────────────
function Collections() {
  const { account } = useWallet();
  const addr = account?.address?.toString() ?? "";

  const [archiveList, setArchiveList] = useState<Archive[]>([]);
  const [colMeta, setColMeta] = useState<ColMeta[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(collectionColors[0]);
  const [newIcon, setNewIcon] = useState("FolderOpen");
  const [saving, setSaving] = useState(false);

  // Drill-down
  const [activeCol, setActiveCol] = useState<ColMeta | null>(null);

  // ── Load data from Supabase on wallet connect ────────────────────────────────
  useEffect(() => {
    if (!addr) {
      setLoading(false);
      return;
    }
    setLoading(true);

    Promise.all([fetchArchives(addr), loadCollectionsMeta(addr)])
      .then(([archives, meta]) => {
        setArchiveList(archives);

        if (meta && meta.length > 0) {
          // ✅ Loaded from Supabase — fully synced
          setColMeta(meta);
        } else {
          // First time: seed defaults then save to Supabase for cross-device sync
          const seed: ColMeta[] = defaultCollections.map((c) => ({
            name: c.name,
            color: c.color,
            icon: c.icon,
          }));
          setColMeta(seed);
          saveCollectionsMeta(addr, seed); // fire-and-forget
        }
      })
      .finally(() => setLoading(false));
  }, [addr]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const persist = async (updated: ColMeta[]) => {
    setColMeta(updated);
    await saveCollectionsMeta(addr, updated);
  };

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (colMeta.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("A collection with this name already exists");
      return;
    }
    setSaving(true);
    const newCol: ColMeta = { name: trimmed, color: newColor, icon: newIcon };
    await persist([...colMeta, newCol]);
    toast.success(`Collection "${trimmed}" created`);
    setSaving(false);
    setShowModal(false);
    setNewName("");
    setNewColor(collectionColors[0]);
    setNewIcon("FolderOpen");
  };

  const handleDelete = async (col: ColMeta) => {
    if (!confirm(`Delete "${col.name}"? Archives in it won't be deleted, just uncategorised.`))
      return;
    await persist(colMeta.filter((c) => c.name !== col.name));
    if (activeCol?.name === col.name) setActiveCol(null);
    toast.success(`Collection "${col.name}" deleted`);
  };

  // Enrich with archive counts
  const enriched = colMeta.map((c) => ({
    ...c,
    count: archiveList.filter((a) => a.collection === c.name).length,
  }));

  const activeArchives = activeCol
    ? archiveList.filter((a) => a.collection === activeCol.name)
    : [];

  // ── Drill-down view ───────────────────────────────────────────────────────────
  if (activeCol) {
    const Icon = iconMap[activeCol.icon] ?? FolderOpen;
    return (
      <div className="px-4 md:px-8 py-8">
        <button
          onClick={() => setActiveCol(null)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Collections
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div
            className="grid h-10 w-10 place-items-center rounded-xl ring-1 shrink-0 bg-[var(--col-bg)] text-[var(--col-fg)] border-[var(--col-border)]"
            style={
              Object.assign(
                {},
                {
                  "--col-bg": `color-mix(in oklch, ${activeCol.color} 18%, transparent)`,
                  "--col-fg": activeCol.color,
                  "--col-border": activeCol.color,
                },
              ) as React.CSSProperties
            }
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{activeCol.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeArchives.length} archive{activeArchives.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {activeArchives.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/20 p-12 text-center">
            <FolderOpen className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No archives in this collection yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              When creating a snapshot, select this collection to organise it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeArchives.map((a) => (
              <Link
                key={a.id}
                to="/dashboard/archive/$id"
                params={{ id: a.id }}
                className="group rounded-2xl border border-border/60 bg-card/40 overflow-hidden hover:bg-card/70 hover:border-border transition shadow-card"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted/40">
                  <img
                    src={a.thumbnail}
                    alt={a.title}
                    className="h-full w-full object-cover group-hover:scale-[1.02] transition duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md glass px-2 py-1 text-[10px]">
                    <img src={a.favicon} alt="" className="h-3 w-3 rounded-sm" />
                    {a.domain}
                  </div>
                </div>
                <div className="p-4">
                  <div className="line-clamp-1 text-sm font-medium">{a.title}</div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{relativeTime(a.timestamp)}</span>
                    <span className="inline-flex items-center gap-1">
                      <ExternalLink className="h-3 w-3" /> View
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Main collections grid ─────────────────────────────────────────────────────
  return (
    <div className="px-4 md:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Collections</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organise archives into folders. Synced across all your devices.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 shadow-glow"
        >
          <Plus className="h-3.5 w-3.5" /> New collection
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {enriched.map((c) => {
            const Icon = iconMap[c.icon] ?? FolderOpen;
            return (
              <div
                key={c.name}
                className="group relative rounded-2xl border border-border/60 bg-card/40 p-5 hover:bg-card/70 hover:border-border transition overflow-hidden"
              >
                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(c);
                  }}
                  className="absolute top-2.5 right-2.5 z-10 rounded-md p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition"
                  title="Delete collection"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                {/* Open collection */}
                <div className="cursor-pointer" onClick={() => setActiveCol(c)}>
                  <div
                    className="absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-20 group-hover:opacity-40 transition blur-2xl bg-[var(--col-bg)]"
                    style={Object.assign({}, { "--col-bg": c.color }) as React.CSSProperties}
                  />
                  <div className="relative">
                    <div
                      className="grid h-10 w-10 place-items-center rounded-xl ring-1 bg-[var(--col-bg)] text-[var(--col-fg)] border-[var(--col-border)]"
                      style={
                        Object.assign(
                          {},
                          {
                            "--col-bg": `color-mix(in oklch, ${c.color} 18%, transparent)`,
                            "--col-fg": c.color,
                            "--col-border": c.color,
                          },
                        ) as React.CSSProperties
                      }
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-4 font-semibold">{c.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {c.count} archive{c.count !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add card */}
          <button
            onClick={() => setShowModal(true)}
            className="rounded-2xl border border-dashed border-border/70 bg-card/20 p-5 text-left hover:bg-card/40 transition flex flex-col items-start justify-between min-h-[148px]"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-muted/50 text-muted-foreground">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <div className="font-medium">Create collection</div>
              <div className="text-xs text-muted-foreground">Group related archives</div>
            </div>
          </button>
        </div>
      )}

      {/* ── New Collection Modal ────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-xl mx-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">New Collection</h2>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
                className="rounded-lg p-1 text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="block text-xs text-muted-foreground mb-1.5">Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Receipts, News, Crypto"
              className="w-full rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm outline-none focus:border-primary transition"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim()) handleCreate();
              }}
            />

            <label className="block text-xs text-muted-foreground mt-4 mb-1.5">Icon</label>
            <div className="flex items-center gap-2 flex-wrap">
              {iconOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setNewIcon(opt.value)}
                  className={[
                    "rounded-lg p-2 border transition",
                    newIcon === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/50 text-muted-foreground hover:border-primary/30",
                  ].join(" ")}
                  title={opt.label}
                >
                  <opt.Icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            <label className="block text-xs text-muted-foreground mt-4 mb-1.5">Colour</label>
            <div className="flex items-center gap-2 flex-wrap">
              {collectionColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Select color ${c}`}
                  onClick={() => setNewColor(c)}
                  className={[
                    "h-7 w-7 rounded-full border-2 transition bg-[var(--col-bg)]",
                    newColor === c ? "border-white scale-110" : "border-transparent",
                  ].join(" ")}
                  style={Object.assign({}, { "--col-bg": c }) as React.CSSProperties}
                />
              ))}
            </div>

            {/* Preview */}
            <div className="mt-5 rounded-xl border border-border/50 bg-muted/20 p-4 flex items-center gap-3">
              <div
                className="grid h-9 w-9 place-items-center rounded-lg ring-1 shrink-0 bg-[var(--col-bg)] text-[var(--col-fg)] border-[var(--col-border)]"
                style={
                  Object.assign(
                    {},
                    {
                      "--col-bg": `color-mix(in oklch, ${newColor} 18%, transparent)`,
                      "--col-fg": newColor,
                      "--col-border": newColor,
                    },
                  ) as React.CSSProperties
                }
              >
                {(() => {
                  const P = iconMap[newIcon] ?? FolderOpen;
                  return <P className="h-4 w-4" />;
                })()}
              </div>
              <div>
                <div className="text-sm font-medium">{newName || "Collection Name"}</div>
                <div className="text-[10px] text-muted-foreground">0 archives</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || saving}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition shadow-glow inline-flex items-center gap-2"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
