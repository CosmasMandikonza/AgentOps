"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ExpandableScreen } from "@/components/ui/expandable-screen";
import { formatTimestamp, formatUSDC } from "@/lib/utils";

type LocusStatus = {
  connected: boolean;
  balance?: number;
  mode: "live" | "mock";
  network: "base";
  error?: string;
  lastUpdatedAt?: string;
  walletAddress?: string;
};

type LocusControlPanelProps = {
  isOpen: boolean;
  status: LocusStatus | null;
  statusError: string | null;
  isUpdating: boolean;
  onClose: () => void;
  onToggleMode: (mode: "live" | "mock") => Promise<void> | void;
};

type LiveCheckoutSessionResponse = {
  success?: boolean;
  data?: {
    sessionId?: string;
    checkoutUrl?: string;
    createdAt?: string;
    status?: string;
    amount?: string;
    currency?: string;
    expiresAt?: string;
  };
  error?: string;
};

type LiveCheckoutSessionProof = NonNullable<LiveCheckoutSessionResponse["data"]>;

type LiveFulfillmentProofResponse = {
  success?: boolean;
  data?: {
    provider?: string;
    actionName?: string;
    createdAt?: string;
    responsePreview?: string;
    requestMetadata?: Record<string, string | number>;
    artifactDetails?: Record<string, string>;
  };
  error?: string;
};

type LiveFulfillmentProof = NonNullable<LiveFulfillmentProofResponse["data"]>;
type Tone = "live" | "ready" | "warning" | "danger" | "muted";

function getModeLabel(status: LocusStatus | null, statusError: string | null) {
  if (statusError || !status) {
    return "UNAVAILABLE";
  }

  if (status.mode === "live" && status.connected) {
    return "LIVE";
  }

  if (status.mode === "live" && status.error) {
    return "LIVE (ERROR)";
  }

  return "DEMO";
}

function isUnavailableMessage(message: string | null) {
  if (!message) {
    return false;
  }

  const normalized = message.toLowerCase();
  return (
    normalized.includes("unavailable") ||
    normalized.includes("404") ||
    normalized.includes("not found")
  );
}

function truncateLine(value: string, max = 88) {
  return value.length <= max ? value : `${value.slice(0, max - 3)}...`;
}

function buildWalletSummary(status: LocusStatus | null) {
  if (status?.mode === "live" && status.connected && typeof status.balance === "number") {
    return `${formatUSDC(status.balance)} USDC available on ${status.network}.`;
  }

  if (status?.mode === "live") {
    return "Live wallet status could not be verified.";
  }

  return "Switch to Live mode to verify the operator wallet.";
}

function buildCheckoutSummary(
  proof: LiveCheckoutSessionProof | null,
  error: string | null,
  canRun: boolean,
) {
  if (proof) {
    const amount = `${proof.amount ?? "1.00"} ${proof.currency ?? "USDC"}`;
    const created = proof.createdAt ? formatTimestamp(proof.createdAt) : "[--:--:--]";
    return `${proof.status ?? "created"} | ${amount} | ${created}`;
  }

  if (error) {
    return "Live checkout session could not be created.";
  }

  if (canRun) {
    return "Create a real hosted checkout session.";
  }

  return "Available when Live mode is enabled.";
}

function buildSearchSummary(
  proof: LiveFulfillmentProof | null,
  error: string | null,
  canRun: boolean,
) {
  if (proof) {
    const numResults = proof.requestMetadata?.numResults;
    const query =
      typeof proof.requestMetadata?.query === "string"
        ? proof.requestMetadata.query
        : "live query";
    const resultLabel = typeof numResults === "number" ? `${numResults} results` : "results";
    return `Returned ${resultLabel} from Exa for ${truncateLine(query, 36)}.`;
  }

  if (error) {
    return "Search proof is unavailable right now.";
  }

  if (canRun) {
    return "Run a live wrapped search proof.";
  }

  return "Available when Live mode is enabled.";
}

function buildScreenshotSummary(
  proof: LiveFulfillmentProof | null,
  error: string | null,
  canRun: boolean,
) {
  if (proof) {
    const title =
      typeof proof.artifactDetails?.title === "string" ? proof.artifactDetails.title : null;
    const statusCode =
      typeof proof.artifactDetails?.statusCode === "string"
        ? proof.artifactDetails.statusCode
        : null;

    if (title && statusCode) {
      return `Captured homepage screenshot (${statusCode}) for ${truncateLine(title, 44)}.`;
    }

    if (title) {
      return `Captured homepage screenshot for ${truncateLine(title, 50)}.`;
    }

    return "Captured homepage screenshot via Firecrawl.";
  }

  if (isUnavailableMessage(error)) {
    return "Screenshot proof unavailable in current beta configuration.";
  }

  if (error) {
    return "Screenshot proof could not be created.";
  }

  if (canRun) {
    return "Run a live screenshot proof.";
  }

  return "Available when Live mode is enabled.";
}

function SummaryBadge({ label, tone }: { label: string; tone: Tone }) {
  const classes: Record<Tone, string> = {
    live: "bg-[rgba(0,255,136,0.2)] text-[var(--accent)]",
    ready: "bg-[rgba(255,184,0,0.16)] text-[var(--warning)]",
    warning: "bg-[rgba(255,184,0,0.16)] text-[var(--warning)]",
    danger: "bg-[rgba(255,51,102,0.12)] text-[var(--danger)]",
    muted: "bg-[var(--border)] text-[var(--muted)]",
  };

  return (
    <span
      className={`shrink-0 px-1.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] ${classes[tone]}`}
    >
      {label}
    </span>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-w-0 grid-cols-[4.75rem_1fr] gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
      <span className="text-[var(--muted)]">{label}</span>
      <span className="min-w-0 truncate text-[var(--text)]">{value}</span>
    </div>
  );
}

function DetailRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="grid gap-2 border-b border-[var(--border)] py-3 sm:grid-cols-[10rem_1fr] sm:gap-4">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </div>
      {href ? (
        <Link
          href={href}
          target="_blank"
          rel="noreferrer"
          className="break-all text-sm leading-7 text-[var(--accent)] underline underline-offset-4"
        >
          {value}
        </Link>
      ) : (
        <div className="break-all text-sm leading-7 text-[var(--text)]">{value}</div>
      )}
    </div>
  );
}

function DetailState({
  title,
  message,
  tone = "muted",
}: {
  title: string;
  message: string;
  tone?: "muted" | "warning" | "danger";
}) {
  const classes =
    tone === "danger"
      ? "border-[var(--danger)] bg-[rgba(255,51,102,0.06)] text-[var(--danger)]"
      : tone === "warning"
        ? "border-[var(--warning)] bg-[rgba(255,184,0,0.08)] text-[var(--warning)]"
        : "border-[var(--border)] bg-[var(--bg)] text-[var(--text-secondary)]";

  return (
    <div className={`space-y-2 border px-4 py-4 ${classes}`}>
      <p className="font-mono text-[11px] uppercase tracking-[0.22em]">{title}</p>
      <p className="text-sm leading-7">{message}</p>
    </div>
  );
}

function DetailMetadata({
  title,
  data,
}: {
  title: string;
  data?: Record<string, string | number>;
}) {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <div className="border border-[var(--border)] bg-[var(--bg)] px-4 py-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
        {title}
      </p>
      <div className="mt-2">
        {Object.entries(data).map(([key, value]) => (
          <DetailRow key={key} label={key} value={String(value)} />
        ))}
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  tone = "accent",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "accent" | "muted";
}) {
  const classes =
    tone === "accent"
      ? "border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-glow)]"
      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--warning)] hover:text-[var(--warning)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`border bg-[var(--surface)] px-2.5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors duration-150 ${classes} disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:text-[var(--muted)] disabled:hover:bg-[var(--surface)]`}
    >
      {children}
    </button>
  );
}

function ProofCard({
  layoutId,
  title,
  badgeLabel,
  badgeTone,
  action,
  provider,
  createdAt,
  statusLine,
  actions,
  children,
  disabled = false,
  disabledLabel,
}: {
  layoutId: string;
  title: string;
  badgeLabel: string;
  badgeTone: Tone;
  action: string;
  provider: string;
  createdAt?: string;
  statusLine: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  disabledLabel?: string;
}) {
  return (
    <ExpandableScreen
      layoutId={layoutId}
      title={title}
      actions={actions}
      disabled={disabled}
      disabledLabel={disabledLabel}
      className="w-full"
      summary={
        <>
          <div className="flex items-start justify-between gap-3">
            <p className="min-w-0 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text)]">
              {title}
            </p>
            <SummaryBadge label={badgeLabel} tone={badgeTone} />
          </div>
          <SummaryRow label="Action" value={action} />
          <SummaryRow label="Provider" value={provider} />
          <SummaryRow
            label="Created"
            value={createdAt ? formatTimestamp(createdAt) : "[--:--:--]"}
          />
          <p className="text-xs leading-6 text-[var(--text-secondary)]">{statusLine}</p>
        </>
      }
    >
      {children}
    </ExpandableScreen>
  );
}

export function LocusControlPanel({
  isOpen,
  status,
  statusError,
  isUpdating,
  onClose,
  onToggleMode,
}: LocusControlPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [checkoutSession, setCheckoutSession] = useState<LiveCheckoutSessionProof | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isRunningSearchProof, setIsRunningSearchProof] = useState(false);
  const [isRunningScreenshotProof, setIsRunningScreenshotProof] = useState(false);
  const [searchProof, setSearchProof] = useState<LiveFulfillmentProof | null>(null);
  const [screenshotProof, setScreenshotProof] = useState<LiveFulfillmentProof | null>(null);
  const [searchProofError, setSearchProofError] = useState<string | null>(null);
  const [screenshotProofError, setScreenshotProofError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const parseJsonPayload = async <T,>(response: Response): Promise<T | null> => {
    const rawText = await response.text();

    try {
      return JSON.parse(rawText) as T;
    } catch {
      return null;
    }
  };

  const handleCreateLiveCheckout = async () => {
    if (isCreatingCheckout) {
      return;
    }

    setIsCreatingCheckout(true);
    setCheckoutError(null);
    setCheckoutSession(null);

    try {
      const response = await fetch("/api/locus/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const payload = await parseJsonPayload<LiveCheckoutSessionResponse>(response);

      if (
        !payload ||
        !response.ok ||
        payload.success !== true ||
        !payload.data?.sessionId ||
        !payload.data.checkoutUrl
      ) {
        throw new Error(payload?.error ?? "Unable to create live checkout session");
      }

      setCheckoutSession(payload.data);
    } catch (error) {
      setCheckoutSession(null);
      setCheckoutError(
        error instanceof Error ? error.message : "Unable to create live checkout session",
      );
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const handleRunLiveProof = async (kind: "search" | "screenshot", path: string) => {
    const setLoading =
      kind === "search" ? setIsRunningSearchProof : setIsRunningScreenshotProof;
    const setProof = kind === "search" ? setSearchProof : setScreenshotProof;
    const setError =
      kind === "search" ? setSearchProofError : setScreenshotProofError;

    if (
      (kind === "search" && isRunningSearchProof) ||
      (kind === "screenshot" && isRunningScreenshotProof)
    ) {
      return;
    }

    setLoading(true);
    setProof(null);
    setError(null);

    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const payload = await parseJsonPayload<LiveFulfillmentProofResponse>(response);

      if (
        !payload ||
        !response.ok ||
        payload.success !== true ||
        !payload.data?.provider ||
        !payload.data?.actionName ||
        !payload.data?.responsePreview
      ) {
        throw new Error(payload?.error ?? "Unable to run live fulfillment proof");
      }

      setProof(payload.data);
    } catch (error) {
      setProof(null);
      setError(
        error instanceof Error ? error.message : "Unable to run live fulfillment proof",
      );
    } finally {
      setLoading(false);
    }
  };

  const modeLabel = getModeLabel(status, statusError);
  const liveSelected = status?.mode === "live";
  const demoSelected = !liveSelected;
  const canCreateLiveCheckout = status?.mode === "live";
  const canRunLiveProof = status?.mode === "live";
  const screenshotUnavailable = isUnavailableMessage(screenshotProofError);

  const walletTone: Tone =
    status?.mode === "live" && status.connected
      ? "live"
      : status?.mode === "live"
        ? "danger"
        : "muted";
  const walletLine = buildWalletSummary(status);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-30 mt-3 flex max-h-[calc(100vh-5rem)] w-[min(24rem,calc(100vw-1rem))] flex-col overflow-x-hidden border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[0_0_24px_rgba(0,0,0,0.35)]"
    >
      <div className="shrink-0 border-b border-[var(--border)] pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              Locus Control
            </p>
            <p className="mt-2 font-mono text-sm uppercase tracking-[0.18em] text-[var(--text)]">
              {modeLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] transition-colors duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            Close
          </button>
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-5 overflow-y-auto overflow-x-hidden pr-1">
        <div className="space-y-3 border border-[var(--border)] bg-[var(--bg)] px-3 py-3">
          <SummaryRow label="Mode" value={status?.mode?.toUpperCase() ?? "UNKNOWN"} />
          <SummaryRow label="Connected" value={status?.connected ? "YES" : "NO"} />
          <SummaryRow
            label="Updated"
            value={status?.lastUpdatedAt ? formatTimestamp(status.lastUpdatedAt) : "[--:--:--]"}
          />
          {statusError || status?.error ? (
            <p className="text-xs leading-6 text-[var(--danger)]">
              {statusError ?? status?.error}
            </p>
          ) : null}
        </div>

        <ProofCard
          layoutId="wallet-proof"
          title="Wallet Artifact"
          badgeLabel={walletTone === "live" ? "LIVE" : walletTone === "danger" ? "ERROR" : "READY"}
          badgeTone={walletTone}
          action="Wallet Status"
          provider="pay"
          createdAt={status?.lastUpdatedAt}
          statusLine={walletLine}
        >
          {status?.mode === "live" && status.connected ? (
            <div className="space-y-4">
              <DetailState
                title="Live Wallet"
                message="The operator wallet is connected and reporting a live balance."
              />
              <div className="border border-[var(--border)] bg-[var(--bg)] px-4 py-4">
                <DetailRow
                  label="Balance"
                  value={
                    typeof status.balance === "number"
                      ? `${formatUSDC(status.balance)} USDC`
                      : "N/A"
                  }
                />
                <DetailRow label="Network" value={status.network} />
                {status.walletAddress ? (
                  <DetailRow label="Address" value={status.walletAddress} />
                ) : null}
              </div>
            </div>
          ) : (
            <DetailState
              title="Wallet Proof Pending"
              message={
                status?.mode === "live"
                  ? "The wallet could not be verified from the current live response."
                  : "Switch the app to Live mode to view the live wallet artifact."
              }
              tone={status?.mode === "live" ? "danger" : "warning"}
            />
          )}
        </ProofCard>

        <ProofCard
          layoutId="checkout-proof"
          title="Checkout Artifact"
          badgeLabel={
            checkoutSession
              ? "LIVE"
              : checkoutError
                ? "ERROR"
                : canCreateLiveCheckout
                  ? "READY"
                  : "DEMO"
          }
          badgeTone={
            checkoutSession
              ? "live"
              : checkoutError
                ? "danger"
                : canCreateLiveCheckout
                  ? "ready"
                  : "muted"
          }
          action="Checkout Session"
          provider="checkout"
          createdAt={checkoutSession?.createdAt}
          statusLine={buildCheckoutSummary(
            checkoutSession,
            checkoutError,
            canCreateLiveCheckout,
          )}
          actions={
            <ActionButton
              onClick={() => void handleCreateLiveCheckout()}
              disabled={!canCreateLiveCheckout || isCreatingCheckout}
            >
              {isCreatingCheckout ? "Creating..." : "Create"}
            </ActionButton>
          }
        >
          {checkoutSession ? (
            <div className="space-y-4">
              <DetailState
                title="Live Checkout"
                message="A live hosted checkout session was created successfully."
              />
              <div className="border border-[var(--border)] bg-[var(--bg)] px-4 py-4">
                <DetailRow label="Session ID" value={checkoutSession.sessionId ?? ""} />
                <DetailRow
                  label="Checkout URL"
                  value={checkoutSession.checkoutUrl ?? ""}
                  href={checkoutSession.checkoutUrl}
                />
                <DetailRow label="Status" value={checkoutSession.status ?? "created"} />
                <DetailRow
                  label="Amount"
                  value={`${checkoutSession.amount ?? "1.00"} ${checkoutSession.currency ?? "USDC"}`}
                />
                <DetailRow
                  label="Created"
                  value={
                    checkoutSession.createdAt
                      ? formatTimestamp(checkoutSession.createdAt)
                      : "[--:--:--]"
                  }
                />
                <DetailRow
                  label="Expires"
                  value={
                    checkoutSession.expiresAt
                      ? formatTimestamp(checkoutSession.expiresAt)
                      : "[--:--:--]"
                  }
                />
              </div>
            </div>
          ) : (
            <DetailState
              title={checkoutError ? "Checkout Unavailable" : "No Live Checkout Yet"}
              message={
                checkoutError
                  ? "The live checkout artifact could not be created from the current response."
                  : canCreateLiveCheckout
                    ? "Create a live checkout session from the summary card to populate this artifact."
                    : "Switch the app to Live mode before creating a live checkout artifact."
              }
              tone={checkoutError ? "danger" : canCreateLiveCheckout ? "muted" : "warning"}
            />
          )}
        </ProofCard>

        <ProofCard
          layoutId="search-proof"
          title="Search Artifact"
          badgeLabel={
            searchProof
              ? "LIVE"
              : searchProofError
                ? "ERROR"
                : canRunLiveProof
                  ? "READY"
                  : "DEMO"
          }
          badgeTone={
            searchProof
              ? "live"
              : searchProofError
                ? "danger"
                : canRunLiveProof
                  ? "ready"
                  : "muted"
          }
          action={searchProof?.actionName ?? "Exa Search"}
          provider={searchProof?.provider ?? "exa"}
          createdAt={searchProof?.createdAt}
          statusLine={buildSearchSummary(searchProof, searchProofError, canRunLiveProof)}
          actions={
            <ActionButton
              onClick={() => void handleRunLiveProof("search", "/api/locus/proof/search")}
              disabled={!canRunLiveProof || isRunningSearchProof}
            >
              {isRunningSearchProof ? "Running..." : "Run"}
            </ActionButton>
          }
        >
          {searchProof ? (
            <div className="space-y-4">
              <DetailState
                title="Live Search"
                message="The live wrapped search proof completed and returned a response artifact."
              />
              <div className="border border-[var(--border)] bg-[var(--bg)] px-4 py-4">
                <DetailRow label="Action" value={searchProof.actionName ?? "Exa Search"} />
                <DetailRow label="Provider" value={searchProof.provider ?? "exa"} />
                <DetailRow
                  label="Created"
                  value={
                    searchProof.createdAt
                      ? formatTimestamp(searchProof.createdAt)
                      : "[--:--:--]"
                  }
                />
              </div>
              <DetailMetadata title="Request Metadata" data={searchProof.requestMetadata} />
              <div className="border border-[var(--border)] bg-[var(--bg)] px-4 py-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                  Response Preview
                </p>
                <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--text-secondary)]">
                  {searchProof.responsePreview}
                </pre>
              </div>
            </div>
          ) : (
            <DetailState
              title={searchProofError ? "Search Unavailable" : "No Live Search Yet"}
              message={
                searchProofError
                  ? "The live search proof could not be created from the current configuration."
                  : canRunLiveProof
                    ? "Run the live search proof from the summary card to inspect the artifact."
                    : "Switch the app to Live mode before running a live search proof."
              }
              tone={searchProofError ? "danger" : canRunLiveProof ? "muted" : "warning"}
            />
          )}
        </ProofCard>

        <ProofCard
          layoutId="screenshot-proof"
          title="Screenshot Artifact"
          badgeLabel={
            screenshotProof
              ? "LIVE"
              : screenshotUnavailable
                ? "UNAVAILABLE"
                : screenshotProofError
                  ? "ERROR"
                  : canRunLiveProof
                    ? "READY"
                    : "DEMO"
          }
          badgeTone={
            screenshotProof
              ? "live"
              : screenshotUnavailable
                ? "warning"
                : screenshotProofError
                  ? "danger"
                  : canRunLiveProof
                    ? "ready"
                    : "muted"
          }
          action={screenshotProof?.actionName ?? "Screenshot Capture"}
          provider={screenshotProof?.provider ?? "firecrawl"}
          createdAt={screenshotProof?.createdAt}
          statusLine={buildScreenshotSummary(
            screenshotProof,
            screenshotProofError,
            canRunLiveProof,
          )}
          disabled={screenshotUnavailable}
          disabledLabel="View unavailable"
          actions={
            <ActionButton
              onClick={() => void handleRunLiveProof("screenshot", "/api/locus/proof/screenshot")}
              disabled={!canRunLiveProof || isRunningScreenshotProof || screenshotUnavailable}
              tone={screenshotUnavailable ? "muted" : "accent"}
            >
              {screenshotUnavailable
                ? "Unavailable"
                : isRunningScreenshotProof
                  ? "Running..."
                  : "Run"}
            </ActionButton>
          }
        >
          {screenshotProof ? (
            <div className="space-y-4">
              <DetailState
                title="Live Screenshot"
                message="The live screenshot proof completed and returned an artifact payload."
              />
              <div className="border border-[var(--border)] bg-[var(--bg)] px-4 py-4">
                <DetailRow
                  label="Action"
                  value={screenshotProof.actionName ?? "Screenshot Capture"}
                />
                <DetailRow
                  label="Provider"
                  value={screenshotProof.provider ?? "firecrawl"}
                />
                <DetailRow
                  label="Created"
                  value={
                    screenshotProof.createdAt
                      ? formatTimestamp(screenshotProof.createdAt)
                      : "[--:--:--]"
                  }
                />
              </div>
              <DetailMetadata title="Request Metadata" data={screenshotProof.requestMetadata} />
              <DetailMetadata title="Artifact Details" data={screenshotProof.artifactDetails} />
              <div className="border border-[var(--border)] bg-[var(--bg)] px-4 py-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">
                  Response Preview
                </p>
                <pre className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-[var(--text-secondary)]">
                  {screenshotProof.responsePreview}
                </pre>
              </div>
            </div>
          ) : (
            <DetailState
              title={
                screenshotUnavailable
                  ? "Screenshot Proof Unavailable"
                  : screenshotProofError
                    ? "Screenshot Unavailable"
                    : "No Live Screenshot Yet"
              }
              message={
                screenshotUnavailable
                  ? "Screenshot proof unavailable in current beta configuration."
                  : screenshotProofError
                    ? "The screenshot proof could not be created from the current configuration."
                    : canRunLiveProof
                      ? "Run the live screenshot proof from the summary card to inspect the artifact."
                      : "Switch the app to Live mode before running a live screenshot proof."
              }
              tone={
                screenshotUnavailable
                  ? "warning"
                  : screenshotProofError
                    ? "danger"
                    : canRunLiveProof
                      ? "muted"
                      : "warning"
              }
            />
          )}
        </ProofCard>
      </div>

      <div className="mt-4 shrink-0 border-t border-[var(--border)] bg-[var(--surface)] pt-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          Mode Switch
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => void onToggleMode("mock")}
            className={`px-3 py-3 font-mono text-xs uppercase tracking-[0.22em] transition-colors duration-150 ${
              demoSelected
                ? "border border-[var(--warning)] bg-[rgba(255,184,0,0.08)] text-[var(--warning)]"
                : "border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--warning)] hover:text-[var(--warning)]"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            Demo
          </button>
          <button
            type="button"
            disabled={isUpdating}
            onClick={() => void onToggleMode("live")}
            className={`px-3 py-3 font-mono text-xs uppercase tracking-[0.22em] transition-colors duration-150 ${
              liveSelected
                ? "border border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)]"
                : "border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            Live
          </button>
        </div>
        <p className="mt-3 text-xs leading-6 text-[var(--text-secondary)]">
          This switch changes server-side runtime behavior only. Browser clients
          never receive API keys.
        </p>
      </div>
    </div>
  );
}
