import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { relativeTime, getSavedArchives, fetchArchives, Archive } from "@/lib/mock-data";
import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  ArrowLeft,
  Copy,
  Download,
  Share2,
  ShieldCheck,
  Clock,
  ExternalLink,
  Hash,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/archive/$id")({
  loader: ({ params }) => {
    return { id: params.id };
  },
  head: () => ({
    meta: [{ title: `Archive — VerifSnap Shelby` }],
  }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useLoaderData();
  const [a, setA] = useState<Archive | null>(null);
  const [loading, setLoading] = useState(true);
  const { account } = useWallet();

  useEffect(() => {
    async function loadArchive() {
      setLoading(true);
      if (account) {
        const archives = await fetchArchives(account.address.toString());
        const found = archives.find((x) => x.id === id);
        setA(found || null);
      } else {
        const archives = getSavedArchives();
        const found = archives.find((x) => x.id === id);
        setA(found || null);
      }
      setLoading(false);
    }
    loadArchive();
  }, [id, account]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!a) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-lg font-semibold">Archive not found</h2>
        <Link to="/dashboard/archives" className="text-sm text-primary mt-2 inline-block">
          Back to archives
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-8">
      <Link
        to="/dashboard/archives"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to archives
      </Link>

      <div className="mt-4 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <img src={a.favicon} alt="" className="h-4 w-4 rounded-sm" />
                {a.domain}
                <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-success">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              </div>
              <h1 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">{a.title}</h1>
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground break-all"
              >
                {a.url} <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            </div>
          </div>

          <div className="mt-5 relative rounded-2xl border border-border/60 bg-card/40 overflow-hidden shadow-card">
            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border/60 bg-background/40">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              <div className="mx-auto rounded-md bg-background/60 px-3 py-0.5 text-[11px] text-muted-foreground truncate max-w-[60%]">
                {a.url}
              </div>
            </div>
            <img
              src={a.thumbnail}
              alt={a.title}
              className="w-full max-h-[60vh] object-cover object-top"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <ActionButton
              icon={Copy}
              label="Copy link"
              onClick={() => {
                navigator.clipboard.writeText(`https://verifsnap.app/a/${a.id}`);
                toast.success("Link copied");
              }}
            />
            <ActionButton
              icon={Download}
              label="Download"
              onClick={() => {
                window.open(a.thumbnail, "_blank");
              }}
            />
            <ActionButton
              icon={Share2}
              label="Share"
              onClick={() => toast.success("Share dialog opened")}
            />
          </div>

          {/* Version history */}
          <div className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Version history
            </h2>
            <ol className="mt-4 relative space-y-4 border-l border-border/60 pl-6">
              {Array.from({ length: a.versions }).map((_, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[27px] top-1 grid h-3 w-3 place-items-center rounded-full bg-primary ring-4 ring-background" />
                  <div className="rounded-xl border border-border/60 bg-card/40 p-4 hover:bg-card/70 transition">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Archive #{a.versions - i}</div>
                      <div className="text-xs text-muted-foreground">
                        {relativeTime(
                          new Date(
                            new Date(a.timestamp).getTime() - i * 86400000 * 3,
                          ).toISOString(),
                        )}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {i === 0 ? "Current" : "Previous snapshot"} ·{" "}
                      {(a.sizeMb - i * 0.2).toFixed(1)} MB
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="lg:w-80 shrink-0 space-y-4">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
            <h3 className="text-sm font-semibold">Archive details</h3>
            <div className="mt-4 space-y-3 text-sm">
              <Detail2 icon={Hash} label="Archive ID" value={a.id} />
              <Detail2
                icon={Clock}
                label="Captured"
                value={new Date(a.timestamp).toLocaleString()}
              />
              <Detail2 icon={ShieldCheck} label="Verification" value="Signed · valid" success />
              <Detail2 icon={Clock} label="Retention" value="Forever" />
              <Detail2 icon={Download} label="Size" value={`${a.sizeMb.toFixed(1)} MB`} />
            </div>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h3 className="text-sm font-semibold">Proof of capture</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Cryptographic signature anchoring this archive to a specific moment in time.
            </p>
            <code className="mt-3 block break-all rounded-md bg-background/60 p-3 text-[10px] text-muted-foreground">
              sha256:{a.id}a8c92ef0b3d1f7e2c5{a.id.slice(3)}
            </code>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
        primary
          ? "bg-primary text-primary-foreground hover:opacity-90 shadow-glow"
          : "border border-border/60 bg-card/40 hover:bg-card",
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function Detail2({
  icon: Icon,
  label,
  value,
  success,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  success?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <span className={`text-right text-foreground/90 truncate ${success ? "text-success" : ""}`}>
        {value}
      </span>
    </div>
  );
}
