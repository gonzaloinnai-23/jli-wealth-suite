import { useMemo } from "react";
import { useDashboard } from "../context/DashboardContext";
import { D, type MonthLabel } from "../data/portfolio";

/**
 * Returns the currently-selected slice of month labels for the active
 * portfolio, honouring the `rangeStart` / `rangeEnd` indices from the
 * dashboard context. Mirrors `getFilteredMonths()` in the original.
 */
export function useFilteredMonths(): MonthLabel[] {
  const { state } = useDashboard();
  return useMemo(() => {
    const all = D[state.port].months;
    const from = Math.max(0, Math.min(state.rangeStart, all.length - 1));
    const to = Math.max(from, Math.min(state.rangeEnd, all.length - 1));
    return all.slice(from, to + 1);
  }, [state.port, state.rangeStart, state.rangeEnd]);
}
