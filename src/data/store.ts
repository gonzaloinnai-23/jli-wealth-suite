/**
 * Reactive data store for the dashboard.
 *
 * - Seeds the initial snapshot from the bundled JSON + constants modules.
 * - Persists any user edits in localStorage under a single key.
 * - Exposes a subscription API compatible with `useSyncExternalStore`, so any
 *   component that reads the store re-renders on every mutation.
 * - Provides Export/Import JSON and Reset.
 *
 * The store is the single source of truth: `getEnriched()` in `lib/calc.ts`
 * consumes it through `getSnapshot()` and re-derives everything on each call.
 * Because the enriched derivation is cheap (~120 months × 22 products) and
 * memoised by snapshot identity, the UI stays responsive even when typing
 * into a cell of the monthly values table.
 */
import { useSyncExternalStore } from "react";
import portfolioData from "./portfolio-data.json";
import {
  ALT_DATA,
  ALT_INFO,
  ALT_TARGETS,
  BENCH_MSCI,
  BENCH_BOND,
  BENCH_BOND_USD,
  BENCH_GOLD,
  BENCH_EM,
  BENCH_6040,
  CPI_ES,
  EURUSD,
  USD_COEFF,
  TRADE_MONTHS_BCA,
  TRADE_MONTHS_BCP,
} from "./constants";
import {
  validateSnapshot,
  tryValidate,
  type DataSnapshot,
  type Product,
  type AltFund,
  type AltType,
  type MonthLabel,
} from "./schema";

const STORAGE_KEY = "mendoza-family-office/snapshot/v1";

/** Hard-coded TER table from the original script. Kept here so the store can own it. */
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

const DEP_BANK: Record<string, number> = {
  "goldman sachs": 0,
  "jp morgan pb": 0,
  "interactive brokers": 0.05,
  andbank: 0.15,
};

/** Build the initial snapshot by stitching the bundled JSON + constants. */
function buildInitialSnapshot(): DataSnapshot {
  return {
    version: 1,
    portfolio: portfolioData as any,
    alternativos: {
      bca: (ALT_DATA as any).bca as AltFund[],
      bcp: (ALT_DATA as any).bcp as AltFund[],
      info: { ...(ALT_INFO as any) },
      targets: { ...(ALT_TARGETS as any) } as Record<AltType, number>,
    },
    constants: {
      EURUSD: { ...(EURUSD as Record<string, number>) },
      CPI_ES: { ...(CPI_ES as Record<string, number>) },
      BENCH: {
        MSCI: { ...(BENCH_MSCI as Record<string, number>) },
        BOND: { ...(BENCH_BOND as Record<string, number>) },
        BOND_USD: { ...(BENCH_BOND_USD as Record<string, number>) },
        GOLD: { ...(BENCH_GOLD as Record<string, number>) },
        EM: { ...(BENCH_EM as Record<string, number>) },
        "6040": { ...(BENCH_6040 as Record<string, number>) },
      },
      USD_COEFF: { ...(USD_COEFF as Record<string, number>) },
      TER_ISIN: { ...TER_ISIN },
      DEP_BANK: { ...DEP_BANK },
      TRADE_MONTHS: {
        bca: Array.from(TRADE_MONTHS_BCA),
        bcp: Array.from(TRADE_MONTHS_BCP),
      },
    },
  };
}

/** Load from localStorage if present and valid, otherwise the bundled default. */
function loadSnapshot(): DataSnapshot {
  if (typeof window === "undefined") return buildInitialSnapshot();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialSnapshot();
    const parsed = JSON.parse(raw);
    const validated = tryValidate(parsed);
    if (validated) return validated;
    console.warn("[DataStore] stored snapshot failed validation, using default");
  } catch (err) {
    console.warn("[DataStore] failed to load from localStorage:", err);
  }
  return buildInitialSnapshot();
}

function persist(snapshot: DataSnapshot) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.warn("[DataStore] failed to persist to localStorage:", err);
  }
}

// ─────────────────────── Store implementation ───────────────────────

type Listener = () => void;

class DataStore {
  private snapshot: DataSnapshot;
  private listeners = new Set<Listener>();
  /** Stable default for `useSyncExternalStore` getServerSnapshot. */
  private readonly initialSnapshot: DataSnapshot;

  constructor() {
    this.initialSnapshot = buildInitialSnapshot();
    this.snapshot = loadSnapshot();
  }

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): DataSnapshot => this.snapshot;

  getServerSnapshot = (): DataSnapshot => this.initialSnapshot;

  /**
   * Apply a mutation to the snapshot. The updater receives the current
   * snapshot and must return the new one (new object reference — treat the
   * current one as immutable). Automatically persists + notifies subscribers.
   */
  update(updater: (current: DataSnapshot) => DataSnapshot): void {
    const next = updater(this.snapshot);
    if (next === this.snapshot) return; // no-op
    this.snapshot = next;
    persist(this.snapshot);
    this.listeners.forEach((l) => l());
  }

  /** Replace the whole snapshot (Import JSON). */
  replace(next: DataSnapshot): void {
    this.snapshot = next;
    persist(this.snapshot);
    this.listeners.forEach((l) => l());
  }

  /** Restore to the bundled defaults (Reset button). */
  reset(): void {
    this.replace(buildInitialSnapshot());
  }

  /** Serialise to a JSON string ready for download. */
  exportJson(): string {
    return JSON.stringify(this.snapshot, null, 2);
  }

  /** Parse + validate + replace. Throws if validation fails. */
  importJson(raw: string): void {
    const parsed = JSON.parse(raw);
    const validated = validateSnapshot(parsed);
    this.replace(validated);
  }

  // ─── High-level mutations ─────────────────────────────────────────

  updateProduct(port: "bca" | "bcp", isin: string, patch: Partial<Product>): void {
    this.update((s) => {
      const products = s.portfolio[port].products;
      const idx = products.findIndex((p) => p.isin === isin);
      if (idx < 0) return s;
      const updated = { ...products[idx], ...patch };
      const nextProducts = products.slice();
      nextProducts[idx] = updated;
      return withPort(s, port, { products: nextProducts });
    });
  }

  setProductMonthValue(
    port: "bca" | "bcp",
    isin: string,
    month: MonthLabel,
    valor: number,
    difmes: number
  ): void {
    this.update((s) => {
      const products = s.portfolio[port].products;
      const idx = products.findIndex((p) => p.isin === isin);
      if (idx < 0) return s;
      const product = products[idx];
      const nextProduct: Product = {
        ...product,
        valor: { ...product.valor, [month]: valor },
        difmes: { ...product.difmes, [month]: difmes },
      };
      const nextProducts = products.slice();
      nextProducts[idx] = nextProduct;
      return withPort(s, port, { products: nextProducts });
    });
  }

  addProduct(port: "bca" | "bcp", product: Product): void {
    this.update((s) => {
      const products = s.portfolio[port].products;
      if (products.some((p) => p.isin === product.isin)) {
        throw new Error(`ISIN ${product.isin} already exists`);
      }
      return withPort(s, port, { products: [...products, product] });
    });
  }

  removeProduct(port: "bca" | "bcp", isin: string): void {
    this.update((s) => {
      const products = s.portfolio[port].products.filter((p) => p.isin !== isin);
      return withPort(s, port, { products });
    });
  }

  updateAltFund(
    port: "bca" | "bcp",
    originalName: string,
    patch: Partial<AltFund>
  ): void {
    this.update((s) => {
      const funds = s.alternativos[port];
      const idx = funds.findIndex((f) => f.name === originalName);
      if (idx < 0) return s;
      const next = funds.slice();
      next[idx] = { ...funds[idx], ...patch };
      return {
        ...s,
        alternativos: { ...s.alternativos, [port]: next },
      };
    });
  }

  addAltFund(port: "bca" | "bcp", fund: AltFund): void {
    this.update((s) => ({
      ...s,
      alternativos: {
        ...s.alternativos,
        [port]: [...s.alternativos[port], fund],
      },
    }));
  }

  removeAltFund(port: "bca" | "bcp", name: string): void {
    this.update((s) => ({
      ...s,
      alternativos: {
        ...s.alternativos,
        [port]: s.alternativos[port].filter((f) => f.name !== name),
      },
    }));
  }

  setAltTarget(type: AltType, value: number): void {
    this.update((s) => ({
      ...s,
      alternativos: {
        ...s.alternativos,
        targets: { ...s.alternativos.targets, [type]: value },
      },
    }));
  }
}

function withPort(
  s: DataSnapshot,
  port: "bca" | "bcp",
  patch: Partial<DataSnapshot["portfolio"]["bca"]>
): DataSnapshot {
  return {
    ...s,
    portfolio: {
      ...s.portfolio,
      [port]: { ...s.portfolio[port], ...patch },
    },
  };
}

// Module-level singleton — one store per app.
export const dataStore = new DataStore();

// ─────────────────────── React hook ───────────────────────

/**
 * Subscribe a component to the store. Re-renders on every mutation.
 * Use this ONLY when you actually need to re-render on data changes; for
 * one-shot reads outside render, call `dataStore.getSnapshot()` directly.
 */
export function useSnapshot(): DataSnapshot {
  return useSyncExternalStore(
    dataStore.subscribe,
    dataStore.getSnapshot,
    dataStore.getServerSnapshot
  );
}

// Re-export types for convenience
export type { DataSnapshot, Product, AltFund, AltType, MonthLabel } from "./schema";
