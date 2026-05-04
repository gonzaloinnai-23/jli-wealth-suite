// ============================================================
// BASE DE DATOS DE ETFs COMPARTIDA ENTRE LAS 3 PÁGINAS
// Campos:
//  region, name, ter, aum (billones USD), holdings, focus, tag (visual)
// + Campos para evaluar Política de Inversión (IPS):
//  provider           — gestora
//  domicile           — 'US' | 'IRL' | 'LU'
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
  // ===== EEUU =====
  VOO:  { region: 'us', name: 'Vanguard S&P 500 ETF',             ter: 0.03, aum: 1500, holdings: 500,   focus: 'Large Cap',  tag: 'MÁS POPULAR',
          provider: 'Vanguard',     domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2010 },
  SPY:  { region: 'us', name: 'SPDR S&P 500 ETF Trust',            ter: 0.09, aum: 600,  holdings: 500,   focus: 'Large Cap',  tag: null,
          provider: 'State Street', domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 1993 },
  VTI:  { region: 'us', name: 'Vanguard Total Stock Market',       ter: 0.03, aum: 450,  holdings: 3700,  focus: 'Total Market', tag: 'TOTAL MARKET',
          provider: 'Vanguard',     domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2001 },
  QQQ:  { region: 'us', name: 'Invesco Nasdaq 100',                ter: 0.20, aum: 380,  holdings: 100,   focus: 'Tech',       tag: 'TECH',
          provider: 'Invesco',      domicile: 'US',  accumulation: false, isSectorial: true,  inceptionYear: 1999 },
  IVV:  { region: 'us', name: 'iShares Core S&P 500',              ter: 0.03, aum: 600,  holdings: 500,   focus: 'Large Cap',  tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2000 },
  SCHD: { region: 'us', name: 'Schwab US Dividend Equity',         ter: 0.06, aum: 70,   holdings: 100,   focus: 'Dividend',   tag: null,
          provider: 'Charles Schwab', domicile: 'US', accumulation: false, isSectorial: false, inceptionYear: 2011 },

  // ===== EEUU UCITS (domiciliados en Irlanda — aptos para inversores europeos) =====
  CSPX: { region: 'us', name: 'iShares Core S&P 500 UCITS ETF (Acc)', ter: 0.07, aum: 96,  holdings: 503, focus: 'S&P 500 UCITS',     tag: 'UCITS 🇮🇪',
          provider: 'BlackRock',    domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2010 },
  VUAA: { region: 'us', name: 'Vanguard S&P 500 UCITS ETF (Acc)',     ter: 0.07, aum: 13,  holdings: 503, focus: 'S&P 500 UCITS',     tag: 'UCITS 🇮🇪',
          provider: 'Vanguard',     domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2019 },
  SPY4: { region: 'us', name: 'SPDR S&P 400 US Mid Cap UCITS ETF',    ter: 0.30, aum: 0.7, holdings: 400, focus: 'S&P 400 Mid-Cap',   tag: 'MID-CAP UCITS',
          provider: 'State Street', domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2012 },
  EQQQ: { region: 'us', name: 'Invesco EQQQ Nasdaq-100 UCITS ETF',    ter: 0.30, aum: 10,  holdings: 100, focus: 'Nasdaq 100 UCITS',  tag: 'NASDAQ UCITS',
          provider: 'Invesco',      domicile: 'IRL', accumulation: false, isSectorial: false, inceptionYear: 2002 },
  CNDX: { region: 'us', name: 'iShares Nasdaq 100 UCITS ETF (Acc)',   ter: 0.33, aum: 15,  holdings: 100, focus: 'Nasdaq 100 UCITS',  tag: 'UCITS 🇮🇪',
          provider: 'BlackRock',    domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2010 },
  XRSU: { region: 'us', name: 'Xtrackers Russell 2000 UCITS ETF (Acc)', ter: 0.30, aum: 1.5, holdings: 2000, focus: 'Russell 2000 Small-Cap', tag: 'SMALL-CAP UCITS',
          provider: 'DWS',          domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2016 },
  // ----- Alternativas a Vanguard/BlackRock para S&P 500 UCITS -----
  SPYL: { region: 'us', name: 'SPDR S&P 500 UCITS ETF (Acc)',          ter: 0.03, aum: 5,   holdings: 503, focus: 'S&P 500 UCITS', tag: 'UCITS 🇮🇪',
          provider: 'State Street', domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2012 },
  XSPX: { region: 'us', name: 'Xtrackers S&P 500 UCITS ETF 1C (Acc)',  ter: 0.07, aum: 10,  holdings: 503, focus: 'S&P 500 UCITS', tag: 'UCITS 🇮🇪',
          provider: 'DWS',          domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2010 },
  SPXP: { region: 'us', name: 'Invesco S&P 500 UCITS ETF (Acc)',       ter: 0.05, aum: 8,   holdings: 503, focus: 'S&P 500 UCITS', tag: 'UCITS 🇮🇪',
          provider: 'Invesco',      domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2010 },

  // ===== EUROPA =====
  VGK:  { region: 'eu', name: 'Vanguard FTSE Europe ETF',          ter: 0.09, aum: 25,   holdings: 1300,  focus: 'Broad Europe',  tag: 'MÁS POPULAR',
          provider: 'Vanguard',     domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2005 },
  IEUR: { region: 'eu', name: 'iShares Core MSCI Europe',          ter: 0.09, aum: 5,    holdings: 1000,  focus: 'Broad Europe',  tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2014 },
  IMEU: { region: 'eu', name: 'iShares Core MSCI Europe UCITS ETF (Acc)', ter: 0.12, aum: 8, holdings: 430, focus: 'UCITS Europe', tag: 'UCITS 🇮🇪',
          provider: 'BlackRock',    domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2009 },
  EZU:  { region: 'eu', name: 'iShares MSCI Eurozone',             ter: 0.51, aum: 7,    holdings: 240,   focus: 'Eurozone',      tag: 'SIN UK',
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2000 },
  EWG:  { region: 'eu', name: 'iShares MSCI Germany',              ter: 0.50, aum: 1.5,  holdings: 60,    focus: 'Alemania',      tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 1996 },
  EWU:  { region: 'eu', name: 'iShares MSCI United Kingdom',       ter: 0.50, aum: 2.5,  holdings: 85,    focus: 'UK',            tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 1996 },

  // ===== CHINA =====
  MCHI: { region: 'cn', name: 'iShares MSCI China',                ter: 0.59, aum: 7,    holdings: 600,   focus: 'Broad China',   tag: 'MÁS POPULAR',
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2011 },
  FXI:  { region: 'cn', name: 'iShares China Large-Cap',           ter: 0.74, aum: 7,    holdings: 50,    focus: 'Large Cap HK',  tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2004 },
  KWEB: { region: 'cn', name: 'KraneShares CSI China Internet',    ter: 0.70, aum: 7.4,  holdings: 35,    focus: 'Tech China',    tag: 'TECH CHINA',
          provider: 'KraneShares',  domicile: 'US',  accumulation: false, isSectorial: true,  inceptionYear: 2013 },
  ASHR: { region: 'cn', name: 'Xtrackers CSI 300 A-Shares',        ter: 0.65, aum: 2,    holdings: 300,   focus: 'A-Shares',      tag: null,
          provider: 'DWS',          domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2013 },

  // ===== JAPÓN =====
  EWJ:  { region: 'jp', name: 'iShares MSCI Japan',                ter: 0.50, aum: 15,   holdings: 230,   focus: 'Broad Japan',    tag: 'MÁS POPULAR',
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 1996 },
  DXJ:  { region: 'jp', name: 'WisdomTree Japan Hedged Equity',    ter: 0.48, aum: 6,    holdings: 330,   focus: 'Yen Hedged',     tag: 'YEN HEDGED',
          provider: 'WisdomTree',   domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2006 },
  BBJP: { region: 'jp', name: 'JPMorgan BetaBuilders Japan',       ter: 0.19, aum: 12,   holdings: 480,   focus: 'Broad Japan',    tag: null,
          provider: 'JPMorgan',     domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2018, isCommercialBank: true },
  SCJ:  { region: 'jp', name: 'iShares MSCI Japan Small-Cap',      ter: 0.47, aum: 0.25, holdings: 750,   focus: 'Small Cap',      tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2007 },

  // ===== EMERGENTES =====
  VWO:  { region: 'em', name: 'Vanguard FTSE Emerging Markets',    ter: 0.06, aum: 85,   holdings: 6200,  focus: 'Broad EM',        tag: 'MÁS POPULAR',
          provider: 'Vanguard',     domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2005 },
  IEMG: { region: 'em', name: 'iShares Core MSCI Emerging Markets',ter: 0.09, aum: 144,  holdings: 2600,  focus: 'Broad EM',        tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2012 },
  EMXC: { region: 'em', name: 'iShares MSCI EM ex-China',          ter: 0.25, aum: 15,   holdings: 640,   focus: 'EM ex-China',     tag: 'SIN CHINA',
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2017 },
  INDA: { region: 'em', name: 'iShares MSCI India',                ter: 0.64, aum: 9,    holdings: 130,   focus: 'India',           tag: '⭐ ESTRELLA 2050',
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2012 },
  EWZ:  { region: 'em', name: 'iShares MSCI Brazil',               ter: 0.59, aum: 5,    holdings: 50,    focus: 'Brasil',          tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2000 },
  EWW:  { region: 'em', name: 'iShares MSCI Mexico',               ter: 0.50, aum: 2,    holdings: 50,    focus: 'México',          tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 1996 },
  EWT:  { region: 'em', name: 'iShares MSCI Taiwan',               ter: 0.56, aum: 4,    holdings: 90,    focus: 'Taiwán',          tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2000 },
  EWY:  { region: 'em', name: 'iShares MSCI South Korea',          ter: 0.59, aum: 4,    holdings: 110,   focus: 'Corea del Sur',   tag: null,
          provider: 'BlackRock',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2000 },
  // ----- UCITS acumulativos para Emergentes (domicilio Irlanda) -----
  EIMI: { region: 'em', name: 'iShares Core MSCI EM IMI UCITS ETF (Acc)', ter: 0.18, aum: 23,   holdings: 3000, focus: 'Broad EM UCITS',  tag: 'UCITS 🇮🇪',
          provider: 'BlackRock',    domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2014 },
  VFEA: { region: 'em', name: 'Vanguard FTSE Emerging Markets UCITS ETF (Acc)', ter: 0.22, aum: 5, holdings: 6200, focus: 'Broad EM UCITS', tag: 'UCITS 🇮🇪',
          provider: 'Vanguard',     domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2018 },

  // ===== GLOBALES =====
  VT:    { region: 'world', name: 'Vanguard Total World Stock',          ter: 0.07, aum: 45, holdings: 9900, focus: 'Todo el mundo', tag: 'TODO EL MUNDO',
           provider: 'Vanguard',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2008 },
  ACWI:  { region: 'world', name: 'iShares MSCI ACWI',                   ter: 0.32, aum: 22, holdings: 2400, focus: 'Todo el mundo', tag: null,
           provider: 'BlackRock',   domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2008 },
  VWCE:  { region: 'world', name: 'Vanguard FTSE All-World UCITS',       ter: 0.22, aum: 18, holdings: 3700, focus: 'UCITS Global',  tag: 'UCITS 🇪🇺',
           provider: 'Vanguard',    domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2019 },
  VXUS:  { region: 'world', name: 'Vanguard Total International Stock',  ter: 0.05, aum: 95, holdings: 8600, focus: 'Mundo ex-USA',  tag: 'EX-USA',
           provider: 'Vanguard',    domicile: 'US',  accumulation: false, isSectorial: false, inceptionYear: 2011 },
  // ----- Alternativas Globales UCITS no-Vanguard/BlackRock -----
  XDWD:  { region: 'world', name: 'Xtrackers MSCI World UCITS ETF 1C (Acc)', ter: 0.19, aum: 14, holdings: 1500, focus: 'MSCI World UCITS', tag: 'UCITS 🇮🇪',
           provider: 'DWS',         domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2014 },
  SWRD:  { region: 'world', name: 'SPDR MSCI World UCITS ETF (Acc)',         ter: 0.12, aum: 7,  holdings: 1500, focus: 'MSCI World UCITS', tag: 'UCITS 🇮🇪',
           provider: 'State Street', domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2019 },
  MXWO:  { region: 'world', name: 'Invesco MSCI World UCITS ETF (Acc)',      ter: 0.19, aum: 4,  holdings: 1500, focus: 'MSCI World UCITS', tag: 'UCITS 🇮🇪',
           provider: 'Invesco',     domicile: 'IRL', accumulation: true,  isSectorial: false, inceptionYear: 2009 }
};

// Pesos regionales del mercado global actual (capitalización bursátil 2026)
const REGION_WEIGHTS = {
  us: 62, eu: 14, cn: 9, jp: 5.5, em: 5, other: 4.5
};

// Para ETFs globales, asumimos distribución interna según market cap mundial
const GLOBAL_BREAKDOWN = {
  VT:    { us: 62, eu: 14, cn: 3, jp: 5.5, em: 11, other: 4.5 }, // solapa EM con china
  ACWI:  { us: 62, eu: 14, cn: 3, jp: 5.5, em: 11, other: 4.5 },
  VWCE:  { us: 62, eu: 14, cn: 3, jp: 5.5, em: 11, other: 4.5 },
  VXUS:  { us: 0,  eu: 37, cn: 8, jp: 14,  em: 30, other: 11 }, // ex-USA redistribuido
  // MSCI World = developed markets (sin emergentes ni China)
  XDWD:  { us: 70, eu: 16, cn: 0, jp: 6,   em: 0,  other: 8 },
  SWRD:  { us: 70, eu: 16, cn: 0, jp: 6,   em: 0,  other: 8 },
  MXWO:  { us: 70, eu: 16, cn: 0, jp: 6,   em: 0,  other: 8 }
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
