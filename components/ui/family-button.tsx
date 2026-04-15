import type { HTMLAttributes } from "react";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type DivProps = HTMLAttributes<HTMLDivElement>;

export function FamilyButton({ className, children, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden border border-zinc-900/10 bg-[rgba(255,255,255,0.72)] shadow-[0_26px_90px_rgba(126,98,255,0.12)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1",
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.92),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(210,255,231,0.48),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.2))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(34,34,34,0.12),transparent)]" />
      <div className="relative">{children}</div>
    </div>
  );
}

export function FamilyButtonHeader({
  className,
  children,
  ...props
}: DivProps) {
  return (
    <div
      className={cn(
        "relative px-6 pt-6 sm:px-8 sm:pt-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function FamilyButtonContent({
  className,
  children,
  ...props
}: DivProps) {
  return (
    <div
      className={cn(
        "relative px-6 pb-6 sm:px-8 sm:pb-8",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TextureSeparator({ className, ...props }: DivProps) {
  return (
    <div
      className={cn("relative h-8 overflow-hidden", className)}
      aria-hidden="true"
      {...props}
    >
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-zinc-900/10" />
      <div className="absolute inset-x-6 top-1/2 h-8 -translate-y-1/2 opacity-40">
        <div className="h-full bg-[radial-gradient(circle,rgba(34,34,34,0.18)_0.8px,transparent_1px)] bg-[length:12px_12px]" />
      </div>
    </div>
  );
}
