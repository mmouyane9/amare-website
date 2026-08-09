/* ==========================================================================
   انخرط معنا — وثائق الانخراط Page Content Loader

   Loads the published CMS content for the Documents page
   (slug '/documents') and injects it into the existing page DOM.
   Hardcoded HTML serves as fallback when no CMS content is available.

   ONLY runs on the DOCUMENTS page — the slug is fixed and guarded, so it
   can never render another page's content (and vice versa).

   Icons: the page uses FontAwesome <i> icons. Every text injection preserves
   the existing <i> icon inside the element (same technique as the SVG
   preservation used by the other page loaders).

   Images: the page has NO content images (only the shared navbar/footer
   logo), so there are no image fields and no image handling in this loader.
   ========================================================================== */

(function () {
  'use strict';

  var SLUG = '/documents';

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function isDocumentsPage() {
    var path = window.location.pathname;
    return /documents/i.test(path);
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
    var e = sec.querySelector('.section-head .eyebrow');
    if (e && eyebrow) e.textContent = eyebrow;
    var t = sec.querySelector('.section-head .section-title');
    if (t && heading) t.textContent = heading;
    var d = sec.querySelector('.section-head .section-desc');
    if (d && description) d.textContent = description;
  }

  function injectHero(d) {
    var h1 = document.querySelector('.doc-hero-title');
    if (h1) setTitleWithEm(h1, d.heading, d.headingEm);
    var eyebrow = document.querySelector('.doc-hero-eyebrow');
    if (eyebrow && d.subheading) setTextWithIcon(eyebrow, d.subheading);
    var desc = document.querySelector('.doc-hero-desc');
    if (desc && d.description) desc.textContent = d.description;
    injectButtons(document.querySelectorAll('.doc-hero-actions a'), d.buttons);
  }

  function injectButtons(anchors, buttons) {
    if (!buttons || !buttons.length) return;
    for (var i = 0; i < anchors.length; i++) {
      if (!buttons[i]) continue;
      anchors[i].href = buttons[i].url || '#';
      setTextWithIcon(anchors[i], buttons[i].label);
    }
  }

  function injectDocGrid(d) {
    var sec = document.querySelector('#doc-grid');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);
    if (d.documents) {
      var cards = sec.querySelectorAll('.doc-card');
      for (var i = 0; i < Math.min(cards.length, d.documents.length); i++) {
        var doc = d.documents[i];
        var card = cards[i];
        var title = card.querySelector('.doc-card-title');
        if (title && doc.title) title.textContent = doc.title;
        var desc = card.querySelector('.doc-card-desc');
        if (desc && doc.description) desc.textContent = doc.description;
        var badge = card.querySelector('.doc-card-badge');
        if (badge && doc.format) {
          var icon = badge.querySelector('i, svg');
          badge.textContent = doc.format;
          if (icon) badge.insertBefore(icon, badge.firstChild);
          badge.className = 'doc-card-badge doc-card-badge-' + String(doc.format).toLowerCase();
        }
        var info = card.querySelectorAll('.doc-card-info');
        if (info[0] && doc.size) setTextWithIcon(info[0], doc.size);
        if (info[1] && doc.date) setTextWithIcon(info[1], doc.date);
        var btn = card.querySelector('.doc-card-btn');
        if (btn) {
          btn.href = doc.url || '#';
          setTextWithIcon(btn, doc.buttonLabel);
        }
      }
    }
  }

  function injectDocDownload(d) {
    var sec = document.querySelector('#doc-download');
    if (!sec) return;
    var title = sec.querySelector('.doc-download-title');
    if (title && d.heading) title.textContent = d.heading;
    var desc = sec.querySelector('.doc-download-desc');
    if (desc && d.description) desc.textContent = d.description;
    var btn = sec.querySelector('.doc-download-btn');
    if (btn) {
      btn.href = d.url || '#';
      setTextWithIcon(btn, d.buttonLabel);
    }
  }

  function injectDocRequirements(d) {
    var sec = document.querySelector('#doc-requirements');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);
    if (d.items) {
      var items = sec.querySelectorAll('.doc-checklist-text');
      for (var i = 0; i < Math.min(items.length, d.items.length); i++) {
        items[i].textContent = d.items[i];
      }
    }
  }

  function injectDocFaq(d) {
    var sec = document.querySelector('#doc-faq');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);
    if (d.items) {
      var items = sec.querySelectorAll('.doc-faq-item');
      for (var i = 0; i < Math.min(items.length, d.items.length); i++) {
        var q = items[i].querySelector('.doc-faq-question > span:first-child');
        if (q && d.items[i].question) q.textContent = d.items[i].question;
        var a = items[i].querySelector('.doc-faq-answer p');
        if (a && d.items[i].answer) a.textContent = d.items[i].answer;
      }
    }
  }

  function injectDocCta(d) {
    var sec = document.querySelector('#doc-cta');
    if (!sec) return;
    var title = sec.querySelector('.doc-cta-title');
    if (title) setTitleWithEm(title, d.heading, d.headingEm);
    var desc = sec.querySelector('.doc-cta-desc');
    if (desc && d.description) desc.textContent = d.description;
    injectButtons(sec.querySelectorAll('.doc-cta-actions a'), d.buttons);
  }

  function injectSection(section) {
    if (!section || !section.enabled) return;
    var type = section.type;
    var data = section.data || {};

    if (type === 'hero') return injectHero(data);

    if (type === 'custom') {
      switch (data._renderer) {
        case 'docGrid':         return injectDocGrid(data);
        case 'docDownload':     return injectDocDownload(data);
        case 'docRequirements': return injectDocRequirements(data);
        case 'docFaq':          return injectDocFaq(data);
        case 'docCta':          return injectDocCta(data);
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
        console.warn('[DOCUMENTS CMS] Supabase chain not ready after ' + (MAX_RETRIES * RETRY_MS) + 'ms — falling back to HTML');
        return callback(null);
      }
      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) { setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS); return; }
        console.warn('[DOCUMENTS CMS] Supabase client unavailable after ' + (MAX_RETRIES * RETRY_MS) + 'ms — falling back to HTML');
        return callback(null);
      }

      client.from('pages').select('id, title, slug, status').eq('slug', SLUG).eq('status', 'published').single()
        .then(function (r) {
          if (r.error || !r.data) { console.log('[DOCUMENTS CMS] Page not found:', SLUG); return callback(null); }
          var page = r.data;
          console.log('[DOCUMENTS CMS] Page found:', page.title, page.slug);
          client.from('page_sections').select('id, section_type, content, settings, styles, visible, sort_order')
            .eq('page_id', page.id).eq('visible', true).order('sort_order')
            .then(function (sr) {
              if (sr.error || !sr.data || !sr.data.length) { console.log('[DOCUMENTS CMS] No sections'); return callback(null); }
              var rows = sr.data;
              console.log('[DOCUMENTS CMS] Loaded', rows.length, 'sections');
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
    if (!isDocumentsPage()) return;
    loadFromSupabase(function (sections) {
      if (sections && sections.length > 0) {
        console.log('[DOCUMENTS CMS] Rendering', sections.length, 'CMS sections...');
        for (var i = 0; i < sections.length; i++) injectSection(sections[i]);
        console.log('[DOCUMENTS CMS] Rendering complete');
      } else {
        console.log('[DOCUMENTS CMS] No CMS sections — HTML fallback');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
