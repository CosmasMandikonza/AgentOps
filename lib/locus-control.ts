import "server-only";

export type LocusControlMode = "live" | "mock";

type LocusControlState = {
  overrideMode: LocusControlMode;
  updatedAt: string;
};

type GlobalLocusControlState = typeof globalThis & {
  __agentOpsLocusControl?: LocusControlState;
};

function getDefaultMode(): LocusControlMode {
  return process.env.LOCUS_MOCK_MODE === "true" ? "mock" : "live";
}

function getState(): LocusControlState {
  const globalState = globalThis as GlobalLocusControlState;

  if (!globalState.__agentOpsLocusControl) {
    globalState.__agentOpsLocusControl = {
      overrideMode: getDefaultMode(),
      updatedAt: new Date().toISOString(),
    };
  }

  return globalState.__agentOpsLocusControl;
}

export function getConfiguredLocusMode(
  fallbackMode: LocusControlMode = getDefaultMode(),
): LocusControlMode {
  return getState().overrideMode ?? fallbackMode;
}

export function setConfiguredLocusMode(mode: LocusControlMode) {
  const state = getState();
  state.overrideMode = mode;
  state.updatedAt = new Date().toISOString();

  return {
    mode: state.overrideMode,
    updatedAt: state.updatedAt,
  };
}

export function getLocusControlSnapshot(
  fallbackMode: LocusControlMode = getDefaultMode(),
) {
  const state = getState();

  return {
    mode: state.overrideMode ?? fallbackMode,
    updatedAt: state.updatedAt,
  };
}
