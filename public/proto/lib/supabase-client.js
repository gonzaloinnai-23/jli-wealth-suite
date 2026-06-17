// Cliente Supabase singleton, compartido entre el shell y los iframes
// (es seguro: cada iframe es same-origin y reutiliza el storage de auth).
//
// Antes de cargar este script:
//   1) <script src="/proto/lib/supabase-config.js"></script>
//   2) <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//
// Expone window.sb (cliente Supabase) o null si no hay config válida.

(function () {
  const cfg = window.SUPABASE_CONFIG || {};
  const SDK = window.supabase; // namespace que expone el UMD
  if (!cfg.url || !cfg.anonKey) {
    window.sb = null;
    window.SB_READY = false;
    console.info('[supabase] sin config (modo demo localStorage)');
    return;
  }
  if (!SDK || typeof SDK.createClient !== 'function') {
    window.sb = null;
    window.SB_READY = false;
    console.warn('[supabase] SDK no cargado — chequear el <script> del CDN');
    return;
  }
  // Cliente único; el SDK ya maneja persistencia en localStorage.
  window.sb = SDK.createClient(cfg.url, cfg.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Necesario para procesar el hash del link de recuperación de contraseña
      // (Supabase redirecciona con #access_token=...&type=recovery).
      detectSessionInUrl: true,
    },
  });
  window.SB_READY = true;
})();
