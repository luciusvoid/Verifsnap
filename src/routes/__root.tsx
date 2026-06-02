import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { ShelbyClient } from "@shelby-protocol/sdk/browser";
import { ShelbyClientProvider } from "@shelby-protocol/react";
import { useMemo, useState, useEffect } from "react";
import { ThemeProvider } from "next-themes";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 h-12 w-12 rounded-xl glass grid place-items-center text-primary">
          404
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">This page wasn't archived</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The URL you're looking for doesn't exist — but we'd happily archive it for you.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link
            to="/"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Go home
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition"
          >
            Open dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something broke</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Try refreshing — your archives are safe.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VerifSnap Shelby — Save proof before the internet changes" },
      {
        name: "description",
        content: "Archive any webpage permanently. Detect changes. Prove what was there.",
      },
      { name: "author", content: "VerifSnap Shelby" },
      {
        property: "og:title",
        content: "VerifSnap Shelby — Save proof before the internet changes",
      },
      {
        property: "og:description",
        content: "Archive any webpage permanently. Detect changes. Prove what was there.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Membaca network yang dipilih dari localStorage
  const activeNetwork = useMemo(() => {
    if (!mounted) return Network.TESTNET;
    try {
      const stored = localStorage.getItem("verifsnap_network") || "testnet";
      return stored === "shelbynet" ? Network.SHELBYNET : Network.TESTNET;
    } catch (e) {
      console.error("Failed to read verifsnap_network from localStorage:", e);
      return Network.TESTNET;
    }
  }, [mounted]);

  // ShelbyClient dibuat dengan API Key yang sesuai per jaringan
  const shelbyClient = useMemo(() => {
    if (!mounted) return null;
    try {
      const isShelbyNet = activeNetwork === Network.SHELBYNET;

      // Prioritas: localStorage (kunci lokal pengguna) → env var per jaringan → fallback
      const localTestnetKey = localStorage.getItem("verifsnap_shelby_api_key");
      const localShelbyNetKey = localStorage.getItem("verifsnap_shelbynet_api_key");

      const apiKey = isShelbyNet
        ? localShelbyNetKey ||
          import.meta.env.VITE_SHELBY_SHELBYNET_API_KEY ||
          import.meta.env.VITE_SHELBY_API_KEY ||
          "placeholder-shelby-api-key"
        : localTestnetKey || import.meta.env.VITE_SHELBY_API_KEY || "placeholder-shelby-api-key";

      return new ShelbyClient({
        network: activeNetwork,
        apiKey,
      });
    } catch (e) {
      console.error("ShelbyClient initialization failed:", e);
      return null;
    }
  }, [mounted, activeNetwork]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AptosWalletAdapterProvider
        autoConnect={false}
        optInWallets={["Continue with Google", "Petra"]}
        dappConfig={{ network: activeNetwork }}
        onError={(error) => {
          console.error("Aptos Wallet Adapter Error:", error);
        }}
      >
        <ShelbyClientProvider client={shelbyClient as ShelbyClient}>
          <Outlet />
          <Toaster theme="dark" position="bottom-right" />
        </ShelbyClientProvider>
      </AptosWalletAdapterProvider>
    </QueryClientProvider>
  );
}
