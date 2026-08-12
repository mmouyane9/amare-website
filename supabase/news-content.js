/* ==========================================================================
   الأخبار (NEWS) Page Content Loader

   Loads the published CMS content for the News page (slug '/news') and
   injects it into the existing page DOM.

   The News page renders its news grid / featured / category cards from a
   JS store (newsData + categories inside News/news.html). This loader
   therefore:
     1. Injects the editable static text (hero, section heads, newsletter,
        CTA) directly into the DOM — preserving the SVG icons.
     2. Does NOT feed news items / categories — those now come from the
        public.news table through supabase/news-articles.js.

   Hardcoded HTML/JS serves as fallback when no CMS content is available.

   ONLY runs on the NEWS page — the slug is fixed and guarded, so it can
   never render another page's content (and vice versa).
   ========================================================================== */

(function () {
  'use strict';

  var SLUG = '/news';

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function isNewsPage() {
    var path = window.location.pathname;
    return /news\.html/i.test(path);
  }

  /* Bilingual helper — picks key_lang, falls back to key_ar, then key. */
  function pickBilingual(data, key) {
    if (!data) return '';
    var lang = (window.I18n && window.I18n.getCurrentLanguage) ? window.I18n.getCurrentLanguage() : 'ar';
    var value = data[key + '_' + lang];
    if (value != null && value !== '') return value;
    value = data[key + '_ar'];
    if (value != null && value !== '') return value;
    return data[key] || '';
  }

  // Set text while preserving the first SVG icon child.
  function setTextWithIcon(el, text) {
    if (!el) return;
    var icon = el.querySelector('svg');
    el.textContent = text || '';
    if (icon) el.insertBefore(icon, el.firstChild);
  }

  // Set a heading, re-wrapping the highlighted word in the accent span.
  function setTitleWithEm(el, heading, headingEm) {
    if (!el) return;
    var h = String(heading || '');
    var em = String(headingEm || '');
    var emClass = '';
    var existing = el.querySelector('span');
    if (existing && existing.className) emClass = ' class="' + existing.className + '"';
    var idx = em && h.indexOf(em);
    if (idx >= 0) {
      el.innerHTML =
        esc(h.slice(0, idx)) +
        '<span' + emClass + '>' + esc(em) + '</span>' +
        esc(h.slice(idx + em.length));
    } else {
      el.textContent = h;
    }
  }

  function setSectionHead(sec, eyebrow, heading, description) {
    var e = sec.querySelector('.nw-section-head .nw-eyebrow');
    if (e && eyebrow) setTextWithIcon(e, eyebrow);
    var t = sec.querySelector('.nw-section-head .nw-section-title');
    if (t && heading) t.textContent = heading;
    var d = sec.querySelector('.nw-section-head .nw-section-desc');
    if (d && description) d.textContent = description;
  }

  function injectButtons(anchors, buttons, field) {
    if (!buttons || !buttons.length) return;
    for (var i = 0; i < anchors.length; i++) {
      if (!buttons[i]) continue;
      anchors[i].href = buttons[i].url || '#';
      setTextWithIcon(anchors[i], pickBilingual(buttons[i], field || 'label'));
    }
  }

  function injectHero(d) {
    var h1 = document.querySelector('.nw-hero h1');
    if (h1) setTitleWithEm(h1, pickBilingual(d, 'heading'), pickBilingual(d, 'headingEm'));
    var badge = document.querySelector('.nw-hero-badge');
    if (badge) setTextWithIcon(badge, pickBilingual(d, 'subheading'));
    var subtitle = document.querySelector('.nw-hero-subtitle');
    if (subtitle) subtitle.textContent = pickBilingual(d, 'description');
    injectButtons(document.querySelectorAll('.nw-hero-actions a'), d.buttons, 'label');
  }

  function injectNwFeatured(d) {
    var sec = document.querySelector('#nwFeatured');
    if (!sec) return;
    setSectionHead(sec, pickBilingual(d, 'eyebrow'), pickBilingual(d, 'heading'), null);
  }

  function injectNwGrid(d) {
    var sec = document.querySelector('#nwLatest');
    if (!sec) return;
    setSectionHead(sec, pickBilingual(d, 'eyebrow'), pickBilingual(d, 'heading'), pickBilingual(d, 'description'));
  }

  function injectNwCategories(d) {
    var sec = document.querySelector('#nwCategories');
    if (!sec) return;
    setSectionHead(sec, pickBilingual(d, 'eyebrow'), pickBilingual(d, 'heading'), pickBilingual(d, 'description'));
  }

  function injectNwSearch(d) {
    var sec = document.querySelector('#nwSearch');
    if (!sec) return;
    setSectionHead(sec, pickBilingual(d, 'eyebrow'), pickBilingual(d, 'heading'), null);
  }

  function injectNwNewsletter(d) {
    var sec = document.querySelector('#nwNewsletter');
    if (!sec) return;
    var title = sec.querySelector('.nw-newsletter-inner h2');
    if (title) title.textContent = pickBilingual(d, 'heading');
    var desc = sec.querySelector('.nw-newsletter-inner p');
    if (desc) desc.textContent = pickBilingual(d, 'description');
    var btn = sec.querySelector('.nw-newsletter-form button');
    if (btn) btn.textContent = pickBilingual(d, 'buttonLabel');
  }

  function injectNwCta(d) {
    var sec = document.querySelector('#nwCta');
    if (!sec) return;
    var title = sec.querySelector('.nw-cta-inner h2');
    if (title) title.textContent = pickBilingual(d, 'heading');
    injectButtons(sec.querySelectorAll('.nw-cta-actions a'), d.buttons, 'label');
  }

  var pending = null;

  function applyNewsData() {
    // News cards / categories now come exclusively from the public.news table
    // via supabase/news-articles.js. Nothing to apply from CMS sections.
  }

  function injectSection(section) {
    if (!section || !section.enabled) return;
    var type = section.type;
    var data = section.data || {};

    if (type === 'hero') return injectHero(data);

    if (type === 'custom') {
      switch (data._renderer) {
        case 'nwFeatured':     return injectNwFeatured(data);
        case 'nwGrid':         return injectNwGrid(data);
        case 'nwCategories':   return injectNwCategories(data);
        case 'nwSearch':       return injectNwSearch(data);
        case 'nwNewsletter':   return injectNwNewsletter(data);
        case 'nwCta':          return injectNwCta(data);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  var _lastSections = null;

  function loadFromSupabase(callback) {
    var MAX_RETRIES = 30, RETRY_MS = 200;

    function tryLoad(retries) {
      var S = window.Supabase;
      if (!S || !S.getClient) {
        if (retries < MAX_RETRIES) { setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS); return; }
        console.warn('[NEWS CMS] Supabase chain not ready after ' + (MAX_RETRIES * RETRY_MS) + 'ms — falling back to HTML');
        return callback(null);
      }
      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) { setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS); return; }
        console.warn('[NEWS CMS] Supabase client unavailable after ' + (MAX_RETRIES * RETRY_MS) + 'ms — falling back to HTML');
        return callback(null);
      }

      client.from('pages').select('id, title, slug, status').eq('slug', SLUG).eq('status', 'published').single()
        .then(function (r) {
          if (r.error || !r.data) { console.log('[NEWS CMS] Page not found:', SLUG); return callback(null); }
          var page = r.data;
          console.log('[NEWS CMS] Page found:', page.title, page.slug);
          client.from('page_sections').select('id, section_type, content, settings, styles, visible, sort_order')
            .eq('page_id', page.id).eq('visible', true).order('sort_order')
            .then(function (sr) {
              if (sr.error || !sr.data || !sr.data.length) { console.log('[NEWS CMS] No sections'); return callback(null); }
              var rows = sr.data;
              console.log('[NEWS CMS] Loaded', rows.length, 'sections');
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

  function renderAll() {
    if (_lastSections && _lastSections.length > 0) {
      console.log('[NEWS CMS] Re-rendering', _lastSections.length, 'CMS sections...');
      for (var i = 0; i < _lastSections.length; i++) injectSection(_lastSections[i]);
      applyNewsData();
    }
  }

  function init() {
    if (!isNewsPage()) return;
    loadFromSupabase(function (sections) {
      if (sections && sections.length > 0) {
        _lastSections = sections;
        console.log('[NEWS CMS] Rendering', sections.length, 'CMS sections...');
        for (var i = 0; i < sections.length; i++) injectSection(sections[i]);
        applyNewsData();
        console.log('[NEWS CMS] Rendering complete');
      } else {
        console.log('[NEWS CMS] No CMS sections — HTML fallback');
        _lastSections = null;
      }
    });

    window.addEventListener('amare:langchange', function () {
      renderAll();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
