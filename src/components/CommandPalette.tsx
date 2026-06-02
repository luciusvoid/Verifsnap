import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Plus,
  Archive,
  Eye,
  FolderOpen,
  HardDrive,
  Settings,
  CreditCard,
} from "lucide-react";
import { getSavedArchives } from "@/lib/mock-data";
import type { Archive as ArchiveType } from "@/lib/mock-data";

const actions = [
  { label: "New snapshot", to: "/dashboard", icon: Plus, kbd: "N" },
  { label: "Go to archives", to: "/dashboard/archives", icon: Archive },

  { label: "Go to collections", to: "/dashboard/collections", icon: FolderOpen },
  { label: "Go to storage", to: "/dashboard/storage", icon: HardDrive },
  { label: "Go to payments", to: "/dashboard/payments", icon: CreditCard },
  { label: "Settings", to: "/dashboard/settings", icon: Settings },
] as const;

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [list, setList] = useState<ArchiveType[]>([]);

  useEffect(() => {
    if (open) {
      setList(getSavedArchives());
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;
  const filteredArchives = list
    .filter(
      (a) => a.title.toLowerCase().includes(q.toLowerCase()) || a.domain.includes(q.toLowerCase()),
    )
    .slice(0, 5);
  const filteredActions = actions.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-start justify-center bg-background/70 backdrop-blur-sm pt-[12vh] px-4 animate-in fade-in-0"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-xl glass-strong rounded-2xl shadow-card overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border/60 px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search archives, run a command…"
            className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto scrollbar-thin p-2">
          {filteredActions.length > 0 && (
            <div className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Actions
            </div>
          )}
          {filteredActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={() => {
                  navigate({ to: a.to });
                  onOpenChange(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent/60 transition"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span>{a.label}</span>
                {"kbd" in a && a.kbd && (
                  <kbd className="ml-auto rounded border border-border/60 bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {a.kbd}
                  </kbd>
                )}
              </button>
            );
          })}
          {filteredArchives.length > 0 && (
            <div className="px-2 pt-3 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              Archives
            </div>
          )}
          {filteredArchives.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                navigate({ to: "/dashboard/archive/$id", params: { id: a.id } });
                onOpenChange(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent/60 transition text-left"
            >
              <img src={a.favicon} alt="" className="h-4 w-4 rounded-sm" />
              <div className="flex-1 min-w-0">
                <div className="truncate">{a.title}</div>
                <div className="truncate text-xs text-muted-foreground">{a.domain}</div>
              </div>
            </button>
          ))}
          {filteredActions.length === 0 && filteredArchives.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">No results</div>
          )}
        </div>
      </div>
    </div>
  );
}
