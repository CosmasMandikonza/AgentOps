export function TerminalBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-[-10%] top-[-8%] h-[28rem] w-[28rem] bg-[radial-gradient(circle,rgba(255,109,109,0.08),transparent_60%)] blur-3xl" />
      <div className="absolute right-[-10%] top-[12%] h-[30rem] w-[30rem] bg-[radial-gradient(circle,rgba(0,255,136,0.08),transparent_60%)] blur-3xl" />
      <div className="absolute bottom-[-18%] left-[28%] h-[26rem] w-[26rem] bg-[radial-gradient(circle,rgba(255,184,0,0.06),transparent_60%)] blur-3xl" />
    </div>
  );
}
