"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type ExpandableScreenProps = {
  layoutId: string;
  title: string;
  summary: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  triggerLabel?: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  disabledLabel?: string;
};

export function ExpandableScreen({
  layoutId,
  title,
  summary,
  children,
  actions,
  triggerLabel = "View proof",
  className,
  contentClassName,
  disabled = false,
  disabledLabel = "View unavailable",
}: ExpandableScreenProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const overlayRoot = useMemo(() => {
    if (typeof document === "undefined") {
      return null;
    }

    return document.body;
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return;
    }

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, [isOpen]);

  const card = (
    <motion.div
      layoutId={layoutId}
      className={cn(
        "min-w-0 space-y-3 overflow-hidden border border-[var(--border)] bg-[var(--bg)] px-3 py-3",
        className,
      )}
    >
      {summary}

      <div className="flex flex-wrap items-center gap-2">
        {actions}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--text)] transition-colors duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          {disabled ? disabledLabel : triggerLabel}
        </button>
      </div>
    </motion.div>
  );

  return (
    <>
      {!isOpen ? card : null}

      {isMounted && overlayRoot
        ? createPortal(
            <AnimatePresence>
              {isOpen ? (
                <motion.div
                  className="fixed inset-0 z-[140] flex items-start justify-center bg-[rgba(11,12,14,0.58)] px-4 py-4 backdrop-blur-md sm:px-6 sm:py-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <button
                    type="button"
                    aria-label={`Close ${title}`}
                    onClick={() => setIsOpen(false)}
                    className="absolute inset-0"
                  />

                  <motion.div
                    layoutId={layoutId}
                    className={cn(
                      "relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden border border-[var(--border)] bg-[var(--surface)] shadow-[0_30px_120px_rgba(0,0,0,0.42)] sm:max-h-[calc(100vh-3rem)]",
                      contentClassName,
                    )}
                  >
                    <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-4 py-4 sm:px-5">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
                          Proof Detail
                        </p>
                        <h3 className="mt-2 font-mono text-base uppercase tracking-[0.18em] text-[var(--text)]">
                          {title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="border border-[var(--border)] bg-[var(--bg)] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text)] transition-colors duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        Close
                      </button>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
                      {children}
                    </div>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            overlayRoot,
          )
        : null}
    </>
  );
}
