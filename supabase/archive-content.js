/* ==========================================================================
   الأرشيف (ARCHIVE) Page Content Loader

   Loads the published CMS content for the Archive page (slug '/archive')
   and injects it into the existing page DOM.

   The Archive page renders its categories grid, archive library grid and
   downloads list from hardcoded JS stores (DEFAULT_ARCHIVE +
   DEFAULT_CATEGORIES + DEFAULT_DOWNLOADS inside Archive/archive.html).
   This loader therefore:
     1. Injects the editable static text (hero, stats, section heads, FAQ,
        CTA) directly into the DOM — preserving the SVG icons.
     2. Feeds the live archive items + categories + downloads to the page
        through window.ArchivePage.setData(items, cats, downloads) then
        re-renders via window.ArchivePage.render(). Category SVG icons are
        preserved by the page (looked up from its own defaults).

   The page has NO content images (cards render SVG placeholder icons), so
   there are no image fields and no image handling in this loader.

   Hardcoded HTML/JS serves as fallback when no CMS content is available.

   ONLY runs on the ARCHIVE page — the slug is fixed and guarded, so it can
   never render another page's content (and vice versa).
   ========================================================================== */

(function () {
  'use strict';

  var SLUG = '/archive';

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function isArchivePage() {
    var path = window.location.pathname;
    return /archive/i.test(path);
  }

  // Set text while preserving the first <svg> icon child.
  function setTextWithIcon(el, text) {
    if (!el) return;
    var icon = el.querySelector('svg');
    el.textContent = text || '';
    if (icon) el.insertBefore(icon, el.firstChild);
  }

  // Set a heading, re-wrapping the highlighted word in the accent span.
  // Reuses the existing span's class so the accent styling is preserved.
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
    var e = sec.querySelector('.ar-section-head .ar-eyebrow');
    if (e && eyebrow) setTextWithIcon(e, eyebrow);
    var t = sec.querySelector('.ar-section-head .ar-section-title');
    if (t && heading) t.textContent = heading;
    var d = sec.querySelector('.ar-section-head .ar-section-desc');
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
    var h1 = document.querySelector('.ar-hero h1');
    if (h1) setTitleWithEm(h1, d.heading, d.headingEm);
    var badge = document.querySelector('.ar-hero-badge');
    if (badge && d.subheading) setTextWithIcon(badge, d.subheading);
    var subtitle = document.querySelector('.ar-hero-subtitle');
    if (subtitle && d.description) subtitle.textContent = d.description;
    injectButtons(document.querySelectorAll('.ar-hero-actions a'), d.buttons);
  }

  function injectArStats(d) {
    var sec = document.querySelector('#arStats');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);
    if (d.stats && d.stats.length) {
      var cards = sec.querySelectorAll('.ar-stat-card');
      for (var i = 0; i < Math.min(cards.length, d.stats.length); i++) {
        var st = d.stats[i];
        var num = cards[i].querySelector('.ar-stat-number');
        if (num) {
          if (st.count) num.setAttribute('data-count', st.count);
          num.textContent = st.display || '';
        }
        var label = cards[i].querySelector('.ar-stat-label');
        if (label && st.label) label.textContent = st.label;
      }
    }
  }

  function injectArCategories(d) {
    var sec = document.querySelector('#arCategories');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);
    if (d.categories) pending.cats = d.categories;
  }

  function injectArSearch(d) {
    var sec = document.querySelector('#arSearch');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);
  }

  function injectArLibrary(d) {
    var sec = document.querySelector('#arLibrary');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);
    if (d.items) pending.items = d.items;
  }

  function injectArDownloads(d) {
    var sec = document.querySelector('#arDownloads');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);
    if (d.items) pending.downloads = d.items;
  }

  function injectArFaq(d) {
    var sec = document.querySelector('#arFaq');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);
    if (d.items) {
      var items = sec.querySelectorAll('.ar-faq-item');
      for (var i = 0; i < Math.min(items.length, d.items.length); i++) {
        var q = items[i].querySelector('.ar-faq-question');
        if (q && d.items[i].question) {
          setTextWithIcon(q, d.items[i].question);
        }
        var a = items[i].querySelector('.ar-faq-answer-inner');
        if (a && d.items[i].answer) a.textContent = d.items[i].answer;
      }
    }
  }

  function injectArCta(d) {
    var sec = document.querySelector('#arCta');
    if (!sec) return;
    var title = sec.querySelector('.ar-cta-inner h2');
    if (title && d.heading) title.textContent = d.heading;
    injectButtons(sec.querySelectorAll('.ar-cta-actions a'), d.buttons);
  }

  var pending = { items: null, cats: null, downloads: null };

  function applyArchiveData() {
    if (pending.items || pending.cats || pending.downloads) {
      if (window.ArchivePage) {
        window.ArchivePage.setData(pending.items, pending.cats, pending.downloads);
        window.ArchivePage.render();
      } else {
        // The page store script may not have run yet — retry briefly.
        setTimeout(applyArchiveData, 50);
      }
    }
  }

  function injectSection(section) {
    if (!section || !section.enabled) return;
    var type = section.type;
    var data = section.data || {};

    if (type === 'hero') return injectHero(data);

    if (type === 'custom') {
      switch (data._renderer) {
        case 'arStats':      return injectArStats(data);
        case 'arCategories': return injectArCategories(data);
        case 'arSearch':     return injectArSearch(data);
        case 'arLibrary':    return injectArLibrary(data);
        case 'arDownloads':  return injectArDownloads(data);
        case 'arFaq':        return injectArFaq(data);
        case 'arCta':        return injectArCta(data);
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
        console.warn('[ARCHIVE CMS] Supabase chain not ready after ' + (MAX_RETRIES * RETRY_MS) + 'ms — falling back to HTML');
        return callback(null);
      }
      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) { setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS); return; }
        console.warn('[ARCHIVE CMS] Supabase client unavailable after ' + (MAX_RETRIES * RETRY_MS) + 'ms — falling back to HTML');
        return callback(null);
      }

      client.from('pages').select('id, title, slug, status').eq('slug', SLUG).eq('status', 'published').single()
        .then(function (r) {
          if (r.error || !r.data) { console.log('[ARCHIVE CMS] Page not found:', SLUG); return callback(null); }
          var page = r.data;
          console.log('[ARCHIVE CMS] Page found:', page.title, page.slug);
          client.from('page_sections').select('id, section_type, content, settings, styles, visible, sort_order')
            .eq('page_id', page.id).eq('visible', true).order('sort_order')
            .then(function (sr) {
              if (sr.error || !sr.data || !sr.data.length) { console.log('[ARCHIVE CMS] No sections'); return callback(null); }
              var rows = sr.data;
              console.log('[ARCHIVE CMS] Loaded', rows.length, 'sections');
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
      console.log('[ARCHIVE CMS] Re-rendering', _lastSections.length, 'CMS sections...');
      for (var i = 0; i < _lastSections.length; i++) injectSection(_lastSections[i]);
      applyArchiveData();
    }
  }

  function init() {
    if (!isArchivePage()) return;
    loadFromSupabase(function (sections) {
      if (sections && sections.length > 0) {
        _lastSections = sections;
        console.log('[ARCHIVE CMS] Rendering', sections.length, 'CMS sections...');
        for (var i = 0; i < sections.length; i++) injectSection(sections[i]);
        applyArchiveData();
        console.log('[ARCHIVE CMS] Rendering complete');
      } else {
        console.log('[ARCHIVE CMS] No CMS sections — HTML fallback');
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
