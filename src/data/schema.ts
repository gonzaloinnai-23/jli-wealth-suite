/**
 * Formal schema for the portfolio dataset that feeds the dashboard.
 *
 * Everything the UI renders (KPIs, charts, tables, org chart, PE vehicles,
 * benchmarks, FX…) is derived from the shape defined here. The Admin tab
 * edits instances of these types; changes flow through the DataStore and
 * the rest of the app recomputes from the enriched view.
 */

// ─────────────────────── Primitives ───────────────────────

/** Month label in the format used by the original dashboard: "Ene-16", "Dic-25", … */
export type MonthLabel = string;

/** Coarse asset class codes used in weights, benchmarks, FX buckets. */
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

/** Product tipologia — controlled vocabulary used across the dashboard. */
export type Tipologia =
  | "Cartera Gestionada RV"
  | "Cartera Gestionada RF"
  | "Fondo Renta Variable"
  | "ETF Renta Variable"
  | "Fondo Renta Fija"
  | "Renta Fija Directa"
  | "Fondo Monetario"
  | "Fondo Multiactivo"
  | "ETF Materias Primas"
  | "Vehículo Alternativo"
  | "Cuenta Corriente";

export const TIPOLOGIAS: readonly Tipologia[] = [
  "Cartera Gestionada RV",
  "Cartera Gestionada RF",
  "Fondo Renta Variable",
  "ETF Renta Variable",
  "Fondo Renta Fija",
  "Renta Fija Directa",
  "Fondo Monetario",
  "Fondo Multiactivo",
  "ETF Materias Primas",
  "Vehículo Alternativo",
  "Cuenta Corriente",
] as const;

/** Divisas soportadas (no exhaustivo — se pueden añadir más). */
export type Divisa = "EUR" | "USD" | "GBP" | "CHF" | "JPY";

// ─────────────────────── Product ───────────────────────

/**
 * One holding — a fund, ETF, managed portfolio, cash account or PE vehicle.
 * `valor` and `difmes` are keyed by month label; months missing from the
 * object are treated as 0 (holding didn't exist yet or was already sold).
 */
export interface Product {
  /** Commercial name shown in all tables and legends. */
  producto: string;
  /** ISIN or synthetic identifier (used for lookups in USD_COEFF, TER_ISIN). */
  isin: string;
  tipologia: Tipologia;
  /** Bank / custodian that holds the position. */
  banco: string;
  divisa: Divisa;
  /** Who legally owns this position (family member, holding company…). */
  titular: string;
  /** Market value in EUR at the end of each month. */
  valor: Record<MonthLabel, number>;
  /** Monthly return in % (product-level dif%mes). */
  difmes: Record<MonthLabel, number>;
}

/** A portfolio is a named set of products that share the same month timeline. */
export interface PortSet {
  /** Full monthly timeline in chronological order. Must be consistent across all products. */
  months: MonthLabel[];
  products: Product[];
  /** Raw asset_alloc weights — ignored at runtime (recomputed from products), kept for fidelity with the original. */
  asset_alloc?: Record<string, Record<MonthLabel, number>>;
}

/** Root: the two portfolios the dashboard can switch between. `bcp` is currently hidden in the UI. */
export interface PortfolioData {
  bca: PortSet;
  bcp: PortSet;
}

// ─────────────────────── Alternative investments ───────────────────────

export type AltType = "VC" | "Buyout" | "Credit" | "Infra" | "RE";

export const ALT_TYPES: readonly AltType[] = ["VC", "Buyout", "Credit", "Infra", "RE"] as const;

export type AltPhase =
  | "captacion"
  | "inversion"
  | "cosecha"
  | "desinversion"
  | "liquidado"
  | "evergreen"
  | "directo";

export const ALT_PHASES: readonly AltPhase[] = [
  "captacion",
  "inversion",
  "cosecha",
  "desinversion",
  "liquidado",
  "evergreen",
  "directo",
] as const;

export interface AltFund {
  name: string;
  type: AltType;
  vintage: number;
  /** Committed amount in EUR. */
  committed: number;
}

/** Extra metadata shown in the Alternativos detail panel. */
export interface AltFundInfo {
  desc: string;
  category: string;
  fund: string;
  size: string;
  irr: string;
  phase: AltPhase;
  startYr: number;
  lifeYrs: number;
  companies?: number;
  companyNote?: string;
  notes?: string;
}

// ─────────────────────── Benchmark / macro series ───────────────────────

/** Monthly benchmark/inflation/FX series, keyed by month label. */
export type MonthlySeries = Record<MonthLabel, number>;

export interface BenchmarkBundle {
  MSCI: MonthlySeries;
  BOND: MonthlySeries;
  BOND_USD: MonthlySeries;
  GOLD: MonthlySeries;
  EM: MonthlySeries;
  "6040": MonthlySeries;
}

/** Per-ISIN USD exposure coefficients (0 = pure EUR, 1 = pure USD). */
export type UsdCoefficients = Record<string, number>;

/** Per-ISIN TER (Total Expense Ratio) in %. */
export type TerByIsin = Record<string, number>;

/** Per-bank custody/depositary cost in %. */
export type DepByBank = Record<string, number>;

/** Trade months set per portfolio — used by the benchmark mid-month interpolation rule. */
export type TradeMonths = {
  bca: MonthLabel[];
  bcp: MonthLabel[];
};

// ─────────────────────── Full snapshot ───────────────────────

export interface ConstantsBundle {
  EURUSD: MonthlySeries;
  CPI_ES: MonthlySeries;
  BENCH: BenchmarkBundle;
  USD_COEFF: UsdCoefficients;
  TER_ISIN: TerByIsin;
  DEP_BANK: DepByBank;
  TRADE_MONTHS: TradeMonths;
}

/**
 * A complete portfolio snapshot — everything required to render the dashboard.
 * This is the unit the DataStore loads, mutates and exports as JSON.
 *
 * `version` is used for simple forward-compat checks when importing older
 * exports. Bump when breaking changes are introduced.
 */
export interface DataSnapshot {
  version: 1;
  portfolio: PortfolioData;
  alternativos: {
    bca: AltFund[];
    bcp: AltFund[];
    info: Record<string, AltFundInfo>;
    targets: Record<AltType, number>;
  };
  constants: ConstantsBundle;
}

// ─────────────────────── Validation ───────────────────────

export class SchemaError extends Error {
  constructor(public readonly path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = "SchemaError";
  }
}

/** Assert a value looks like a number; throws SchemaError otherwise. */
function assertNumber(v: unknown, path: string): asserts v is number {
  if (typeof v !== "number" || !isFinite(v)) {
    throw new SchemaError(path, `expected finite number, got ${typeof v}`);
  }
}

function assertString(v: unknown, path: string): asserts v is string {
  if (typeof v !== "string") {
    throw new SchemaError(path, `expected string, got ${typeof v}`);
  }
}

function assertArray(v: unknown, path: string): asserts v is unknown[] {
  if (!Array.isArray(v)) {
    throw new SchemaError(path, `expected array, got ${typeof v}`);
  }
}

function assertObject(v: unknown, path: string): asserts v is Record<string, unknown> {
  if (v === null || typeof v !== "object" || Array.isArray(v)) {
    throw new SchemaError(path, `expected object, got ${Array.isArray(v) ? "array" : typeof v}`);
  }
}

/**
 * Lightweight validator for a `DataSnapshot` coming from an untrusted source
 * (Import JSON button). Doesn't check every field — catches the common
 * mistakes: wrong types on the big arrays/objects, missing months list,
 * missing bcaproducts, etc.
 */
export function validateSnapshot(raw: unknown): DataSnapshot {
  assertObject(raw, "$");
  if (raw.version !== 1) {
    throw new SchemaError("$.version", `expected 1, got ${JSON.stringify(raw.version)}`);
  }
  assertObject(raw.portfolio, "$.portfolio");
  assertObject(raw.portfolio.bca, "$.portfolio.bca");
  assertArray((raw.portfolio.bca as any).months, "$.portfolio.bca.months");
  assertArray((raw.portfolio.bca as any).products, "$.portfolio.bca.products");
  assertObject(raw.alternativos, "$.alternativos");
  assertObject(raw.constants, "$.constants");
  return raw as unknown as DataSnapshot;
}

/** Safe shallow check — returns null on invalid, the snapshot otherwise. */
export function tryValidate(raw: unknown): DataSnapshot | null {
  try {
    return validateSnapshot(raw);
  } catch {
    return null;
  }
}

// Helpers re-exported for the calc layer.
export { assertNumber, assertString, assertArray, assertObject };
