/* ==========================================================================
   Website Settings Loader — Dynamic General Settings for the Public Website

   1. Loads settings from the `website_settings` table.
   2. Replaces all `data-amare-setting` elements with live values.
   3. Subscribes to Realtime — updates every page instantly.
   4. Dispatches `amare:settingschange` so other scripts can react.
   5. Falls back to hardcoded HTML — website never breaks.
   ========================================================================== */

(function () {
  'use strict';

  var FALLBACK = {
    association_name: 'الجمعية المغربية لهواة البحث والاستكشاف',
    short_name: 'AMARE',
    contact_email: 'association.amare.agadir@gmail.com',
    phone: '+212 684869996',
    whatsapp: '+212684869996',
    address: 'ص.ب 749 أيت ملول 86150',
    google_maps_url: 'https://www.google.com/maps?q=30.385528,-9.448611',
    working_hours: 'الإثنين - الجمعة | 09:00 - 18:00',
    logo_url: 'Amare%20files%20/logo.png',
    footer_logo_url: 'Amare%20files%20/logo.png',
    favicon_url: 'Amare%20files%20/logo.png',
  };

  var SETTINGS_ID = '00000000-0000-0000-0000-000000000001';
  var STORAGE_KEY = 'amare_website_settings';
  var currentSettings = null;

  /* ---------------------------------------------------------------
     Helpers
     --------------------------------------------------------------- */
  function getClient() {
    var S = window.Supabase;
    if (!S || !S.getClient) return null;
    return S.getClient();
  }

  function normalizeSettings(row) {
    if (!row) return FALLBACK;
    return {
      association_name: row.association_name || FALLBACK.association_name,
      short_name: row.short_name || FALLBACK.short_name,
      contact_email: row.contact_email || FALLBACK.contact_email,
      phone: row.phone || FALLBACK.phone,
      whatsapp: row.whatsapp || FALLBACK.whatsapp,
      address: row.address || FALLBACK.address,
      google_maps_url: row.google_maps_url || FALLBACK.google_maps_url,
      working_hours: row.working_hours || FALLBACK.working_hours,
      logo_url: row.logo_url || FALLBACK.logo_url,
      footer_logo_url: row.footer_logo_url || FALLBACK.footer_logo_url,
      favicon_url: row.favicon_url || FALLBACK.favicon_url,
    };
  }

  /* ---------------------------------------------------------------
     DOM Injectors
     --------------------------------------------------------------- */
  function applyToElement(el, value) {
    if (!el) return;
    var tagName = el.tagName.toLowerCase();
    var isInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
    var isImg = tagName === 'img';
    var isIframe = tagName === 'iframe';

    if (isImg) {
      el.src = value;
    } else if (isIframe) {
      el.src = value;
    } else if (isInput) {
      el.value = value;
    } else if (el.hasAttribute('data-amare-href')) {
      el.setAttribute('href', value);
    } else if (el.hasAttribute('data-amare-text')) {
      el.textContent = value;
    } else if (el.hasAttribute('data-amare-title')) {
      el.setAttribute('title', value);
    } else if (el.hasAttribute('data-amare-content')) {
      el.textContent = value;
    } else {
      el.textContent = value;
    }
  }

  function updateDOM(settings) {
    /* --- Browser title --- */
    document.title = settings.association_name + ' | معًا نصنع أثرًا حقيقيًا';

    /* --- Meta tags --- */
    var metaOgTitle = document.querySelector('meta[property="og:title"]');
    if (metaOgTitle && settings.association_name) {
      metaOgTitle.setAttribute('content', settings.association_name);
    }

    var metaAuthor = document.querySelector('meta[name="author"]');
    if (metaAuthor && settings.association_name) {
      metaAuthor.setAttribute('content', settings.association_name);
    }

    /* --- Favicon --- */
    var faviconLink = document.querySelector('link[rel="shortcut icon"]');
    if (faviconLink && settings.favicon_url) {
      faviconLink.setAttribute('href', settings.favicon_url);
    }

    /* --- All data-amare-setting elements --- */
    var elements = document.querySelectorAll('[data-amare-setting]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.getAttribute('data-amare-setting');
      if (key && settings[key] !== undefined) {
        applyToElement(el, settings[key]);
      }
    }

    /* --- Branding: all navbar logos --- */
    var navLogos = document.querySelectorAll('.topbar-brand-logo, .mobile-drawer-brand-logo');
    for (var n = 0; n < navLogos.length; n++) {
      if (settings.logo_url) navLogos[n].src = settings.logo_url;
    }

    /* --- Branding: footer logos --- */
    var footerLogos = document.querySelectorAll('.footer-brand .topbar-brand-logo');
    for (var f = 0; f < footerLogos.length; f++) {
      if (settings.footer_logo_url) footerLogos[f].src = settings.footer_logo_url;
    }

    /* --- Special: WhatsApp link (always process, format the URL) --- */
    var waEls = document.querySelectorAll('.topbar-whatsapp');
    for (var w = 0; w < waEls.length; w++) {
      var waNum = (settings.whatsapp || '').replace(/[^0-9+]/g, '').replace(/^\+/, '');
      waEls[w].setAttribute('href', 'http://wa.me/+' + waNum);
    }
  }

  /* ---------------------------------------------------------------
     Persist to localStorage for instant next-page loads
     --------------------------------------------------------------- */
  function cacheSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (_) { /* ignore */ }
  }

  function getCachedSettings() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) { /* ignore */ }
    return null;
  }

  /* ---------------------------------------------------------------
     Realtime subscription
     --------------------------------------------------------------- */
  function subscribeRealtime(callback) {
    var client = getClient();
    if (!client) return;

    client
      .channel('website_settings_public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'website_settings', filter: 'id=eq.' + SETTINGS_ID },
        function (payload) {
          var settings = normalizeSettings(payload.new);
          currentSettings = settings;
          cacheSettings(settings);
          callback(settings);
        }
      )
      .subscribe();
  }

  /* ---------------------------------------------------------------
     Fetch from Supabase
     --------------------------------------------------------------- */
  function fetchAndApply() {
    var client = getClient();
    if (!client) {
      applyFallback();
      return;
    }

    client
      .from('website_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle()
      .then(function (result) {
        if (result.error || !result.data) {
          applyFallback();
          return;
        }
        var settings = normalizeSettings(result.data);
        currentSettings = settings;
        cacheSettings(settings);
        window.__AMARE_SETTINGS__ = settings;
        updateDOM(settings);
        window.dispatchEvent(new CustomEvent('amare:settingschange', { detail: settings }));
      })
      .catch(function () {
        applyFallback();
      });
  }

  function applyFallback() {
    currentSettings = FALLBACK;
    window.__AMARE_SETTINGS__ = FALLBACK;
    updateDOM(FALLBACK);
  }

  /* ---------------------------------------------------------------
     Boot
     --------------------------------------------------------------- */
  function boot() {
    /* 1. Apply cached settings immediately (zero flicker) */
    var cached = getCachedSettings();
    if (cached) {
      currentSettings = cached;
      window.__AMARE_SETTINGS__ = cached;
      updateDOM(cached);
    }

    /* 2. Fetch fresh in background */
    fetchAndApply();

    /* 3. Subscribe to realtime */
    subscribeRealtime(function (settings) {
      window.__AMARE_SETTINGS__ = settings;
      updateDOM(settings);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
