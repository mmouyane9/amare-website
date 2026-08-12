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
    address: 'الطابق الأول، الشقة 4، المجمع التجاري تيويزي، تكاديرت، أكادير',
    address_ar: 'الطابق الأول، الشقة 4، المجمع التجاري تيويزي، تكاديرت، أكادير',
    address_fr: '1er étage, Appartement 4, Complexe Commercial Tiwizi, Takadirt, Agadir',
    google_maps_url: 'https://maps.app.goo.gl/VCXL3tC7vZWpzS5UA',
    working_hours: 'الإثنين - الجمعة | 09:00 - 18:00',
    logo_url: '/Amare%20files%20/logo.png',
    footer_logo_url: '/Amare%20files%20/logo.png',
    favicon_url: '/Amare%20files%20/logo.png',
    facebook: null,
    instagram: null,
    linkedin: null,
    youtube: null,
    tiktok: null,
    twitter: null,
    whatsapp_url: null,
    telegram: null,
    organization_description: 'الجمعية المغربية لهواة البحث والاستكشاف هي إطار قانوني وطني يجمع الهواة تحت راية واحدة لصون التراث الوطني المغربي.',
    show_logo: true,
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
      address_ar: row.address_ar || row.address || FALLBACK.address_ar,
      address_fr: row.address_fr || FALLBACK.address_fr,
      google_maps_url: row.google_maps_url || FALLBACK.google_maps_url,
      working_hours: row.working_hours || FALLBACK.working_hours,
      logo_url: row.logo_url || FALLBACK.logo_url,
      footer_logo_url: row.footer_logo_url || FALLBACK.footer_logo_url,
      favicon_url: row.favicon_url || FALLBACK.favicon_url,
      facebook: row.facebook || FALLBACK.facebook,
      instagram: row.instagram || FALLBACK.instagram,
      linkedin: row.linkedin || FALLBACK.linkedin,
      youtube: row.youtube || FALLBACK.youtube,
      tiktok: row.tiktok || FALLBACK.tiktok,
      twitter: row.twitter || FALLBACK.twitter,
      whatsapp_url: row.whatsapp_url || FALLBACK.whatsapp_url,
      telegram: row.telegram || FALLBACK.telegram,
      organization_description: row.organization_description || FALLBACK.organization_description,
      show_logo: row.show_logo !== undefined ? row.show_logo : FALLBACK.show_logo,
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

  function resolveAddress(settings) {
    var lang =
      window.I18n && window.I18n.getCurrentLanguage
        ? window.I18n.getCurrentLanguage()
        : 'ar';
    if (lang === 'fr') {
      return settings.address_fr || settings.address_ar || '';
    }
    return settings.address_ar || '';
  }

  function updateDOM(settings) {
    /* --- Browser title --- */
    if (window.I18n && window.I18n.pageTitle) {
      var i18nTitle = window.I18n.pageTitle();
      if (i18nTitle) document.title = i18nTitle;
      else document.title = settings.association_name;
    } else {
      document.title = settings.association_name;
    }

    /* --- Meta tags (only when i18n is not managing them) --- */
    if (!window.I18n) {
      var metaOgTitle = document.querySelector('meta[property="og:title"]');
      if (metaOgTitle && settings.association_name) {
        metaOgTitle.setAttribute('content', settings.association_name);
      }
      var metaAuthor = document.querySelector('meta[name="author"]');
      if (metaAuthor && settings.association_name) {
        metaAuthor.setAttribute('content', settings.association_name);
      }
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
      if (!key) continue;
      if (key === 'address') {
        applyToElement(el, resolveAddress(settings));
      } else if (settings[key] !== undefined) {
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
    var footerLogoContainers = document.querySelectorAll('.footer-brand .brand-mark');
    for (var f = 0; f < footerLogos.length; f++) {
      if (settings.footer_logo_url) footerLogos[f].src = settings.footer_logo_url;
    }
    for (var fc = 0; fc < footerLogoContainers.length; fc++) {
      footerLogoContainers[fc].style.display = settings.show_logo ? '' : 'none';
    }

    /* --- Social media icons: update href / hide if empty --- */
    var socialMap = {
      'فيسبوك':    'facebook',
      'Facebook':   'facebook',
      'إنستغرام':   'instagram',
      'Instagram':  'instagram',
      'لينكدإن':    'linkedin',
      'LinkedIn':   'linkedin',
      'يوتيوب':     'youtube',
      'YouTube':    'youtube',
      'تيك توك':    'tiktok',
      'TikTok':     'tiktok',
      'تويتر':      'twitter',
      'إكس':        'twitter',
      'X':          'twitter',
      'Twitter':    'twitter',
      'تليغرام':     'telegram',
      'Telegram':   'telegram',
    };

    var socialIcons = document.querySelectorAll(
      '[aria-label]'
    );

    for (var si = 0; si < socialIcons.length; si++) {
      var icon = socialIcons[si];
      if (icon.tagName !== 'A') continue;
      var ariaLabel = icon.getAttribute('aria-label');
      if (!ariaLabel) continue;
      var field = socialMap[ariaLabel.trim()];
      if (!field) continue;

      var url = settings[field];
      if (url) {
        icon.href = url;
        icon.style.display = '';
        icon.style.visibility = '';
      } else {
        icon.href = '#';
        icon.style.display = 'none';
        icon.style.visibility = 'hidden';
      }
    }

    /* --- Special: WhatsApp link (use whatsapp_url if set, else build from phone) --- */
    var waValue = settings.whatsapp_url
      || (settings.whatsapp
          ? 'https://wa.me/+' + settings.whatsapp.replace(/[^0-9+]/g, '').replace(/^\+/, '')
          : null);

    var waEls = document.querySelectorAll(
      '.topbar-whatsapp, .mobile-drawer-action-whatsapp, a[href*="wa.me"]'
    );
    for (var w = 0; w < waEls.length; w++) {
      if (waValue) {
        waEls[w].setAttribute('href', waValue);
        waEls[w].style.display = '';
        waEls[w].style.visibility = '';
      } else {
        waEls[w].style.display = 'none';
        waEls[w].style.visibility = 'hidden';
      }
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
  var realtimeChannel = null;

  function subscribeRealtime(callback) {
    var client = getClient();
    if (!client) return false;

    if (realtimeChannel) {
      realtimeChannel.unsubscribe();
      realtimeChannel = null;
    }

    realtimeChannel = client
      .channel('website_settings_public')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'website_settings', filter: 'id=eq.' + SETTINGS_ID },
        function (payload) {
          var settings = normalizeSettings(payload.new);
          currentSettings = settings;
          cacheSettings(settings);
          window.__AMARE_SETTINGS__ = settings;
          updateDOM(settings);
          reTranslateI18n();
          window.dispatchEvent(new CustomEvent('amare:settingschange', { detail: settings }));
        }
      )
      .subscribe();
    return true;
  }

  /* ---------------------------------------------------------------
     Fetch from Supabase
     --------------------------------------------------------------- */
  var fetchRetries = 0;
  var MAX_FETCH_RETRIES = 60;

  function fetchAndApply() {
    var client = getClient();
    if (!client) {
      fetchRetries++;
      if (fetchRetries < MAX_FETCH_RETRIES) {
        setTimeout(fetchAndApply, 500);
      }
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
        reTranslateI18n();
        window.dispatchEvent(new CustomEvent('amare:settingschange', { detail: settings }));

        if (!realtimeSubscribed) {
          realtimeSubscribed = subscribeRealtime(function (settings) {
            window.__AMARE_SETTINGS__ = settings;
            updateDOM(settings);
            reTranslateI18n();
          });
        }
      })
      .catch(function () {
        applyFallback();
      });
  }

  var realtimeSubscribed = false;

  function applyFallback() {
    currentSettings = FALLBACK;
    window.__AMARE_SETTINGS__ = FALLBACK;
    updateDOM(FALLBACK);
    reTranslateI18n();
  }

  /* ---------------------------------------------------------------
     i18n re-translation after CMS data updates
     --------------------------------------------------------------- */
  function reTranslateI18n() {
    if (!window.I18n || !window.I18n.getCurrentLanguage) return;

    var lang = window.I18n.getCurrentLanguage();
    var elements = document.querySelectorAll('[data-amare-setting][data-i18n]');

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      el.setAttribute('data-i18n-ar-original', el.textContent || '');

      if (lang === 'fr' && window.I18n.t) {
        var key = el.getAttribute('data-i18n');
        if (key) {
          var translated = window.I18n.t(key);
          if (translated && translated.indexOf(key) !== 0) {
            el.textContent = translated;
          }
        }
      }
    }
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
      reTranslateI18n();
    }

    /* 2. Fetch fresh from CMS in background (retries until Supabase is ready) */
    fetchAndApply();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
