"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

import type { Transaction } from "@/lib/types";
import { formatTimestamp, formatUSDC } from "@/lib/utils";

interface TransactionFeedProps {
  transactions: Transaction[];
  maxHeight?: string;
}

function formatSignedAmount(amount: number): string {
  return `${amount >= 0 ? "+" : "-"}${formatUSDC(Math.abs(amount))}`;
}

function isRealTransaction(transaction: Transaction) {
  const metadata = transaction.metadata;
  if (
    metadata &&
    typeof metadata === "object" &&
    !Array.isArray(metadata) &&
    metadata.real_locus_call === true
  ) {
    return true;
  }

  return Boolean(
    transaction.locus_tx_id &&
      !transaction.locus_tx_id.startsWith("demo_"),
  );
}

function getPreviewTxId(value: string) {
  return value.slice(0, 16);
}

export function TransactionFeed({
  transactions,
  maxHeight = "32rem",
}: TransactionFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousTransactionIdsRef = useRef<Set<string> | null>(null);
  const previousTransactionCountRef = useRef(0);
  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (left, right) =>
          new Date(left.created_at).getTime() -
          new Date(right.created_at).getTime(),
      ),
    [transactions],
  );
  const previousTransactionIds = previousTransactionIdsRef.current;
  const hasCountIncrease =
    previousTransactionIds !== null &&
    sortedTransactions.length > previousTransactionCountRef.current;

  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }

    previousTransactionIdsRef.current = new Set(
      sortedTransactions.map((transaction) => transaction.id),
    );
    previousTransactionCountRef.current = sortedTransactions.length;
  }, [sortedTransactions]);

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto border border-[var(--border)] bg-[var(--surface)]"
      style={{ maxHeight }}
    >
      <div className="flex flex-col">
        <AnimatePresence initial={false}>
          {sortedTransactions.map((transaction, index) => {
            const isPositive = transaction.amount >= 0;
            const isReal = isRealTransaction(transaction);
            const amountClassName = isPositive
              ? "text-[var(--accent)]"
              : "text-[var(--danger)]";
            const borderClassName = isPositive
              ? "border-[var(--accent)]"
              : "border-[var(--danger)]";
            const backgroundColor = index % 2 === 0 ? "#0A0A0A" : "#141414";
            const isNewTransaction =
              hasCountIncrease &&
              previousTransactionIds !== null &&
              !previousTransactionIds.has(transaction.id);
            const shouldFlashCheckout =
              isNewTransaction && transaction.type === "CHECKOUT_RECEIVED";

            return (
              <motion.div
                key={transaction.id}
                className={`grid grid-cols-[auto_auto_1fr_auto] items-start gap-3 border-b border-[var(--border)] border-l-[3px] px-3 py-3 font-mono text-sm tabular-nums last:border-b-0 ${borderClassName}`}
                initial={
                  isNewTransaction
                    ? {
                        opacity: 0,
                        y: 10,
                        backgroundColor: shouldFlashCheckout
                          ? "rgba(0, 255, 136, 0.15)"
                          : backgroundColor,
                      }
                    : false
                }
                animate={{
                  opacity: 1,
                  y: 0,
                  backgroundColor,
                }}
                transition={{
                  opacity: { duration: 0.3, ease: "easeOut" },
                  y: { duration: 0.3, ease: "easeOut" },
                  backgroundColor: {
                    duration: shouldFlashCheckout ? 0.8 : 0.18,
                    ease: "easeOut",
                  },
                }}
              >
                <span className="text-[var(--muted)]">
                  {formatTimestamp(transaction.created_at)}
                </span>
                <span className="pt-0.5 text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {transaction.type}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[var(--text)]">
                    {transaction.description ?? "No description"}
                  </p>
                  {transaction.provider ? (
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                      {transaction.provider}
                    </p>
                  ) : null}
                  {isReal && transaction.locus_tx_id ? (
                    <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                      {getPreviewTxId(transaction.locus_tx_id)}
                    </p>
                  ) : null}
                </div>
                <div className="justify-self-end text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isReal ? (
                      <span className="bg-[rgba(0,255,136,0.2)] px-1 font-mono text-[10px] uppercase text-[var(--accent)]">
                        LIVE
                      </span>
                    ) : (
                      <span className="bg-[var(--border)] px-1 font-mono text-[10px] uppercase text-[var(--muted)]">
                        SIMULATED
                      </span>
                    )}
                    <span className={`font-bold ${amountClassName}`}>
                      {formatSignedAmount(transaction.amount)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
