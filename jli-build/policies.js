// Investment policies — versioned. Each entry is a snapshot approved
// on `date`. Newer versions go on top (we keep all so the user can
// toggle and we can mark policy-definition events on the patrimonio
// timeline.
//
// Bucket mapping is used by the Política tab to compare the current
// portfolio against the strategic asset allocation. `match` is a
// predicate run over each position; the first matching bucket wins.
window.JLI_POLICIES = [
  {
    version: 1,
    date: '2026-04-27',
    titular: 'José Luis Innocenti',
    horizonte: '20 años (Largo Plazo)',
    perfil: 'Crecimiento a Largo Plazo / Inversión en Índices únicamente',
    objetivo: 'Definir filtros de exclusión estrictos y criterios mínimos obligatorios para la selección de fondos de inversión, asegurando vehículos eficientes, líquidos, transparentes y de bajo costo, con foco en la preservación y el crecimiento del capital en el largo plazo (20 años).',
    filtros: [
      { categoria: 'Tipo de Activo',     criterio: 'Fondos Mixtos o Híbridos',                 justif: 'Exposición pura a un único tipo de activo para control total del riesgo.' },
      { categoria: 'Complejidad',        criterio: 'Instrumentos Estructurados / Derivados',   justif: 'Solo replicación física. Prohibida la replicación sintética.' },
      { categoria: 'Concentración',      criterio: 'Fondos Sectoriales > 10%',                 justif: 'No se permite exposición a una sola industria > 10% de la cartera.' },
      { categoria: 'Gestión',            criterio: 'Banca Comercial',                          justif: 'Prioridad a gestoras independientes, no a bancos comerciales.' },
      { categoria: 'Costes',             criterio: 'Retrocesiones',                            justif: 'Solo Clean Share Classes (sin comisiones ocultas).' },
      { categoria: 'Liquidez',           criterio: 'Liquidez > T+10',                          justif: 'Garantía de convertibilidad a efectivo en máximo 10 días.' },
      { categoria: 'Metodología',        criterio: 'Gestión Activa',                           justif: 'Exclusivamente fondos indexados y pasivos.' },
      { categoria: 'Jurisdicción',       criterio: 'Domicilio en EE.UU.',                      justif: 'Optimización fiscal para no residentes (Estate Tax / IRS).' },
      { categoria: 'Gestora de Activos', criterio: 'Concentración en una gestora > 30%',       justif: 'Máx 30% del patrimonio gestionado por una misma gestora.' }
    ],
    kpis: {
      trackRecordMinYears: 5,
      aumMinUSD: 1_000_000_000,
      terMaxPct: 0.30,
      acumulacion: true
    },
    // Strategic allocation. `min`/`max` in % of portfolio.
    // `match(pos)` returns true if the position belongs to the bucket;
    // first match wins (priority order top→bottom).
    allocation: [
      { id: 'sp500',     region: 'EE.UU.', tipo: 'Large Caps',       indice: 'S&P 500',     min: 55, max: 65, color: '#38bdf8',
        match: p => p.isSP500 || /\bs&p ?500\b/i.test(p.name||'') || /\bspx\b/i.test(p.name||'') },
      { id: 'mid400',    region: 'EE.UU.', tipo: 'Mid Caps',         indice: 'S&P 400',     min: 5,  max: 10, color: '#a78bfa',
        match: p => /\bs&p ?400\b|mid[- ]?cap/i.test(p.name||'') },
      { id: 'small2000', region: 'EE.UU.', tipo: 'Small Caps',       indice: 'Russell 2000', min: 5, max: 10, color: '#f472b6',
        match: p => /russell 2000|small[- ]?cap/i.test(p.name||'') },
      { id: 'nasdaq',    region: 'EE.UU.', tipo: 'Growth / High Tech', indice: 'NASDAQ-100', min: 3, max: 5,  color: '#22d3ee',
        match: p => /nasdaq[- ]?100|nasdaq 100/i.test(p.name||'') },
      { id: 'europe',    region: 'Europa', tipo: 'Renta Variable',   indice: 'MSCI Europe', min: 5,  max: 7,  color: '#34d399',
        match: p => /msci europe|europe equity|european equity/i.test(p.name||'') || (p.geo||'').toLowerCase() === 'europe' },
      { id: 'cash',      region: 'Cash',   tipo: 'Money Market',     indice: '—',           min: 3,  max: 5,  color: '#94a3b8',
        match: p => p.tipo === 'Efectivo' || /money market|liquidity|ultra short|treasury 0-1|cash series/i.test(p.name||'') }
    ],
    principios: [
      { titulo: 'Simplicidad', detalle: 'Estructura transparente y fácil de auditar.' },
      { titulo: 'Eficiencia',  detalle: 'La minimización de costes es el motor principal del retorno neto a largo plazo.' },
      { titulo: 'Disciplina',  detalle: 'Rebalanceo periódico para mantener los pesos de la asignación estratégica.' },
      { titulo: 'Consistencia', detalle: 'Mantener el plan de inversión independientemente de la volatilidad del mercado a corto plazo.' }
    ],
    plazo: {
      estimado: '1 año (sujeto a oportunidad y consideraciones fiscales).',
      oportunidad: 'VIX > 20 → ventana de compra; VIX < 15 → ventana de venta para recomponer cartera hacia objetivos.',
      fiscal: 'Aprovechar beneficios fiscales para la recomposición.'
    },
    notas: 'Documento marco regulatorio único para la gestión del patrimonio durante el horizonte de 20 años.'
  }
];
