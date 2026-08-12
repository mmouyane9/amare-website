/* ==========================================================================
   AMARE — Navbar Loader (single include for ALL pages)
   --------------------------------------------------------------------------
   Include this ONE script on every page and it will load the entire
   Supabase chain in the correct order:

      CDN SDK → i18n → i18n-text → config → client → website-settings →
      database → storage → auth → realtime → index → navbar-renderer →
      footer-renderer → navbar

   The script auto-detects its own directory, so it works at any page depth
   without changing the path.

   Usage:
     Root pages:    <script src="supabase/navbar-loader.js"></script>
     Subfolders:    <script src="../supabase/navbar-loader.js"></script>
   ========================================================================== */

(function () {
  'use strict';

  var scripts = document.getElementsByTagName('script');
  var me = scripts[scripts.length - 1];
  var base = me.src.substring(0, me.src.lastIndexOf('/') + 1);

  var files = [
    'i18n.js',
    'i18n-text.js',
    'config.js',
    'client.js',
    'website-settings.js',
    'database.js',
    'storage.js',
    'auth.js',
    'realtime.js',
    'index.js',
    'navbar-renderer.js',
    'footer-renderer.js',
    'navbar.js',
  ];

  /* -------- sequential loader -------------------------------------------- */

  function injectScript(url) {
    return new Promise(function (resolve, reject) {
      // Skip if an existing tag with the same filename already exists
      var filename = url.split('/').pop();
      var existing = document.querySelector(
        'script[src$="/' + filename + '"]'
      );
      if (existing) return resolve();

      var s = document.createElement('script');
      s.src = url;
      s.async = false;
      s.onload = resolve;
      s.onerror = function () {
        console.error('[NavbarLoader] Failed to load: ' + url);
        reject(new Error('Failed to load ' + url));
      };
      document.head.appendChild(s);
    });
  }

  /* -------- boot --------------------------------------------------------- */

  function boot() {
    var chain = Promise.resolve();

    // Load the CDN SDK only if supabase global is not already available
    if (typeof window.supabase === 'undefined' && typeof window.Supabase === 'undefined') {
      chain = chain.then(function () {
        return injectScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      });
    }

    for (var i = 0; i < files.length; i++) {
      chain = chain.then(function (url) {
        return injectScript(url);
      }.bind(null, base + files[i]));
    }

    return chain;
  }

  // Expose the boot promise so pages can wait for the Supabase client to be
  // initialised before running queries (instead of relying on fixed delays).
  // Resolves when the full chain (SDK → config → client → … → index) is loaded.
  window.AmareSupabaseReady = boot();
  window.AmareSupabaseReady.catch(function (err) {
    console.error('[NavbarLoader] Boot failed:', err);
  });
})();
