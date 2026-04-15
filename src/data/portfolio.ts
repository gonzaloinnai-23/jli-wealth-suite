/**
 * Portfolio data — imported from the JSON blob extracted verbatim from the
 * original dashboard script (`const D = {...}`).
 *
 * Shape (discovered by inspection of the real payload):
 *   D.bca.months:     120 monthly labels ("Ene-16" … "Dic-25")
 *   D.bca.products:   22 instruments, each with:
 *       producto, isin, tipologia, banco, divisa, titular,
 *       valor:   Record<MonthLabel, number>   — value in EUR per month
 *       difmes:  Record<MonthLabel, number>   — monthly delta in EUR
 *   D.bca.asset_alloc: Record<AssetClass, Record<MonthLabel, number>>  (weights %)
 *   D.bcp: same shape (second portfolio — currently hidden in the UI)
 */
import raw from "./portfolio-data.json";

export type MonthLabel = string;

export type AssetClass =
  | "RV"
  | "RF"
  | "ALT"
  | "CASH"
  | "MULTI"
  | "RF_USD"
  | "RF_EUR"
  | "GOLD"
  | "EM";

export interface Product {
  producto: string;
  isin: string;
  tipologia: string;
  banco: string;
  divisa: string;
  titular: string;
  valor: Record<MonthLabel, number>;
  difmes: Record<MonthLabel, number>;
}

export interface PortSet {
  months: MonthLabel[];
  products: Product[];
  asset_alloc: Record<string, Record<MonthLabel, number>>;
}

export interface PortfolioData {
  bca: PortSet;
  bcp: PortSet;
}

export const D = raw as unknown as PortfolioData;

/** Convenience alias for the full list of month labels from the BCA portfolio. */
export const ALL_MONTHS: MonthLabel[] = D.bca.months;

/** Legacy export kept for backwards compatibility with the Fase 1 shell. */
export const ALL_MONTHS_FALLBACK = ALL_MONTHS;
