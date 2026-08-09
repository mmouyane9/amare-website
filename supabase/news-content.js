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

  // Set text while preserving the first FontAwesome <i> / <svg> icon child.
  function setTextWithIcon(el, text) {
    if (!el) return;
    var icon = el.querySelector('i, svg');
    el.textContent = text || '';
    if (icon) el.insertBefore(icon, el.firstChild);
  }

  // Set a heading, re-wrapping the highlighted word in the accent span.
  // Reuses the existing em span's class so the accent styling is preserved.
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

  function injectButtons(anchors, buttons) {
    if (!buttons || !buttons.length) return;
    for (var i = 0; i < anchors.length; i++) {
      if (!buttons[i]) continue;
      anchors[i].href = buttons[i].url || '#';
      setTextWithIcon(anchors[i], buttons[i].label);
    }
  }

  function injectHero(d) {
    var h1 = document.querySelector('.nw-hero h1');
    if (h1) setTitleWithEm(h1, d.heading, d.headingEm);
    var badge = document.querySelector('.nw-hero-badge');
    if (badge && d.subheading) setTextWithIcon(badge, d.subheading);
    var subtitle = document.querySelector('.nw-hero-subtitle');
    if (subtitle && d.description) subtitle.textContent = d.description;
    injectButtons(document.querySelectorAll('.nw-hero-actions a'), d.buttons);
  }

  function injectNwFeatured(d) {
    var sec = document.querySelector('#nwFeatured');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);
  }

  function injectNwGrid(d) {
    var sec = document.querySelector('#nwLatest');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);
    // News cards are no longer fed from CMS sections — they come from the
    // public.news table via supabase/news-articles.js (real published data).
  }

  function injectNwCategories(d) {
    var sec = document.querySelector('#nwCategories');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);
  }

  function injectNwSearch(d) {
    var sec = document.querySelector('#nwSearch');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);
  }

  function injectNwNewsletter(d) {
    var sec = document.querySelector('#nwNewsletter');
    if (!sec) return;
    var title = sec.querySelector('.nw-newsletter-inner h2');
    if (title && d.heading) title.textContent = d.heading;
    var desc = sec.querySelector('.nw-newsletter-inner p');
    if (desc && d.description) desc.textContent = d.description;
    var btn = sec.querySelector('.nw-newsletter-form button');
    if (btn && d.buttonLabel) btn.textContent = d.buttonLabel;
  }

  function injectNwCta(d) {
    var sec = document.querySelector('#nwCta');
    if (!sec) return;
    var title = sec.querySelector('.nw-cta-inner h2');
    if (title && d.heading) title.textContent = d.heading;
    injectButtons(sec.querySelectorAll('.nw-cta-actions a'), d.buttons);
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

  function init() {
    if (!isNewsPage()) return;
    loadFromSupabase(function (sections) {
      if (sections && sections.length > 0) {
        console.log('[NEWS CMS] Rendering', sections.length, 'CMS sections...');
        for (var i = 0; i < sections.length; i++) injectSection(sections[i]);
        applyNewsData();
        console.log('[NEWS CMS] Rendering complete');
      } else {
        console.log('[NEWS CMS] No CMS sections — HTML fallback');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
