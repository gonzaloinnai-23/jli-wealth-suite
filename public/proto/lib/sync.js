// Pull / push de datos del usuario entre localStorage y Supabase.
//
// Estrategia: localStorage-first.
//   - Las páginas siguen leyendo/escribiendo localStorage como antes.
//   - El shell, al loguear, hace un pull → poblar localStorage.
//   - Cuando un dato cambia (objetivos, cartera), se hace push silencioso.

(function () {
  const ns = (window.jliSync = window.jliSync || {});

  // ---- Objetivos ----
  ns.pushObjetivos = async function (snapshot) {
    if (!window.sb) return { ok: false };
    try {
      const u = (await window.sb.auth.getUser())?.data?.user;
      if (!u) return { ok: false, error: 'no session' };
      const { error } = await window.sb
        .from('objetivos')
        .upsert({ user_id: u.id, data: snapshot, updated_at: new Date().toISOString() });
      if (error) { console.warn('[sync] pushObjetivos', error); return { ok: false, error: error.message }; }
      return { ok: true };
    } catch (e) { return { ok: false, error: String(e) }; }
  };

  ns.pullObjetivos = async function () {
    if (!window.sb) return null;
    try {
      const u = (await window.sb.auth.getUser())?.data?.user;
      if (!u) return null;
      const { data, error } = await window.sb
        .from('objetivos')
        .select('data')
        .eq('user_id', u.id)
        .maybeSingle();
      if (error) { console.warn('[sync] pullObjetivos', error); return null; }
      return data?.data || null;
    } catch (e) { console.warn('[sync] pullObjetivos threw', e); return null; }
  };

  // ---- Cartera actual ----
  ns.pushCartera = async function ({ csvText, positions }) {
    if (!window.sb) return { ok: false };
    try {
      const u = (await window.sb.auth.getUser())?.data?.user;
      if (!u) return { ok: false, error: 'no session' };
      const { error } = await window.sb
        .from('cartera_actual')
        .upsert({
          user_id: u.id,
          csv_text: csvText || null,
          positions: positions || null,
          updated_at: new Date().toISOString(),
        });
      if (error) { console.warn('[sync] pushCartera', error); return { ok: false, error: error.message }; }
      return { ok: true };
    } catch (e) { return { ok: false, error: String(e) }; }
  };

  ns.pullCartera = async function () {
    if (!window.sb) return null;
    try {
      const u = (await window.sb.auth.getUser())?.data?.user;
      if (!u) return null;
      const { data, error } = await window.sb
        .from('cartera_actual')
        .select('csv_text, positions, updated_at')
        .eq('user_id', u.id)
        .maybeSingle();
      if (error) { console.warn('[sync] pullCartera', error); return null; }
      return data || null;
    } catch (e) { console.warn('[sync] pullCartera threw', e); return null; }
  };

  // ---- Pull total al loguear: hidrata localStorage ----
  ns.hydrateLocalStorageFromSupabase = async function () {
    if (!window.sb) return;
    const [obj, cart] = await Promise.all([ns.pullObjetivos(), ns.pullCartera()]);
    try {
      if (obj) localStorage.setItem('jli_objetivos', JSON.stringify(obj));
      if (cart) {
        if (cart.csv_text) localStorage.setItem('jli_cartera_csv', cart.csv_text);
        if (cart.positions) localStorage.setItem('jli_cartera_positions', JSON.stringify(cart.positions));
      }
    } catch (e) { console.warn('[sync] hydrate writes failed', e); }
  };
})();
