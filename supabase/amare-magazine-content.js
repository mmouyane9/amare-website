/* ==========================================================================
   خدماتنا — AMARE MAGAZINE Page Content Loader

   Loads the published CMS content for the AMARE Magazine page
   (slug '/amare-magazine') and injects it into the existing page DOM.
   Hardcoded HTML serves as fallback when no CMS content is available.

   ONLY runs on the AMARE MAGAZINE page — the slug is fixed and guarded, so it
   can never render another page's content (and vice versa).

   Images: the magazine page uses SVG placeholders. Each image field is an
   editable URL — when a URL is set, a real <img> replaces the placeholder;
   when empty (default), the placeholder is kept untouched.
   ========================================================================== */

(function () {
  'use strict';

  var SLUG = '/amare-magazine';

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function isMagazinePage() {
    var path = window.location.pathname;
    return /amare-magazine/i.test(path);
  }

  function setEyebrow(sec, text) {
    var el = sec.querySelector('.mag-section-eyebrow');
    if (el && text) {
      var svg = el.querySelector('svg');
      el.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(text);
    }
  }

  function setTitle(sec, text) {
    var el = sec.querySelector('.mag-section-title');
    if (el && text) el.textContent = text;
  }

  function setDesc(sec, text) {
    var el = sec.querySelector('.mag-section-desc');
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

  // Keeps the trailing 'AMARE' word highlighted with the page's accent span.
  function setHeroHeading(h1, heading) {
    var m = String(heading || '').match(/^(.*?\s+)(AMARE)$/i);
    if (m) {
      h1.innerHTML = esc(m[1]) + '<span>' + esc(m[2]) + '</span>';
    } else {
      h1.textContent = heading;
    }
  }

  // Meta items carry an SVG icon — set text while preserving the icon.
  function setMetaText(item, text) {
    if (!item) return;
    var svg = item.querySelector('svg');
    item.textContent = text || '';
    if (svg) item.insertBefore(svg, item.firstChild);
  }

  // Replace the SVG placeholder with a real <img> when a URL is set.
  function setImage(container, url) {
    if (!container) return;
    var src = String(url || '').trim();
    if (!src) return;
    var placeholder = container.querySelector(
      '.mag-featured-image-placeholder, .mag-article-image-placeholder'
    );
    var img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.loading = 'lazy';
    if (placeholder) container.removeChild(placeholder);
    container.appendChild(img);
  }

  function injectHero(d) {
    var h1 = document.querySelector('.mag-hero h1');
    if (h1 && d.heading) setHeroHeading(h1, d.heading);
    var sub = document.querySelector('.mag-hero-subtitle');
    if (sub && d.description) sub.textContent = d.description;
    injectButtons(document.querySelectorAll('.mag-hero-actions a'), d.buttons);
  }

  function injectMagFeatured(d) {
    var sec = document.querySelector('#magFeatured');
    if (!sec) return;
    var body = sec.querySelector('.mag-featured-body');
    if (!body) return;
    var badge = body.querySelector('.mag-badge');
    if (badge && d.badge) badge.textContent = d.badge;
    var h2 = body.querySelector('h2');
    if (h2 && d.heading) h2.textContent = d.heading;
    var excerpt = body.querySelector('.mag-excerpt');
    if (excerpt && d.excerpt) excerpt.textContent = d.excerpt;
    var meta = body.querySelectorAll('.mag-meta-item');
    if (meta[0] && d.date) setMetaText(meta[0], d.date);
    if (meta[1] && d.readTime) setMetaText(meta[1], d.readTime);
    var more = body.querySelector('.mag-read-more');
    if (more) {
      if (d.linkUrl) more.href = d.linkUrl;
      if (d.linkLabel) {
        var svg = more.querySelector('svg');
        more.textContent = d.linkLabel;
        if (svg) more.appendChild(svg);
      }
    }
    setImage(sec.querySelector('.mag-featured-image'), d.image);
  }

  function injectMagLatest(d) {
    var sec = document.querySelector('#magLatest');
    if (!sec) return;
    setEyebrow(sec, d.eyebrow);
    setTitle(sec, d.heading);
    setDesc(sec, d.description);
    if (d.articles) {
      var cards = sec.querySelectorAll('.mag-article-card');
      for (var i = 0; i < Math.min(cards.length, d.articles.length); i++) {
        var a = d.articles[i];
        var card = cards[i];
        var badge = card.querySelector('.mag-badge');
        if (badge && a.badge) badge.textContent = a.badge;
        var h3 = card.querySelector('h3');
        if (h3 && a.title) h3.textContent = a.title;
        var excerpt = card.querySelector('.mag-excerpt');
        if (excerpt && a.excerpt) excerpt.textContent = a.excerpt;
        var meta = card.querySelectorAll('.mag-meta-item');
        if (meta[0] && a.date) setMetaText(meta[0], a.date);
        if (meta[1] && a.readTime) setMetaText(meta[1], a.readTime);
        var more = card.querySelector('.mag-read-more');
        if (more && a.linkUrl) more.href = a.linkUrl;
        setImage(card.querySelector('.mag-article-image'), a.image);
      }
    }
  }

  function injectMagCats(d) {
    var sec = document.querySelector('#magCats');
    if (!sec) return;
    setEyebrow(sec, d.eyebrow);
    setTitle(sec, d.heading);
    setDesc(sec, d.description);
    if (d.categories) {
      var cards = sec.querySelectorAll('.mag-cat-card');
      for (var i = 0; i < Math.min(cards.length, d.categories.length); i++) {
        var c = d.categories[i];
        var h3 = cards[i].querySelector('h3');
        var count = cards[i].querySelector('.mag-cat-count');
        if (h3 && c.title) h3.textContent = c.title;
        if (count && c.count) count.textContent = c.count;
      }
    }
  }

  function injectMagNewsletter(d) {
    var sec = document.querySelector('#magNewsletter');
    if (!sec) return;
    var h2 = sec.querySelector('.mag-newsletter-inner h2');
    if (h2 && d.heading) h2.textContent = d.heading;
    var desc = sec.querySelector('.mag-newsletter-desc');
    if (desc && d.description) desc.textContent = d.description;
    var btn = sec.querySelector('.mag-newsletter-form button');
    if (btn && d.buttonLabel) {
      var svg = btn.querySelector('svg');
      btn.textContent = d.buttonLabel;
      if (svg) btn.appendChild(svg);
    }
  }

  function injectMagCta(d) {
    var sec = document.querySelector('#magCta');
    if (!sec) return;
    var h2 = sec.querySelector('.mag-cta-inner h2');
    if (h2 && d.heading) h2.textContent = d.heading;
    injectButtons(sec.querySelectorAll('.mag-cta-actions a'), d.buttons);
  }

  function injectSection(section) {
    if (!section || !section.enabled) return;
    var type = section.type;
    var data = section.data || {};

    if (type === 'hero') return injectHero(data);

    if (type === 'custom') {
      switch (data._renderer) {
        case 'magFeatured':   return injectMagFeatured(data);
        case 'magLatest':     return injectMagLatest(data);
        case 'magCats':       return injectMagCats(data);
        case 'magNewsletter': return injectMagNewsletter(data);
        case 'magCta':        return injectMagCta(data);
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
        console.warn('[MAGAZINE CMS] Supabase chain not ready after ' + (MAX_RETRIES * RETRY_MS) + 'ms — falling back to HTML');
        return callback(null);
      }
      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) { setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS); return; }
        console.warn('[MAGAZINE CMS] Supabase client unavailable after ' + (MAX_RETRIES * RETRY_MS) + 'ms — falling back to HTML');
        return callback(null);
      }

      client.from('pages').select('id, title, slug, status').eq('slug', SLUG).eq('status', 'published').single()
        .then(function (r) {
          if (r.error || !r.data) { console.log('[MAGAZINE CMS] Page not found:', SLUG); return callback(null); }
          var page = r.data;
          console.log('[MAGAZINE CMS] Page found:', page.title, page.slug);
          client.from('page_sections').select('id, section_type, content, settings, styles, visible, sort_order')
            .eq('page_id', page.id).eq('visible', true).order('sort_order')
            .then(function (sr) {
              if (sr.error || !sr.data || !sr.data.length) { console.log('[MAGAZINE CMS] No sections'); return callback(null); }
              var rows = sr.data;
              console.log('[MAGAZINE CMS] Loaded', rows.length, 'sections');
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
    if (!isMagazinePage()) return;
    loadFromSupabase(function (sections) {
      if (sections && sections.length > 0) {
        console.log('[MAGAZINE CMS] Rendering', sections.length, 'CMS sections...');
        for (var i = 0; i < sections.length; i++) injectSection(sections[i]);
        console.log('[MAGAZINE CMS] Rendering complete');
      } else {
        console.log('[MAGAZINE CMS] No CMS sections — HTML fallback');
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
