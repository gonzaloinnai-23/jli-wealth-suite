// Helpers de autenticación + guard de sesión.
// Depende de window.sb (cargado por supabase-client.js).

(function () {
  const ns = (window.jliAuth = window.jliAuth || {});

  ns.isConfigured = () => !!window.sb;

  // Devuelve la sesión actual (o null). Cacheable.
  ns.getSession = async function () {
    if (!window.sb) return null;
    try {
      const { data, error } = await window.sb.auth.getSession();
      if (error) { console.warn('[auth] getSession', error); return null; }
      return data?.session || null;
    } catch (e) { console.warn('[auth] getSession threw', e); return null; }
  };

  ns.getUser = async function () {
    const s = await ns.getSession();
    return s?.user || null;
  };

  // Login con email + password. Devuelve { ok, error }.
  ns.signIn = async function (email, password) {
    if (!window.sb) return { ok: false, error: 'Supabase no configurado' };
    try {
      const { error } = await window.sb.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e) { return { ok: false, error: String(e) }; }
  };

  // Signup con email + password. Si la confirmación por email está habilitada
  // el usuario va a recibir un correo; en ese caso ok=true pero session es null.
  ns.signUp = async function (email, password) {
    if (!window.sb) return { ok: false, error: 'Supabase no configurado' };
    try {
      const { error } = await window.sb.auth.signUp({ email, password });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e) { return { ok: false, error: String(e) }; }
  };

  // Envía mail con link de reseteo. El user vuelve al sitio con el hash que
  // dispara el evento PASSWORD_RECOVERY → ahí se muestra el form de nueva clave.
  ns.resetPassword = async function (email) {
    if (!window.sb) return { ok: false, error: 'Supabase no configurado' };
    try {
      const redirectTo = window.location.origin + window.location.pathname;
      const { error } = await window.sb.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e) { return { ok: false, error: String(e) }; }
  };

  // Cambia la contraseña del user actual (asume sesión activa por recovery link).
  ns.updatePassword = async function (newPassword) {
    if (!window.sb) return { ok: false, error: 'Supabase no configurado' };
    try {
      const { error } = await window.sb.auth.updateUser({ password: newPassword });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    } catch (e) { return { ok: false, error: String(e) }; }
  };

  ns.signOut = async function () {
    if (!window.sb) return;
    try { await window.sb.auth.signOut(); } catch (e) { console.warn('[auth] signOut', e); }
    // Limpieza local de los datos sincronizados (no de la config ni del SDK)
    try {
      ['jli_objetivos', 'jli_cartera_csv', 'jli_cartera_positions',
       'etf_selection_v1', 'etf_amounts_v1', 'etf_region_weights_v1',
       'etf_custody_pct_v1'].forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  };

  // Subscribe a cambios de estado de auth. cb({event, session}).
  ns.onAuthStateChange = function (cb) {
    if (!window.sb) return () => {};
    const { data } = window.sb.auth.onAuthStateChange((event, session) => cb({ event, session }));
    return () => { try { data.subscription.unsubscribe(); } catch (e) {} };
  };
})();
