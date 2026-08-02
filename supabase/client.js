/* ==========================================================================
   Supabase — Client (single shared instance)
   --------------------------------------------------------------------------
   Creates the Supabase client exactly once and shares it across the project:
     - window.Supabase.client        (shared client reference)
     - window.Supabase.getClient()   (lazy accessor, returns the same instance)
     - window.supabaseClient         (compatibility alias used by existing code)

   Do NOT call createClient anywhere else — this is the only initialisation
   point. Load the official SDK BEFORE this file:

     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
     <script src="supabase/config.js"></script>
     <script src="supabase/client.js"></script>
   ========================================================================== */
(function (window) {
  'use strict';

  var Supabase = (window.Supabase = window.Supabase || {});
  var config = Supabase.config || {};

  var _client = null;

  function getClient() {
    if (_client) return _client;

    var createClient =
      typeof window.supabase !== 'undefined' && window.supabase.createClient
        ? window.supabase.createClient
        : null;

    if (!createClient) {
      console.error(
        '[Supabase] SDK not loaded. Add the @supabase/supabase-js script before supabase/client.js.'
      );
      return null;
    }

    if (!config.url || !config.anonKey) {
      console.error(
        '[Supabase] Missing configuration. Load supabase/config.js before supabase/client.js.'
      );
      return null;
    }

    try {
      _client = createClient(config.url, config.anonKey, config.options);
    } catch (err) {
      console.error('[Supabase] Failed to initialize client:', err);
      _client = null;
    }

    return _client;
  }

  Supabase.client = getClient();
  Supabase.getClient = getClient;

  // Lazy compatibility alias: any read of window.supabaseClient returns the
  // shared singleton (or null if the SDK/config is unavailable).
  Object.defineProperty(window, 'supabaseClient', {
    get: getClient,
    configurable: true,
  });
})(window);
