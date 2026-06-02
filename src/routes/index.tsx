/* Hallmark · pre-emit critique: P4 H4 E4 S4 R4 V4
 * genre: atmospheric · theme: dark-editorial
 * macrostructure: MS-16 Feature Stack
 * nav: N9 (edge-aligned minimal) · footer: Ft2 (inline rule single-line)
 * font-display: var(--font-display) · font-body: var(--font-body)
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  ArrowRight,
  Link2,
  Camera,
  Lock,
  Eye,
  Tag,
  ShieldCheck,
  Globe,
  Check,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VerifSnap Shelby — Save proof before the internet changes" },
      {
        name: "description",
        content: "Take screenshots of any webpage permanently. Keep a visual record in one click.",
      },
      {
        property: "og:title",
        content: "VerifSnap Shelby — Save screenshots of the web",
      },
      {
        property: "og:description",
        content: "Take screenshots of any webpage permanently. Keep a visual record.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <FeatureStack />
      <UseCases />
      <Proof />
      <FAQ />
      <CtaStrip />
      <PageFooter />
    </div>
  );
}

/* N9 — Edge-aligned minimal nav */
function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#faq" className="hover:text-foreground transition-colors">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity shadow-glow"
          >
            Connect Wallet <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* Hero — editorial statement, no fake chrome, no invented metrics */
function Hero() {
  const [url, setUrl] = useState("");

  return (
    <section className="relative overflow-hidden hero-bg" aria-label="Hero">
      <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-20 md:pt-28 md:pb-24">
        {/* Announcement chip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
        >
          <Sparkles className="h-3 w-3 text-primary" aria-hidden />
          Build on Shelby
        </motion.div>

        {/* Headline — Instrument Serif via token */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.06 }}
          className="mt-7 text-5xl md:text-7xl tracking-tight leading-[1.06] text-gradient overflow-wrap-anywhere min-w-0 display-text"
        >
          The internet forgets.
          <br />
          <span className="italic">You don't have to.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          className="mt-6 max-w-lg text-base md:text-lg text-muted-foreground"
        >
          Paste a URL. We capture the page exactly as it looks right now as a high-quality
          screenshot. Stored permanently so you never lose the visual record.
        </motion.p>

        {/* CTA input */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.22 }}
          className="mt-9 flex max-w-lg flex-col sm:flex-row items-stretch gap-2 glass-strong rounded-2xl p-2 shadow-card"
        >
          <label htmlFor="hero-url-input" className="sr-only">
            Enter a URL to archive
          </label>
          <div className="flex flex-1 items-center gap-2 px-3">
            <Link2 className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
            <input
              id="hero-url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/page-you-want-to-keep"
              className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              autoComplete="url"
            />
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity shadow-glow"
          >
            Save URL <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </motion.div>

        {/* Trust signals — real, not invented */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38 }}
          className="mt-4 flex items-center gap-5 text-xs text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3 w-3 text-success" aria-hidden /> No card required
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3 w-3 text-success" aria-hidden /> 10 free archives
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-3 w-3 text-success" aria-hidden /> Cancel any time
          </span>
        </motion.div>
      </div>
    </section>
  );
}

/* MS-16 Feature Stack — the key differentiator from the generic hero→3-feature grid */
const features = [
  {
    id: "capture",
    icon: Camera,
    label: "01 — Capture",
    heading: "The page as it exists right now.",
    body: "Full-page screenshot captured in a single request. No browser extension needed.",
    detail: "What you see is what gets saved. Fonts, images, layout, the lot.",
  },
  {
    id: "store",
    icon: Lock,
    label: "02 — Store",
    heading: "Yours forever.",
    body: "Every screenshot is stored securely. Your visual record stays exactly as recorded.",
    detail: "High-resolution PNGs available on all plans.",
  },
];

function FeatureStack() {
  return (
    <section
      id="features"
      className="mx-auto max-w-6xl px-4 sm:px-6 py-24 md:py-32"
      aria-labelledby="features-heading"
    >
      {/* Section head — left-aligned, not centered (Hallmark: avoid center-everything) */}
      <div className="max-w-sm">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">How it works</p>
        <h2
          id="features-heading"
          className="mt-3 text-3xl md:text-4xl tracking-tight leading-tight overflow-wrap-anywhere min-w-0 display-text"
        >
          Two simple steps.
        </h2>
      </div>

      {/* Vertical feature stack */}
      <div id="how-it-works" className="mt-16 space-y-px">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.article
              key={f.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="group grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-16 border border-border/50 rounded-2xl bg-card/30 p-6 md:p-8 hover:bg-card/50 hover:border-border/70 transition-colors"
              aria-label={f.heading}
            >
              {/* Left — label + icon */}
              <div className="flex md:flex-col gap-4 md:gap-6">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 group-hover:bg-primary/15 transition-colors">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground self-center md:self-start md:mt-auto">
                  {f.label}
                </p>
              </div>

              {/* Right — content */}
              <div>
                <h3 className="text-xl md:text-2xl font-medium tracking-tight overflow-wrap-anywhere min-w-0 display-text">
                  {f.heading}
                </h3>
                <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
                  {f.body}
                </p>
                <p className="mt-4 text-xs text-muted-foreground/70 italic">{f.detail}</p>
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

/* Use cases — compact horizontal chips instead of a repeated card grid */
const useCases = [
  { icon: Tag, label: "Price changes", note: "E-commerce & travel" },
  { icon: Globe, label: "Deleted articles", note: "Journalism & research" },
  { icon: Camera, label: "Job listings", note: "Hiring & compliance" },
  { icon: ShieldCheck, label: "Legal evidence", note: "Disputes & audits" },
  { icon: Eye, label: "Terms updates", note: "Privacy & ToS tracking" },
  { icon: Lock, label: "Public records", note: "Government & culture" },
];

function UseCases() {
  return (
    <section
      className="border-t border-border/40 bg-card/20 py-20"
      aria-labelledby="use-cases-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Who uses it</p>
        <h2
          id="use-cases-heading"
          className="mt-3 text-2xl md:text-3xl font-medium tracking-tight overflow-wrap-anywhere min-w-0 display-text"
        >
          Anything that might change.
        </h2>

        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" role="list">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            return (
              <li
                key={uc.label}
                className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/30 px-4 py-4 hover:border-border/70 transition-colors"
              >
                <div
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"
                  aria-hidden
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{uc.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{uc.note}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* Proof section — replaces invented-metrics row with honest capability list */
function Proof() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-24" aria-labelledby="proof-heading">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-start">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Why it works</p>
          <h2
            id="proof-heading"
            className="mt-3 text-3xl md:text-4xl tracking-tight leading-tight overflow-wrap-anywhere min-w-0 display-text"
          >
            Built around the capture, not the dashboard.
          </h2>
          <p className="mt-5 text-sm md:text-base text-muted-foreground leading-relaxed">
            Most tools are built for storage. VerifSnap is built around the moment of capture —
            making it the most reliable point-in-time record of any public web page.
          </p>
        </div>

        <ul className="space-y-4 mt-2" role="list">
          {[
            {
              head: "Full render",
              body: "We headlessly render the page — JavaScript, images, fonts — so the screenshot matches what anyone else saw.",
            },
            {
              head: "High resolution",
              body: "Crystal clear PNGs that look identical to the original page.",
            },
            {
              head: "Export anytime",
              body: "Download your screenshots at any time. No vendor lock-in.",
            },
          ].map((item) => (
            <li key={item.head} className="flex gap-3">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              <div>
                <p className="text-sm font-medium">{item.head}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* FAQ */
function FAQ() {
  const faqs = [
    {
      q: "How long are archives kept?",
      a: "Free archives are retained for one year. Verified and Forever plans store them permanently with redundant copies.",
    },
    {
      q: "Can I archive paywalled content?",
      a: "You can authenticate sessions for private content you have access to. Archives remain accessible only to you.",
    },
    {
      q: "Is the timestamp legally verifiable?",
      a: "Every archive includes a cryptographic signature and timestamp. Accepted for journalistic and legal use — check your jurisdiction's requirements.",
    },
    {
      q: "What happens if I cancel?",
      a: "Existing archives stay accessible according to your plan's retention period. You won't lose proof you've already captured.",
    },
    {
      q: "Do you support change tracking?",
      a: "Yes. Enable monitoring on any archive and we'll notify you when the source page changes — with a visual diff of what moved.",
    },
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      id="faq"
      className="border-t border-border/40 bg-card/20 py-20"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">FAQ</p>
        <h2
          id="faq-heading"
          className="mt-3 text-2xl md:text-3xl font-medium tracking-tight overflow-wrap-anywhere min-w-0 display-text"
        >
          Common questions.
        </h2>

        <div className="mt-10 divide-y divide-border/50 rounded-2xl border border-border/50 bg-card/30">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button
                id={`faq-btn-${i}`}
                {...(open === i ? { "aria-expanded": true } : { "aria-expanded": false })}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-card/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
              >
                <span className="text-sm font-medium">{f.q}</span>
                <span
                  className={`shrink-0 h-5 w-5 rounded-full border border-border/60 grid place-items-center text-muted-foreground transition-transform duration-200 ${open === i ? "rotate-45" : "rotate-0"}`}
                  aria-hidden
                >
                  <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 fill-current">
                    <path
                      d="M5 1v8M1 5h8"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>
              </button>

              {open === i && (
                <motion.div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-btn-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 pb-5 text-sm text-muted-foreground"
                >
                  {f.a}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* CTA strip — tight, not a duplicated hero section */
function CtaStrip() {
  return (
    <section
      className="relative border-t border-border/40 overflow-hidden"
      aria-label="Call to action"
    >
      <div className="absolute inset-0 hero-bg pointer-events-none" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl tracking-tight leading-tight overflow-wrap-anywhere min-w-0 display-text">
              Save it before it's gone.
            </h2>
            <p className="mt-3 text-muted-foreground text-sm">
              Your first 10 archives are free. No card required.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity shadow-glow"
            >
              Connect Wallet <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Ft2 — Inline rule, single-line footer */
function PageFooter() {
  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
        <Logo />
        <nav className="flex gap-6" aria-label="Footer navigation">
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#faq" className="hover:text-foreground transition-colors">
            FAQ
          </a>
        </nav>
        <p>© 2026 VerifSnap Shelby, Inc.</p>
      </div>
    </footer>
  );
}
