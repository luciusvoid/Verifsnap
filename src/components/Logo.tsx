import { Link } from "@tanstack/react-router";

export function Logo({ to = "/", className = "" }: { to?: string; className?: string }) {
  return (
    <Link to={to} className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary/30 to-primary/5 ring-1 ring-primary/30 shadow-glow">
        <span className="absolute inset-0 rounded-lg bg-primary/10 blur-md group-hover:bg-primary/20 transition" />
        <svg
          viewBox="0 0 24 24"
          className="relative h-4 w-4 text-primary"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 17H7A5 5 0 0 1 7 7h2" />
          <path d="M15 7h2a5 5 0 0 1 4.5 7.2" />
          <path d="M8 12h4" />
          <path d="m18 18 4 4" />
          <path d="m22 18-4 4" />
        </svg>
      </span>
      <span className="font-semibold tracking-tight text-foreground flex items-center">
        VerifSnap
        <span className="text-primary text-[8px] font-semibold tracking-wider uppercase ml-1.5 px-1 bg-primary/10 border border-primary/25 rounded-md font-mono shrink-0">
          Shelby
        </span>
      </span>
    </Link>
  );
}
