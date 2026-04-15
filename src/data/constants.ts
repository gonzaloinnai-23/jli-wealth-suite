/**
 * Top-level constants extracted verbatim from reference/original.js.
 * These are the non-function, non-`D` top-level data declarations from the
 * original imperative dashboard script. Kept as close to the source as
 * possible so the ported logic can reference them directly.
 */

export const EXTRA_ASSETS={
  RE:{label:'Real Estate (Prime)',value:27900000,color:'#f472b6',annRet:6.5,annVol:8.0},
  PE:{label:'Private Equity (FoF)',value:12900000,color:'#c084fc',annRet:11.0,annVol:20.0}
};

// ═══ ALTERNATIVOS DATA (Dic-2025) ═══

export const ALT_TYPE_COLORS={VC:'#a78bfa',Buyout:'#3b82f6',Credit:'#f472b6',Infra:'#34d399',RE:'#fb923c'};

export const ALT_TYPE_LABELS={VC:'Venture Capital',Buyout:'Buyout / PE',Credit:'Crédito Privado',Infra:'Infraestructura',RE:'Real Estate'};

export const ALT_DATA={
  bca:[
    {name:'KKR Global PE IV',type:'Buyout',vintage:2019,committed:5000000},
    {name:'Blackstone RE Partners IX',type:'RE',vintage:2020,committed:3500000},
    {name:'Ardian Growth Fund V',type:'Buyout',vintage:2021,committed:2800000},
    {name:'Brookfield Infra Fund IV',type:'Infra',vintage:2022,committed:2500000},
    {name:'EQT Ventures III',type:'VC',vintage:2021,committed:1000000},
    {name:'Ares European Direct Lending',type:'Credit',vintage:2022,committed:1500000},
    {name:'Carlyle Europe Partners VI',type:'Buyout',vintage:2023,committed:2000000},
    {name:'Brookfield Renewable Partners',type:'Infra',vintage:2024,committed:1800000},
    {name:'Apollo Credit Fund XII',type:'Credit',vintage:2023,committed:1200000},
    {name:'CVC Capital Partners IX',type:'Buyout',vintage:2024,committed:2500000}
  ],
  bcp:[
    {name:'KKR Global PE IV',type:'Buyout',vintage:2019,committed:5000000},
    {name:'Blackstone RE Partners IX',type:'RE',vintage:2020,committed:3500000},
    {name:'Ardian Growth Fund V',type:'Buyout',vintage:2021,committed:2800000},
    {name:'Brookfield Infra Fund IV',type:'Infra',vintage:2022,committed:2500000},
    {name:'EQT Ventures III',type:'VC',vintage:2021,committed:1000000},
    {name:'Ares European Direct Lending',type:'Credit',vintage:2022,committed:1500000},
    {name:'Carlyle Europe Partners VI',type:'Buyout',vintage:2023,committed:2000000},
    {name:'Brookfield Renewable Partners',type:'Infra',vintage:2024,committed:1800000},
    {name:'Apollo Credit Fund XII',type:'Credit',vintage:2023,committed:1200000},
    {name:'CVC Capital Partners IX',type:'Buyout',vintage:2024,committed:2500000}
  ]
};

export const ALT_TARGETS={VC:5,Buyout:40,Credit:15,Infra:25,RE:15};
// phase: captacion|inversion|cosecha|desinversion|liquidado|evergreen|directo
// startYr: año inicio del fondo, lifeYrs: duración típica del fondo
// vintagePerf: [{fund,vintage,netIrr,tvpi,note}] — añadas anteriores del mismo gestor

export const ALT_INFO={
  'KKR Global PE IV':{desc:'KKR flagship global private equity fund. Large-cap buyouts across North America, Europe and Asia-Pacific.',category:'Large Buyout',fund:'Global PE IV',size:'$19.000M',irr:'~15-20% neto obj.',phase:'cosecha',startYr:2019,lifeYrs:10,companies:28,companyNote:'28 empresas en cartera incluyendo sector salud, tecnologia, servicios industriales y consumo.',
    notes:'KKR gestiona +$500Bn en AUM. Uno de los mayores gestores alternativos del mundo.',
    vintagePerf:[
      {fund:'Global PE I',vintage:2010,netIrr:'~18%',tvpi:'2.1x',note:'Excelente vintage post-crisis.'},
      {fund:'Global PE II',vintage:2014,netIrr:'~16%',tvpi:'1.9x',note:'Strong mid-cycle returns.'},
      {fund:'Global PE III',vintage:2017,netIrr:'~14%',tvpi:'1.6x',note:'Pre-COVID vintage.'}
    ]},
  'Blackstone RE Partners IX':{desc:'Blackstone Real Estate Partners. Fondo opportunistic de real estate global.',category:'Real Estate Opportunistic',fund:'BREP IX',size:'$30.400M',irr:'~12-15% neto obj.',phase:'cosecha',startYr:2020,lifeYrs:10,companies:45,companyNote:'45+ inversiones en logistica, residencial, data centers y hospitality a nivel global.',
    notes:'Blackstone es el mayor gestor de real estate privado del mundo con +$325Bn en AUM inmobiliario.',
    vintagePerf:[
      {fund:'BREP VII',vintage:2015,netIrr:'~16%',tvpi:'1.8x',note:'Excelente vintage.'},
      {fund:'BREP VIII',vintage:2018,netIrr:'~13%',tvpi:'1.5x',note:'Solid returns pese a COVID.'}
    ]},
  'Ardian Growth Fund V':{desc:'Ardian Growth. Fondo de growth equity enfocado en Europa, tech y healthcare.',category:'Growth Equity',fund:'Growth Fund V',size:'EUR2.500M',irr:'~18-22% bruto obj.',phase:'inversion',startYr:2021,lifeYrs:10,companies:12,companyNote:'12 empresas en cartera en software, fintech, healthtech y servicios digitales europeos.',
    notes:'Ardian gestiona +EUR170Bn en AUM. Programa Growth con foco en lideres europeos de alto crecimiento.',
    vintagePerf:[
      {fund:'Growth III',vintage:2016,netIrr:'~25%',tvpi:'2.8x',note:'Top quartile. Exits exitosos.'},
      {fund:'Growth IV',vintage:2019,netIrr:'~20%',tvpi:'1.9x',note:'Buen progreso.'}
    ]},
  'Brookfield Infra Fund IV':{desc:'Brookfield Infrastructure Fund. Infraestructura core-plus global.',category:'Infraestructura Core-Plus',fund:'BIF IV',size:'$17.000M',irr:'~10-12% neto obj.',phase:'inversion',startYr:2022,lifeYrs:12,companies:8,companyNote:'8 activos en utilities, transporte, telecomunicaciones y midstream a nivel global.',
    notes:'Brookfield es uno de los mayores operadores de infraestructura del mundo con +$100Bn en infra AUM.',
    vintagePerf:[
      {fund:'BIF II',vintage:2013,netIrr:'~12%',tvpi:'1.7x',note:'Fuerte performance. Liquidado.'},
      {fund:'BIF III',vintage:2016,netIrr:'~11%',tvpi:'1.5x',note:'Consistente con el track record.'}
    ]},
  'EQT Ventures III':{desc:'EQT Ventures. Fondo VC europeo enfocado en tech de alto crecimiento.',category:'Venture Capital',fund:'Ventures III',size:'EUR1.100M',irr:'~20-25% bruto obj.',phase:'inversion',startYr:2021,lifeYrs:10,companies:22,companyNote:'22 empresas en cartera en AI, fintech, climate tech y software B2B.',
    notes:'EQT Ventures combina capital con herramientas propietarias de AI (Motherbrain) para deal sourcing.',
    vintagePerf:[
      {fund:'Ventures I',vintage:2016,netIrr:'~30%',tvpi:'3.2x',note:'Excelente. Inversiones en Spotify, Klarna ecosystem.'},
      {fund:'Ventures II',vintage:2019,netIrr:'~15%',tvpi:'1.6x',note:'Afectado por correcciones tech 2022.'}
    ]},
  'Ares European Direct Lending':{desc:'Ares Management. Direct lending senior secured en Europa.',category:'Direct Lending',fund:'Euro DL Fund IV',size:'EUR5.000M',irr:'~7-9% neto obj.',phase:'evergreen',startYr:2022,lifeYrs:99,companies:35,companyNote:'35 prestamos senior secured en cartera. Floating rate, sectores no ciclicos.',
    notes:'Ares gestiona +$400Bn. Plataforma de credito lider con +20 anos de track record.'},
  'Carlyle Europe Partners VI':{desc:'Carlyle European buyout fund. Mid-to-large cap buyout en Europa.',category:'European Buyout',fund:'CEP VI',size:'EUR7.000M',irr:'~15-18% bruto obj.',phase:'inversion',startYr:2023,lifeYrs:10,companies:5,companyNote:'5 inversiones realizadas en healthcare, tech y servicios empresariales europeos. Target: 15-18 empresas.',
    notes:'Carlyle gestiona +$380Bn. Programa europeo con 25+ anos de historia.',
    vintagePerf:[
      {fund:'CEP III',vintage:2006,netIrr:'~8%',tvpi:'1.4x',note:'Crisis financiera impacto.'},
      {fund:'CEP IV',vintage:2014,netIrr:'~18%',tvpi:'2.0x',note:'Excelente vintage. Top quartile.'},
      {fund:'CEP V',vintage:2019,netIrr:'~16%',tvpi:'1.6x',note:'Buen progreso pese a COVID.'}
    ]},
  'Brookfield Renewable Partners':{desc:'Brookfield Renewable Partners. Infraestructura de energia renovable global.',category:'Infraestructura Renovable',fund:'BRP',size:'$7.000M',irr:'~10-12% neto obj.',phase:'inversion',startYr:2024,lifeYrs:15,companies:3,companyNote:'3 plataformas en solar, eolica y almacenamiento de energia en EEUU y Europa.',
    notes:'Brookfield opera una de las mayores plataformas de renovables del mundo (+28GW).'},
  'Apollo Credit Fund XII':{desc:'Apollo Global Management. Credit fund enfocado en stressed/distressed.',category:'Credito Oportunista',fund:'Credit Fund XII',size:'$5.500M',irr:'~10-14% neto obj.',phase:'inversion',startYr:2023,lifeYrs:8,companies:18,companyNote:'18 posiciones en credito corporativo, structured credit y situaciones especiales.',
    notes:'Apollo gestiona +$600Bn, siendo el mayor gestor de credito alternativo del mundo.',
    vintagePerf:[
      {fund:'Credit Fund IX',vintage:2016,netIrr:'~12%',tvpi:'1.5x',note:'Fuerte track record.'},
      {fund:'Credit Fund XI',vintage:2020,netIrr:'~14%',tvpi:'1.4x',note:'Aprovecho dislocaciones COVID.'}
    ]},
  'CVC Capital Partners IX':{desc:'CVC Capital Partners. Large-cap buyout europeo.',category:'Large Buyout',fund:'Fund IX',size:'EUR26.000M',irr:'~15-20% bruto obj.',phase:'captacion',startYr:2024,lifeYrs:10,companies:0,companyNote:'En captacion, aun sin inversiones. Predecesor Fund VIII: 24 inversiones en consumer, healthcare, tech.',
    notes:'CVC gestiona +EUR170Bn. IPO en 2024 (Amsterdam). Uno de los mayores PE europeos.',
    vintagePerf:[
      {fund:'Fund V',vintage:2008,netIrr:'~14%',tvpi:'1.8x',note:'Post-crisis vintage.'},
      {fund:'Fund VI',vintage:2013,netIrr:'~20%',tvpi:'2.3x',note:'Top quartile. Excelente.'},
      {fund:'Fund VII',vintage:2017,netIrr:'~18%',tvpi:'1.9x',note:'Fuerte performance.'},
      {fund:'Fund VIII',vintage:2020,netIrr:'~12%',tvpi:'1.3x',note:'En construccion. 24 inversiones.'}
    ]}
};

export const ALT_PHASE_LABELS={captacion:'Captación',inversion:'Inversión',cosecha:'Cosecha',desinversion:'Desinversión',liquidado:'Liquidado',evergreen:'Evergreen',directo:'Inv. Directa'};

export const ALT_PHASE_COLORS={captacion:'#a78bfa',inversion:'#3b82f6',cosecha:'#34d399',desinversion:'#fb923c',liquidado:'#64748b',evergreen:'#60a5fa',directo:'#94a3b8'};

export const TIPO_COLORS = {
  'Renta Fija Directa':'#60a5fa','Fondo Monetario':'#a78bfa',
  'Fondo Renta Fija':'#818cf8','Fondo Renta Variable':'#f472b6',
  'Fondo Multiactivo':'#fb923c','Cartera Gestionada RF':'#34d399',
  'Cartera Gestionada RV':'#2dd4bf','ETF Renta Variable':'#facc15',
  'ETF Materias Primas':'#fbbf24','Vehículo Alternativo':'#f87171',
  'Cuenta Corriente':'#64748b'
};

export const CHART_PALETTE = [
  '#3b82f6','#f472b6','#34d399','#fb923c','#a78bfa',
  '#facc15','#60a5fa','#f87171','#2dd4bf','#818cf8',
  '#fbbf24','#4ade80','#e879f9','#38bdf8','#fb7185'
];

export const PORT_SLUG={bca:'ale',bcp:'pablo'};

export const SLUG_PORT={ale:'bca',pablo:'bcp'};

export const MULTI_SPLIT={RV:0.50,RF:0.50};

export const AA_COLORS={RV:'#3b82f6',RF:'#34d399',ALT:'#f59e0b',CASH:'#94a3b8',MULTI:'#a78bfa'};

export const AA_LABELS={RV:'Renta Variable',RF:'Renta Fija',ALT:'Alternativo',CASH:'Cash',MULTI:'Multi'};

// Benchmark monthly returns (%) — source: IWDA.AS (MSCI World EUR), EAGG.PA (Euro Agg Bond EUR)

export const BENCH_MSCI = {"Ene-16":9.54,"Feb-16":-4.56,"Mar-16":5.75,"Abr-16":-2.05,"May-16":4.79,"Jun-16":3.18,"Jul-16":-1.87,"Ago-16":0.49,"Sep-16":-4.52,"Oct-16":1.36,"Nov-16":4.48,"Dic-16":-5.19,"Ene-17":-5.65,"Feb-17":-3.97,"Mar-17":12.94,"Abr-17":-1.72,"May-17":-2.52,"Jun-17":1.17,"Jul-17":1.88,"Ago-17":6.19,"Sep-17":-4.81,"Oct-17":5.74,"Nov-17":-4.9,"Dic-17":4.66,"Ene-18":-0.46,"Feb-18":2.29,"Mar-18":2.88,"Abr-18":1.35,"May-18":3.52,"Jun-18":-6.94,"Jul-18":1.93,"Ago-18":-3.17,"Sep-18":0.69,"Oct-18":4.67,"Nov-18":-0.67,"Dic-18":-9.26,"Ene-19":9.8,"Feb-19":-2.23,"Mar-19":-2.3,"Abr-19":2.08,"May-19":5.18,"Jun-19":0.46,"Jul-19":-0.03,"Ago-19":9.26,"Sep-19":-0.51,"Oct-19":4.15,"Nov-19":0.76,"Dic-19":0.76,"Ene-20":-9.18,"Feb-20":-6.51,"Mar-20":-11.62,"Abr-20":13.21,"May-20":5.31,"Jun-20":3.15,"Jul-20":5.51,"Ago-20":8.1,"Sep-20":1.13,"Oct-20":4.73,"Nov-20":-0.69,"Dic-20":-3.99,"Ene-21":-1.07,"Feb-21":-0.76,"Mar-21":6.99,"Abr-21":-2.58,"May-21":13.16,"Jun-21":10.83,"Jul-21":8.29,"Ago-21":-3.2,"Sep-21":-5.07,"Oct-21":0.75,"Nov-21":4.05,"Dic-21":-2.08,"Ene-22":-5.08,"Feb-22":-2.37,"Mar-22":2.59,"Abr-22":-2.81,"May-22":6.18,"Jun-22":-8.09,"Jul-22":-4.51,"Ago-22":-1.75,"Sep-22":-9.1,"Oct-22":8.48,"Nov-22":7.48,"Dic-22":-2.97,"Ene-23":1.18,"Feb-23":-1.35,"Mar-23":6.37,"Abr-23":0.28,"May-23":-1.37,"Jun-23":4.89,"Jul-23":4.14,"Ago-23":-0.87,"Sep-23":2.4,"Oct-23":-4.22,"Nov-23":5.28,"Dic-23":1.87,"Ene-24":4.3,"Feb-24":-7.94,"Mar-24":4.76,"Abr-24":-2.98,"May-24":7.35,"Jun-24":2.06,"Jul-24":0.75,"Ago-24":-5.86,"Sep-24":7.54,"Oct-24":-0.36,"Nov-24":7.71,"Dic-24":8.18,"Ene-25":-3.87,"Feb-25":1.28,"Mar-25":-0.06,"Abr-25":12.08,"May-25":-10.44,"Jun-25":1.77,"Jul-25":-1.99,"Ago-25":3.43,"Sep-25":-3.19,"Oct-25":3.36,"Nov-25":3.85,"Dic-25":-0.67};

export const BENCH_BOND = {"Ene-16":-1.18,"Feb-16":-0.65,"Mar-16":1.78,"Abr-16":0.67,"May-16":-0.44,"Jun-16":-0.35,"Jul-16":0.02,"Ago-16":0.8,"Sep-16":1.27,"Oct-16":0.33,"Nov-16":-0.17,"Dic-16":1.22,"Ene-17":0.03,"Feb-17":-0.45,"Mar-17":0.2,"Abr-17":-1.04,"May-17":2.29,"Jun-17":1.12,"Jul-17":0.56,"Ago-17":-0.87,"Sep-17":-0.52,"Oct-17":0.41,"Nov-17":-0.41,"Dic-17":-0.58,"Ene-18":-1.18,"Feb-18":1.54,"Mar-18":1.44,"Abr-18":-0.39,"May-18":1.04,"Jun-18":-0.42,"Jul-18":-0.2,"Ago-18":0.22,"Sep-18":-0.21,"Oct-18":0.47,"Nov-18":-0.67,"Dic-18":-1.2,"Ene-19":0.69,"Feb-19":1,"Mar-19":0.33,"Abr-19":0.59,"May-19":0.59,"Jun-19":1.24,"Jul-19":0.42,"Ago-19":1.61,"Sep-19":-0.91,"Oct-19":0.73,"Nov-19":-0.55,"Dic-19":0.11,"Ene-20":1.41,"Feb-20":-2.32,"Mar-20":0.57,"Abr-20":1.16,"May-20":0.23,"Jun-20":0.04,"Jul-20":0.37,"Ago-20":0.68,"Sep-20":0.08,"Oct-20":-0.92,"Nov-20":1.07,"Dic-20":1.62,"Ene-21":-1.24,"Feb-21":0.65,"Mar-21":0.77,"Abr-21":-0.1,"May-21":-1.03,"Jun-21":-0.78,"Jul-21":0.48,"Ago-21":-0.31,"Sep-21":-0.32,"Oct-21":-1.08,"Nov-21":-0.11,"Dic-21":0.26,"Ene-22":-2,"Feb-22":-1.5,"Mar-22":-2.99,"Abr-22":-2.58,"May-22":-1.61,"Jun-22":-3.49,"Jul-22":-0.88,"Ago-22":-0.45,"Sep-22":-3.99,"Oct-22":0.98,"Nov-22":0.56,"Dic-22":-0.63,"Ene-23":-0.58,"Feb-23":-0.14,"Mar-23":1.14,"Abr-23":-0.62,"May-23":1.81,"Jun-23":-0.16,"Jul-23":1.79,"Ago-23":-0.31,"Sep-23":-0.87,"Oct-23":-0.3,"Nov-23":3.09,"Dic-23":2.23,"Ene-24":-1.77,"Feb-24":0.39,"Mar-24":-0.08,"Abr-24":-0.58,"May-24":0.08,"Jun-24":0.94,"Jul-24":1.3,"Ago-24":0.39,"Sep-24":0.48,"Oct-24":-0.21,"Nov-24":1.04,"Dic-24":0.61,"Ene-25":1.84,"Feb-25":-1.14,"Mar-25":1.09,"Abr-25":-0.96,"May-25":-1.16,"Jun-25":1.41,"Jul-25":0.61,"Ago-25":0.08,"Sep-25":-0.56,"Oct-25":1.25,"Nov-25":-0.3,"Dic-25":-0.6};

export const BENCH_6040 = {"Ene-16":5.25,"Feb-16":-3,"Mar-16":4.16,"Abr-16":-0.96,"May-16":2.7,"Jun-16":1.77,"Jul-16":-1.11,"Ago-16":0.61,"Sep-16":-2.2,"Oct-16":0.95,"Nov-16":2.62,"Dic-16":-2.63,"Ene-17":-3.38,"Feb-17":-2.56,"Mar-17":7.84,"Abr-17":-1.45,"May-17":-0.6,"Jun-17":1.15,"Jul-17":1.35,"Ago-17":3.37,"Sep-17":-3.09,"Oct-17":3.61,"Nov-17":-3.1,"Dic-17":2.56,"Ene-18":-0.75,"Feb-18":1.99,"Mar-18":2.3,"Abr-18":0.65,"May-18":2.53,"Jun-18":-4.33,"Jul-18":1.08,"Ago-18":-1.81,"Sep-18":0.33,"Oct-18":2.99,"Nov-18":-0.67,"Dic-18":-6.04,"Ene-19":6.16,"Feb-19":-0.94,"Mar-19":-1.25,"Abr-19":1.48,"May-19":3.34,"Jun-19":0.77,"Jul-19":0.15,"Ago-19":6.2,"Sep-19":-0.67,"Oct-19":2.78,"Nov-19":0.24,"Dic-19":0.5,"Ene-20":-4.94,"Feb-20":-4.83,"Mar-20":-6.74,"Abr-20":8.39,"May-20":3.28,"Jun-20":1.91,"Jul-20":3.45,"Ago-20":5.13,"Sep-20":0.71,"Oct-20":2.47,"Nov-20":0.01,"Dic-20":-1.75,"Ene-21":-1.14,"Feb-21":-0.2,"Mar-21":4.5,"Abr-21":-1.59,"May-21":7.48,"Jun-21":6.19,"Jul-21":5.17,"Ago-21":-2.04,"Sep-21":-3.17,"Oct-21":0.02,"Nov-21":2.39,"Dic-21":-1.14,"Ene-22":-3.85,"Feb-22":-2.02,"Mar-22":0.36,"Abr-22":-2.72,"May-22":3.06,"Jun-22":-6.25,"Jul-22":-3.06,"Ago-22":-1.23,"Sep-22":-7.06,"Oct-22":5.48,"Nov-22":4.71,"Dic-22":-2.03,"Ene-23":0.48,"Feb-23":-0.87,"Mar-23":4.28,"Abr-23":-0.08,"May-23":-0.1,"Jun-23":2.87,"Jul-23":3.2,"Ago-23":-0.65,"Sep-23":1.09,"Oct-23":-2.65,"Nov-23":4.4,"Dic-23":2.01,"Ene-24":1.87,"Feb-24":-4.61,"Mar-24":2.82,"Abr-24":-2.02,"May-24":4.44,"Jun-24":1.61,"Jul-24":0.97,"Ago-24":-3.36,"Sep-24":4.72,"Oct-24":-0.3,"Nov-24":5.04,"Dic-24":5.15,"Ene-25":-1.59,"Feb-25":0.31,"Mar-25":0.4,"Abr-25":6.86,"May-25":-6.73,"Jun-25":1.63,"Jul-25":-0.95,"Ago-25":2.09,"Sep-25":-2.14,"Oct-25":2.52,"Nov-25":2.19,"Dic-25":-0.64};
// Bloomberg US Agg Bond (EUR, sin cobertura) = Euro Agg + impacto mensual EUR/USD
// Para inversor EUR: rentabilidad en USD + apreciación/depreciación del USD vs EUR

export const BENCH_BOND_USD = {"Ene-16":0.69,"Feb-16":-1.08,"Mar-16":-0.1,"Abr-16":-2,"May-16":1.08,"Jun-16":0.03,"Jul-16":-0.92,"Ago-16":0.38,"Sep-16":0.63,"Oct-16":-0.31,"Nov-16":3.28,"Dic-16":-0.6,"Ene-17":0.87,"Feb-17":1.03,"Mar-17":0.68,"Abr-17":-0.12,"May-17":1.15,"Jun-17":0.7,"Jul-17":0.44,"Ago-17":-0.32,"Sep-17":-2.45,"Oct-17":-0.33,"Nov-17":0.33,"Dic-17":0.35,"Ene-18":-0.95,"Feb-18":-0.36,"Mar-18":1.46,"Abr-18":1.44,"May-18":-1.2,"Jun-18":2.43,"Jul-18":0.93,"Ago-18":-0.28,"Sep-18":-1.2,"Oct-18":0.3,"Nov-18":-0.3,"Dic-18":-1.38,"Ene-19":-0.49,"Feb-19":1.68,"Mar-19":-1.08,"Abr-19":1.15,"May-19":2.93,"Jun-19":1.38,"Jul-19":0.6,"Ago-19":2.84,"Sep-19":-1.63,"Oct-19":-0.71,"Nov-19":0.78,"Dic-19":0.84,"Ene-20":-0.52,"Feb-20":1.24,"Mar-20":0.88,"Abr-20":1.4,"May-20":-1.03,"Jun-20":1.54,"Jul-20":-0.37,"Ago-20":1.87,"Sep-20":1.23,"Oct-20":3.7,"Nov-20":1.48,"Dic-20":-2.18,"Ene-21":1.35,"Feb-21":0.97,"Mar-21":-1.44,"Abr-21":-1.99,"May-21":-2.52,"Jun-21":2.15,"Jul-21":-0.21,"Ago-21":0.19,"Sep-21":0.52,"Oct-21":-0.49,"Nov-21":-2.27,"Dic-21":2.38,"Ene-22":-1.89,"Feb-22":-1.39,"Mar-22":-2.89,"Abr-22":-0.22,"May-22":-0.65,"Jun-22":-3.38,"Jul-22":0.42,"Ago-22":-0.66,"Sep-22":-3.88,"Oct-22":1.1,"Nov-22":-0.4,"Dic-22":0.14,"Ene-23":0.86,"Feb-23":1.1,"Mar-23":-0.98,"Abr-23":0.98,"May-23":0.9,"Jun-23":-1.44,"Jul-23":0.18,"Ago-23":2.26,"Sep-23":-1.09,"Oct-23":2.1,"Nov-23":-0.93,"Dic-23":0.55,"Ene-24":0.17,"Feb-24":-2.49,"Mar-24":-0.41,"Abr-24":2.21,"May-24":1.18,"Jun-24":-0.95,"Jul-24":-0.4,"Ago-24":-0.76,"Sep-24":0.51,"Oct-24":1.77,"Nov-24":-0.44,"Dic-24":1.19,"Ene-25":-0.71,"Feb-25":1.13,"Mar-25":0.34,"Abr-25":0.16,"May-25":-0.23,"Jun-25":-0.16,"Jul-25":-1.22,"Ago-25":3.5,"Sep-25":0.36,"Oct-25":0.76,"Nov-25":-2.2,"Dic-25":0.36};
// Oro físico (XAU/EUR) — Xtrackers Physical Gold ETC benchmark (fuente: XAU/USD × EUR/USD mensual)

export const BENCH_GOLD = {"Ene-16":0.06,"Feb-16":-0.81,"Mar-16":0.41,"Abr-16":-2.42,"May-16":-2.96,"Jun-16":10.68,"Jul-16":-1.09,"Ago-16":3.49,"Sep-16":-0.74,"Oct-16":2.31,"Nov-16":1.43,"Dic-16":1.72,"Ene-17":1.63,"Feb-17":-4.41,"Mar-17":-0.62,"Abr-17":4.24,"May-17":-1.55,"Jun-17":3.45,"Jul-17":1.81,"Ago-17":-0.15,"Sep-17":-0.43,"Oct-17":0.2,"Nov-17":-1.79,"Dic-17":-3.04,"Ene-18":1.53,"Feb-18":2.16,"Mar-18":-0.28,"Abr-18":-3.6,"May-18":5.12,"Jun-18":0.7,"Jul-18":-1.95,"Ago-18":2.87,"Sep-18":2.71,"Oct-18":2.16,"Nov-18":-3.8,"Dic-18":-2.75,"Ene-19":5.23,"Feb-19":12.5,"Mar-19":5.68,"Abr-19":1.58,"May-19":-4.08,"Jun-19":1.82,"Jul-19":1.99,"Ago-19":-0.72,"Sep-19":-2.52,"Oct-19":-3.34,"Nov-19":-0.61,"Dic-19":2.79,"Ene-20":-0.45,"Feb-20":2.37,"Mar-20":3.8,"Abr-20":0.23,"May-20":-4.05,"Jun-20":4.76,"Jul-20":2.31,"Ago-20":3.75,"Sep-20":5.06,"Oct-20":-0.08,"Nov-20":-3.41,"Dic-20":-0.62,"Ene-21":-2.21,"Feb-21":-0.04,"Mar-21":-2.22,"Abr-21":2.64,"May-21":-3.48,"Jun-21":-2.95,"Jul-21":2.06,"Ago-21":2.01,"Sep-21":3.78,"Oct-21":-0.09,"Nov-21":-0.83,"Dic-21":5.2,"Ene-22":-3.87,"Feb-22":3,"Mar-22":3.3,"Abr-22":-0.42,"May-22":-0.32,"Jun-22":-0.35,"Jul-22":-1.33,"Ago-22":-2.05,"Sep-22":1.06,"Oct-22":1.63,"Nov-22":2.13,"Dic-22":3.33,"Ene-23":2.52,"Feb-23":-0.54,"Mar-23":5.23,"Abr-23":2.53,"May-23":4.7,"Jun-23":3.06,"Jul-23":1.01,"Ago-23":-3.05,"Sep-23":-3.92,"Oct-23":0.56,"Nov-23":-2.7,"Dic-23":0.2,"Ene-24":8.89,"Feb-24":-6.64,"Mar-24":4.03,"Abr-24":2.38,"May-24":2.84,"Jun-24":3.17,"Jul-24":4.23,"Ago-24":5.14,"Sep-24":4,"Oct-24":8.66,"Nov-24":-3.87,"Dic-24":-1.29,"Ene-25":-0.6,"Feb-25":5.47,"Mar-25":1.73,"Abr-25":0.09,"May-25":0.12,"Jun-25":-2.54,"Jul-25":3.34,"Ago-25":0.83,"Sep-25":3.62,"Oct-25":1.29,"Nov-25":-2.28,"Dic-25":0.6};
// MSCI Emerging Markets (EUR, sin cobertura) — calibrado a fondos reales EM en cartera.
// 2024: estimado ~+13.9% (Vanguard EM +13.88%). 2025 May-Dic: calibrado a SPDR MSCI EM ETF (IE00B469F816).

export const BENCH_EM = {"Ene-16":-0.21,"Feb-16":3.55,"Mar-16":1.8,"Abr-16":-1.26,"May-16":4.28,"Jun-16":-2.73,"Jul-16":1.82,"Ago-16":11.5,"Sep-16":-1.89,"Oct-16":0.26,"Nov-16":-11.97,"Dic-16":10.57,"Ene-17":12.87,"Feb-17":3,"Mar-17":-2.15,"Abr-17":5.62,"May-17":3.83,"Jun-17":5.19,"Jul-17":-1.05,"Ago-17":6.18,"Sep-17":-9.22,"Oct-17":-0.77,"Nov-17":-0.87,"Dic-17":-2.05,"Ene-18":-2.22,"Feb-18":-4.9,"Mar-18":-6.07,"Abr-18":3.68,"May-18":4.04,"Jun-18":1.16,"Jul-18":3.15,"Ago-18":-1.02,"Sep-18":-2.33,"Oct-18":-2.7,"Nov-18":1.77,"Dic-18":-4.69,"Ene-19":10.09,"Feb-19":7.98,"Mar-19":7.88,"Abr-19":-1.75,"May-19":-12.01,"Jun-19":11.37,"Jul-19":0.03,"Ago-19":1.28,"Sep-19":0.4,"Oct-19":0.1,"Nov-19":-10.16,"Dic-19":6.8,"Ene-20":-3.45,"Feb-20":-3.5,"Mar-20":-13.25,"Abr-20":12.11,"May-20":5.91,"Jun-20":6.4,"Jul-20":10.67,"Ago-20":1.23,"Sep-20":-3.86,"Oct-20":-1.83,"Nov-20":-4.3,"Dic-20":4.99,"Ene-21":-0.66,"Feb-21":5.11,"Mar-21":-0.65,"Abr-21":6.66,"May-21":-8.01,"Jun-21":2.73,"Jul-21":-2.13,"Ago-21":2.63,"Sep-21":0.69,"Oct-21":-2.23,"Nov-21":-2.39,"Dic-21":3.92,"Ene-22":-0.12,"Feb-22":-2.67,"Mar-22":-9.1,"Abr-22":-3.59,"May-22":-1.41,"Jun-22":-5.22,"Jul-22":0.2,"Ago-22":5.88,"Sep-22":-9.8,"Oct-22":7.67,"Nov-22":8.27,"Dic-22":-4.16,"Ene-23":-0.77,"Feb-23":1.04,"Mar-23":-5.58,"Abr-23":2.72,"May-23":4.71,"Jun-23":4.93,"Jul-23":1.22,"Ago-23":-3.54,"Sep-23":5.51,"Oct-23":-7.32,"Nov-23":-0.03,"Dic-23":4.06,"Ene-24":-5.84,"Feb-24":1.24,"Mar-24":-2.58,"Abr-24":7.77,"May-24":1.13,"Jun-24":4.08,"Jul-24":-0.72,"Ago-24":5.37,"Sep-24":1.47,"Oct-24":2.54,"Nov-24":-3.36,"Dic-24":3.51,"Ene-25":-2.97,"Feb-25":3.14,"Mar-25":-9.77,"Abr-25":-1.57,"May-25":5.36,"Jun-25":7.04,"Jul-25":6.09,"Ago-25":5.22,"Sep-25":3.22,"Oct-25":-3.06,"Nov-25":-10.23,"Dic-25":1.49};

// ─── Trade-month detection for mid-month benchmark interpolation ───
// Months with significant trades (>50K€ flows) detected from position evolution data.
// For these months, benchmark uses blended weights (50% start + 50% end of month)
// to approximate mid-month trade timing. Non-trade months use start-of-month weights only.
// This reduces benchmark weight mismatch from ~30 days to ~15 days for trade months.

export const TRADE_MONTHS_BCA=new Set(['Mar-16','Jun-16','Sep-16','Dic-16','Mar-17','Jun-17','Sep-17','Dic-17','Mar-18','Jun-18','Sep-18','Dic-18','Mar-19','Jun-19','Sep-19','Dic-19','Mar-20','Jun-20','Sep-20','Dic-20','Mar-21','Jun-21','Sep-21','Dic-21','Mar-22','Jun-22','Sep-22','Dic-22','Mar-23','Jun-23','Sep-23','Dic-23','Mar-24','Jun-24','Sep-24','Dic-24','Mar-25','Jun-25','Sep-25','Dic-25']);

export const TRADE_MONTHS_BCP=new Set(['Mar-16','Jun-16','Sep-16','Dic-16','Mar-17','Jun-17','Sep-17','Dic-17','Mar-18','Jun-18','Sep-18','Dic-18','Mar-19','Jun-19','Sep-19','Dic-19','Mar-20','Jun-20','Sep-20','Dic-20','Mar-21','Jun-21','Sep-21','Dic-21','Mar-22','Jun-22','Sep-22','Dic-22','Mar-23','Jun-23','Sep-23','Dic-23','Mar-24','Jun-24','Sep-24','Dic-24','Mar-25','Jun-25','Sep-25','Dic-25']);

// Helper: get blended asset_alloc weights for benchmark precision
// prevMi = previous month key (start-of-month = end of prev month)
// mi = current month key (end-of-month weights, post-trade)
// If trade month → blend 50/50; otherwise → use start-of-month weights (prevMi)

export const USD_COEFF={
  // MSCI World trackers → 71.25% (US weight in MSCI World Dec-25)
  'IE00B4L5Y983':0.7125,'IE000OHHIBC6':0.7125,'IE00BFPM9N11':0.7125,'IE00BFPM9M04':0.7125,
  'IE00B03HD209':0.7125,'LU1811364055':0.7125,'LU0836512615':0.7125,
  // S&P 500 → 99%
  'IE0002639775':0.99,
  // Emerging Markets → 0% (China, Taiwan, Korea, India — not USD)
  'IE00B469F816':0.00,'IE00BFPM9H50':0.00,'IE00BFPM9J74':0.00,
  // MSCI Europe → 0%
  'LU0389811539':0.00,'LU0987205969':0.00,
  // Gold ETCs → 100% (gold priced in USD, exposed to EUR/USD)
  'DE000A2T0VU5':1.00,
  // RF USD funds
  'IE00BYZW5L40':0.80,  // BNY Mellon Global Credit USD
  'IE00B8DTNZ55':0.90,'IE0034085260':0.90,  // Vanguard US IG Credit, Pimco GIS USD
  'IE0007471927':1.00,'IE00B04GQX83':1.00,  // Vanguard US Gov Bond, Vanguard US 500
  // RF EUR funds → 0%
  'LU2598654767':0.00,'IE00BL0BM031':0.00,'LU1663872726':0.00,
  'IE00BDRK7J14':0.00,'IE00BD0NC037':0.00,'LU2377004903':0.00,'LU0128494944':0.00,
  'LU0568620560':0.00,'LU0354091653':0.00,'IE00B96CNN65':0.00,'IE00BHTFVV24':0.00,
  // Multiactivo → ~30% (50% RV × 71.25% ≈ 35.6%, minus EUR bond component)
  'LU0449914208':0.30,
  // Demo portfolio ISINs
  'GS-CG-001':0.40,    // GS Managed RV Global — ~40% USD (global mix)
  'LU0129459060':0.95,  // JPM US Large Cap — ~95% USD
  'IE00BK5BQT80':0.60,  // Vanguard All-World — ~60% USD
  'LU0690375182':0.30,  // Fundsmith — ~30% USD (global quality)
  'IE00B3VVMM84':0.00,  // Vanguard EM — 0% USD
  'GS-CG-002':0.00,     // GS Managed RF EUR — 0%
  'IE00B80G9288':0.50,   // PIMCO Income — ~50% USD
  'IE00B1FZS798':1.00,   // iShares USD Treasury — 100% USD
  'ES0000012H41':0.00,   // Bono España — 0%
  'KKR-GPE-IV':0.60,    // KKR Global PE — ~60% USD
  'BX-REP-IX':0.50,     // Blackstone RE — ~50% USD
  'ARDIAN-GF-V':0.20,   // Ardian Growth EUR — ~20% USD
  'BIF-IV-2020':0.60,   // Brookfield Infra — ~60% USD
  'IE00B579F325':1.00,   // Invesco Gold — 100% USD
  'GOLD-JPM-001':1.00,  // Gold JPM — 100% USD
  'FR0010135103':0.30,   // Carmignac Patrimoine — ~30% USD
  'FR0010251660':0.00    // Amundi Euro Liquidity — 0%
};

export const EURUSD = {"Ene-16":1.1093,"Feb-16":1.1082,"Mar-16":1.1168,"Abr-16":1.1279,"May-16":1.1161,"Jun-16":1.1131,"Jul-16":1.1137,"Ago-16":1.1264,"Sep-16":1.1226,"Oct-16":1.1091,"Nov-16":1.1409,"Dic-16":1.1284,"Ene-17":1.1363,"Feb-17":1.1308,"Mar-17":1.13,"Abr-17":1.1402,"May-17":1.1346,"Jun-17":1.1572,"Jul-17":1.1621,"Ago-17":1.161,"Sep-17":1.1636,"Oct-17":1.1662,"Nov-17":1.1558,"Dic-17":1.1932,"Ene-18":1.1821,"Feb-18":1.1661,"Mar-18":1.161,"Abr-18":1.1571,"May-18":1.1537,"Jun-18":1.1551,"Jul-18":1.1446,"Ago-18":1.1401,"Sep-18":1.1449,"Oct-18":1.1322,"Nov-18":1.1412,"Dic-18":1.1168,"Ene-19":1.1312,"Feb-19":1.1231,"Mar-19":1.1216,"Abr-19":1.1322,"May-19":1.1322,"Jun-19":1.1293,"Jul-19":1.1389,"Ago-19":1.139,"Sep-19":1.1311,"Oct-19":1.1333,"Nov-19":1.1408,"Dic-19":1.1247,"Ene-20":1.1328,"Feb-20":1.144,"Mar-20":1.1383,"Abr-20":1.1559,"May-20":1.1666,"Jun-20":1.1594,"Jul-20":1.1516,"Ago-20":1.1503,"Sep-20":1.1701,"Oct-20":1.1733,"Nov-20":1.1773,"Dic-20":1.1708,"Ene-21":1.1793,"Feb-21":1.1637,"Mar-21":1.1657,"Abr-21":1.163,"May-21":1.1398,"Jun-21":1.1247,"Jul-21":1.1358,"Ago-21":1.0998,"Sep-21":1.112,"Oct-21":1.0786,"Nov-21":1.098,"Dic-21":1.0707,"Ene-22":1.0523,"Feb-22":1.0694,"Mar-22":1.0453,"Abr-22":1.0571,"May-22":1.061,"Jun-22":1.0651,"Jul-22":1.0613,"Ago-22":1.0702,"Sep-22":1.0642,"Oct-22":1.051,"Nov-22":1.0935,"Dic-22":1.076,"Ene-23":1.0915,"Feb-23":1.0609,"Mar-23":1.0636,"Abr-23":1.0695,"May-23":1.0757,"Jun-23":1.0828,"Jul-23":1.0821,"Ago-23":1.0857,"Sep-23":1.0822,"Oct-23":1.0833,"Nov-23":1.0729,"Dic-23":1.0704,"Ene-24":1.085,"Feb-24":1.0818,"Mar-24":1.0888,"Abr-24":1.0708,"May-24":1.0616,"Jun-24":1.0797,"Jul-24":1.0729,"Ago-24":1.076,"Sep-24":1.0706,"Oct-24":1.0786,"Nov-24":1.0617,"Dic-24":1.0337,"Ene-25":1.05,"Feb-25":1.0567,"Mar-25":1.0684,"Abr-25":1.0736,"May-25":1.0736,"Jun-25":1.0507,"Jul-25":1.0537,"Ago-25":1.0729,"Sep-25":1.0404,"Oct-25":1.0618,"Nov-25":1.0539,"Dic-25":1.0551};

// Inflación mensual España (IPC variación mensual %) — fuente: INE

export const CPI_ES = {"Ene-16":-0.1,"Feb-16":-0.3,"Mar-16":0.2,"Abr-16":-0.1,"May-16":0.1,"Jun-16":0.1,"Jul-16":-0.1,"Ago-16":0,"Sep-16":-0.1,"Oct-16":0.3,"Nov-16":0,"Dic-16":-0.2,"Ene-17":0.1,"Feb-17":0.4,"Mar-17":-0.1,"Abr-17":0,"May-17":0.2,"Jun-17":0.3,"Jul-17":0.1,"Ago-17":0.1,"Sep-17":0,"Oct-17":0.3,"Nov-17":0,"Dic-17":0.2,"Ene-18":0.2,"Feb-18":0,"Mar-18":0.2,"Abr-18":-0.1,"May-18":-0.1,"Jun-18":-0.1,"Jul-18":0,"Ago-18":0,"Sep-18":0.3,"Oct-18":0.1,"Nov-18":0.1,"Dic-18":0.2,"Ene-19":0.3,"Feb-19":0.1,"Mar-19":0.1,"Abr-19":0.2,"May-19":0,"Jun-19":-0.1,"Jul-19":0,"Ago-19":0.3,"Sep-19":0.1,"Oct-19":0,"Nov-19":0,"Dic-19":-0.2,"Ene-20":0.1,"Feb-20":0.2,"Mar-20":0.2,"Abr-20":0.1,"May-20":0,"Jun-20":0,"Jul-20":-0.2,"Ago-20":-0.1,"Sep-20":0,"Oct-20":0.1,"Nov-20":0.2,"Dic-20":0.1,"Ene-21":0.3,"Feb-21":-0.2,"Mar-21":0.4,"Abr-21":0.2,"May-21":0.6,"Jun-21":0.2,"Jul-21":0.1,"Ago-21":0.1,"Sep-21":0.3,"Oct-21":0.2,"Nov-21":0,"Dic-21":0.6,"Ene-22":0.7,"Feb-22":0.9,"Mar-22":0.8,"Abr-22":0.6,"May-22":0.6,"Jun-22":0.7,"Jul-22":0.9,"Ago-22":0.5,"Sep-22":0.8,"Oct-22":0.7,"Nov-22":0.7,"Dic-22":0.8,"Ene-23":0.5,"Feb-23":0.3,"Mar-23":0.2,"Abr-23":0.5,"May-23":0.3,"Jun-23":0.4,"Jul-23":0.2,"Ago-23":0.4,"Sep-23":0.2,"Oct-23":0.3,"Nov-23":0.5,"Dic-23":0.4,"Ene-24":0.2,"Feb-24":0,"Mar-24":0.3,"Abr-24":0.4,"May-24":0.5,"Jun-24":0.2,"Jul-24":0.3,"Ago-24":0.2,"Sep-24":0.3,"Oct-24":0,"Nov-24":0.3,"Dic-24":0.3,"Ene-25":0.3,"Feb-25":0.2,"Mar-25":0.3,"Abr-25":0.2,"May-25":0.3,"Jun-25":0.2,"Jul-25":0.3,"Ago-25":0.4,"Sep-25":0.1,"Oct-25":0.4,"Nov-25":0,"Dic-25":0.2};

export const TIT_COLORS=['#3b82f6','#f59e0b','#34d399','#a78bfa','#f87171','#06b6d4'];

export const BANK_COLORS={'Goldman Sachs':'#4f46e5','JP Morgan':'#1e40af','Interactive Brokers':'#dc2626','Andbank':'#059669'};
