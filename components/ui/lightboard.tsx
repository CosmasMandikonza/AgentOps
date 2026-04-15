"use client";

import { useEffect, useMemo, useState } from "react";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export enum LightBoardSize {
  Small = "small",
  Medium = "medium",
  Large = "large",
}

type LightBoardProps = {
  className?: string;
  size?: LightBoardSize;
  lightSize?: number;
  gap?: number;
  text: string;
  font?: "default" | "wide";
  updateInterval?: number;
};

const GLYPHS: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01110"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "10000", "10000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  " ": ["000", "000", "000", "000", "000", "000", "000"],
};

const SIZE_CONFIG: Record<LightBoardSize, { dot: number; gap: number; padding: string }> = {
  [LightBoardSize.Small]: { dot: 4, gap: 3, padding: "p-3" },
  [LightBoardSize.Medium]: { dot: 6, gap: 4, padding: "p-4" },
  [LightBoardSize.Large]: { dot: 8, gap: 5, padding: "p-6" },
};

function buildPattern(text: string, font: "default" | "wide") {
  const rows = Array.from({ length: 7 }, () => "");
  const spacer = font === "wide" ? "00" : "0";

  for (const char of text.toUpperCase()) {
    const glyph = GLYPHS[char] ?? GLYPHS[" "];

    for (let row = 0; row < rows.length; row += 1) {
      rows[row] += glyph[row] + spacer;
    }
  }

  return rows.map((row) => row.replace(/0+$/, ""));
}

export function LightBoard({
  className,
  size = LightBoardSize.Medium,
  lightSize,
  gap,
  text,
  font = "default",
  updateInterval = 120,
}: LightBoardProps) {
  const [tick, setTick] = useState(0);
  const pattern = useMemo(() => buildPattern(text, font), [font, text]);
  const config = SIZE_CONFIG[size];
  const dot = lightSize ?? config.dot;
  const spacing = gap ?? config.gap;
  const rowCount = pattern.length;
  const columnCount = pattern.reduce((max, row) => Math.max(max, row.length), 0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((value) => value + 1);
    }, updateInterval);

    return () => window.clearInterval(timer);
  }, [updateInterval]);

  return (
    <div
      aria-label={text}
      className={cn(
        "relative overflow-hidden border border-white/10 bg-[linear-gradient(180deg,#121316_0%,#0d0f10_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_80px_rgba(31,31,31,0.22)]",
        config.padding,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_42%),linear-gradient(180deg,rgba(125,255,170,0.08),transparent_48%)]" />
      <div
        className="relative mx-auto grid w-fit"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, ${dot}px)`,
          gap: `${spacing}px`,
        }}
      >
        {Array.from({ length: rowCount * columnCount }, (_, index) => {
          const row = Math.floor(index / columnCount);
          const column = index % columnCount;
          const isActive = pattern[row]?.[column] === "1";
          const pulse = (row * 17 + column * 31 + tick) % 11;
          const shimmer = isActive && pulse === 0;
          const color = shimmer ? "#f3ffb0" : "#82ffc3";

          return (
            <span
              key={`${row}-${column}`}
              className="block rounded-full transition-all duration-150"
              style={{
                width: dot,
                height: dot,
                opacity: isActive ? (shimmer ? 1 : 0.88) : 0.12,
                background: isActive ? color : "rgba(255,255,255,0.12)",
                boxShadow: isActive
                  ? shimmer
                    ? "0 0 18px rgba(243,255,176,0.9), 0 0 38px rgba(130,255,195,0.4)"
                    : "0 0 10px rgba(130,255,195,0.46)"
                  : "none",
                transform: shimmer ? "scale(1.18)" : "scale(1)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
