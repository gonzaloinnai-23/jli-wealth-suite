import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Global dashboard state — mirrors the top-level `let` variables in the
 * original imperative script (port, rangeStart, fxMode, …).
 */
export interface DashboardState {
  port: "bca" | "bcp";
  rangeStart: number;
  rangeEnd: number;
  projMode: "nominal" | "real";
  projScope: "neo" | "full";
  projYears: 5 | 10 | 15 | 20 | 25 | 30;
  evoStackMode: "real" | "twr";
  evoBenchMode: "real" | "twr";
  evoBenchFilter: "all" | "rv" | "rf" | "gold" | "alt";
  fxMode: "total" | "byclass";
  fxClass: "RV" | "RF_USD" | "ALT" | "MULTI";
  orgView: "ale" | "both" | "pab";
}

const initial: DashboardState = {
  port: "bca",
  rangeStart: 0,
  rangeEnd: 119,
  projMode: "nominal",
  projScope: "neo",
  projYears: 20,
  evoStackMode: "real",
  evoBenchMode: "twr",
  evoBenchFilter: "all",
  fxMode: "total",
  fxClass: "RV",
  orgView: "ale",
};

type Setter = <K extends keyof DashboardState>(key: K, value: DashboardState[K]) => void;

interface Ctx {
  state: DashboardState;
  set: Setter;
  reset: () => void;
}

const DashboardContext = createContext<Ctx | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardState>(initial);
  const value = useMemo<Ctx>(
    () => ({
      state,
      set: (key, value) => setState((s) => ({ ...s, [key]: value })),
      reset: () => setState(initial),
    }),
    [state]
  );
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): Ctx {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return ctx;
}
