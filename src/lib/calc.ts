/**
 * Core calculation helpers — ports the imperative logic from `initData()` and
 * the KPI section of `renderResumen()` in the original script into pure TS
 * functions operating on typed portfolio data.
 */
import { D, type MonthLabel, type PortSet, type Product } from "../data/portfolio";
import {
  BENCH_MSCI,
  BENCH_BOND,
  BENCH_BOND_USD,
  BENCH_GOLD,
  BENCH_EM,
  BENCH_6040,
  CPI_ES,
  TRADE_MONTHS_BCA,
  TRADE_MONTHS_BCP,
  USD_COEFF,
} from "../data/constants";

export type DerivedSeries = Record<MonthLabel, number>;

/**
 * Enriched portfolio set with all derived monthly series computed eagerly.
 * Mirrors the runtime shape that `initData()` builds on top of the raw `D`.
 */
export interface EnrichedPortSet extends PortSet {
  total_series: DerivedSeries; // sum of product values excl. Cuenta Corriente
  total_with_cc: DerivedSeries; // sum including Cuenta Corriente
  twr_series: DerivedSeries; // monthly TWR (time-weighted return) in %
  growth_returns: DerivedSeries; // cumulative € contribution from returns
  growth_newmoney: DerivedSeries; // cumulative € contribution from new money
  tipo_series: Record<string, DerivedSeries>; // sums by tipologia
  banco_series: Record<string, DerivedSeries>; // sums by bank
  titular_series: Record<string, DerivedSeries>; // sums by titular
  ter_avg_series: DerivedSeries; // weighted avg TER % per month
  ter_cost_series: DerivedSeries; // annual TER cost in € per month
  dep_avg_series: DerivedSeries; // weighted avg depositaría % per month
  dep_cost_series: DerivedSeries; // annual depositaría cost in €
  all_avg_series: DerivedSeries; // TER + depositaría weighted %
  all_cost_series: DerivedSeries; // TER + depositaría €
  /** Per-product TER (%). */
  product_ter: Map<string, number>;
  /** Per-product depositary (%). */
  product_dep: Map<string, number>;
}

/** Cache of enriched portfolios so preprocessing runs once per key. */
const cache: Partial<Record<"bca" | "bcp", EnrichedPortSet>> = {};

export function getEnriched(port: "bca" | "bcp" = "bca"): EnrichedPortSet {
  if (!cache[port]) cache[port] = preprocess(D[port]);
  return cache[port]!;
}

/**
 * Ports the body of `initData()` for a single portfolio. Pure: input is raw,
 * output is a fully-derived enriched copy. Does NOT mutate `D`.
 */
/**
 * Asset-allocation bucketing rules (from the original `initData()`).
 *  - `AA_MAP` maps each `tipologia` to the coarse asset class it contributes to.
 *  - `RF_TYPES` are the tipologias that split into RF_USD vs RF_EUR.
 *  - `EM_ISINS` is the small set of products that contribute to the EM sub-bucket.
 */
// NOTE: 1:1 with the original `initData()`. `Cartera Gestionada RV` is
// intentionally NOT listed here — it falls through to the `|| "MULTI"` default
// so those products land in MULTI. Changing this will break the benchmark.
const AA_MAP: Record<string, "RV" | "RF" | "ALT" | "CASH" | "MULTI"> = {
  "Fondo Renta Variable": "RV",
  "ETF Renta Variable": "RV",
  "Cartera Gestionada RF": "RF",
  "Fondo Renta Fija": "RF",
  "Renta Fija Directa": "RF",
  "Fondo Monetario": "RF",
  "Vehículo Alternativo": "ALT",
  "ETF Materias Primas": "ALT",
  "Cuenta Corriente": "CASH",
  "Fondo Multiactivo": "MULTI",
};
const RF_TYPES = new Set([
  "Cartera Gestionada RF",
  "Fondo Renta Fija",
  "Renta Fija Directa",
  "Fondo Monetario",
]);
const EM_ISINS = new Set(["IE00B3VVMM84"]);
const isRfUsd = (name: string) => /USD|U\.S\.|US Treasury/i.test(name);

// Per-ISIN TER values (annualised %). Ported verbatim from `initData()`.
const TER_ISIN: Record<string, number> = {
  "GS-CG-001": 0.85,
  LU0129459060: 0.5,
  IE00BK5BQT80: 0.22,
  LU0690375182: 1.05,
  IE00B3VVMM84: 0.22,
  "GS-CG-002": 0.45,
  IE00B80G9288: 0.74,
  IE00B1FZS798: 0.2,
  ES0000012H41: 0,
  "KKR-GPE-IV": 2,
  "BX-REP-IX": 1.75,
  "ARDIAN-GF-V": 2.1,
  "BIF-IV-2020": 1.5,
  IE00B579F325: 0.12,
  "GOLD-JPM-001": 0.15,
  FR0010135103: 1.5,
  FR0010251660: 0.1,
};

// Depositary cost by bank (annual %).
const DEP_BANK: Record<string, number> = {
  "goldman sachs": 0,
  "jp morgan pb": 0,
  "interactive brokers": 0.05,
  andbank: 0.15,
};

function getTER(p: Product): number {
  if (p.isin && TER_ISIN[p.isin] !== undefined) return TER_ISIN[p.isin];
  const n = (p.producto || "").toLowerCase();
  if (
    (n.includes("cartera") && (n.includes("rf") || n.includes("renta"))) ||
    n.includes("jpm euro ladder")
  )
    return 0.45;
  return 0;
}

function getDep(p: Product): number {
  const b = (p.banco || "").toLowerCase();
  const n = (p.producto || "").toLowerCase();
  if (
    n.includes("cartera") &&
    (b.includes("goldman") || b.includes("gs") || b.includes("jp morgan") || b.includes("jpm"))
  )
    return 0;
  if (n.includes("jpm euro ladder") || n.includes("jp morgan access")) return 0;
  if (n.includes("gold jpm")) return 0;
  for (const k of Object.keys(DEP_BANK)) {
    if (b.includes(k)) return DEP_BANK[k];
  }
  return 0;
}

function preprocess(p: PortSet): EnrichedPortSet {
  const months = p.months;
  const total_series: DerivedSeries = {};
  const total_with_cc: DerivedSeries = {};
  const tipo_series: Record<string, DerivedSeries> = {};
  const banco_series: Record<string, DerivedSeries> = {};
  const titular_series: Record<string, DerivedSeries> = {};
  const twr_series: DerivedSeries = {};
  const growth_returns: DerivedSeries = {};
  const growth_newmoney: DerivedSeries = {};
  // The asset_alloc the original computes at runtime is EUR-denominated (not
  // percentages). It overwrites whatever was in the JSON. We rebuild it from
  // products the same way — this is the single source of truth the benchmark
  // calculation consumes.
  const asset_alloc: Record<string, DerivedSeries> = {
    RV: {},
    RF: {},
    ALT: {},
    CASH: {},
    MULTI: {},
    RF_USD: {},
    RF_EUR: {},
    GOLD: {},
    EM: {},
  };
  months.forEach((m) => {
    Object.keys(asset_alloc).forEach((k) => (asset_alloc[k][m] = 0));
    total_series[m] = 0;
    total_with_cc[m] = 0;
  });

  p.products.forEach((prod) => {
    const tipo = prod.tipologia || "Otro";
    if (!tipo_series[tipo]) {
      tipo_series[tipo] = {};
      months.forEach((m) => (tipo_series[tipo][m] = 0));
    }
    const banco = prod.banco || "Desconocido";
    if (!banco_series[banco]) {
      banco_series[banco] = {};
      months.forEach((m) => (banco_series[banco][m] = 0));
    }
    const titular = prod.titular || "?";
    if (!titular_series[titular]) {
      titular_series[titular] = {};
      months.forEach((m) => (titular_series[titular][m] = 0));
    }
    const grp = AA_MAP[prod.tipologia] || "MULTI";
    const isGold =
      prod.tipologia === "ETF Materias Primas" ||
      (prod.tipologia === "Vehículo Alternativo" && /gold/i.test(prod.producto));
    const isEm = EM_ISINS.has(prod.isin);
    const rfBucket = RF_TYPES.has(prod.tipologia)
      ? isRfUsd(prod.producto)
        ? "RF_USD"
        : "RF_EUR"
      : null;

    months.forEach((m) => {
      const v = (prod.valor && prod.valor[m]) || 0;
      if (prod.tipologia !== "Cuenta Corriente") total_series[m] += v;
      total_with_cc[m] += v;
      tipo_series[tipo][m] += v;
      banco_series[banco][m] += v;
      titular_series[titular][m] += v;
      asset_alloc[grp][m] += v;
      if (isGold) asset_alloc.GOLD[m] += v;
      if (isEm) asset_alloc.EM[m] += v;
      if (rfBucket) asset_alloc[rfBucket][m] += v;
    });
  });

  // Monthly TWR computed from product-level Dif%Mes
  months.forEach((m) => {
    let totS = 0;
    let totE = 0;
    p.products.forEach((prod) => {
      if (prod.tipologia === "Cuenta Corriente") return;
      const ev = (prod.valor && prod.valor[m]) || 0;
      if (ev <= 0) return;
      const raw = prod.difmes && prod.difmes[m];
      const dm = raw != null && Math.abs(raw) < 50 ? raw : 0;
      const sv = ev / (1 + dm / 100);
      totS += sv;
      totE += ev;
    });
    twr_series[m] = totS > 0 ? (totE / totS - 1) * 100 : 0;
  });

  // Decompose growth into returns vs. new money, cumulative
  let cumReturns = 0;
  let cumNewMoney = 0;
  months.forEach((m, i) => {
    const endVal = total_with_cc[m] || 0;
    if (i === 0) {
      growth_returns[m] = 0;
      growth_newmoney[m] = 0;
    } else {
      const prevM = months[i - 1];
      const prevVal = total_with_cc[prevM] || 0;
      const investPrev = total_series[prevM] || 0;
      const retPct = twr_series[m] || 0;
      const retAmt = (investPrev * retPct) / 100;
      const newMoney = endVal - prevVal - retAmt;
      cumReturns += retAmt;
      cumNewMoney += newMoney;
      growth_returns[m] = cumReturns;
      growth_newmoney[m] = cumNewMoney;
    }
  });

  // Per-product TER/DEP (cached once)
  const product_ter = new Map<string, number>();
  const product_dep = new Map<string, number>();
  p.products.forEach((prod) => {
    product_ter.set(prod.producto, getTER(prod));
    product_dep.set(prod.producto, getDep(prod));
  });

  // Monthly weighted TER/DEP series
  const ter_avg_series: DerivedSeries = {};
  const ter_cost_series: DerivedSeries = {};
  const dep_avg_series: DerivedSeries = {};
  const dep_cost_series: DerivedSeries = {};
  const all_avg_series: DerivedSeries = {};
  const all_cost_series: DerivedSeries = {};
  months.forEach((m) => {
    let wTer = 0;
    let wDep = 0;
    let totV = 0;
    p.products.forEach((prod) => {
      const v = (prod.valor && prod.valor[m]) || 0;
      if (v > 0) {
        wTer += v * (product_ter.get(prod.producto) || 0);
        wDep += v * (product_dep.get(prod.producto) || 0);
        totV += v;
      }
    });
    ter_avg_series[m] = totV > 0 ? wTer / totV : 0;
    ter_cost_series[m] = wTer / 100;
    dep_avg_series[m] = totV > 0 ? wDep / totV : 0;
    dep_cost_series[m] = wDep / 100;
    all_avg_series[m] = ter_avg_series[m] + dep_avg_series[m];
    all_cost_series[m] = ter_cost_series[m] + dep_cost_series[m];
  });

  return {
    ...p,
    asset_alloc, // overwrite whatever the JSON had with the EUR-denominated recomputed version
    total_series,
    total_with_cc,
    twr_series,
    growth_returns,
    growth_newmoney,
    tipo_series,
    banco_series,
    titular_series,
    ter_avg_series,
    ter_cost_series,
    dep_avg_series,
    dep_cost_series,
    all_avg_series,
    all_cost_series,
    product_ter,
    product_dep,
  };
}

// ─────────────────────── Benchmark computation ───────────────────────

/**
 * Returns the asset-allocation weight map to use for a given month, applying
 * the mid-month interpolation rule on trade months.
 */
export function benchWeights(
  aa: Record<string, DerivedSeries>,
  mi: MonthLabel,
  prevMi: MonthLabel | null,
  isTradeMo: boolean
): Record<string, number> {
  const keys = ["RV", "RF", "ALT", "CASH", "MULTI", "RF_USD", "RF_EUR", "GOLD", "EM"];
  const w: Record<string, number> = {};
  if (!prevMi) {
    keys.forEach((k) => (w[k] = aa[k]?.[mi] || 0));
  } else if (isTradeMo) {
    keys.forEach((k) => {
      const prev = aa[k]?.[prevMi] || 0;
      const curr = aa[k]?.[mi] || 0;
      w[k] = (prev + curr) / 2;
    });
  } else {
    keys.forEach((k) => (w[k] = aa[k]?.[prevMi] || 0));
  }
  return w;
}

/** Monthly blended benchmark return for a given allocation snapshot. */
export function benchRetForWeights(w: Record<string, number>, mi: MonthLabel): number {
  const rv = w.RV;
  const rf = w.RF;
  const alt = w.ALT;
  const cash = w.CASH;
  const multi = w.MULTI;
  const rfusd = w.RF_USD;
  const rfeur = w.RF_EUR;
  const total = rv + rf + alt + cash + multi;
  if (total <= 0) return 0;
  const rMSCI = BENCH_MSCI[mi] || 0;
  const rBOND = BENCH_BOND[mi] || 0;
  const rBONDUSD = BENCH_BOND_USD[mi] || 0;
  const r6040 = BENCH_6040[mi] || 0;
  const rGOLD = BENCH_GOLD[mi] || 0;
  const rEM = BENCH_EM[mi] || 0;
  const gold = w.GOLD;
  const altOther = alt - gold;
  const em = w.EM;
  const rvWorld = rv - em;
  return (
    (rvWorld / total) * rMSCI +
    (em / total) * rEM +
    (rfeur / total) * rBOND +
    (rfusd / total) * rBONDUSD +
    (gold / total) * rGOLD +
    (altOther / total) * ((rMSCI + rBONDUSD) / 2) +
    (multi / total) * r6040
  );
}

// ─────────────────────── KPI slice helpers ───────────────────────

export interface KpiSummary {
  totalNow: number;
  firstMonth: MonthLabel;
  lastMonth: MonthLabel;
  returnPct: number; // cumulative TWR nominal (%)
  annPct: number; // annualised TWR nominal (%)
  inflPct: number; // cumulative CPI (%)
  realRetPct: number; // cumulative TWR real (%)
  annReal: number; // annualised TWR real (%)
  benchPct: number; // cumulative custom benchmark (%)
  gapBps: number; // (TWR − bench) × 100 in bps
  best: { m: MonthLabel; v: number };
  worst: { m: MonthLabel; v: number };
  vol: number;
  maxDd: number;
  sharpe: number;
  retEur: number;
  newMoneyEur: number;
  cashDragBps: number;
}

/**
 * Computes the full set of KPI numbers shown in the Resumen header for the
 * given slice of months. Mirrors the KPI block at the top of `renderResumen`.
 */
export function computeKpis(
  port: "bca" | "bcp",
  months: MonthLabel[]
): KpiSummary {
  const d = getEnriched(port);
  const ts = d.total_series;
  const twr = d.twr_series;
  const twc = d.total_with_cc;
  const lastMonth = months[months.length - 1];
  const firstMonth = months[0];
  const totalNow = ts[lastMonth] || 0;

  // Cumulative TWR
  let cumul = 1;
  months.forEach((mi) => (cumul *= 1 + (twr[mi] || 0) / 100));
  const returnPct = (cumul - 1) * 100;
  const years = months.length / 12;
  const annPct = years > 0 ? (Math.pow(cumul, 1 / years) - 1) * 100 : 0;

  // Cumulative inflation & real return
  let cumCPI = 1;
  months.forEach((mi) => (cumCPI *= 1 + (CPI_ES[mi] || 0) / 100));
  const inflPct = (cumCPI - 1) * 100;
  const realRetPct = (cumul / cumCPI - 1) * 100;
  const annReal = years > 0 ? (Math.pow(cumul / cumCPI, 1 / years) - 1) * 100 : 0;

  // Benchmark with mid-month trade blending
  const tradeSet = port === "bca" ? TRADE_MONTHS_BCA : TRADE_MONTHS_BCP;
  let cumBench = 1;
  months.forEach((mi, idx) => {
    const prevMi = idx > 0 ? months[idx - 1] : null;
    const bw = benchWeights(d.asset_alloc, mi, prevMi, tradeSet.has(mi));
    cumBench *= 1 + benchRetForWeights(bw, mi) / 100;
  });
  const benchPct = (cumBench - 1) * 100;
  const gapBps = Math.round((returnPct - benchPct) * 100);

  // Best/worst month
  let best = { m: "", v: -Infinity };
  let worst = { m: "", v: Infinity };
  months.forEach((mi) => {
    const r = twr[mi] || 0;
    if (r > best.v) best = { m: mi, v: r };
    if (r < worst.v) worst = { m: mi, v: r };
  });

  // Volatility, Max Drawdown, Sharpe
  const rets = months.map((mi) => twr[mi] || 0);
  const retMean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const retVar = rets.reduce((a, b) => a + (b - retMean) ** 2, 0) / (rets.length - 1 || 1);
  const vol = Math.sqrt(retVar) * Math.sqrt(12);
  let peak = 0;
  let maxDd = 0;
  let cDD = 1;
  months.forEach((mi) => {
    cDD *= 1 + (twr[mi] || 0) / 100;
    if (cDD > peak) peak = cDD;
    const dd = ((cDD - peak) / peak) * 100;
    if (dd < maxDd) maxDd = dd;
  });
  const rfMo = 0.25;
  const excess = rets.map((r) => r - rfMo);
  const exMean = excess.reduce((a, b) => a + b, 0) / excess.length;
  const exStd = Math.sqrt(
    excess.reduce((a, b) => a + (b - exMean) ** 2, 0) / (excess.length - 1 || 1)
  );
  const sharpe = exStd > 0 ? (exMean / exStd) * Math.sqrt(12) : 0;

  // Absolute € returns and new money
  const retEur = (d.growth_returns[lastMonth] || 0) - (d.growth_returns[firstMonth] || 0);
  const newMoneyEur =
    (d.growth_newmoney[lastMonth] || 0) - (d.growth_newmoney[firstMonth] || 0);

  // Cash drag (cumulative bps)
  let cashDragPct = 0;
  months.forEach((mi) => {
    const aa = d.asset_alloc;
    const rv = aa.RV[mi] || 0;
    const rf = aa.RF[mi] || 0;
    const alt = aa.ALT[mi] || 0;
    const cash = aa.CASH[mi] || 0;
    const multi = aa.MULTI[mi] || 0;
    const total = rv + rf + alt + cash + multi;
    if (total <= 0) return;
    const cashPct = cash / total;
    const nonCash = total - cash;
    if (nonCash <= 0) return;
    const w: Record<string, number> = {
      RV: rv,
      RF: rf,
      ALT: alt,
      CASH: cash,
      MULTI: multi,
      RF_USD: aa.RF_USD[mi] || 0,
      RF_EUR: aa.RF_EUR[mi] || 0,
      GOLD: aa.GOLD[mi] || 0,
      EM: aa.EM[mi] || 0,
    };
    // Re-scale the non-cash weights so they sum to 1 and compute their blended return
    const scaled: Record<string, number> = {};
    Object.keys(w).forEach((k) => (scaled[k] = (k === "CASH" ? 0 : w[k])));
    const nonCashRet = benchRetForWeights(scaled, mi);
    cashDragPct += cashPct * nonCashRet;
  });
  const cashDragBps = Math.round(cashDragPct * 100);

  return {
    totalNow,
    firstMonth,
    lastMonth,
    returnPct,
    annPct,
    inflPct,
    realRetPct,
    annReal,
    benchPct,
    gapBps,
    best,
    worst,
    vol,
    maxDd,
    sharpe,
    retEur,
    newMoneyEur,
    cashDragBps,
  };
}

// ─────────────────────── Product / class classification ───────────────────────

// ─────────────────────── Slice helpers (for SubPeriodTable) ───────────────────────

/** Compounded nominal TWR (%) over an arbitrary slice of months. */
export function twrSlice(port: "bca" | "bcp", months: MonthLabel[]): number | null {
  if (!months || months.length === 0) return null;
  const d = getEnriched(port);
  let c = 1;
  months.forEach((mi) => (c *= 1 + (d.twr_series[mi] || 0) / 100));
  return (c - 1) * 100;
}

/** Compounded Spanish CPI inflation (%) over a slice. */
export function inflSlice(months: MonthLabel[]): number | null {
  if (!months || months.length === 0) return null;
  let c = 1;
  months.forEach((mi) => (c *= 1 + (CPI_ES[mi] || 0) / 100));
  return (c - 1) * 100;
}

/** Compounded TWR Real (nominal - inflation) over a slice. */
export function twrRealSlice(port: "bca" | "bcp", months: MonthLabel[]): number | null {
  if (!months || months.length === 0) return null;
  const d = getEnriched(port);
  let cN = 1;
  let cI = 1;
  months.forEach((mi) => {
    cN *= 1 + (d.twr_series[mi] || 0) / 100;
    cI *= 1 + (CPI_ES[mi] || 0) / 100;
  });
  return (cN / cI - 1) * 100;
}

/**
 * Compounded replicated-benchmark return (%) over a slice.
 * Note: uses plain start-of-month weights (no mid-month trade blending) —
 * this matches the `benchSlice` defined locally in the original's
 * `renderResumen`, which differs from the main KPI benchmark on purpose.
 */
export function benchSlice(port: "bca" | "bcp", months: MonthLabel[]): number | null {
  if (!months || months.length === 0) return null;
  const d = getEnriched(port);
  const aa = d.asset_alloc;
  let c = 1;
  months.forEach((mi) => {
    const w: Record<string, number> = {
      RV: aa.RV[mi] || 0,
      RF: aa.RF[mi] || 0,
      ALT: aa.ALT[mi] || 0,
      CASH: aa.CASH[mi] || 0,
      MULTI: aa.MULTI[mi] || 0,
      RF_USD: aa.RF_USD[mi] || 0,
      RF_EUR: aa.RF_EUR[mi] || 0,
      GOLD: aa.GOLD[mi] || 0,
      EM: aa.EM[mi] || 0,
    };
    const total = w.RV + w.RF + w.ALT + w.CASH + w.MULTI;
    if (total <= 0) return;
    c *= 1 + benchRetForWeights(w, mi) / 100;
  });
  return (c - 1) * 100;
}

// ─────────────────────── Sub-period helpers ───────────────────────

export interface SubPeriod {
  label: string;
  months: MonthLabel[] | null;
}

/**
 * Builds the 5 sub-periods (Últ. 3m / 6m / 12m / YTD / selected) relative to
 * the selected window, mirroring the logic at the top of the SubPeriodTable
 * block in the original `renderResumen`.
 */
export function buildSubPeriods(
  port: "bca" | "bcp",
  selected: MonthLabel[]
): SubPeriod[] {
  const d = getEnriched(port);
  const allM = d.months;
  const lastM = selected[selected.length - 1];
  const lastIdx = allM.indexOf(lastM);

  const m3 = allM.slice(Math.max(0, lastIdx - 2), lastIdx + 1);
  const m6 = allM.slice(Math.max(0, lastIdx - 5), lastIdx + 1);
  const m12 = allM.slice(Math.max(0, lastIdx - 11), lastIdx + 1);

  const lastYear = lastM.split("-")[1];
  const ytdStart = allM.findIndex((mi) => mi.endsWith("-" + lastYear));
  const ytdMonths = ytdStart >= 0 ? allM.slice(ytdStart, lastIdx + 1) : null;

  return [
    { label: "Últ. 3m", months: m3.length >= 2 ? m3 : null },
    { label: "Últ. 6m", months: m6.length >= 4 ? m6 : null },
    { label: "Últ. 12m", months: m12.length >= 8 ? m12 : null },
    {
      label: "YTD 20" + lastYear,
      months: ytdMonths && ytdMonths.length >= 1 ? ytdMonths : null,
    },
    { label: "Periodo (" + selected.length + "m)", months: selected },
  ];
}

export function getUSDCoeff(p: Product): number {
  if (p.isin && USD_COEFF[p.isin] !== undefined) return USD_COEFF[p.isin];
  const t = p.tipologia || "";
  const n = (p.producto || "").toUpperCase();
  if (t === "ETF Materias Primas") return 1.0;
  if (t === "Vehículo Alternativo") return /gold/i.test(p.producto || "") ? 1.0 : 0.5;
  if (t === "Fondo Monetario" || t === "Cuenta Corriente") return 0.0;
  if (t === "Fondo Multiactivo") return 0.3;
  if (/USD|U\.S\.|US TREASURY/i.test(n)) return 1.0;
  return 0.0;
}

// ─────────────────────── FX exposure helpers ───────────────────────

/**
 * Same product→group map used by the FX section in the original
 * `renderResumen`. NOTE that it DOES include `Cartera Gestionada RV` → RV
 * (unlike the benchmark `AA_MAP` which omits it). The original uses a
 * different local map for the FX block, so we preserve that difference here.
 */
const AA_GRP_FX: Record<string, "RV" | "RF" | "ALT" | "CASH" | "MULTI"> = {
  "Cartera Gestionada RV": "RV",
  "ETF Renta Variable": "RV",
  "Fondo Renta Variable": "RV",
  "Cartera Gestionada RF": "RF",
  "Fondo Renta Fija": "RF",
  "Renta Fija Directa": "RF",
  "Fondo Monetario": "RF",
  "ETF Materias Primas": "ALT",
  "Vehículo Alternativo": "ALT",
  "Fondo Multiactivo": "MULTI",
  "Cuenta Corriente": "CASH",
};

export interface FxSeries {
  /** % of portfolio exposed to USD total, per month. */
  usdExpPct: number[];
  /** Same split by class: RV / RF_USD / ALT / MULTI. */
  usdByClass: {
    RV: number[];
    RF_USD: number[];
    ALT: number[];
    MULTI: number[];
  };
  /** Absolute EUR values by class (useful for tooltips). */
  usdAbsByClass: {
    RV: number[];
    RF_USD: number[];
    ALT: number[];
    MULTI: number[];
  };
  /** Cumulative FX impact (%) — how much % the euro portfolio gained/lost from FX moves. */
  fxImpactSeries: number[];
}

/**
 * Computes the per-month USD exposure series used by the FX block in the
 * Resumen tab. Mirrors the loop at the top of the `fx` section.
 */
export function computeFxSeries(
  port: "bca" | "bcp",
  months: MonthLabel[],
  eurusd: Record<MonthLabel, number>
): FxSeries {
  const d = getEnriched(port);
  const aa = d.asset_alloc;
  const usdExpPct: number[] = [];
  const usdByClass = { RV: [] as number[], RF_USD: [] as number[], ALT: [] as number[], MULTI: [] as number[] };
  const usdAbsByClass = {
    RV: [] as number[],
    RF_USD: [] as number[],
    ALT: [] as number[],
    MULTI: [] as number[],
  };

  months.forEach((mi) => {
    let rvU = 0;
    let rfuU = 0;
    let altU = 0;
    let mulU = 0;
    let totU = 0;
    const totP =
      (aa.RV[mi] || 0) +
      (aa.RF[mi] || 0) +
      (aa.ALT[mi] || 0) +
      (aa.CASH[mi] || 0) +
      (aa.MULTI[mi] || 0);
    d.products.forEach((p) => {
      const v = (p.valor && p.valor[mi]) || 0;
      if (!v) return;
      const c = getUSDCoeff(p);
      const u = v * c;
      const g = AA_GRP_FX[p.tipologia] || "MULTI";
      if (g === "RV") rvU += u;
      else if (g === "RF" && c > 0) rfuU += u;
      else if (g === "ALT") altU += u;
      else if (g === "MULTI") mulU += u;
      totU += u;
    });
    usdByClass.RV.push(totP > 0 ? (rvU / totP) * 100 : 0);
    usdByClass.RF_USD.push(totP > 0 ? (rfuU / totP) * 100 : 0);
    usdByClass.ALT.push(totP > 0 ? (altU / totP) * 100 : 0);
    usdByClass.MULTI.push(totP > 0 ? (mulU / totP) * 100 : 0);
    usdAbsByClass.RV.push(rvU);
    usdAbsByClass.RF_USD.push(rfuU);
    usdAbsByClass.ALT.push(altU);
    usdAbsByClass.MULTI.push(mulU);
    usdExpPct.push(totP > 0 ? (totU / totP) * 100 : 0);
  });

  // Cumulative FX impact on euro portfolio
  let cumFxImpact = 0;
  const fxImpactSeries = months.map((mi, i) => {
    if (i === 0) return 0;
    const prevRate = eurusd[months[i - 1]] || 1;
    const curRate = eurusd[mi] || 1;
    const eurChange = curRate / prevRate - 1;
    const exposure = usdExpPct[i] / 100;
    cumFxImpact += -exposure * eurChange * 100;
    return cumFxImpact;
  });

  return { usdExpPct, usdByClass, usdAbsByClass, fxImpactSeries };
}

/**
 * Weighted-average EUR/USD purchase price series — for each month, the
 * cumulative average of the EUR/USD rate weighted by incremental USD
 * exposure across all products. Used by the `fxCost` chart.
 */
export function computeFxAvgPrice(
  port: "bca" | "bcp",
  months: MonthLabel[],
  eurusd: Record<MonthLabel, number>
): { spot: (number | null)[]; avg: (number | null)[] } {
  const d = getEnriched(port);
  let sumRateWeighted = 0;
  let sumUSD = 0;
  const avg: (number | null)[] = [];
  const spot: (number | null)[] = [];
  months.forEach((mi) => {
    const rate = eurusd[mi] || 0;
    let totUSD = 0;
    d.products.forEach((p) => {
      const v = (p.valor && p.valor[mi]) || 0;
      if (!v) return;
      totUSD += v * getUSDCoeff(p);
    });
    if (totUSD > 0 && rate > 0) {
      sumRateWeighted += rate * totUSD;
      sumUSD += totUSD;
    }
    avg.push(sumUSD > 0 ? sumRateWeighted / sumUSD : null);
    spot.push(rate || null);
  });
  return { spot, avg };
}
