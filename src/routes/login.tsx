import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Wallet, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in with Aptos — VerifSnap Shelby" },
      {
        name: "description",
        content:
          "Sign in with your Aptos Web3 Wallet or Google Keyless Account to access VerifSnap Shelby.",
      },
    ],
  }),
  component: Login,
});

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.3 29.3 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.1 6.6 4.8C14.8 15.3 19 12.5 24 12.5c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.3 29.3 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.1z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5.2 0 9.9-1.7 13.5-4.6l-6.2-5.1c-2 1.4-4.5 2.2-7.3 2.2-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.6 39 16.2 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.3l6.2 5.1C40.7 35.1 43.5 30 43.5 24c0-1.2-.1-2.4 0-3.5z"
      />
    </svg>
  );
}

function Login() {
  const navigate = useNavigate();
  const { connect, wallets, connected, account } = useWallet();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [network, setNetwork] = useState("testnet");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("verifsnap_network") || "testnet";
      setNetwork(stored);
    }
  }, []);

  useEffect(() => {
    if (connected && account) {
      const shortAddress = `${account.address.toString().slice(0, 6)}...${account.address.toString().slice(-4)}`;
      const netName = network === "shelbynet" ? "ShelbyNet" : "Testnet";
      toast.success(`Connected as ${shortAddress} on ${netName}!`);
      navigate({ to: "/dashboard" });
    }
  }, [connected, account, navigate, network]);

  const handleWalletConnect = async (walletName: Parameters<typeof connect>[0]) => {
    setConnectingWallet(String(walletName));
    try {
      await connect(walletName);
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes("not installed") || msg.includes("not found")) {
        toast.error(`${walletName} is not installed. Please install the extension first.`);
      } else {
        toast.error(`Failed to connect: ${msg}`);
      }
    } finally {
      setConnectingWallet(null);
    }
  };

  return (
    <div className="relative min-h-screen grid place-items-center px-4 hero-bg overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-6 left-6">
        <Logo />
      </div>

      <motion.div
        initial={{ y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="glass-strong rounded-2xl p-7 shadow-card">
          <div className="text-center">
            <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-gradient">
              Connect to VerifSnap Shelby
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in securely using {network === "shelbynet" ? "ShelbyNet" : "Testnet"} network.
            </p>
          </div>

          <div className="mt-7 space-y-3">
            {/* 1. Aptos Connect Keyless Login (Google/Social) */}
            <button
              onClick={() => handleWalletConnect("Continue with Google")}
              disabled={!!connectingWallet}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border/60 bg-gradient-to-r from-primary/10 to-transparent hover:from-primary/15 px-4 py-3 text-sm font-medium transition cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {connectingWallet === "Continue with Google" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <GoogleIcon />
              )}
              <span>
                {connectingWallet === "Continue with Google"
                  ? "Connecting..."
                  : "Aptos Keyless (Google)"}
              </span>
            </button>

            <div className="my-4 flex items-center gap-3 text-[9px] uppercase tracking-wider text-muted-foreground/60">
              <div className="h-px flex-1 bg-border/40" /> Or Connect Web3 Wallet{" "}
              <div className="h-px flex-1 bg-border/40" />
            </div>

            {/* 2. Petra Wallet (Web3 Extension) */}
            <button
              onClick={() => handleWalletConnect("Petra")}
              disabled={!!connectingWallet}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-sm font-medium hover:bg-card transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2.5">
                {connectingWallet === "Petra" ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Wallet className="h-5 w-5 text-primary" />
                )}
                <span>{connectingWallet === "Petra" ? "Connecting Petra..." : "Petra Wallet"}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* 3. Martian Wallet */}
            <button
              onClick={() => handleWalletConnect("Martian")}
              disabled={!!connectingWallet}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-sm font-medium hover:bg-card transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2.5">
                {connectingWallet === "Martian" ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <Wallet className="h-5 w-5 text-primary" />
                )}
                <span>
                  {connectingWallet === "Martian" ? "Connecting Martian..." : "Martian Wallet"}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Show other detected wallets dynamically if any */}
            {wallets
              .filter(
                (w) =>
                  w.name !== "Continue with Google" && w.name !== "Petra" && w.name !== "Martian",
              )
              .map((w) => (
                <button
                  key={w.name}
                  onClick={() => handleWalletConnect(w.name)}
                  disabled={!!connectingWallet}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-sm font-medium hover:bg-card/60 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2.5">
                    {connectingWallet === w.name ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <Wallet className="h-5.5 w-5.5 text-muted-foreground" />
                    )}
                    <span>{connectingWallet === w.name ? `Connecting ${w.name}...` : w.name}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
          </div>

          <ul className="mt-8 grid gap-2 text-xs text-muted-foreground border-t border-border/40 pt-5">
            <li className="inline-flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-success" /> Tamper-proof Shelby Storage integration
            </li>
            <li className="inline-flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-success" /> Secure 1-click blockchain identity
            </li>
            <li className="inline-flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-success" /> Verifiable cryptographic snapshots
            </li>
          </ul>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Need a testnet wallet?{" "}
          <a
            href="https://petra.app"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition"
          >
            Get Petra
          </a>{" "}
          or use Aptos Keyless for instant Google sign-in.
        </p>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
