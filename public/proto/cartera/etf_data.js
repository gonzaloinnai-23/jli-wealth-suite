// ============================================================
// BASE DE DATOS DE ETFs COMPARTIDA ENTRE LAS 3 PÁGINAS
// Curada a partir de la planilla "1. Índices y ETFs — Carteras Modelo Indexados".
// Campos:
//  region, name, ter, aum (billones USD), holdings, focus, tag (visual)
// + Campos para evaluar Política de Inversión (IPS):
//  provider           — gestora
//  domicile           — 'US' | 'IRL' | 'LU' | 'DE'
//  accumulation       — true = acumulación · false = distribución
//  isMixed            — true si es híbrido / multi-asset
//  isSectorial        — true si es sectorial (>10% concentración por industria)
//  isSynthetic        — true si replicación sintética (derivados)
//  isActiveMgmt       — true si gestión activa (no indexado)
//  hasRetrocession    — true si clase no-clean
//  liquidityDays      — días para liquidación (T+N)
//  isCommercialBank   — true si la gestora es banca comercial
//  inceptionYear      — año de lanzamiento del fondo (para track record)
// ============================================================
const ETF_DB = {
  // ===== EEUU — S&P 500 (US-domiciliados) =====
  VOO:  { region: 'us', name: 'Vanguard S&P 500 ETF', ter: 0.03, aum: 817, holdings: 503, focus: 'S&P 500', tag: 'MÁS POPULAR',
          provider: 'Vanguard',     domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2010 },
  IVV:  { region: 'us', name: 'iShares Core S&P 500 ETF', ter: 0.03, aum: 580, holdings: 503, focus: 'S&P 500', tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2000 },
  SPY:  { region: 'us', name: 'SPDR S&P 500 ETF Trust', ter: 0.09, aum: 650, holdings: 503, focus: 'S&P 500', tag: null,
          provider: 'State Street', domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 1993 },
  // ===== EEUU — S&P 500 UCITS (Irlanda) =====
  CSPX: { region: 'us', name: 'iShares Core S&P 500 UCITS ETF (Acc)', ter: 0.07, aum: 127, holdings: 503, focus: 'S&P 500 UCITS', tag: 'UCITS 🇮🇪',
          provider: 'BlackRock',    domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2010 },
  VUAA: { region: 'us', name: 'Vanguard S&P 500 UCITS ETF (Acc)', ter: 0.07, aum: 29, holdings: 500, focus: 'S&P 500 UCITS', tag: 'UCITS 🇮🇪',
          provider: 'Vanguard',     domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2019 },
  SPY5: { region: 'us', name: 'SPDR S&P 500 UCITS ETF', ter: 0.03, aum: 14.85, holdings: 500, focus: 'S&P 500 UCITS', tag: 'UCITS 🇮🇪',
          provider: 'State Street', domicile: 'IRL', accumulation: false, isSectorial: false, inceptionYear: 2011 },
  // ===== EEUU — Total Market =====
  VTI:  { region: 'us', name: 'Vanguard Total Stock Market ETF', ter: 0.03, aum: 430, holdings: 3506, focus: 'CRSP US Total Market', tag: 'TOTAL MARKET',
          provider: 'Vanguard',     domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2001 },
  ITOT: { region: 'us', name: 'iShares Core S&P Total US Stock Market ETF', ter: 0.03, aum: 80, holdings: 2500, focus: 'S&P Total Market', tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2004 },

  // ===== EUROPA =====
  MEUF: { region: 'eu', name: 'Amundi Core Stoxx Europe 600 UCITS ETF Acc', ter: 0.07, aum: 18.5, holdings: 600, focus: 'STOXX Europe 600', tag: 'UCITS 🇱🇺',
          provider: 'Amundi',       domicile: 'LU',  accumulation: true,  isSectorial: false, inceptionYear: 2014 },
  EXSA: { region: 'eu', name: 'iShares STOXX Europe 600 UCITS ETF (DE)', ter: 0.20, aum: 9.2, holdings: 602, focus: 'STOXX Europe 600', tag: 'UCITS 🇩🇪',
          provider: 'BlackRock',    domicile: 'DE',  accumulation: false, isSectorial: false, inceptionYear: 2010 },
  IMEU: { region: 'eu', name: 'iShares Core MSCI Europe UCITS ETF (Acc)', ter: 0.12, aum: 10, holdings: 410, focus: 'MSCI Europe', tag: 'UCITS 🇮🇪',
          provider: 'BlackRock',    domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2009 },
  SXR7: { region: 'eu', name: 'iShares Core MSCI EMU UCITS ETF EUR (Acc)', ter: 0.12, aum: 6.8, holdings: 233, focus: 'MSCI EMU (Eurozona)', tag: 'UCITS 🇮🇪',
          provider: 'BlackRock',    domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2009 },

  // ===== CHINA =====
  ASHR: { region: 'cn', name: 'Xtrackers Harvest CSI 300 China A-Shares ETF', ter: 0.65, aum: 1.5, holdings: 300, focus: 'CSI 300 A-Shares', tag: 'A-SHARES',
          provider: 'DWS',          domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2013 },
  RQFI: { region: 'cn', name: 'Xtrackers Harvest CSI 300 UCITS ETF 1D', ter: 0.65, aum: 0.27, holdings: 300, focus: 'CSI 300 A-Shares UCITS', tag: 'UCITS 🇱🇺',
          provider: 'DWS',          domicile: 'LU',  accumulation: false, isSectorial: false, inceptionYear: 2014 },
  MCHI: { region: 'cn', name: 'iShares MSCI China ETF', ter: 0.59, aum: 6.6, holdings: 588, focus: 'MSCI China', tag: 'MÁS POPULAR',
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2011 },
  FXI:  { region: 'cn', name: 'iShares China Large-Cap ETF', ter: 0.74, aum: 6.0, holdings: 58, focus: 'FTSE China 50', tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2004 },

  // ===== JAPÓN =====
  EWJ:  { region: 'jp', name: 'iShares MSCI Japan ETF', ter: 0.49, aum: 20.4, holdings: 188, focus: 'MSCI Japan', tag: 'MÁS POPULAR',
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 1996 },
  VJPN: { region: 'jp', name: 'Vanguard FTSE Japan UCITS ETF (Dist)', ter: 0.15, aum: 2.6, holdings: 500, focus: 'FTSE Japan', tag: 'UCITS 🇮🇪',
          provider: 'Vanguard',     domicile: 'IRL', accumulation: false, isSectorial: false, inceptionYear: 2013 },
  SJPA: { region: 'jp', name: 'iShares Core MSCI Japan IMI UCITS ETF (Acc)', ter: 0.12, aum: 5.0, holdings: 1250, focus: 'MSCI Japan IMI', tag: 'UCITS 🇮🇪',
          provider: 'BlackRock',    domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2018 },

  // ===== EMERGENTES =====
  EEM:  { region: 'em', name: 'iShares MSCI Emerging Markets ETF', ter: 0.70, aum: 18, holdings: 1250, focus: 'MSCI EM', tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2003 },
  IEMG: { region: 'em', name: 'iShares Core MSCI Emerging Markets ETF', ter: 0.09, aum: 135, holdings: 2800, focus: 'MSCI EM IMI', tag: 'MÁS POPULAR',
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2012 },
  EIMI: { region: 'em', name: 'iShares Core MSCI EM IMI UCITS ETF (Acc)', ter: 0.18, aum: 37, holdings: 3018, focus: 'MSCI EM IMI', tag: 'UCITS 🇮🇪',
          provider: 'BlackRock',    domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2014 },
  VWO:  { region: 'em', name: 'Vanguard FTSE Emerging Markets ETF', ter: 0.06, aum: 120, holdings: 5095, focus: 'FTSE EM (sin Corea)', tag: null,
          provider: 'Vanguard',     domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2005 },
  XMME: { region: 'em', name: 'Xtrackers MSCI Emerging Markets UCITS ETF 1C', ter: 0.18, aum: 11, holdings: 1350, focus: 'MSCI EM', tag: 'UCITS 🇮🇪',
          provider: 'DWS',          domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2014 },

  // ===== GLOBAL — Resto ex-US (US-dom) =====
  VXUS: { region: 'world', name: 'Vanguard Total International Stock ETF', ter: 0.05, aum: 144, holdings: 8842, focus: 'FTSE Global All Cap ex US', tag: 'EX-USA',
          provider: 'Vanguard',     domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2011 },
  VEU:  { region: 'world', name: 'Vanguard FTSE All-World ex-US ETF', ter: 0.04, aum: 85, holdings: 3600, focus: 'FTSE All-World ex US', tag: 'EX-USA',
          provider: 'Vanguard',     domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2007 },
  IXUS: { region: 'world', name: 'iShares Core MSCI Total International Stock ETF', ter: 0.07, aum: 45, holdings: 4300, focus: 'MSCI ACWI ex US IMI', tag: 'EX-USA',
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2012 },

  // ===== GLOBAL — DM ex-US =====
  EFA:  { region: 'world', name: 'iShares MSCI EAFE ETF', ter: 0.32, aum: 68, holdings: 720, focus: 'MSCI EAFE (DM ex-US ex-CA)', tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2001 },
  VEA:  { region: 'world', name: 'Vanguard FTSE Developed Markets ETF', ter: 0.03, aum: 150, holdings: 3957, focus: 'FTSE Developed All Cap ex US', tag: null,
          provider: 'Vanguard',     domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2007 },

  // ===== GLOBAL — Mundo DM (MSCI World, sin emergentes) =====
  IWDA: { region: 'world', name: 'iShares Core MSCI World UCITS ETF (Acc)', ter: 0.20, aum: 121, holdings: 1349, focus: 'MSCI World (DM)', tag: 'UCITS 🇮🇪',
          provider: 'BlackRock',    domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2009 },
  HMWO: { region: 'world', name: 'HSBC MSCI World UCITS ETF', ter: 0.15, aum: 11, holdings: 1368, focus: 'MSCI World (DM)', tag: 'UCITS 🇮🇪',
          provider: 'HSBC',         domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2010, isCommercialBank: true },

  // ===== GLOBAL — Mundo total (ACWI / All-World) =====
  ACWI: { region: 'world', name: 'iShares MSCI ACWI ETF', ter: 0.32, aum: 22, holdings: 2317, focus: 'MSCI ACWI', tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2008 },
  VT:   { region: 'world', name: 'Vanguard Total World Stock ETF', ter: 0.06, aum: 90, holdings: 9800, focus: 'FTSE All-World', tag: 'TODO EL MUNDO',
          provider: 'Vanguard',     domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2008 },
  VWCE: { region: 'world', name: 'Vanguard FTSE All-World UCITS ETF (Acc)', ter: 0.19, aum: 36, holdings: 3700, focus: 'FTSE All-World', tag: 'UCITS 🇮🇪',
          provider: 'Vanguard',     domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2019 },
  VWRL: { region: 'world', name: 'Vanguard FTSE All-World UCITS ETF (Dist)', ter: 0.19, aum: 22, holdings: 3700, focus: 'FTSE All-World', tag: 'UCITS 🇮🇪',
          provider: 'Vanguard',     domicile: 'IRL', accumulation: false, isSectorial: false, inceptionYear: 2012 },
  SPYI: { region: 'world', name: 'SPDR MSCI ACWI IMI UCITS ETF', ter: 0.17, aum: 5.9, holdings: 8228, focus: 'MSCI ACWI IMI', tag: 'UCITS 🇮🇪',
          provider: 'State Street', domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2011 }
};

// Pesos regionales del mercado global actual (capitalización bursátil 2026)
const REGION_WEIGHTS = {
  us: 62, eu: 14, cn: 9, jp: 5.5, em: 5, other: 4.5
};

// Para ETFs globales, asumimos distribución interna según market cap mundial
const GLOBAL_BREAKDOWN = {
  // Mundo total (ACWI / FTSE All-World) — DM + EM
  ACWI: { us: 62, eu: 14, cn: 3, jp: 5.5, em: 11, other: 4.5 },
  VT:   { us: 62, eu: 14, cn: 3, jp: 5.5, em: 11, other: 4.5 },
  VWCE: { us: 62, eu: 14, cn: 3, jp: 5.5, em: 11, other: 4.5 },
  VWRL: { us: 62, eu: 14, cn: 3, jp: 5.5, em: 11, other: 4.5 },
  // MSCI ACWI IMI: All-cap (incluye small-cap); US baja levemente
  SPYI: { us: 60, eu: 15, cn: 3, jp: 5.5, em: 11, other: 5.5 },
  // Resto ex-US (DM + EM, sin EEUU)
  VXUS: { us: 0, eu: 37, cn: 8, jp: 14, em: 30, other: 11 },
  VEU:  { us: 0, eu: 40, cn: 8, jp: 15, em: 25, other: 12 },
  IXUS: { us: 0, eu: 38, cn: 8, jp: 14, em: 28, other: 12 },
  // DM ex-US (sin emergentes ni China)
  EFA:  { us: 0, eu: 65, cn: 0, jp: 25, em: 0, other: 10 },
  VEA:  { us: 0, eu: 60, cn: 0, jp: 22, em: 0, other: 18 },
  // MSCI World = developed markets puros (sin emergentes, sin China)
  IWDA: { us: 70, eu: 16, cn: 0, jp: 6, em: 0, other: 8 },
  HMWO: { us: 70, eu: 16, cn: 0, jp: 6, em: 0, other: 8 }
};

const REGION_META = {
  us:    { name: 'Estados Unidos',   hex: '#1e88e5', emoji: '🇺🇸' },
  eu:    { name: 'Europa',            hex: '#fbc02d', emoji: '🇪🇺' },
  cn:    { name: 'China',             hex: '#43a047', emoji: '🇨🇳' },
  jp:    { name: 'Japón',             hex: '#e53935', emoji: '🇯🇵' },
  em:    { name: 'Emergentes',        hex: '#ab47bc', emoji: '🌏' },
  other: { name: 'Resto del Mundo',   hex: '#78909c', emoji: '🌐' },
  world: { name: 'Global',            hex: '#4fc3f7', emoji: '🌍' }
};

// ============================================================
// UTILIDADES DE CÁLCULO
// ============================================================

// Suma total de empresas únicas aproximada (con descuento por solapamiento)
function computeTotalHoldings(tickers) {
  if (tickers.length === 0) return 0;
  // Agrupar por región
  const byRegion = {};
  tickers.forEach(t => {
    const etf = ETF_DB[t];
    if (!etf) return;
    if (!byRegion[etf.region]) byRegion[etf.region] = [];
    byRegion[etf.region].push(etf.holdings);
  });
  let total = 0;
  Object.values(byRegion).forEach(holdings => {
    // Solapamiento: el ETF con más empresas cubre al resto; los otros aportan ~25% extra por cada uno
    holdings.sort((a,b) => b-a);
    total += holdings[0];
    for (let i = 1; i < holdings.length; i++) {
      total += holdings[i] * 0.25;
    }
  });
  return Math.round(total);
}

// Calcula pesos regionales agregados de una selección (ponderados por AUM si se prefiere,
// o simplemente igualmente ponderados; aquí usamos igual ponderación por ETF = 1/N)
function computeRegionalMix(tickers) {
  if (tickers.length === 0) return {};
  const mix = { us:0, eu:0, cn:0, jp:0, em:0, other:0 };
  const weight = 100 / tickers.length;
  tickers.forEach(t => {
    const etf = ETF_DB[t];
    if (!etf) return;
    if (etf.region === 'world') {
      const br = GLOBAL_BREAKDOWN[t] || REGION_WEIGHTS;
      Object.keys(mix).forEach(r => { mix[r] += (br[r] || 0) * weight / 100; });
    } else {
      mix[etf.region] += weight;
    }
  });
  return mix;
}

// Índice de diversificación 1-10
// Combina:
//  - Diversificación geográfica (qué tan uniforme es la distribución entre regiones) - 40%
//  - Número de empresas (log-scaled hasta 3000 que da 10) - 40%
//  - Número de ETFs distintos (hasta 6 ETFs da 10) - 20%
function computeDiversificationScore(tickers) {
  if (tickers.length === 0) return 0;

  // 1. Diversificación geográfica (entropía de Shannon normalizada)
  const mix = computeRegionalMix(tickers);
  const totalMix = Object.values(mix).reduce((a,b)=>a+b, 0);
  let entropy = 0;
  Object.values(mix).forEach(pct => {
    if (pct > 0) {
      const p = pct / totalMix;
      entropy -= p * Math.log2(p);
    }
  });
  const maxEntropy = Math.log2(6); // 6 regiones
  const geoScore = (entropy / maxEntropy) * 10;

  // 2. Empresas cubiertas (log-scale)
  const holdings = computeTotalHoldings(tickers);
  const holdingsScore = Math.min(10, Math.log10(Math.max(1, holdings)) / Math.log10(3000) * 10);

  // 3. Número de ETFs distintos
  const etfScore = Math.min(10, tickers.length * (10/6));

  // Combinación ponderada
  const score = geoScore * 0.40 + holdingsScore * 0.40 + etfScore * 0.20;
  return Math.round(score * 10) / 10; // 1 decimal
}

// TER promedio ponderado (igual peso por ETF)
function computeAvgTER(tickers) {
  if (tickers.length === 0) return 0;
  const sum = tickers.reduce((acc, t) => acc + (ETF_DB[t]?.ter || 0), 0);
  return Math.round((sum / tickers.length) * 1000) / 1000;
}

// ============================================================
// POLÍTICA DE INVERSIÓN (IPS)
// Lee la política guardada por /proto/politica.html y evalúa ETFs
// ============================================================
const IPS_KEY = 'jli_ips';

const IPS_DEFAULT_FILTERS = {
  mixtos: true, derivados: true, sectorial: true, banca: true,
  retros: true, liquidez: true, activa: true, usDomicile: true,
  concentracion: true,
};
const IPS_DEFAULT_KPIS = {
  trackYears:   { active: true, value: 5 },
  aumMillUSD:   { active: true, value: 1000 },
  terMaxPct:    { active: true, value: 0.30 },
  accumulation: { active: true, value: 'acumulacion' },
};

function loadIPS() {
  try {
    const raw = localStorage.getItem(IPS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        exclusions: { ...IPS_DEFAULT_FILTERS, ...(parsed.exclusions || {}) },
        kpis: { ...IPS_DEFAULT_KPIS, ...(parsed.kpis || {}) },
      };
    }
  } catch (e) {}
  return { exclusions: { ...IPS_DEFAULT_FILTERS }, kpis: { ...IPS_DEFAULT_KPIS } };
}

// Evalúa un ETF contra la política. Devuelve { eligible, reasons[] }
function evaluateAgainstIPS(etf, ipsArg) {
  const ips = ipsArg || loadIPS();
  const reasons = [];
  const ex = ips.exclusions;
  const kp = ips.kpis;

  // ---- FILTROS DE EXCLUSIÓN ----
  if (ex.mixtos      && etf.isMixed)         reasons.push('Fondo mixto / híbrido');
  if (ex.derivados   && etf.isSynthetic)     reasons.push('Replicación sintética / derivados');
  if (ex.sectorial   && etf.isSectorial)     reasons.push('Concentración sectorial > 10%');
  if (ex.banca       && etf.isCommercialBank) reasons.push(`Gestora de banca comercial (${etf.provider})`);
  if (ex.retros      && etf.hasRetrocession) reasons.push('Retrocesiones / share class no-clean');
  if (ex.liquidez    && (etf.liquidityDays || 2) > 10) reasons.push(`Liquidez T+${etf.liquidityDays}`);
  if (ex.activa      && etf.isActiveMgmt)    reasons.push('Gestión activa');
  if (ex.usDomicile  && etf.domicile === 'US') reasons.push('Domicilio en EE. UU.');
  // concentracion: no se evalúa por ETF aislado — depende del mix de cartera (ver checkConcentrationCartera)

  // ---- KPIs MÍNIMOS ----
  if (kp.trackYears && kp.trackYears.active) {
    const minYear = new Date().getFullYear() - (kp.trackYears.value || 0);
    const inception = etf.inceptionYear || new Date().getFullYear();
    if (inception > minYear) {
      reasons.push(`Antigüedad < ${kp.trackYears.value} años (lanzado ${inception})`);
    }
  }
  if (kp.aumMillUSD && kp.aumMillUSD.active) {
    const aumMill = (etf.aum || 0) * 1000; // aum está en billones USD
    if (aumMill < kp.aumMillUSD.value) {
      reasons.push(`AUM ${aumMill.toFixed(0)}M < ${kp.aumMillUSD.value}M USD`);
    }
  }
  if (kp.terMaxPct && kp.terMaxPct.active) {
    if (etf.ter > kp.terMaxPct.value) {
      reasons.push(`TER ${etf.ter}% > ${kp.terMaxPct.value}% máximo`);
    }
  }
  if (kp.accumulation && kp.accumulation.active && kp.accumulation.value !== 'cualquiera') {
    const wantAcc = kp.accumulation.value === 'acumulacion';
    if (!!etf.accumulation !== wantAcc) {
      reasons.push(`Política de dividendos: ${wantAcc ? 'requiere acumulación' : 'requiere distribución'}`);
    }
  }

  return { eligible: reasons.length === 0, reasons };
}

// Evalúa la regla de concentración por gestora sobre el conjunto seleccionado
// Devuelve { ok, byProvider: { Vanguard: 50, BlackRock: 30, ... }, breachedProviders }
function evaluateProviderConcentration(tickers, ipsArg) {
  const ips = ipsArg || loadIPS();
  if (!ips.exclusions.concentracion || !tickers || tickers.length === 0) {
    return { ok: true, byProvider: {}, breachedProviders: [] };
  }
  const weight = 100 / tickers.length;
  const byProvider = {};
  tickers.forEach(t => {
    const etf = ETF_DB[t];
    if (!etf) return;
    const p = etf.provider || 'Otro';
    byProvider[p] = (byProvider[p] || 0) + weight;
  });
  const breachedProviders = Object.entries(byProvider)
    .filter(([_, pct]) => pct > 30)
    .map(([p, pct]) => ({ provider: p, pct: Math.round(pct * 10) / 10 }));
  return { ok: breachedProviders.length === 0, byProvider, breachedProviders };
}

// ============================================================
// STORAGE: guardar selección entre páginas
// ============================================================
const SELECTION_KEY = 'etf_selection_v1';

function saveSelection(tickers) {
  try { localStorage.setItem(SELECTION_KEY, JSON.stringify(tickers)); } catch(e){}
}

function loadSelection() {
  try {
    const raw = localStorage.getItem(SELECTION_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function clearSelection() {
  try { localStorage.removeItem(SELECTION_KEY); } catch(e){}
}
