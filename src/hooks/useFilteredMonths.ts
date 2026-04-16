import { useMemo } from "react";
import { useDashboard } from "../context/DashboardContext";
import { useSnapshot } from "../data/store";
import type { MonthLabel } from "../data/portfolio";

/**
 * Returns the currently-selected slice of month labels for the active
 * portfolio, honouring the `rangeStart` / `rangeEnd` indices from the
 * dashboard context. Mirrors `getFilteredMonths()` in the original.
 *
 * Subscribes to the DataStore via `useSnapshot()`, so whenever a product is
 * mutated the hook re-emits a new array reference — this invalidates any
 * `useMemo([…, months])` downstream and causes the KPI/chart components to
 * re-derive from the fresh enriched portfolio.
 */
export function useFilteredMonths(): MonthLabel[] {
  const { state } = useDashboard();
  const snapshot = useSnapshot();
  return useMemo(() => {
    const all = snapshot.portfolio[state.port].months;
    const from = Math.max(0, Math.min(state.rangeStart, all.length - 1));
    const to = Math.max(from, Math.min(state.rangeEnd, all.length - 1));
    return all.slice(from, to + 1);
  }, [state.port, state.rangeStart, state.rangeEnd, snapshot]);
}
