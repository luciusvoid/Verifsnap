import { createFileRoute, Link } from "@tanstack/react-router";
import { getSavedArchives, fetchArchives, Archive } from "@/lib/mock-data";
import { ArchiveCard } from "./dashboard.index";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState, useEffect } from "react";
import { Search, Filter, LayoutGrid, List, Camera } from "lucide-react";

export const Route = createFileRoute("/dashboard/archives")({
  head: () => ({ meta: [{ title: "Archives — VerifSnap Shelby" }] }),
  component: Archives,
});

function Archives() {
  const [q, setQ] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [list, setList] = useState<Archive[]>([]);
  const { account } = useWallet();

  useEffect(() => {
    if (account) {
      fetchArchives(account.address.toString()).then(setList);
    } else {
      setList(getSavedArchives());
    }
  }, [account]);

  const filtered = list.filter(
    (a) => a.title.toLowerCase().includes(q.toLowerCase()) || a.domain.includes(q.toLowerCase()),
  );
  return (
    <div className="px-4 md:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Archives</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {list.length} archives — kept forever.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-1.5 w-full sm:w-72">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
          <button
            aria-label="Filter archives"
            className="rounded-lg border border-border/60 bg-card/40 p-2 hover:bg-card transition"
          >
            <Filter className="h-4 w-4" />
          </button>
          <div className="flex rounded-lg border border-border/60 bg-card/40 p-0.5">
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              className={`p-1.5 rounded-md ${view === "grid" ? "bg-accent" : ""}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              className={`p-1.5 rounded-md ${view === "list" ? "bg-accent" : ""}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((a) => (
            <ArchiveCard key={a.id} a={a} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden divide-y divide-border/60">
          {filtered.map((a) => (
            <Link
              key={a.id}
              to="/dashboard/archive/$id"
              params={{ id: a.id }}
              className="flex items-center gap-4 p-4 hover:bg-card transition"
            >
              <img src={a.thumbnail} alt="" className="h-14 w-20 rounded-md object-cover" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{a.title}</div>
                <div className="text-xs text-muted-foreground truncate">{a.url}</div>
              </div>
              <span className="hidden sm:inline-flex text-xs text-muted-foreground">
                {a.versions} versions
              </span>
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] text-success">
                Archived
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-card/30 p-16 text-center">
      <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 grid place-items-center text-primary">
        <Camera className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-medium">No archives found</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Try a different search term or clear filters.
      </p>
    </div>
  );
}
