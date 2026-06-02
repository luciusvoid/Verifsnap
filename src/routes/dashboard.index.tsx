import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { type InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Link2,
  ArrowRight,
  Globe,
  Camera,
  FileSearch,
  Save,
  ShieldCheck,
  Check,
  Loader2,
  Sparkles,
  Wallet,
} from "lucide-react";
import {
  archives,
  relativeTime,
  getSavedArchives,
  Archive,
  defaultCollections as collections,
  fetchArchives,
} from "@/lib/mock-data";
import {
  verifyWalletSignature,
  serverInsertArchive,
  serverInsertActivity,
} from "@/server-functions/auth";
import { toast } from "sonner";
import { captureSnapshot } from "@/server-functions/snapshot";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useUploadBlobs } from "@shelby-protocol/react";

export const Route = createFileRoute("/dashboard/")({
  component: NewSnapshot,
});

const steps = [
  { icon: Globe, label: "Opening webpage" },
  { icon: Camera, label: "Capturing screenshot (PNG)" },
  { icon: Save, label: "Saving screenshot" },
];

function NewSnapshot() {
  const navigate = useNavigate();
  const wallet = useWallet();
  const { connected, account, signAndSubmitTransaction } = wallet;
  // Destructure mutateAsync dari hook sesuai docs Shelby React SDK
  const { mutateAsync: uploadBlobs, isPending: isUploading } = useUploadBlobs({});
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState<number>(-1);
  const [done, setDone] = useState(false);
  const [localArchives, setLocalArchives] = useState<Archive[]>([]);
  const [activeNetwork, setActiveNetwork] = useState("testnet");
  const [selectedCollection, setSelectedCollection] = useState<string>("");

  // Expiration options in days — mirrors Shelby Explorer
  const EXPIRATION_OPTIONS = [
    { label: "7d", days: 7 },
    { label: "30d", days: 30 },
    { label: "90d", days: 90 },
    { label: "365d", days: 365 },
  ] as const;
  const [expirationDays, setExpirationDays] = useState<7 | 30 | 90 | 365>(30);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("verifsnap_network") || "testnet";
      setActiveNetwork(stored);
    }
  }, []);

  useEffect(() => {
    if (account) {
      fetchArchives(account.address.toString()).then(setLocalArchives);
    } else {
      setLocalArchives(getSavedArchives());
    }
  }, [account]);

  const start = async () => {
    if (!url.trim()) {
      toast.error("Paste a URL first");
      return;
    }
    if (!connected || !account) {
      toast.info(
        "Please connect your Aptos wallet to save snapshots on the decentralized Shelby network.",
      );
      navigate({ to: "/login" });
      return;
    }

    setDone(false);
    setStage(0);

    try {
      // 1. Verify wallet ownership via cryptographic signature
      if (!wallet.signMessage) {
        throw new Error("Wallet does not support message signing");
      }
      const message = "Login to Shelby: " + Date.now();
      const response = await wallet.signMessage({ message, nonce: "1" });
      if (!response) {
        throw new Error("Message signing cancelled");
      }

      let signatureStr = "";
      if (typeof response.signature === "string") {
        signatureStr = response.signature;
      } else if (response.signature && "data" in response.signature) {
        signatureStr =
          (response.signature as { signature?: string }).signature || response.signature.toString();
      } else {
        signatureStr = response.signature?.toString() || "";
      }

      let pubKeyStr = "";
      if (account.publicKey) {
        pubKeyStr =
          typeof account.publicKey === "string" ? account.publicKey : account.publicKey.toString();
      }

      const authResult = await verifyWalletSignature({
        data: {
          fullMessage: response.fullMessage,
          signature: signatureStr,
          publicKey: pubKeyStr,
          address: account.address.toString(),
        },
      });

      if (!authResult.verified) {
        throw new Error("Wallet signature verification failed");
      }
      toast.success("Wallet verified! Starting capture...");

      const advanceStage = (target: number, delay: number) =>
        new Promise((res) =>
          setTimeout(() => {
            setStage(target);
            res(null);
          }, delay),
        );

      // Simulate opening webpage UI
      await advanceStage(1, 800);

      // Start the actual backend process via server function to capture webpage HTML and screenshots
      const capturePromise = captureSnapshot({ data: url });

      const result = await capturePromise;

      if (!account) {
        throw new Error("Wallet not connected. Please connect your Aptos wallet first.");
      }
      if (!signAndSubmitTransaction) {
        throw new Error("Wallet does not support signing transactions.");
      }

      // Prepare blobs for client-side decentralised upload
      const timestamp = Date.now();
      const keyPng = `snapshots/${result.domain}/${timestamp}.png`;

      const blobsToUpload: { blobName: string; blobData: Uint8Array }[] = [];

      let pngBytes: Uint8Array | null = null;
      if (result.pngBase64) {
        const binaryString = atob(result.pngBase64);
        pngBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          pngBytes[i] = binaryString.charCodeAt(i);
        }
        blobsToUpload.push({ blobName: keyPng, blobData: pngBytes });
      }

      toast.info("Waiting for wallet signature to register snapshot on Shelby storage...");

      // Perform the Web3 decentralized upload.
      // Shelby SDK men-destructure signAndSubmitTransaction dari object signer.
      // Untuk mencegah hilangnya context 'this' di wallet adapter, kita bungkus signAndSubmitTransaction
      // dengan wrapper function yang memanggilnya dari object wallet.
      const shelbySigner = {
        account: account,
        signAndSubmitTransaction: async (tx: InputTransactionData) => signAndSubmitTransaction(tx),
      };

      const expirationMicros = (Date.now() + expirationDays * 24 * 60 * 60 * 1000) * 1000;

      await uploadBlobs({
        signer: shelbySigner,
        blobs: blobsToUpload,
        expirationMicros,
        maxConcurrentUploads: 1,
      });

      // Construct URLs pointing to the public Shelby storage RPC gateway depending on the active network
      const accountAddress = account.address.toString();
      const baseApiUrl =
        activeNetwork === "shelbynet"
          ? "https://api.shelbynet.shelby.xyz/shelby"
          : "https://api.testnet.shelby.xyz/shelby";
      const finalPngUrl = pngBytes
        ? `${baseApiUrl}/v1/blobs/${accountAddress}/${keyPng}`
        : `https://image.thum.io/get/width/1280/crop/800/maxAge/12/${url}`;

      // Finalize the proof stage
      await advanceStage(2, 500);

      setDone(true);
      toast.success("Screenshot saved successfully!");

      // Add to local archives list so the user immediately sees it in the dashboard
      const totalSize = pngBytes ? parseFloat((pngBytes.length / (1024 * 1024)).toFixed(3)) : 0.05;
      const newArchive: Archive = {
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString() + Math.random().toString(36).substring(2, 9),
        title: `Screenshot of ${result.domain}`,
        domain: result.domain,
        favicon: `https://www.google.com/s2/favicons?sz=64&domain=${result.domain}`,
        timestamp: new Date(timestamp).toISOString(),
        thumbnail: finalPngUrl,
        tracking: false,
        status: "ready" as const,
        url: url,
        sizeMb: totalSize,
        versions: 1,
        collection: selectedCollection || undefined,
      };

      await serverInsertArchive({
        data: { ...newArchive, wallet_address: account.address.toString() },
      });
      await serverInsertActivity({
        data: {
          wallet_address: account.address.toString(),
          status: "success",
          details: `Saved snapshot of ${result.domain} on ${activeNetwork}`,
        },
      });
      setLocalArchives((prev) => [newArchive, ...prev]);

      setTimeout(() => {
        setStage(-1);
        setDone(false);
        setUrl("");
      }, 3000);
    } catch (error) {
      console.error("Snapshot error:", error);
      toast.error((error as Error).message || "Failed to save archive");
      if (account) {
        serverInsertActivity({
          data: {
            wallet_address: account.address.toString(),
            status: "failed",
            details: `[${activeNetwork}] ${(error as Error).message}`,
          },
        }).catch(console.error);
      }
      setStage(-1);
      setDone(false);
    }
  };

  return (
    <div className="px-4 md:px-8 py-8 md:py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          {connected && account ? (
            <div className="flex items-center gap-2 text-xs text-success/90 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Connected · {account.address.toString().slice(0, 6)}...
              {account.address.toString().slice(-4)}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-warning/90 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
              Exploring anonymously
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">New snapshot</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Paste any URL and we'll capture it permanently.
          </p>
        </div>

        <motion.div
          initial={{ y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-2 shadow-card"
        >
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && start()}
                placeholder="https://example.com/page-to-archive"
                className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground"
                disabled={stage >= 0}
              />
            </div>
            <button
              onClick={start}
              disabled={stage >= 0}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition shadow-glow disabled:opacity-60 cursor-pointer"
            >
              {stage >= 0 ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ArrowRight className="h-3.5 w-3.5" />
              )}
              Save snapshot
            </button>
          </div>
        </motion.div>

        {/* Expiration selector — like Shelby Explorer */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mt-2.5 flex flex-wrap items-center gap-2"
        >
          <span className="text-xs text-muted-foreground shrink-0">Expiration:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {EXPIRATION_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                disabled={stage >= 0}
                onClick={() => setExpirationDays(opt.days)}
                className={[
                  "rounded-lg px-3 py-1 text-xs font-medium transition-all cursor-pointer border",
                  expirationDays === opt.days
                    ? "bg-primary text-primary-foreground border-primary shadow-glow"
                    : "bg-muted/40 text-muted-foreground border-transparent hover:border-primary/30 hover:text-foreground hover:bg-muted/70",
                  stage >= 0 && "opacity-50 cursor-not-allowed",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground/60 hidden sm:inline">
            · snapshot stored for {expirationDays === 365 ? "1 year" : `${expirationDays} days`}
          </span>
        </motion.div>

        {/* Collection selector */}
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.07 }}
          className="mt-2.5 flex flex-wrap items-center gap-2"
        >
          <span className="text-xs text-muted-foreground shrink-0">Collection:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              disabled={stage >= 0}
              onClick={() => setSelectedCollection("")}
              className={[
                "rounded-lg px-3 py-1 text-xs font-medium transition-all cursor-pointer border",
                selectedCollection === ""
                  ? "bg-primary text-primary-foreground border-primary shadow-glow"
                  : "bg-muted/40 text-muted-foreground border-transparent hover:border-primary/30 hover:text-foreground hover:bg-muted/70",
                stage >= 0 && "opacity-50 cursor-not-allowed",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              None
            </button>
            {collections.map((col) => (
              <button
                key={col.name}
                type="button"
                disabled={stage >= 0}
                onClick={() => setSelectedCollection(col.name)}
                className={[
                  "rounded-lg px-3 py-1 text-xs font-medium transition-all cursor-pointer border",
                  selectedCollection === col.name
                    ? "bg-primary text-primary-foreground border-primary shadow-glow"
                    : "bg-muted/40 text-muted-foreground border-transparent hover:border-primary/30 hover:text-foreground hover:bg-muted/70",
                  stage >= 0 && "opacity-50 cursor-not-allowed",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {col.name}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-3 flex items-start gap-2.5 rounded-xl bg-warning/5 border border-warning/15 p-3.5 text-xs text-warning/90 leading-relaxed"
        >
          <span className="shrink-0 text-sm leading-none">⚠️</span>
          <div>
            <strong className="font-semibold text-warning">Security notice:</strong> Only archive
            public webpages. Never archive private dashboards, personal transaction sessions, or
            URLs containing secret tokens — they cannot be captured correctly and may expose
            sensitive data.
          </div>
        </motion.div>

        {/* Loading experience */}
        <AnimatePresence>
          {stage >= 0 && (
            <motion.div
              initial={{ y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 glass rounded-2xl p-6"
            >
              <div className="space-y-3">
                {steps.map((s, i) => {
                  const Icon = s.icon;
                  const state = i < stage ? "done" : i === stage ? "active" : "pending";
                  return (
                    <div key={s.label} className="flex items-center gap-3">
                      <div
                        className={[
                          "grid h-8 w-8 place-items-center rounded-lg transition",
                          state === "done" && "bg-success/15 text-success",
                          state === "active" && "bg-primary/15 text-primary ring-1 ring-primary/30",
                          state === "pending" && "bg-muted/40 text-muted-foreground",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {state === "done" ? (
                          <Check className="h-4 w-4" />
                        ) : state === "active" ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div
                          className={`text-sm ${state === "pending" ? "text-muted-foreground" : ""}`}
                        >
                          {s.label}
                        </div>
                        {state === "active" && (
                          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted/50">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 0.85 }}
                              className="h-full bg-primary"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {done && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-5 flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm text-success"
                >
                  <Sparkles className="h-4 w-4" /> Screenshot saved successfully.
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent archives */}
        <div className="mt-12 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent archives</h2>
          <Link
            to="/dashboard/archives"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {localArchives.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-card/30 p-12 text-center animate-in fade-in-50 duration-300">
            <div className="mx-auto h-10 w-10 rounded-xl bg-primary/10 grid place-items-center text-primary mb-3">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-medium">No snapshots yet</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
              Paste a public URL above to capture its screenshot.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {localArchives.slice(0, 6).map((a) => (
              <ArchiveCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ArchiveCard({ a }: { a: (typeof archives)[number] }) {
  return (
    <Link
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
        {a.status === "capturing" && (
          <div className="absolute inset-0 grid place-items-center bg-background/60 backdrop-blur-sm">
            <div className="inline-flex items-center gap-2 rounded-lg bg-card/80 px-3 py-1.5 text-xs">
              <Loader2 className="h-3 w-3 animate-spin text-primary" /> Capturing
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="line-clamp-1 text-sm font-medium">{a.title}</div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{relativeTime(a.timestamp)}</span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Archived
          </span>
        </div>
      </div>
    </Link>
  );
}
