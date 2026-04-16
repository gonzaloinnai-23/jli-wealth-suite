/**
 * Backwards-compatible module that re-exports the canonical types from the
 * new `schema.ts`. Older code that imported `Product`, `PortSet`, `MonthLabel`
 * from `./portfolio` keeps working.
 *
 * Runtime reads now go through the DataStore — call `dataStore.getSnapshot()`
 * or use the `useSnapshot()` hook instead of importing `D` directly.
 */
import portfolioData from "./portfolio-data.json";
import type { PortfolioData, MonthLabel as MonthLabel_ } from "./schema";

export type MonthLabel = MonthLabel_;
export type {
  AssetClass,
  Product,
  PortSet,
  PortfolioData,
  Tipologia,
  Divisa,
} from "./schema";

/**
 * @deprecated Use `dataStore.getSnapshot().portfolio` or `useSnapshot()` instead.
 * Only kept so historical code paths (tests, scratch usage) keep working.
 */
export const D = portfolioData as unknown as PortfolioData;

/** Convenience alias for the full list of month labels from the BCA portfolio. */
export const ALL_MONTHS: MonthLabel[] = D.bca.months;

/** Legacy export kept for backwards compatibility with the Fase 1 shell. */
export const ALL_MONTHS_FALLBACK = ALL_MONTHS;
