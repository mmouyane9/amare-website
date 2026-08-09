/* ==========================================================================
   خدماتنا — SOS AMARE Page Content Loader

   Loads the published CMS content for the SOS AMARE service page
   (slug '/services/sos-amare') and injects it into the existing page DOM.
   Hardcoded HTML serves as fallback when no CMS content is available.

   ONLY runs on the SOS AMARE page — the slug is fixed and guarded, so it
   can never render another page's content (and vice versa).
   ========================================================================== */

(function () {
  'use strict';

  var SLUG = '/services/sos-amare';

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function isSosAmarePage() {
    var path = window.location.pathname;
    return /sos-amare/i.test(path);
  }

  function setEyebrow(sec, text) {
    var el = sec.querySelector('.sos-section-eyebrow');
    if (el && text) {
      var svg = el.querySelector('svg');
      el.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(text);
    }
  }

  function setTitle(sec, text) {
    var el = sec.querySelector('.sos-section-title');
    if (el && text) el.textContent = text;
  }

  function setDesc(sec, text) {
    var el = sec.querySelector('.sos-section-desc');
    if (el && text) el.textContent = text;
  }

  function injectButtons(anchors, buttons) {
    if (!buttons || !buttons.length) return;
    for (var i = 0; i < anchors.length; i++) {
      if (!buttons[i]) continue;
      anchors[i].href = buttons[i].url || '#';
      var svg = anchors[i].querySelector('svg');
      anchors[i].textContent = buttons[i].label || '';
      if (svg) anchors[i].appendChild(svg);
    }
  }

  function injectHero(d) {
    var h1 = document.querySelector('.sos-hero h1');
    if (h1 && d.heading) h1.textContent = d.heading;
    var sub = document.querySelector('.sos-hero-subtitle');
    if (sub && d.description) sub.textContent = d.description;
    injectButtons(document.querySelectorAll('.sos-hero-actions a'), d.buttons);
  }

  function injectSosHow(d) {
    var sec = document.querySelector('#sosHow');
    if (!sec) return;
    setEyebrow(sec, d.eyebrow);
    setTitle(sec, d.heading);
    setDesc(sec, d.description);
    if (d.steps) {
      var cards = sec.querySelectorAll('.sos-how-card');
      for (var i = 0; i < Math.min(cards.length, d.steps.length); i++) {
        var h3 = cards[i].querySelector('h3');
        var p = cards[i].querySelector('p');
        if (h3) h3.textContent = d.steps[i].title || '';
        if (p) p.textContent = d.steps[i].description || '';
      }
    }
  }

  function injectSosCategories(d) {
    var sec = document.querySelector('#sosCats');
    if (!sec) return;
    setEyebrow(sec, d.eyebrow);
    setTitle(sec, d.heading);
    setDesc(sec, d.description);
    if (d.categories) {
      var cards = sec.querySelectorAll('.sos-cat-card');
      for (var i = 0; i < Math.min(cards.length, d.categories.length); i++) {
        var h3 = cards[i].querySelector('h3');
        if (h3) h3.textContent = d.categories[i].title || '';
      }
    }
  }

  function injectSosForm(d) {
    var sec = document.querySelector('#sosForm');
    if (!sec) return;
    setEyebrow(sec, d.eyebrow);
    setTitle(sec, d.heading);
    setDesc(sec, d.description);
  }

  function injectSosGreen(d) {
    var sec = document.querySelector('#sosGreen');
    if (!sec) return;
    var h2 = sec.querySelector('h2');
    if (h2 && d.heading) h2.textContent = d.heading;
    var desc = sec.querySelector('.sos-green-desc');
    if (desc && d.description) desc.textContent = d.description;
    var num = sec.querySelector('.sos-green-number');
    if (num && d.number) {
      var svg = num.querySelector('svg');
      num.textContent = d.number;
      if (svg) num.insertBefore(svg, num.firstChild);
    }
    injectButtons(sec.querySelectorAll('.sos-green-actions a'), d.buttons);
    var hours = sec.querySelector('.sos-green-hours');
    if (hours && d.hours) {
      var hSvg = hours.querySelector('svg');
      hours.textContent = d.hours;
      if (hSvg) hours.insertBefore(hSvg, hours.firstChild);
    }
  }

  function injectSosFaq(d) {
    var sec = document.querySelector('#sosFaq');
    if (!sec) return;
    setEyebrow(sec, d.eyebrow);
    setTitle(sec, d.heading);
    setDesc(sec, d.description);
    if (d.items) {
      var items = sec.querySelectorAll('.sos-faq-item');
      for (var i = 0; i < Math.min(items.length, d.items.length); i++) {
        var q = items[i].querySelector('.sos-faq-question span');
        var a = items[i].querySelector('.sos-faq-answer-inner');
        if (q) q.textContent = d.items[i].question || '';
        if (a) a.textContent = d.items[i].answer || '';
      }
    }
  }

  function injectSosCta(d) {
    var sec = document.querySelector('#sosCta');
    if (!sec) return;
    var h2 = sec.querySelector('h2');
    if (h2 && d.heading) h2.textContent = d.heading;
    injectButtons(sec.querySelectorAll('.sos-cta-actions a'), d.buttons);
  }

  function injectSection(section) {
    if (!section || !section.enabled) return;
    var type = section.type;
    var data = section.data || {};

    if (type === 'hero') return injectHero(data);

    if (type === 'custom') {
      switch (data._renderer) {
        case 'sosHow':       return injectSosHow(data);
        case 'sosCategories': return injectSosCategories(data);
        case 'sosForm':      return injectSosForm(data);
        case 'sosGreen':     return injectSosGreen(data);
        case 'sosFaq':       return injectSosFaq(data);
        case 'sosCta':       return injectSosCta(data);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  function loadFromSupabase(callback) {
    var MAX_RETRIES = 30, RETRY_MS = 200;

    function tryLoad(retries) {
      var S = window.Supabase;
      if (!S || !S.getClient) {
        if (retries < MAX_RETRIES) { setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS); return; }
        console.warn('[SOS CMS] Supabase chain not ready after ' + (MAX_RETRIES * RETRY_MS) + 'ms — falling back to HTML');
        return callback(null);
      }
      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) { setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS); return; }
        console.warn('[SOS CMS] Supabase client unavailable after ' + (MAX_RETRIES * RETRY_MS) + 'ms — falling back to HTML');
        return callback(null);
      }

      client.from('pages').select('id, title, slug, status').eq('slug', SLUG).eq('status', 'published').single()
        .then(function (r) {
          if (r.error || !r.data) { console.log('[SOS CMS] Page not found:', SLUG); return callback(null); }
          var page = r.data;
          console.log('[SOS CMS] Page found:', page.title, page.slug);
          client.from('page_sections').select('id, section_type, content, settings, styles, visible, sort_order')
            .eq('page_id', page.id).eq('visible', true).order('sort_order')
            .then(function (sr) {
              if (sr.error || !sr.data || !sr.data.length) { console.log('[SOS CMS] No sections'); return callback(null); }
              var rows = sr.data;
              console.log('[SOS CMS] Loaded', rows.length, 'sections');
              var sections = [];
              for (var i = 0; i < rows.length; i++) {
                var row = rows[i], data = {};
                var c = row.content || {}, s = row.settings || {};
                for (var ck in c) { if (Object.prototype.hasOwnProperty.call(c, ck)) data[ck] = c[ck]; }
                for (var sk in s) { if (Object.prototype.hasOwnProperty.call(s, sk)) data[sk] = s[sk]; }
                sections.push({ id: row.id, type: row.section_type, enabled: row.visible, order: row.sort_order, data: data });
              }
              callback(sections);
            }).catch(function () { callback(null); });
        }).catch(function () { callback(null); });
    }
    tryLoad(0);
  }

  function init() {
    if (!isSosAmarePage()) return;
    loadFromSupabase(function (sections) {
      if (sections && sections.length > 0) {
        console.log('[SOS CMS] Rendering', sections.length, 'CMS sections...');
        for (var i = 0; i < sections.length; i++) injectSection(sections[i]);
        console.log('[SOS CMS] Rendering complete');
      } else {
        console.log('[SOS CMS] No CMS sections — HTML fallback');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
