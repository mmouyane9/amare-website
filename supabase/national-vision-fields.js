/* ==========================================================================
   National Vision — Simple Field Loader
   Reads page_content table and injects values into [data-cms] elements.
   ========================================================================== */

(function () {
  'use strict';

  var PAGE_SLUG = '/Who%20are%20we/national-vision.html';

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function injectAll(fields) {
    if (!fields || fields.length === 0) return;
    console.log('[NV Fields] Injecting', fields.length, 'fields');

    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var key = f.content_key;
      var value = f.value;
      if (!key || value === null || value === undefined) continue;

      var el = document.querySelector('[data-cms="' + key + '"]');
      if (el) {
        if (el.tagName === 'A' && el.hasAttribute('data-cms-href')) {
          el.textContent = value;
        } else if (el.tagName === 'A') {
          el.textContent = value;
        } else if (el.tagName === 'IMG') {
          el.src = value;
        } else {
          el.textContent = value;
        }
      }

      var hrefEl = document.querySelector('[data-cms-href="' + key + '"]');
      if (hrefEl) {
        hrefEl.href = value;
      }

      var imgEl = document.querySelector('[data-cms-src="' + key + '"]');
      if (imgEl && value) {
        imgEl.src = value;
      }
    }
  }

  function loadFields(callback) {
    var MAX_RETRIES = 30, RETRY_MS = 200;

    function tryLoad(retries) {
      var S = window.Supabase;
      if (!S || !S.getClient) {
        if (retries < MAX_RETRIES) { setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS); return; }
        console.log('[NV Fields] Supabase client not available after waiting');
        return callback(null);
      }
      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) { setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS); return; }
        return callback(null);
      }

      console.log('[NV Fields] Supabase client ready');
      client.from('pages').select('id').eq('slug', PAGE_SLUG).eq('status', 'published').single()
        .then(function (p) {
          if (p.error || !p.data) { console.log('[NV Fields] Page not published'); return callback(null); }
          client.from('page_content').select('content_key, value').eq('page_id', p.data.id).order('sort_order')
            .then(function (r) {
              if (r.error || !r.data) return callback(null);
              console.log('[NV Fields] Loaded', r.data.length, 'fields');
              callback(r.data);
            }).catch(function () { callback(null); });
        }).catch(function () { callback(null); });
    }
    tryLoad(0);
  }

  function init() {
    loadFields(function (fields) {
      if (fields) injectAll(fields);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
