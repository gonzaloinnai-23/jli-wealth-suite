import { useEffect, useRef } from "react";
import Chart, { type ChartConfiguration } from "chart.js/auto";

/**
 * Thin wrapper that owns the imperative Chart.js lifecycle from inside a
 * React component. Returns a ref you attach to a `<canvas>`; the chart is
 * created on mount, rebuilt whenever `config` changes reference, and
 * destroyed on unmount. Mirrors the `kill(id)`/`new Chart(...)` pattern the
 * original dashboard used imperatively.
 */
export function useChart(config: ChartConfiguration) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const instanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    instanceRef.current?.destroy();
    instanceRef.current = new Chart(ref.current, config);
    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [config]);

  return ref;
}
