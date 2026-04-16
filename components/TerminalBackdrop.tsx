export function TerminalBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,0,163,0.18),transparent_28%),linear-gradient(180deg,rgba(7,8,10,0.48),rgba(7,8,10,0.9))]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(5, 7, 10, 0.28) 0%, rgba(5, 7, 10, 0.7) 60%, rgba(5, 7, 10, 0.9) 100%), url('/dashboard-neon-burst.png')",
          backgroundPosition: "center bottom",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_22%,rgba(4,5,7,0.16)_68%,rgba(4,5,7,0.5)_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:10px_10px]" />
    </div>
  );
}
