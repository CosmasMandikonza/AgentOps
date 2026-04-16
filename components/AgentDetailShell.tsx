"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { TerminalBackdrop } from "@/components/TerminalBackdrop";
import { TransactionFeed } from "@/components/TransactionFeed";
import type { Agent, Transaction } from "@/lib/types";

type AgentDetailResponse = {
  success?: boolean;
  data?: {
    agent?: Agent | null;
    deploymentProof?: {
      deploymentId: string;
      status: string;
      startedAt: string;
      liveUrl: string | null;
      provider: string;
      real_locus_call: true;
    } | null;
  };
  error?: string;
};

type AgentDeploymentProof =
  NonNullable<AgentDetailResponse["data"]>["deploymentProof"];

type TransactionsResponse = {
  success?: boolean;
  data?: {
    transactions: Transaction[];
  };
  error?: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getStatusTone(status: Agent["status"]) {
  switch (status) {
    case "live":
      return "border-[var(--accent)] text-[var(--accent)] bg-[rgba(0,255,136,0.08)]";
    case "deploying":
      return "border-[var(--warning)] text-[var(--warning)] bg-[rgba(255,184,0,0.08)]";
    case "processing":
      return "border-[var(--warning)] text-[var(--warning)] bg-[rgba(255,184,0,0.08)]";
    case "error":
      return "border-[var(--danger)] text-[var(--danger)] bg-[rgba(255,51,102,0.08)]";
    default:
      return "border-[var(--border)] text-[var(--muted)] bg-[var(--bg)]";
  }
}

type AgentDetailShellProps = {
  agentId: string;
};

export function AgentDetailShell({ agentId }: AgentDetailShellProps) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deploymentProof, setDeploymentProof] =
    useState<AgentDeploymentProof | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const agentRequestInFlightRef = useRef(false);
  const txRequestInFlightRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAgent = async () => {
      if (agentRequestInFlightRef.current) {
        return;
      }

      agentRequestInFlightRef.current = true;

      try {
        const response = await fetch(`/api/agents/${agentId}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as AgentDetailResponse;

        if (!response.ok || payload.success !== true) {
          throw new Error(payload.error ?? "Unable to load agent");
        }

        if (!isMounted) {
          return;
        }

        setAgent(payload.data?.agent ?? null);
        setDeploymentProof(payload.data?.deploymentProof ?? null);
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setAgent(null);
        setDeploymentProof(null);
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load agent",
        );
      } finally {
        agentRequestInFlightRef.current = false;
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const fetchTransactions = async () => {
      if (txRequestInFlightRef.current) {
        return;
      }

      txRequestInFlightRef.current = true;

      try {
        const response = await fetch(`/api/transactions?agentId=${agentId}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as TransactionsResponse;

        if (!response.ok || payload.success !== true) {
          throw new Error(payload.error ?? "Unable to load transactions");
        }

        if (!isMounted) {
          return;
        }

        setTransactions(payload.data?.transactions ?? []);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setTransactions([]);
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to load transactions",
        );
      } finally {
        txRequestInFlightRef.current = false;
      }
    };

    void fetchAgent();
    void fetchTransactions();

    const intervalId = window.setInterval(() => {
      void fetchAgent();
      void fetchTransactions();
    }, 8000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [agentId]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg px-4 py-6 sm:px-6 lg:px-8">
      <TerminalBackdrop />

      <div className="relative z-10 mx-auto max-w-[1400px] space-y-6">
        <header className="flex flex-col gap-4 border border-[var(--border)] bg-[rgba(20,20,20,0.86)] p-4 backdrop-blur-md sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center font-mono text-xs uppercase tracking-[0.22em] text-[var(--muted)] transition-colors duration-150 hover:text-[var(--accent)]"
            >
              Back to Fleet
            </Link>
            <div>
              <h1 className="font-mono text-xl uppercase tracking-[0.28em] text-[var(--text)]">
                {agent?.name ?? "Agent Detail"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                {agent?.description ?? "Inspect fulfillment activity, proof rows, and operating state for this service."}
              </p>
            </div>
          </div>

          {agent ? (
            <span
              className={`w-fit border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] ${getStatusTone(agent.status)}`}
            >
              {agent.status}
            </span>
          ) : null}
        </header>

        {isLoading ? (
          <div className="border border-[var(--border)] bg-[rgba(20,20,20,0.86)] px-4 py-6 font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)] backdrop-blur-md">
            Loading agent detail...
          </div>
        ) : null}

        {errorMessage && !agent ? (
          <div className="border border-[var(--border)] bg-[rgba(20,20,20,0.86)] px-4 py-6 backdrop-blur-md">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Agent unavailable
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              {errorMessage}
            </p>
          </div>
        ) : null}

        {agent ? (
          <>
            <section className="grid gap-4 lg:grid-cols-4">
              <div className="border border-[var(--border)] bg-[rgba(20,20,20,0.86)] p-4 backdrop-blur-md">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Price
                </p>
                <p className="mt-3 font-mono text-2xl text-[var(--text)]">
                  {formatCurrency(agent.price_usdc)}
                </p>
              </div>
              <div className="border border-[var(--border)] bg-[rgba(20,20,20,0.86)] p-4 backdrop-blur-md">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Revenue
                </p>
                <p className="mt-3 font-mono text-2xl text-[var(--accent)]">
                  {formatCurrency(agent.total_revenue)}
                </p>
              </div>
              <div className="border border-[var(--border)] bg-[rgba(20,20,20,0.86)] p-4 backdrop-blur-md">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Costs
                </p>
                <p className="mt-3 font-mono text-2xl text-[var(--danger)]">
                  {formatCurrency(agent.total_costs)}
                </p>
              </div>
              <div className="border border-[var(--border)] bg-[rgba(20,20,20,0.86)] p-4 backdrop-blur-md">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  Orders
                </p>
                <p className="mt-3 font-mono text-2xl text-[var(--text)]">
                  {agent.orders_completed}
                </p>
              </div>
            </section>

            {deploymentProof ? (
              <section className="border border-[var(--border)] bg-[rgba(20,20,20,0.86)] p-4 backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                      Deployment Proof
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                      Build-backed deployment artifact stored for this agent.
                    </p>
                  </div>
                  <span className="border border-[var(--accent)] bg-[rgba(0,255,136,0.08)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]">
                    Live
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                      Deployment
                    </p>
                    <p className="mt-1 break-all font-mono text-sm text-[var(--text)]">
                      {deploymentProof.deploymentId}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                      Status
                    </p>
                    <p className="mt-1 font-mono text-sm text-[var(--text)]">
                      {deploymentProof.status}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                      Provider
                    </p>
                    <p className="mt-1 font-mono text-sm text-[var(--text)]">
                      {deploymentProof.provider}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                      Live URL
                    </p>
                    {deploymentProof.liveUrl ? (
                      <Link
                        href={deploymentProof.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block break-all text-sm text-[var(--accent)] underline underline-offset-4"
                      >
                        {deploymentProof.liveUrl}
                      </Link>
                    ) : (
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        Pending
                      </p>
                    )}
                  </div>
                </div>
              </section>
            ) : null}

            <section className="space-y-3">
              <div className="border border-[var(--border)] bg-[rgba(20,20,20,0.86)] p-4 backdrop-blur-md">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                  Fulfillment Activity
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  Live and simulated proof rows for this agent appear here in chronological order.
                </p>
              </div>

              {transactions.length > 0 ? (
                <TransactionFeed transactions={transactions} maxHeight="none" />
              ) : (
                <div className="border border-[var(--border)] bg-[rgba(20,20,20,0.86)] px-4 py-6 backdrop-blur-md">
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                    No activity yet
                  </p>
                  <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
                    This agent has not recorded transactions yet.
                  </p>
                </div>
              )}
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
