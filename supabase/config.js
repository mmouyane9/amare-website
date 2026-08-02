/* ==========================================================================
   Supabase — Configuration (single source of truth)
   --------------------------------------------------------------------------
   This project is a static HTML/CSS/JS site with no build step, so the
   Supabase URL and publishable anon key are centralised here and exposed to
   every page through the shared window.Supabase namespace.

   Security note:
   - The URL and anon key are PUBLISHABLE credentials. The anon key is
     designed by Supabase to be exposed in the browser (Row Level Security
     protects the data). Never place the service_role key or any other
     secret in this file or anywhere in the front-end.
   - Real secrets belong in server-side environment variables.

   Environment variable support (for deployments that inject env at runtime,
   e.g. Netlify, Vercel, Cloudflare Pages, or an edge script):
   provide a global override BEFORE this file is loaded:

     <script>
       window.AMARE_SUPABASE_CONFIG = {
         url: 'https://YOUR-PROJECT.supabase.co',
         anonKey: 'sb_publishable_...',
       };
     </script>
   ========================================================================== */
(function (window) {
  'use strict';

  var DEFAULTS = {
    url: 'https://zqfvtgmdpbhhiqluehuh.supabase.co',
    anonKey: 'sb_publishable_LkRDy3q61L79QaCRdWXqxA_fTuMm7sx',
    options: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  };

  var override =
    (typeof window !== 'undefined' && window.AMARE_SUPABASE_CONFIG) || {};

  var config = {
    url: override.url || DEFAULTS.url,
    anonKey: override.anonKey || DEFAULTS.anonKey,
    options: override.options || DEFAULTS.options,
  };

  window.Supabase = window.Supabase || {};
  window.Supabase.config = config;
})(window);
