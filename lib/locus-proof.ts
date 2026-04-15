import "server-only";

import { locusClient } from "@/lib/locus";
import { store } from "@/lib/store";

type LiveProofKind = "search" | "screenshot";

type LiveProofResponse = {
  provider: "exa" | "firecrawl";
  actionName: "Exa Search" | "Firecrawl Screenshot";
  createdAt: string;
  responsePreview: string;
  requestMetadata?: Record<string, string | number>;
  artifactDetails?: Record<string, string>;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getReadablePreview(result: { data: unknown; response_preview: string }) {
  const rawPreview = result.response_preview.trim();

  if (rawPreview.length > 0 && /^[\x09\x0A\x0D\x20-\x7E]+$/.test(rawPreview)) {
    return rawPreview.slice(0, 500);
  }

  if (typeof result.data === "string" && result.data.trim().length > 0) {
    return result.data.trim().slice(0, 500);
  }

  if (isPlainObject(result.data) || Array.isArray(result.data)) {
    try {
      return JSON.stringify(result.data).slice(0, 500);
    } catch {
      return "Live proof completed";
    }
  }

  return rawPreview.slice(0, 500) || "Live proof completed";
}

function getArtifactDetails(data: unknown) {
  if (!isPlainObject(data)) {
    return undefined;
  }

  const details: Record<string, string> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string" && value.trim().length > 0) {
      details[key] = value;
      continue;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      details[key] = String(value);
    }
  }

  return Object.keys(details).length > 0 ? details : undefined;
}

function getScreenshotArtifactDetails(data: unknown) {
  if (!isPlainObject(data)) {
    return undefined;
  }

  const metadata = isPlainObject(data.metadata) ? data.metadata : undefined;
  const details: Record<string, string> = {};

  if (typeof data.screenshot === "string" && data.screenshot.startsWith("data:image/")) {
    details.screenshot = "received";
  }

  if (metadata) {
    if (typeof metadata.title === "string" && metadata.title.trim().length > 0) {
      details.title = metadata.title;
    }

    if (typeof metadata.statusCode === "number" && Number.isFinite(metadata.statusCode)) {
      details.statusCode = String(metadata.statusCode);
    }
  }

  return Object.keys(details).length > 0 ? details : undefined;
}

export async function runLiveFulfillmentProof(
  kind: LiveProofKind,
): Promise<
  | { success: true; data: LiveProofResponse }
  | { success: false; error: string }
> {
  if (!locusClient.isLive()) {
    return {
      success: false,
      error: "Live mode is not enabled",
    };
  }

  const createdAt = new Date().toISOString();

  if (kind === "search") {
    const result = await locusClient.wrapped.exaSearch({
      query: "landing page audit competitor analysis",
      numResults: 5,
    });

    if (result.error || !result.data) {
      console.error("[LOCUS PROOF] Exa search failed:", result.error);

      return {
        success: false,
        error: result.error ?? "Unable to run live Exa search proof",
      };
    }

    const responsePreview = getReadablePreview(result);

    store.createTransaction({
      type: "API_CALL",
      description: "Live Exa search proof",
      amount: 0,
      provider: "exa",
      metadata: {
        provider: "exa",
        type: "search",
        timestamp: createdAt,
        response_preview: responsePreview,
        real_locus_call: true,
      },
      created_at: createdAt,
    });

    return {
      success: true,
      data: {
        provider: "exa",
        actionName: "Exa Search",
        createdAt,
        responsePreview,
        requestMetadata: {
          query: "landing page audit competitor analysis",
          numResults: 5,
        },
      },
    };
  }

  const result = await locusClient.wrapped.screenshot({
    url: "https://example.com",
    format: "png",
  });

  if (result.error || !result.data) {
    console.error("[LOCUS PROOF] Screenshot proof failed:", result.error);

    return {
      success: false,
      error: "Screenshot proof unavailable in current beta configuration.",
    };
  }

  const screenshotData = result.data;
  const screenshotObject = isPlainObject(screenshotData) ? screenshotData : undefined;
  const metadata =
    screenshotObject && isPlainObject(screenshotObject.metadata)
      ? screenshotObject.metadata
      : undefined;
  const title =
    metadata && typeof metadata.title === "string" && metadata.title.trim().length > 0
      ? metadata.title
      : "Unknown";
  const statusCode =
    metadata && typeof metadata.statusCode === "number" && Number.isFinite(metadata.statusCode)
      ? metadata.statusCode
      : undefined;
  const responsePreview = `Screenshot captured via Firecrawl scrape.${statusCode ? ` Status ${statusCode}.` : ""}${title !== "Unknown" ? ` Title: ${title}.` : ""}`;

  store.createTransaction({
    type: "API_CALL",
    description: "Live screenshot proof",
    amount: 0,
    provider: "firecrawl",
    metadata: {
      provider: "firecrawl",
      type: "screenshot",
      timestamp: createdAt,
      response_preview: responsePreview,
      real_locus_call: true,
    },
    created_at: createdAt,
  });

  return {
    success: true,
    data: {
      provider: "firecrawl",
      actionName: "Firecrawl Screenshot",
      createdAt,
      responsePreview,
      requestMetadata: {
        url: "https://example.com",
        formats: "screenshot",
      },
      artifactDetails: getScreenshotArtifactDetails(screenshotData) ?? getArtifactDetails(screenshotData),
    },
  };
}

export type { LiveProofKind, LiveProofResponse };
