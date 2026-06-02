import { createFileRoute } from "@tanstack/react-router";
import { fetchArchives, Archive } from "@/lib/mock-data";
import { useState, useEffect, useRef } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { HardDrive, Archive as ArchiveIcon, Clock, TrendingUp } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const Route = createFileRoute("/dashboard/storage")({
  head: () => ({ meta: [{ title: "Storage — VerifSnap Shelby" }] }),
  component: Storage,
});

function Storage() {
  const [list, setList] = useState<Archive[]>([]);
  const { account } = useWallet();

  useEffect(() => {
    if (account) {
      fetchArchives(account.address.toString()).then(setList);
    }
  }, [account]);

  const used = list.reduce((s, a) => s + a.sizeMb, 0);
  const total = 100;
  const pct = total > 0 ? (used / total) * 100 : 0;
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${pct}%`;
    }
  }, [pct]);

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const count = list.filter(
      (a) => new Date(a.timestamp).toDateString() === d.toDateString(),
    ).length;
    return { day: dayName, snapshots: count };
  });

  const totalSnapshotsThisWeek = last7Days.reduce((sum, item) => sum + item.snapshots, 0);

  return (
    <div className="px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Storage</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your archive footprint and activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Stat
          icon={HardDrive}
          label="Storage used"
          value={`${used.toFixed(1)} MB`}
          sub={`of ${total} MB`}
        />
        <Stat icon={ArchiveIcon} label="Archives" value={`${list.length}`} sub="total snapshots" />
        <Stat icon={Clock} label="Retention" value="Forever" sub="on Verified plan" />
        <Stat icon={TrendingUp} label="This week" value="+24%" sub="vs last week" accent />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-border/60 bg-card/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Activity (last 7 days)</h3>
            <div className="text-xs text-muted-foreground">{totalSnapshotsThisWeek} snapshots</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.13 215)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.78 0.13 215)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "oklch(0.68 0.015 270)", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "oklch(0.68 0.015 270)", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.20 0.014 270)",
                    border: "1px solid oklch(0.30 0.015 270)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  cursor={{ stroke: "oklch(0.78 0.13 215)", strokeOpacity: 0.3 }}
                />
                <Area
                  type="monotone"
                  dataKey="snapshots"
                  stroke="oklch(0.78 0.13 215)"
                  strokeWidth={2}
                  fill="url(#g)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
          <h3 className="text-sm font-semibold">Plan usage</h3>
          <div className="mt-5">
            <div className="flex items-end justify-between">
              <div className="text-3xl font-semibold">
                {used.toFixed(0)}
                <span className="text-base text-muted-foreground"> MB</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {pct.toFixed(0)}% of {total} MB
              </div>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted/50">
              <div
                ref={progressRef}
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
              />
            </div>
            <ul className="mt-5 space-y-2 text-xs">
              <Row label="Screenshots" v="12.4 MB" />
              <Row label="HTML & metadata" v="3.2 MB" />
            </ul>
            <button className="mt-5 w-full rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 shadow-glow">
              Upgrade plan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border ${accent ? "border-primary/30 bg-primary/5" : "border-border/60 bg-card/40"} p-5`}
    >
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs">{label}</span>
        <Icon className={`h-4 w-4 ${accent ? "text-primary" : ""}`} />
      </div>
      <div className={`mt-1 text-2xl font-semibold ${accent ? "text-primary" : ""}`}>{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Row({ label, v }: { label: string; v: string }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{v}</span>
    </li>
  );
}
