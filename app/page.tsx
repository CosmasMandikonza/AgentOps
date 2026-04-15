import Link from "next/link";

import {
  FamilyButton,
  FamilyButtonContent,
  FamilyButtonHeader,
  TextureSeparator,
} from "@/components/ui/family-button";
import { LightBoard, LightBoardSize } from "@/components/ui/lightboard";
import { ThreeDPhotoCarousel } from "@/components/ui/three-d-carousel";

const capabilities = [
  {
    title: "Payment visibility",
    body:
      "Revenue should not disappear into a toolchain. AgentOps gives an operator a direct view of wallet status, checkout creation, and the moment a service becomes a real business event.",
  },
  {
    title: "Fulfillment proof",
    body:
      "Autonomous work becomes easier to trust when it leaves a trail. Search artifacts, screenshots, and proof surfaces turn execution into something a team can inspect instead of infer.",
  },
  {
    title: "Margin control",
    body:
      "An intelligent system still needs an owner on cost. AgentOps puts spend, proof, and remaining margin in one operating view so automation can run with discipline.",
  },
];

const proofSurfaces = [
  "Wallet state and operator balance",
  "Checkout session creation and payment path",
  "Fulfillment artifacts that make work inspectable",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600">
      {children}
    </div>
  );
}

function PrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center justify-center border border-zinc-950 bg-zinc-950 px-5 font-mono text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors duration-150 hover:bg-zinc-800"
    >
      {children}
    </Link>
  );
}

function SecondaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center justify-center border border-zinc-900/12 bg-white/70 px-5 font-mono text-xs font-medium uppercase tracking-[0.22em] text-zinc-900 backdrop-blur-sm transition-colors duration-150 hover:bg-white"
    >
      {children}
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fff8ef_0%,#ffeeda_20%,#f6ecff_55%,#eefcf3_100%)] text-zinc-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-[-6%] h-[34rem] w-[34rem] bg-[radial-gradient(circle,rgba(255,196,161,0.56),transparent_60%)] blur-3xl" />
        <div className="absolute right-[-8%] top-[10%] h-[30rem] w-[30rem] bg-[radial-gradient(circle,rgba(206,187,255,0.44),transparent_58%)] blur-3xl" />
        <div className="absolute bottom-[-12%] left-[30%] h-[32rem] w-[32rem] bg-[radial-gradient(circle,rgba(187,255,215,0.45),transparent_62%)] blur-3xl" />
      </div>

      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-10 lg:pb-24">
          <div className="mb-10 flex flex-col gap-3 border border-zinc-900/10 bg-white/55 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.26em] text-zinc-700 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <span className="text-zinc-950">AgentOps</span>
            <span>Operator software for autonomous revenue services</span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex border border-zinc-900/10 bg-white/70 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-700 backdrop-blur-sm">
                The control layer for autonomous revenue
              </div>

              <h1 className="mt-6 max-w-4xl text-5xl font-medium leading-[0.94] tracking-[-0.05em] text-zinc-950 sm:text-6xl lg:text-7xl">
                AI can do the work. AgentOps makes it operable.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
                AgentOps gives operators one surface for wallet status, checkout proof,
                fulfillment proof, and margin, so autonomous services can run like
                businesses instead of fragile workflows.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PrimaryLink href="/dashboard">Open Operator Console</PrimaryLink>
                <SecondaryLink href="#business-loop">See How It Works</SecondaryLink>
              </div>

              <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
                <div className="border border-zinc-900/10 bg-white/65 px-4 py-4 backdrop-blur-sm">
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                    Wallet
                  </div>
                  <div className="mt-2 text-base font-medium text-zinc-950">
                    Live balance and operator state in view
                  </div>
                </div>
                <div className="border border-zinc-900/10 bg-white/65 px-4 py-4 backdrop-blur-sm">
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                    Proof
                  </div>
                  <div className="mt-2 text-base font-medium text-zinc-950">
                    Checkout and fulfillment artifacts in one place
                  </div>
                </div>
                <div className="border border-zinc-900/10 bg-white/65 px-4 py-4 backdrop-blur-sm">
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                    Margin
                  </div>
                  <div className="mt-2 text-base font-medium text-zinc-950">
                    Revenue, spend, and remaining room to operate
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-5">
              <div className="border border-zinc-900/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,244,249,0.78))] p-5 shadow-[0_30px_100px_rgba(123,92,255,0.12)] backdrop-blur-xl">
                <SectionLabel>Living Accent</SectionLabel>
                <div className="mt-4 border border-zinc-900/10 bg-zinc-950 p-4 sm:p-5">
                  <LightBoard
                    size={LightBoardSize.Large}
                    lightSize={4}
                    gap={2}
                    text="OPERATOR LAYER"
                    font="wide"
                    updateInterval={100}
                  />
                </div>
              </div>

              <div className="border border-zinc-900/10 bg-[rgba(255,255,255,0.72)] p-6 shadow-[0_24px_80px_rgba(255,146,122,0.1)] backdrop-blur-xl">
                <SectionLabel>Why it exists</SectionLabel>
                <p className="mt-4 text-base leading-8 text-zinc-700">
                  AI services do not fail because they lack intelligence. They fail
                  because nobody can clearly see the economics, proof, and control
                  surface around the work. AgentOps is the layer that makes
                  autonomous services operable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="mb-10 max-w-3xl">
            <SectionLabel>What AgentOps does</SectionLabel>
            <h2 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.04em] text-zinc-950 sm:text-5xl">
              The missing layer between an agent and a business
            </h2>
            <p className="mt-5 text-base leading-8 text-zinc-700">
              Models can generate. Agents can execute. But neither tells an operator
              what was paid, what was spent, what was proven, or what margin
              remains. AgentOps puts those answers in one place.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {capabilities.map((item) => (
              <div
                key={item.title}
                className="border border-zinc-900/10 bg-[rgba(255,255,255,0.72)] p-6 shadow-[0_24px_80px_rgba(34,34,34,0.05)] backdrop-blur-xl"
              >
                <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-500">
                  {item.title}
                </div>
                <p className="mt-4 text-xl font-medium leading-8 text-zinc-950">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="business-loop" className="relative">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <SectionLabel>Product Story</SectionLabel>
              <h2 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.04em] text-zinc-950 sm:text-5xl">
                A business loop you can actually see
              </h2>
              <p className="mt-5 text-base leading-8 text-zinc-700">
                Autonomous services become easier to run when the operator can see
                the system at work. Wallet state, checkout proof, fulfillment proof,
                and margin belong in one operating view because they explain the
                business loop as clearly as the model explains the output.
              </p>

              <div className="mt-8 grid gap-3">
                {proofSurfaces.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 border border-zinc-900/10 bg-white/70 px-4 py-3 text-sm text-zinc-800 backdrop-blur-sm"
                  >
                    <span className="font-mono text-zinc-950">+</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-zinc-900/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(249,245,255,0.72))] p-6 shadow-[0_32px_110px_rgba(111,88,255,0.14)] backdrop-blur-xl">
              <ThreeDPhotoCarousel />
            </div>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <SectionLabel>Positioning</SectionLabel>
              <h2 className="mt-4 text-4xl font-medium leading-tight tracking-[-0.04em] text-zinc-950 sm:text-5xl">
                Not another agent. The system around the agent.
              </h2>
              <p className="mt-5 text-base leading-8 text-zinc-700">
                Agents can execute. AgentOps makes them governable. The product is
                not about squeezing one more answer out of a model. It is about
                giving a team control over proof, economics, and operational trust
                once the agent starts doing real work.
              </p>
            </div>

            <FamilyButton>
              <FamilyButtonHeader className="flex flex-col gap-5 py-8 sm:py-10">
                <div className="inline-flex w-fit border border-zinc-900/10 bg-white/75 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-zinc-600">
                  Operator-first software
                </div>
                <div className="max-w-2xl text-3xl font-medium leading-tight tracking-[-0.03em] text-zinc-950 sm:text-4xl">
                  The value is not raw model output. The value is knowing what the system did, what it cost, and whether the business still works.
                </div>
              </FamilyButtonHeader>

              <FamilyButtonContent className="text-base leading-8 text-zinc-700">
                AgentOps gives teams a control layer for autonomous revenue
                services. It turns scattered payment tools, execution traces, and
                fulfillment artifacts into one operating surface with an owner.
              </FamilyButtonContent>

              <TextureSeparator />

              <div className="grid gap-px border-t border-zinc-900/10 bg-zinc-900/10 sm:grid-cols-3">
                <div className="bg-white/72 px-6 py-5">
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    Control
                  </div>
                  <p className="mt-2 text-sm leading-7 text-zinc-700">
                    One surface for wallet state, checkout creation, and operating mode.
                  </p>
                </div>
                <div className="bg-white/72 px-6 py-5">
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    Proof
                  </div>
                  <p className="mt-2 text-sm leading-7 text-zinc-700">
                    Search and screenshot artifacts that make execution legible.
                  </p>
                </div>
                <div className="bg-white/72 px-6 py-5">
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    Economics
                  </div>
                  <p className="mt-2 text-sm leading-7 text-zinc-700">
                    Margin visibility that keeps automation accountable to the business.
                  </p>
                </div>
              </div>
            </FamilyButton>
          </div>
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-10 lg:px-10 lg:pb-24">
          <div className="border border-zinc-900/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(255,243,233,0.8),rgba(238,255,247,0.82))] p-8 shadow-[0_28px_100px_rgba(89,170,126,0.12)] backdrop-blur-xl lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
              <div>
                <SectionLabel>Closing</SectionLabel>
                <h2 className="mt-4 max-w-4xl text-4xl font-medium leading-tight tracking-[-0.04em] text-zinc-950 sm:text-5xl">
                  If AI is going to run services, someone needs software that acts like operations.
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-zinc-700">
                  AgentOps turns autonomous service execution into something a team
                  can supervise, trust, and scale. It is the layer that makes the
                  business loop visible enough to run with confidence.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <PrimaryLink href="/dashboard">Launch AgentOps</PrimaryLink>
                  <SecondaryLink href="/present">Presentation View</SecondaryLink>
                </div>
              </div>

              <div className="border border-zinc-900/10 bg-zinc-950 p-5">
                <LightBoard
                  size={LightBoardSize.Medium}
                  lightSize={4}
                  gap={2}
                  text="LIVE PROOF"
                  font="wide"
                  updateInterval={110}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
