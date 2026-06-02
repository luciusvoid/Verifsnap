import { createServerFn } from "@tanstack/react-start";

declare const process: { env: Record<string, string | undefined> };

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const captureSnapshot = createServerFn({ method: "POST" })
  .inputValidator((url: unknown): string => {
    if (typeof url !== "string" || !url.startsWith("http")) {
      throw new Error("Invalid URL");
    }
    return url;
  })
  .handler(async ({ data: url }) => {
    const urlObj = new URL(url);

    // 1. Fetch PNG Screenshot from API (with upgraded 10-second wait/delay to ensure perfect rendering of slow assets and fonts)
    let imageBuffer: ArrayBuffer | null = null;
    const screenshotApiKey = process.env.SCREENSHOT_API_KEY;
    const thumIoAuthKey = process.env.THUM_IO_AUTH_KEY || process.env.THUM_IO_API_KEY;

    try {
      // Option A: ScreenshotAPI.net (Premium) with 10-second capture delay
      if (screenshotApiKey) {
        console.log("Capturing screenshot via ScreenshotAPI.net (with 10s delay)...");
        const res = await fetch(
          `https://api.screenshotapi.net/screenshot?token=${screenshotApiKey}&url=${encodeURIComponent(url)}&output=image&width=1280&height=800&delay=10000`,
        );
        if (res.ok) {
          imageBuffer = await res.arrayBuffer();
        }
      }

      // Option B: Thum.io with 10-second wait parameter to ensure the screenshot is perfect
      if (!imageBuffer) {
        console.log("Capturing screenshot via Thum.io (with 10s wait modifier)...");
        const thumIoUrl = thumIoAuthKey
          ? `https://image.thum.io/get/auth/${thumIoAuthKey}/width/1280/crop/800/wait/10/maxAge/12/${url}`
          : `https://image.thum.io/get/width/1280/crop/800/wait/10/maxAge/12/${url}`;

        const res = await fetch(thumIoUrl);
        if (res.ok) {
          imageBuffer = await res.arrayBuffer();
        } else {
          console.warn(`Thum.io returned status code: ${res.status}`);
        }
      }

      // Option C: Microlink Free Fallback with 10-second delay
      if (!imageBuffer) {
        console.log("Using Microlink fallback (with 10s wait)...");
        const res = await fetch(
          `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&waitFor=10s&delay=10`,
        );
        if (res.ok) {
          const json = (await res.json()) as {
            data?: { screenshot?: { url?: string } };
          };
          const screenshotUrl = json.data?.screenshot?.url;
          if (screenshotUrl) {
            const imgRes = await fetch(screenshotUrl);
            if (imgRes.ok) {
              imageBuffer = await imgRes.arrayBuffer();
            }
          }
        }
      }
    } catch (e) {
      console.warn("Screenshot capture encountered an issue:", e);
    }

    return {
      url,
      domain: urlObj.hostname,
      pngBase64: imageBuffer ? arrayBufferToBase64(imageBuffer) : null,
    };
  });
