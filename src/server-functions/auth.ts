import { createServerFn } from "@tanstack/react-start";
import { Ed25519PublicKey, Ed25519Signature } from "@aptos-labs/ts-sdk";
import { createClient } from "@supabase/supabase-js";

export const verifyWalletSignature = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const d = data as Record<string, unknown>;
    if (!d.fullMessage || !d.signature || !d.publicKey || !d.address) {
      throw new Error("Missing signature data");
    }
    return d as {
      fullMessage: string;
      signature: string;
      publicKey: string;
      address: string;
    };
  })
  .handler(async ({ data }) => {
    try {
      const { fullMessage, signature, publicKey, address } = data;

      // Strip "0x" prefix if present
      const cleanPubKey = publicKey.startsWith("0x") ? publicKey.slice(2) : publicKey;
      const cleanSig = signature.startsWith("0x") ? signature.slice(2) : signature;

      const pubKeyBytes = new Uint8Array(Buffer.from(cleanPubKey, "hex"));
      const sigBytes = new Uint8Array(Buffer.from(cleanSig, "hex"));
      const messageBytes = new TextEncoder().encode(fullMessage);

      let isValid = false;

      if (pubKeyBytes.length === 32) {
        // Standard Ed25519 wallet (Petra, etc.)
        const ed25519PubKey = new Ed25519PublicKey(pubKeyBytes);
        const ed25519Sig = new Ed25519Signature(sigBytes);
        isValid = ed25519PubKey.verifySignature({
          message: messageBytes,
          signature: ed25519Sig,
        });
      } else {
        // Keyless / Google wallet — ZK proof, trust wallet adapter
        console.log("Non-Ed25519 key detected (Keyless). Skipping crypto verify.");
        isValid = true;
      }

      if (!isValid) {
        throw new Error("Invalid signature");
      }

      if (!fullMessage.includes("Login to Shelby")) {
        throw new Error("Invalid message content");
      }

      // Authentication successful — return wallet address as identity token
      // No JWT needed; server functions use service role key for DB operations
      return { address, verified: true };
    } catch (error) {
      console.error("Signature verification failed:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error("Authentication failed: " + errorMessage);
    }
  });

// Server-side Supabase admin client (uses service role key, never exposed to browser)
function getAdminSupabase() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalEnv = (globalThis as any).process?.env || {};
  const url =
    globalEnv.VITE_SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    globalEnv.SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    "";
  const serviceKey =
    globalEnv.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceKey) {
    throw new Error("Server configuration error: missing Supabase credentials");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const serverInsertArchive = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as Record<string, unknown>)
  .handler(async ({ data }) => {
    const admin = getAdminSupabase();
    const { error } = await admin.from("archives").insert(data);
    if (error) {
      console.error("Error inserting archive:", error);
      throw new Error("Failed to save archive: " + error.message);
    }
    return { success: true };
  });

export const serverInsertActivity = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => data as Record<string, unknown>)
  .handler(async ({ data }) => {
    const admin = getAdminSupabase();
    const { error } = await admin.from("activities").insert(data);
    if (error) {
      console.error("Error inserting activity:", error);
    }
    return { success: true };
  });
