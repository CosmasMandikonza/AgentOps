"use client";

import { useEffect, useRef, useState } from "react";

import { FleetDashboard } from "@/components/FleetDashboard";
import { LocusControlPanel } from "@/components/LocusControlPanel";
import {
  SpawnAgentModal,
  type SpawnAgentResult,
  type SpawnAgentPayload,
} from "@/components/SpawnAgentModal";
import { TerminalBackdrop } from "@/components/TerminalBackdrop";
import type { Agent, FleetStats } from "@/lib/types";

type AgentsResponse = {
  agents: Agent[];
  stats: FleetStats;
  error?: string;
};

type LocusStatusResponse = {
  connected: boolean;
  balance?: number;
  mode: "live" | "mock";
  network: "base";
  error?: string;
  lastUpdatedAt?: string;
  walletAddress?: string;
};

type LocusStatusApiResponse = {
  success?: boolean;
  data?: Partial<LocusStatusResponse> & {
    modeUpdatedAt?: string;
    error?: string;
  };
  error?: string;
};

type SpawnAgentResponse = {
  success?: boolean;
  agent?: Agent;
  deployment?: SpawnAgentResult["deployment"];
  error?: string;
  details?: unknown;
};

const EMPTY_STATS: FleetStats = {
  total_agents: 0,
  total_revenue: 0,
  total_costs: 0,
  total_profit: 0,
  total_orders: 0,
};

function getStatusPill(status: LocusStatusResponse | null, statusError: string | null) {
  if (statusError || !status) {
    return {
      label: "UNAVAILABLE",
      tone: "text-[var(--danger)]",
      border: "border-[var(--danger)]",
      background: "bg-[rgba(255,51,102,0.08)]",
      dot: "bg-[var(--danger)]",
      pulse: false,
    };
  }

  if (status.mode === "live" && status.connected) {
    return {
      label: "LIVE",
      tone: "text-[var(--accent)]",
      border: "border-[var(--accent)]",
      background: "bg-[var(--accent-glow)]",
      dot: "bg-[var(--accent)]",
      pulse: true,
    };
  }

  if (status.mode === "live" && status.error) {
    return {
      label: "LIVE (ERROR)",
      tone: "text-[var(--danger)]",
      border: "border-[var(--danger)]",
      background: "bg-[rgba(255,51,102,0.08)]",
      dot: "bg-[var(--danger)]",
      pulse: false,
    };
  }

  return {
    label: "DEMO",
    tone: "text-[var(--warning)]",
    border: "border-[var(--warning)]",
    background: "bg-[rgba(255,184,0,0.08)]",
    dot: "bg-[var(--warning)]",
    pulse: false,
  };
}

export function DashboardShell() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<FleetStats>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locusStatus, setLocusStatus] = useState<LocusStatusResponse | null>(null);
  const [locusStatusError, setLocusStatusError] = useState<string | null>(null);
  const [isLocusPanelOpen, setIsLocusPanelOpen] = useState(false);
  const [isLocusUpdating, setIsLocusUpdating] = useState(false);
  const isAgentsRequestInFlightRef = useRef(false);
  const isLocusStatusRequestInFlightRef = useRef(false);

  const normalizeLocusStatus = (
    payload: LocusStatusApiResponse,
  ): LocusStatusResponse | null => {
    if (!payload.data) {
      return null;
    }

    return {
      connected: payload.data.connected === true,
      balance:
        typeof payload.data.balance === "number"
          ? payload.data.balance
          : undefined,
      mode: payload.data.mode === "live" ? "live" : "mock",
      network: payload.data.network === "base" ? "base" : "base",
      error:
        typeof payload.data.error === "string"
          ? payload.data.error
          : typeof payload.error === "string"
            ? payload.error
            : undefined,
      lastUpdatedAt:
        typeof payload.data.lastUpdatedAt === "string"
          ? payload.data.lastUpdatedAt
          : undefined,
      walletAddress:
        typeof payload.data.walletAddress === "string"
          ? payload.data.walletAddress
          : undefined,
    };
  };

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      if (isAgentsRequestInFlightRef.current) {
        return;
      }

      isAgentsRequestInFlightRef.current = true;

      try {
        const response = await fetch("/api/agents", {
          cache: "no-store",
        });
        const payload = (await response.json()) as AgentsResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load agents");
        }

        if (!isMounted) {
          return;
        }

        setAgents(payload.agents);
        setStats(payload.stats);
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load dashboard",
        );
      } finally {
        isAgentsRequestInFlightRef.current = false;

        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchDashboardData();
    const intervalId = window.setInterval(() => {
      void fetchDashboardData();
    }, 8000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const parseJsonPayload = async <T,>(response: Response): Promise<T | null> => {
      const rawText = await response.text();

      try {
        return JSON.parse(rawText) as T;
      } catch {
        return null;
      }
    };

    const fetchLocusStatus = async () => {
      if (isLocusStatusRequestInFlightRef.current) {
        return;
      }

      isLocusStatusRequestInFlightRef.current = true;

      try {
        const response = await fetch("/api/locus/status", {
          cache: "no-store",
        });
        const payload = await parseJsonPayload<LocusStatusApiResponse>(response);

        if (!payload) {
          throw new Error("Unable to load Locus status");
        }

        if (!isMounted) {
          return;
        }

        const normalizedStatus = normalizeLocusStatus(payload);

        if (normalizedStatus) {
          setLocusStatus(normalizedStatus);
        }

        if (!response.ok || payload.success !== true) {
          if (normalizedStatus) {
            setLocusStatusError(null);
            return;
          }

          throw new Error(payload.error ?? "Unable to load Locus status");
        }

        setLocusStatusError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLocusStatusError(
          error instanceof Error ? error.message : "Unable to load Locus status",
        );
      } finally {
        isLocusStatusRequestInFlightRef.current = false;
      }
    };

    void fetchLocusStatus();
    const intervalId = window.setInterval(() => {
      void fetchLocusStatus();
    }, 45000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const handleDeploy = async (payload: SpawnAgentPayload) => {
    const response = await fetch("/api/agents/spawn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as SpawnAgentResponse;

    if (!response.ok || result.success !== true || !result.agent) {
      throw new Error(result.error ?? "Unable to spawn agent");
    }

    const refreshResponse = await fetch("/api/agents", {
      cache: "no-store",
    });
    const refreshPayload = (await refreshResponse.json()) as AgentsResponse;

    if (refreshResponse.ok) {
      setAgents(refreshPayload.agents);
      setStats(refreshPayload.stats);
      setErrorMessage(null);
    }

    return {
      deployment: result.deployment,
    } satisfies SpawnAgentResult;
  };

  const handleLocusModeChange = async (mode: "live" | "mock") => {
    setIsLocusUpdating(true);

    try {
      const parseJsonPayload = async <T,>(response: Response): Promise<T | null> => {
        const rawText = await response.text();

        try {
          return JSON.parse(rawText) as T;
        } catch {
          return null;
        }
      };

      const response = await fetch("/api/locus/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
        }),
      });
      const payload = await parseJsonPayload<LocusStatusApiResponse>(response);

      if (!payload) {
        throw new Error("Unable to update Locus mode");
      }

      const normalizedStatus = normalizeLocusStatus(payload);

      if (normalizedStatus) {
        setLocusStatus(normalizedStatus);
      }

      if (!response.ok || payload.success !== true) {
        if (normalizedStatus) {
          setLocusStatusError(null);
          return;
        }

        throw new Error(payload.error ?? "Unable to update Locus mode");
      }

      setLocusStatusError(null);
    } catch (error) {
      setLocusStatusError(
        error instanceof Error ? error.message : "Unable to update Locus mode",
      );
    } finally {
      setIsLocusUpdating(false);
    }
  };

  const statusPill = getStatusPill(locusStatus, locusStatusError);

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-bg px-4 py-6 sm:px-6 lg:px-8">
        <TerminalBackdrop />

        <div className="relative z-10 mx-auto max-w-[1400px] space-y-6">
          <header className="flex flex-col gap-4 border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-mono text-xl uppercase tracking-[0.32em] text-accent">
                AGENTOPS
              </h1>
              <div className="mt-2 flex items-center gap-3">
                <p className="text-sm text-muted">Fleet Dashboard</p>
                <div
                  className={`inline-flex items-center gap-2 border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.2em] ${statusPill.border} ${statusPill.background} ${statusPill.tone}`}
                >
                  <span className="relative flex h-2 w-2">
                    {statusPill.pulse ? (
                      <span
                        className={`absolute inset-0 animate-[status-pulse_2s_ease-out_infinite] ${statusPill.dot}`}
                      />
                    ) : null}
                    <span
                      className={`relative z-10 block h-full w-full ${statusPill.dot}`}
                    />
                  </span>
                  <span>{statusPill.label}</span>
                </div>
              </div>
            </div>

            <div className="relative flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsLocusPanelOpen((current) => !current)}
                className="inline-flex items-center justify-center border border-[var(--border)] bg-[var(--bg)] px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-[var(--text)] transition-colors duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                Locus Control
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center bg-accent px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.22em] text-black transition-opacity duration-150 hover:opacity-90"
              >
                SPAWN AGENT
              </button>

              <LocusControlPanel
                isOpen={isLocusPanelOpen}
                status={locusStatus}
                statusError={locusStatusError}
                isUpdating={isLocusUpdating}
                onClose={() => setIsLocusPanelOpen(false)}
                onToggleMode={handleLocusModeChange}
              />
            </div>
          </header>

          {errorMessage ? (
            <div className="border border-[var(--danger)] bg-[var(--surface)] px-4 py-3 font-mono text-xs uppercase tracking-[0.18em] text-[var(--danger)]">
              {errorMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="border border-[var(--border)] bg-[var(--surface)] px-4 py-6 font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              Loading fleet telemetry...
            </div>
          ) : (
            <FleetDashboard agents={agents} stats={stats} />
          )}
        </div>
      </main>

      <SpawnAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDeploy={handleDeploy}
      />
    </>
  );
}
