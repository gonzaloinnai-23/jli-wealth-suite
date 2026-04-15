import { useEffect, useRef } from "react";
import Chart, { type ChartConfiguration, type ChartType } from "chart.js/auto";

/**
 * Thin wrapper that owns the imperative Chart.js lifecycle from inside a
 * React component. Returns a ref you attach to a `<canvas>`; the chart is
 * created on mount, rebuilt whenever `config` changes reference, and
 * destroyed on unmount. Mirrors the `kill(id)`/`new Chart(...)` pattern the
 * original dashboard used imperatively.
 *
 * Generic over the chart type so specialised configs like
 * `ChartConfiguration<"doughnut">` (which use type-specific options such as
 * `cutout`) type-check without casts.
 */
export function useChart<T extends ChartType = ChartType>(config: ChartConfiguration<T>) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const instanceRef = useRef<Chart<T> | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    instanceRef.current?.destroy();
    instanceRef.current = new Chart<T>(ref.current, config);
    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [config]);

  return ref;
}
