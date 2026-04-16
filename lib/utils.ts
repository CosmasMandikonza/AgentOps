import type { Agent } from "@/lib/types";

const usdcFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const timestampFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatUSDC(amount: number): string {
  return usdcFormatter.format(amount);
}

export function formatTimestamp(date: string | Date): string {
  const parsedDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "[--:--:--]";
  }

  return `[${timestampFormatter.format(parsedDate)}]`;
}

export function calculateMargin(revenue: number, costs: number): string {
  if (revenue <= 0) {
    return "0.0%";
  }

  const margin = ((revenue - costs) / revenue) * 100;
  return `${margin.toFixed(1)}%`;
}

export function getStatusColor(status: Agent["status"]): string {
  switch (status) {
    case "live":
      return "var(--accent)";
    case "processing":
      return "var(--warning)";
    case "error":
      return "var(--danger)";
    case "deploying":
    case "paused":
      return "var(--muted)";
    default:
      return "var(--text-secondary)";
  }
}
