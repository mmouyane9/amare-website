/* ==========================================================================
   Supabase — Index (barrel)
   --------------------------------------------------------------------------
   Load last, after config/client/database/storage/auth/realtime, and
   finalises the single window.Supabase entry point used by every page:

     window.Supabase.config     centralised configuration
     window.Supabase.client     shared client (alias: window.supabaseClient)
     window.Supabase.getClient  lazy accessor for the shared client
     window.Supabase.db         generic database helpers
     window.Supabase.storage    generic storage helpers
     window.Supabase.auth       authentication service (signUp/signIn/Google/
                                signOut/profile/session restore/isAdmin)
     window.Supabase.realtime   realtime scaffold (future use)
     window.Supabase.navbar     navbar auth UI (avatar menu, admin badge)

   Load order on a page:
     1. https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2
     2. supabase/config.js
     3. supabase/client.js
     4. supabase/database.js
     5. supabase/storage.js
     6. supabase/auth.js
     7. supabase/realtime.js
     8. supabase/index.js
     9. supabase/navbar.js        (optional, navbar auth UI)
   ========================================================================== */
(function (window) {
  'use strict';

  var Supabase = (window.Supabase = window.Supabase || {});

  Supabase.version = '1.0.0';
  Supabase.ready = true;
})(window);
