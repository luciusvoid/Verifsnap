import { createFileRoute } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/dashboard/payments")({
  head: () => ({ meta: [{ title: "Payments — VerifSnap Shelby" }] }),
  component: Payments,
});

const plans = [
  {
    name: "Free",
    price: "$0",
    sub: "Forever",
    desc: "Start saving proof — no card needed.",
    features: [
      "10 archives / month",
      "1-year retention",
      "Manual archiving",
      "Public archive links",
    ],
    cta: "Current plan",
    current: true,
  },
  {
    name: "Verified",
    price: "$9",
    sub: "/ month",
    desc: "For people who need proof to hold up.",
    features: [
      "500 archives / month",
      "5-year retention",
      "Automated integrity alerts",
      "Signed proofs",
      "Email support",
    ],
    cta: "Upgrade",
  },
  {
    name: "Permanent",
    price: "$24",
    sub: "/ month",
    desc: "For teams, journalists and researchers.",
    features: [
      "Unlimited archives",
      "Permanent retention",
      "Priority archiving speed",
      "API access",
      "Priority support",
    ],
    cta: "Upgrade",
    popular: true,
  },
  {
    name: "Forever",
    price: "$199",
    sub: "one-time",
    desc: "Pay once. Keep your archives — literally forever.",
    features: [
      "Includes Permanent",
      "Endowed storage fund",
      "Heirloom access",
      "White-glove migration",
    ],
    cta: "Get Forever",
  },
];

function Payments() {
  return (
    <div className="px-4 md:px-8 py-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-2xl md:text-4xl font-semibold tracking-tight text-gradient">
          Choose a plan that fits your proof.
        </h1>
        <p className="text-sm text-muted-foreground mt-3">
          Cancel anytime. Your archives stay yours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((p) => (
          <div
            key={p.name}
            className={[
              "relative rounded-2xl p-6 transition flex flex-col",
              p.popular
                ? "border border-primary/40 bg-card/70 shadow-glow"
                : "border border-border/60 bg-card/40 hover:bg-card/60",
            ].join(" ")}
          >
            {p.popular && (
              <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                <Sparkles className="h-3 w-3" /> Most popular
              </div>
            )}
            <div className="text-sm font-medium text-muted-foreground">{p.name}</div>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
              <span className="pb-1.5 text-xs text-muted-foreground">{p.sub}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            <ul className="mt-5 space-y-2 text-sm flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              disabled={p.current}
              className={[
                "mt-6 rounded-xl px-4 py-2.5 text-sm font-medium transition",
                p.current
                  ? "bg-muted/60 text-muted-foreground cursor-default"
                  : p.popular
                    ? "bg-primary text-primary-foreground hover:opacity-90 shadow-glow"
                    : "border border-border/60 hover:bg-accent",
              ].join(" ")}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border/60 bg-card/40 p-6">
        <h3 className="text-sm font-semibold">Billing history</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          No invoices yet — you're on the Free plan.
        </p>
      </div>
    </div>
  );
}
