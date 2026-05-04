// ============================================================
// BASE DE DATOS DE ETFs COMPARTIDA ENTRE LAS 3 PÁGINAS
// ticker | region | name | ter | aum (billions USD) | holdings (n empresas) | desc
// ============================================================
const ETF_DB = {
  // ===== EEUU =====
  VOO:  { region: 'us', name: 'Vanguard S&P 500 ETF',             ter: 0.03, aum: 1500, holdings: 500,   focus: 'Large Cap',  tag: 'MÁS POPULAR' },
  SPY:  { region: 'us', name: 'SPDR S&P 500 ETF Trust',            ter: 0.09, aum: 600,  holdings: 500,   focus: 'Large Cap',  tag: null },
  VTI:  { region: 'us', name: 'Vanguard Total Stock Market',       ter: 0.03, aum: 450,  holdings: 3700,  focus: 'Total Market', tag: 'TOTAL MARKET' },
  QQQ:  { region: 'us', name: 'Invesco Nasdaq 100',                ter: 0.20, aum: 380,  holdings: 100,   focus: 'Tech',       tag: 'TECH' },
  IVV:  { region: 'us', name: 'iShares Core S&P 500',              ter: 0.03, aum: 600,  holdings: 500,   focus: 'Large Cap',  tag: null },
  SCHD: { region: 'us', name: 'Schwab US Dividend Equity',         ter: 0.06, aum: 70,   holdings: 100,   focus: 'Dividend',   tag: null },

  // ===== EUROPA =====
  VGK:  { region: 'eu', name: 'Vanguard FTSE Europe ETF',          ter: 0.09, aum: 25,   holdings: 1300,  focus: 'Broad Europe',  tag: 'MÁS POPULAR' },
  IEUR: { region: 'eu', name: 'iShares Core MSCI Europe',          ter: 0.09, aum: 5,    holdings: 1000,  focus: 'Broad Europe',  tag: null },
  CSPX: { region: 'eu', name: 'iShares Core MSCI Europe UCITS',    ter: 0.12, aum: 10,   holdings: 430,   focus: 'UCITS Europe',  tag: 'UCITS 🇪🇺' },
  EZU:  { region: 'eu', name: 'iShares MSCI Eurozone',             ter: 0.51, aum: 7,    holdings: 240,   focus: 'Eurozone',      tag: 'SIN UK' },
  EWG:  { region: 'eu', name: 'iShares MSCI Germany',              ter: 0.50, aum: 1.5,  holdings: 60,    focus: 'Alemania',      tag: null },
  EWU:  { region: 'eu', name: 'iShares MSCI United Kingdom',       ter: 0.50, aum: 2.5,  holdings: 85,    focus: 'UK',            tag: null },

  // ===== CHINA =====
  MCHI: { region: 'cn', name: 'iShares MSCI China',                ter: 0.59, aum: 7,    holdings: 600,   focus: 'Broad China',   tag: 'MÁS POPULAR' },
  FXI:  { region: 'cn', name: 'iShares China Large-Cap',           ter: 0.74, aum: 7,    holdings: 50,    focus: 'Large Cap HK',  tag: null },
  KWEB: { region: 'cn', name: 'KraneShares CSI China Internet',    ter: 0.70, aum: 7.4,  holdings: 35,    focus: 'Tech China',    tag: 'TECH CHINA' },
  ASHR: { region: 'cn', name: 'Xtrackers CSI 300 A-Shares',        ter: 0.65, aum: 2,    holdings: 300,   focus: 'A-Shares',      tag: null },

  // ===== JAPÓN =====
  EWJ:  { region: 'jp', name: 'iShares MSCI Japan',                ter: 0.50, aum: 15,   holdings: 230,   focus: 'Broad Japan',    tag: 'MÁS POPULAR' },
  DXJ:  { region: 'jp', name: 'WisdomTree Japan Hedged Equity',    ter: 0.48, aum: 6,    holdings: 330,   focus: 'Yen Hedged',     tag: 'YEN HEDGED' },
  BBJP: { region: 'jp', name: 'JPMorgan BetaBuilders Japan',       ter: 0.19, aum: 12,   holdings: 480,   focus: 'Broad Japan',    tag: null },
  SCJ:  { region: 'jp', name: 'iShares MSCI Japan Small-Cap',      ter: 0.47, aum: 0.25, holdings: 750,   focus: 'Small Cap',      tag: null },

  // ===== EMERGENTES =====
  VWO:  { region: 'em', name: 'Vanguard FTSE Emerging Markets',    ter: 0.06, aum: 85,   holdings: 6200,  focus: 'Broad EM',        tag: 'MÁS POPULAR' },
  IEMG: { region: 'em', name: 'iShares Core MSCI Emerging Markets',ter: 0.09, aum: 144,  holdings: 2600,  focus: 'Broad EM',        tag: null },
  EMXC: { region: 'em', name: 'iShares MSCI EM ex-China',          ter: 0.25, aum: 15,   holdings: 640,   focus: 'EM ex-China',     tag: 'SIN CHINA' },
  INDA: { region: 'em', name: 'iShares MSCI India',                ter: 0.64, aum: 9,    holdings: 130,   focus: 'India',           tag: '⭐ ESTRELLA 2050' },
  EWZ:  { region: 'em', name: 'iShares MSCI Brazil',               ter: 0.59, aum: 5,    holdings: 50,    focus: 'Brasil',          tag: null },
  EWW:  { region: 'em', name: 'iShares MSCI Mexico',               ter: 0.50, aum: 2,    holdings: 50,    focus: 'México',          tag: null },
  EWT:  { region: 'em', name: 'iShares MSCI Taiwan',               ter: 0.56, aum: 4,    holdings: 90,    focus: 'Taiwán',          tag: null },
  EWY:  { region: 'em', name: 'iShares MSCI South Korea',          ter: 0.59, aum: 4,    holdings: 110,   focus: 'Corea del Sur',   tag: null },

  // ===== GLOBALES =====
  VT:    { region: 'world', name: 'Vanguard Total World Stock',          ter: 0.07, aum: 45, holdings: 9900, focus: 'Todo el mundo', tag: 'TODO EL MUNDO' },
  ACWI:  { region: 'world', name: 'iShares MSCI ACWI',                   ter: 0.32, aum: 22, holdings: 2400, focus: 'Todo el mundo', tag: null },
  VWCE:  { region: 'world', name: 'Vanguard FTSE All-World UCITS',       ter: 0.22, aum: 18, holdings: 3700, focus: 'UCITS Global',  tag: 'UCITS 🇪🇺' },
  VXUS:  { region: 'world', name: 'Vanguard Total International Stock',  ter: 0.05, aum: 95, holdings: 8600, focus: 'Mundo ex-USA',  tag: 'EX-USA' }
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
  VXUS:  { us: 0,  eu: 37, cn: 8, jp: 14,  em: 30, other: 11 } // ex-USA redistribuido
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
