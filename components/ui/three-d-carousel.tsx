"use client";

import { useEffect, useMemo, useState } from "react";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type CarouselSlide = {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  surface: string;
};

type ThreeDPhotoCarouselProps = {
  className?: string;
  autoPlay?: boolean;
  interval?: number;
  slides?: CarouselSlide[];
};

const DEFAULT_SLIDES: CarouselSlide[] = [
  {
    eyebrow: "Wallet State",
    title: "The operator starts with balance, not hope.",
    description:
      "A live wallet surface makes every autonomous service legible before a single action runs.",
    accent: "linear-gradient(135deg, rgba(255,175,128,0.92), rgba(255,110,150,0.62))",
    surface:
      "linear-gradient(160deg, rgba(255,255,255,0.96), rgba(255,238,229,0.88), rgba(255,224,245,0.78))",
  },
  {
    eyebrow: "Checkout Proof",
    title: "Revenue enters through a visible, attributable path.",
    description:
      "Hosted checkout creation turns payment from a promise into an operational event.",
    accent: "linear-gradient(135deg, rgba(142,140,255,0.94), rgba(255,171,215,0.68))",
    surface:
      "linear-gradient(160deg, rgba(252,245,255,0.96), rgba(236,241,255,0.9), rgba(255,233,243,0.8))",
  },
  {
    eyebrow: "Fulfillment Proof",
    title: "Search and screenshot artifacts make the work inspectable.",
    description:
      "Execution is stronger when it leaves proof behind instead of a story that needs to be believed.",
    accent: "linear-gradient(135deg, rgba(92,237,198,0.94), rgba(143,255,182,0.62))",
    surface:
      "linear-gradient(160deg, rgba(241,255,250,0.98), rgba(222,249,243,0.9), rgba(236,255,247,0.8))",
  },
];

function getOffset(index: number, activeIndex: number, total: number) {
  let offset = index - activeIndex;

  if (offset > total / 2) {
    offset -= total;
  }

  if (offset < -total / 2) {
    offset += total;
  }

  return offset;
}

export function ThreeDPhotoCarousel({
  className,
  autoPlay = true,
  interval = 3400,
  slides = DEFAULT_SLIDES,
}: ThreeDPhotoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const stableSlides = useMemo(() => slides, [slides]);

  useEffect(() => {
    if (!autoPlay || stableSlides.length < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((value) => (value + 1) % stableSlides.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [autoPlay, interval, stableSlides.length]);

  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-[360px] w-full [perspective:1600px] sm:h-[420px]">
        <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.36),transparent_52%)] blur-3xl" />

        {stableSlides.map((slide, index) => {
          const offset = getOffset(index, activeIndex, stableSlides.length);
          const hidden = Math.abs(offset) > 2;

          if (hidden) {
            return null;
          }

          const isActive = offset === 0;
          const transform =
            offset === 0
              ? "translateX(0%) translateZ(0px) rotateY(0deg) scale(1)"
              : offset < 0
                ? `translateX(${offset * 42}%) translateZ(-80px) rotateY(28deg) scale(0.9)`
                : `translateX(${offset * 42}%) translateZ(-80px) rotateY(-28deg) scale(0.9)`;

          return (
            <div
              key={slide.title}
              className="absolute left-1/2 top-1/2 h-[85%] w-[78%] -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
              style={{
                transform,
                zIndex: 30 - Math.abs(offset),
                opacity: isActive ? 1 : 0.58,
                filter: isActive ? "none" : "blur(1px)",
              }}
            >
              <div
                className="relative h-full overflow-hidden border border-zinc-900/10 shadow-[0_30px_90px_rgba(80,47,102,0.16)]"
                style={{ background: slide.surface }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-28 opacity-90"
                  style={{ background: slide.accent }}
                />
                <div className="absolute right-5 top-5 h-16 w-16 border border-white/60 bg-white/35 backdrop-blur-sm" />
                <div className="absolute left-5 top-5 h-5 w-24 border border-white/55 bg-white/30" />

                <div className="relative flex h-full flex-col justify-end p-6 sm:p-7">
                  <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-600">
                    {slide.eyebrow}
                  </div>
                  <div className="max-w-sm text-2xl font-medium leading-tight text-zinc-950 sm:text-3xl">
                    {slide.title}
                  </div>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-zinc-700">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {stableSlides.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Show slide ${index + 1}`}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "h-2.5 transition-all duration-300",
              index === activeIndex
                ? "w-10 bg-zinc-950"
                : "w-4 bg-zinc-900/20 hover:bg-zinc-900/35",
            )}
          />
        ))}
      </div>
    </div>
  );
}
