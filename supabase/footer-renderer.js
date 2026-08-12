/* ==========================================================================
   AMARE — Dynamic Footer Renderer v2
   --------------------------------------------------------------------------
   Reads footer_columns + footer_items from Supabase, renders the website
   footer with all 5 column types:

     about   → logo + name + description + social (from website_settings)
     links   → simple link list
     contact → contact list with SVG icons
     map     → Google Maps embed

   Subscribes to realtime on both tables.
   ========================================================================== */

(function footerRenderer(window) {
  'use strict';

  var db = (window.Supabase && window.Supabase.db) || null;
  if (!db) {
    setTimeout(function () { footerRenderer(window); }, 200);
    return;
  }

  var channel = null;
  var lastRendered = '';

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function normalizeUrl(url) {
    if (!url || url === '#') return url || '#';
    if (/^(https?:|mailto:|tel:|javascript:|#|\/)/i.test(url)) return url;
    return '/' + url;
  }

  /* Resolve a footer label/column title for the active language. */
  function resolveLabel(item) {
    if (window.I18n && window.I18n.resolveFooterLabel) {
      return window.I18n.resolveFooterLabel(item);
    }
    return item.label_ar || item.title_ar || '';
  }

  function resolveColumnLabel(column) {
    return resolveLabel(column);
  }

  /* Resolve the footer contact address from website_settings (bilingual). */
  function resolveAddress() {
    var settings = window.__AMARE_SETTINGS__ || null;
    if (!settings) return '';
    var lang =
      window.I18n && window.I18n.getCurrentLanguage
        ? window.I18n.getCurrentLanguage()
        : 'ar';
    if (lang === 'fr') {
      return settings.address_fr || settings.address_ar || '';
    }
    return settings.address_ar || '';
  }

  /* ==========================================================================
     SVG icons for contact items
     ========================================================================== */

  var CONTACT_ICONS = {
    'map-pin':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    'phone':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 2.9a2 2 0 0 1-.4 2.1L8 10a16 16 0 0 0 6 6l1.3-1.4a2 2 0 0 1 2.1-.4c.9.4 1.9.6 2.9.7a2 2 0 0 1 1.7 2.1z"/></svg>',
    'mail':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z" opacity="0"/><path d="M22 6 12 13 2 6"/><path d="M2 6h20v12H2z"/></svg>',
    default:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>',
  };

  function contactIcon(name) {
    return CONTACT_ICONS[name] || CONTACT_ICONS['default'];
  }

  /* ==========================================================================
     Render column types
     ========================================================================== */

  function renderContactColumn(column, items) {
    var container = document.getElementById('footer-contact-' + column.id);
    var colLabel = column.label_ar || column.title_ar || '';
    var contactUl = document.querySelector('.footer-contact');
    if (!contactUl) {
      var navs = document.querySelectorAll('nav[aria-label]');
      for (var n = 0; n < navs.length; n++) {
        if (navs[n].getAttribute('aria-label') === colLabel) {
          contactUl = navs[n].querySelector('.footer-contact');
          break;
        }
      }
    }
    if (!contactUl) {
      var allFooterContact = document.querySelectorAll('.footer-contact');
      if (allFooterContact.length > 0) {
        contactUl = allFooterContact[0];
      }
    }
    if (!contactUl) return;

    contactUl.setAttribute('data-amare-no-translate', '');

    var html = '';
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item.is_visible) continue;

      var icon = contactIcon(item.icon || 'map-pin');
      var value = item.value || resolveLabel(item);
      if (item.link_type === 'none' || item.icon === 'map-pin') {
        value = resolveAddress();
      }

      html += '<li>';

      if (item.link_type === 'tel' && item.url) {
        html += '<a href="' + escapeHtml(normalizeUrl(item.url)) + '"';
        if (item.open_in_new_tab) html += ' target="_blank" rel="noopener"';
        html += '>' + icon + '<span dir="ltr">' + escapeHtml(value) + '</span></a>';
      } else if (item.link_type === 'mailto' && item.url) {
        html += '<a href="' + escapeHtml(normalizeUrl(item.url)) + '"';
        html += '>' + icon + '<span dir="ltr">' + escapeHtml(value) + '</span></a>';
      } else {
        html += icon + '<span>' + escapeHtml(value) + '</span>';
      }

      html += '</li>';
    }
    contactUl.innerHTML = html;
  }

  function renderLinksColumn(column, items) {
    var colLabel = column.label_ar || column.title_ar || '';
    var nav = document.querySelector(
      'nav[aria-label="' + colLabel + '"]'
    );
    if (!nav) {
      var allNavs = document.querySelectorAll('nav[aria-label]');
      for (var n = 0; n < allNavs.length; n++) {
        if (allNavs[n].getAttribute('aria-label') === colLabel) {
          nav = allNavs[n];
          break;
        }
      }
    }
    if (!nav) return;

    // Update the <h4> title
    var h4 = nav.querySelector('h4');
    if (h4) h4.textContent = resolveColumnLabel(column);

    var ul = nav.querySelector('.footer-links');
    if (!ul) return;

    ul.setAttribute('data-amare-no-translate', '');

    var html = '';
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item.is_visible) continue;

      if (item.url) {
        html += '<li><a href="' + escapeHtml(normalizeUrl(item.url)) + '"';
        if (item.open_in_new_tab) html += ' target="_blank" rel="noopener"';
        html += '>' + escapeHtml(resolveLabel(item)) + '</a></li>';
      } else {
        html += '<li><span class="footer-section-title">' +
          escapeHtml(resolveLabel(item)) + '</span></li>';
      }
    }
    ul.innerHTML = html;
  }

  function renderMapColumn(column, items) {
    var mapContainer = document.querySelector('.footer-location');
    if (!mapContainer) return;

    mapContainer.setAttribute('data-amare-no-translate', '');

    var h4 = mapContainer.querySelector('h4');
    if (h4) h4.textContent = resolveColumnLabel(column);

    // Find the first map item
    var mapItem = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].is_visible && items[i].link_type === 'map') {
        mapItem = items[i];
        break;
      }
    }
    if (!mapItem) return;

    // Update the badge
    var badge = mapContainer.querySelector('.footer-map-badge');
    if (badge) badge.textContent = mapItem.value || resolveColumnLabel(column);

    // Update the iframe
    var iframe = mapContainer.querySelector('iframe');
    if (iframe && mapItem.url) {
      iframe.src = mapItem.url;
      iframe.title = resolveLabel(mapItem);
    }

    // Update the "Open in Google Maps" button — always use the CMS share URL
    var btn = mapContainer.querySelector('.footer-map-btn');
    if (btn) {
      var settings = window.__AMARE_SETTINGS__ || null;
      var shareUrl =
        (settings && settings.google_maps_url) ||
        (mapItem.url ? mapItem.url.replace('&output=embed', '') : '');
      if (shareUrl) btn.href = shareUrl;
    }
  }

  /* ==========================================================================
     Fetch & render
     ========================================================================== */

  function fetchAndRender() {
    return db
      .select('footer_columns', '*', null, { column: 'sort_order', ascending: true })
      .then(function (colRes) {
        return db
          .select('footer_items', '*', null, { column: 'sort_order', ascending: true })
          .then(function (itemRes) {
            var columns = (colRes && colRes.data) || [];
            var items = (itemRes && itemRes.data) || [];

            if (!Array.isArray(columns)) columns = [];
            if (!Array.isArray(items)) items = [];

            var fingerprint = JSON.stringify([
              columns.map(function (c) {
                return [c.id, c.label_ar || c.title_ar, c.label_fr, c.type, c.sort_order, c.is_visible].join('|');
              }),
              items.map(function (i) {
                return [i.id, i.label_ar || i.title_ar, i.label_fr, i.url, i.value, i.column_id, i.sort_order, i.is_visible].join('|');
              }),
            ]);

            if (fingerprint === lastRendered) return;
            lastRendered = fingerprint;

            var itemsByColumn = {};
            for (var c = 0; c < columns.length; c++) {
              itemsByColumn[columns[c].id] = [];
            }
            for (var i = 0; i < items.length; i++) {
              var colId = items[i].column_id;
              if (colId && itemsByColumn[colId] !== undefined) {
                itemsByColumn[colId].push(items[i]);
              }
            }

            for (var j = 0; j < columns.length; j++) {
              var column = columns[j];
              if (!column.is_visible) continue;
              var colItems = itemsByColumn[column.id] || [];

              if (column.type === 'contact') {
                renderContactColumn(column, colItems);
              } else if (column.type === 'map') {
                renderMapColumn(column, colItems);
              } else if (column.type === 'links') {
                renderLinksColumn(column, colItems);
              }
            }
          });
      })
      .catch(function (err) {
        console.error('[FooterRenderer] Failed:', err);
      });
  }

  /* ==========================================================================
     Realtime
     ========================================================================== */

  function subscribe() {
    if (channel) channel.unsubscribe();
    var client = window.supabaseClient;
    if (!client) return;

    channel = client
      .channel('public-footer-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'footer_items' },
        function () { fetchAndRender(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'footer_columns' },
        function () { fetchAndRender(); }
      )
      .subscribe(function (status) {
        if (status === 'SUBSCRIBED') {
          console.log('[FooterRenderer] Realtime active.');
        }
      });
  }

  /* ==========================================================================
     Boot
     ========================================================================== */

  function boot() {
    fetchAndRender().then(subscribe);

    // Re-render labels when the language changes (data is unchanged, so the
    // fingerprint cache must be reset to force a repaint).
    window.addEventListener('amare:langchange', function () {
      lastRendered = '';
      fetchAndRender();
    });

    // Re-render the contact address when website_settings change via realtime.
    window.addEventListener('amare:settingschange', function () {
      lastRendered = '';
      fetchAndRender();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
