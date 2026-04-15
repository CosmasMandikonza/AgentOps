"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Agent } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";

type ServicePreset = {
  label: string;
  serviceType: Agent["service_type"];
  defaultPrice: number;
  defaultDescription: string;
};

export type SpawnAgentPayload = Pick<
  Agent,
  "name" | "service_type" | "price_usdc" | "budget_cap" | "description"
>;

export type SpawnDeploymentProof = {
  deploymentId: string;
  status: string;
  liveUrl?: string;
  startedAt: string;
};

export type SpawnAgentResult = {
  deployment?: SpawnDeploymentProof;
};

interface SpawnAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeploy: (agent: SpawnAgentPayload) => Promise<SpawnAgentResult> | SpawnAgentResult;
}

const SERVICE_PRESETS: ServicePreset[] = [
  {
    label: "Landing Page Audit",
    serviceType: "landing_page_audit",
    defaultPrice: 15,
    defaultDescription:
      "Conversion-focused landing page teardown with competitor benchmarks, UX observations, and a human-polished action plan.",
  },
  {
    label: "Competitor Intel Report",
    serviceType: "competitor_intel",
    defaultPrice: 20,
    defaultDescription:
      "Fast competitor intelligence report covering positioning, pricing cues, and strategic whitespace for your market.",
  },
  {
    label: "Ad Copy Pack",
    serviceType: "ad_copy_pack",
    defaultPrice: 10,
    defaultDescription:
      "Performance-minded ad copy concepts with hooks, variations, and channel-specific angles for rapid testing.",
  },
  {
    label: "Social Media Teardown",
    serviceType: "social_media_teardown",
    defaultPrice: 12,
    defaultDescription:
      "Profile teardown with content diagnosis, competitor references, and concrete improvements for growth and clarity.",
  },
];

function getDefaultBudget(price: number) {
  return Number((price * 0.4).toFixed(2));
}

function getPresetByLabel(label: string) {
  return (
    SERVICE_PRESETS.find((preset) => preset.label === label) ?? SERVICE_PRESETS[0]
  );
}

export function SpawnAgentModal({
  isOpen,
  onClose,
  onDeploy,
}: SpawnAgentModalProps) {
  const initialPreset = SERVICE_PRESETS[0];
  const [selectedLabel, setSelectedLabel] = useState(initialPreset.label);
  const [serviceName, setServiceName] = useState(initialPreset.label);
  const [priceUsdc, setPriceUsdc] = useState(initialPreset.defaultPrice);
  const [budgetCap, setBudgetCap] = useState(
    getDefaultBudget(initialPreset.defaultPrice),
  );
  const [description, setDescription] = useState(
    initialPreset.defaultDescription,
  );
  const [isDeploying, setIsDeploying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deploymentProof, setDeploymentProof] =
    useState<SpawnDeploymentProof | null>(null);
  const deployTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const preset = getPresetByLabel(selectedLabel);
    setServiceName(preset.label);
    setPriceUsdc(preset.defaultPrice);
    setBudgetCap(getDefaultBudget(preset.defaultPrice));
    setDescription(preset.defaultDescription);
  }, [isOpen, selectedLabel]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    if (deployTimerRef.current) {
      window.clearTimeout(deployTimerRef.current);
      deployTimerRef.current = null;
    }

    const preset = SERVICE_PRESETS[0];
    setSelectedLabel(preset.label);
    setServiceName(preset.label);
    setPriceUsdc(preset.defaultPrice);
    setBudgetCap(getDefaultBudget(preset.defaultPrice));
    setDescription(preset.defaultDescription);
    setIsDeploying(false);
    setErrorMessage(null);
    setDeploymentProof(null);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (deployTimerRef.current) {
        window.clearTimeout(deployTimerRef.current);
      }
    };
  }, []);

  if (!isOpen) {
    return null;
  }

  const selectedPreset = getPresetByLabel(selectedLabel);

  const handlePriceChange = (value: number) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    setPriceUsdc(safeValue);
    setBudgetCap(getDefaultBudget(safeValue));
  };

  const handleDeploy = () => {
    if (isDeploying) {
      return;
    }

    setIsDeploying(true);
    setErrorMessage(null);

    deployTimerRef.current = window.setTimeout(() => {
      void (async () => {
        try {
          const result = await onDeploy({
            name: serviceName.trim() || selectedPreset.label,
            service_type: selectedPreset.serviceType,
            price_usdc: priceUsdc,
            budget_cap: budgetCap,
            description: description.trim() || selectedPreset.defaultDescription,
          });
          deployTimerRef.current = null;
          setIsDeploying(false);
          if (result.deployment) {
            setDeploymentProof(result.deployment);
            return;
          }

          onClose();
        } catch (error) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to deploy agent",
          );
          setIsDeploying(false);
          deployTimerRef.current = null;
        }
      })();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-[480px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_0_24px_rgba(0,0,0,0.35)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-lg uppercase tracking-[0.28em] text-[var(--accent)]">
              DEPLOY NEW AGENT
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Configure service economics before deployment
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xl leading-none text-[var(--muted)] transition-colors duration-150 hover:text-[var(--accent)]"
            aria-label="Close deploy modal"
          >
            X
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="service-type"
              className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--muted)]"
            >
              Service Type
            </label>
            <select
              id="service-type"
              value={selectedLabel}
              onChange={(event) => setSelectedLabel(event.target.value)}
              className="h-11 w-full border border-[var(--border)] bg-[var(--bg)] px-3 font-mono text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
            >
              {SERVICE_PRESETS.map((preset) => (
                <option key={preset.label} value={preset.label}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="service-name"
              className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--muted)]"
            >
              Service Name
            </label>
            <input
              id="service-name"
              type="text"
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
              className="h-11 w-full border border-[var(--border)] bg-[var(--bg)] px-3 font-mono text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="price-usdc"
                className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--muted)]"
              >
                Price (USDC)
              </label>
              <input
                id="price-usdc"
                type="number"
                min="0"
                step="0.01"
                value={priceUsdc}
                onChange={(event) =>
                  handlePriceChange(Number(event.target.value))
                }
                className="h-11 w-full border border-[var(--border)] bg-[var(--bg)] px-3 font-mono text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="budget-cap"
                className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--muted)]"
              >
                Budget Cap (USDC)
              </label>
              <input
                id="budget-cap"
                type="number"
                min="0"
                step="0.01"
                value={budgetCap}
                onChange={(event) => setBudgetCap(Number(event.target.value))}
                className="h-11 w-full border border-[var(--border)] bg-[var(--bg)] px-3 font-mono text-sm text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--muted)]"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full border border-[var(--border)] bg-[var(--bg)] px-3 py-3 font-sans text-sm leading-6 text-[var(--text)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>

        {deploymentProof ? (
          <div className="mt-6 border border-[var(--accent)] bg-[rgba(0,255,136,0.05)] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                Deployment Proof
              </p>
              <span className="bg-[rgba(0,255,136,0.2)] px-1 font-mono text-[10px] uppercase text-[var(--accent)]">
                Live
              </span>
            </div>
            <div className="mt-4 grid gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
              <div className="grid grid-cols-[6.5rem_1fr] gap-3">
                <span className="text-[var(--muted)]">Deployment</span>
                <span className="break-all text-[var(--text)]">
                  {deploymentProof.deploymentId}
                </span>
              </div>
              <div className="grid grid-cols-[6.5rem_1fr] gap-3">
                <span className="text-[var(--muted)]">Status</span>
                <span className="text-[var(--text)]">{deploymentProof.status}</span>
              </div>
              <div className="grid grid-cols-[6.5rem_1fr] gap-3">
                <span className="text-[var(--muted)]">Started</span>
                <span className="text-[var(--text)]">
                  {formatTimestamp(deploymentProof.startedAt)}
                </span>
              </div>
              {deploymentProof.liveUrl ? (
                <div className="grid grid-cols-[6.5rem_1fr] gap-3">
                  <span className="text-[var(--muted)]">Live URL</span>
                  <Link
                    href={deploymentProof.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-[var(--accent)] underline underline-offset-4"
                  >
                    {deploymentProof.liveUrl}
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="mt-6 border-t border-[var(--border)] pt-5">
          <button
            type="button"
            onClick={deploymentProof ? onClose : handleDeploy}
            disabled={isDeploying}
            className={`h-12 w-full bg-[var(--accent)] px-4 font-mono text-sm font-bold uppercase tracking-[0.24em] text-black transition-opacity duration-150 hover:opacity-90 disabled:cursor-default disabled:opacity-90 ${
              isDeploying ? "animate-pulse" : ""
            }`}
          >
            {deploymentProof ? "CLOSE" : isDeploying ? "DEPLOYING..." : "DEPLOY"}
          </button>

          {errorMessage ? (
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-[var(--danger)]">
              {errorMessage}
            </p>
          ) : null}

          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Live Build deployment requires LOCUS_BUILD_REPO configuration.
          </p>
        </div>
      </div>
    </div>
  );
}
