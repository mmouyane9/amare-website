/* ==========================================================================
   شركاؤنا — Unified Partner Page Content Loader

   Loads CMS content for ALL 6 partner pages. Each partner page includes
   this script; the loader auto-detects which partner from the page slug.

   Architecture:
     1. Detect partner slug from the page URL
     2. Load page WHERE slug = partnerSlug AND status = 'published'
     3. Load page_sections WHERE page_id = partnerPage.id AND visible = true
     4. Inject hero, about, contact info, and CTA into the DOM
     5. Hardcoded HTML serves as fallback
   ========================================================================== */

(function () {
  'use strict';

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function el(selector) {
    return document.querySelector(selector);
  }

  /* ------------------------------------------------------------------
     Auto-detect partner slug from the page URL
     ------------------------------------------------------------------ */
  function detectSlug() {
    var path = window.location.pathname;
    // /Our%20partners/lefouilleurma.html -> /partners/lefouilleurma
    var match = path.match(/\/Our[^/]*\/([^.]+)/i) || path.match(/\/partners\/([^/.]+)/i);
    if (match) return '/partners/' + match[1];
    // Fallback: try from the filename
    var file = (path.split('/').pop() || '').replace('.html', '');
    return '/partners/' + file;
  }

  /* ------------------------------------------------------------------
     HERO injector
     ------------------------------------------------------------------ */
  function injectHero(d) {
    var badge = el('.pr-hero-badge');
    if (badge && d.subheading) {
      var svg = badge.querySelector('svg');
      badge.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(d.subheading);
    }

    var h1 = el('.pr-hero h1 span');
    if (!h1) h1 = el('.pr-hero h1');
    if (h1 && d.heading) h1.textContent = d.heading;

    var sub = el('.pr-hero-subtitle');
    if (sub && d.description) sub.textContent = d.description;

    var anchors = document.querySelectorAll('.pr-hero-actions a');
    if (d.buttons) {
      for (var i = 0; i < anchors.length; i++) {
        var a = anchors[i], b = d.buttons[i];
        if (b) {
          a.href = b.url || '#';
          var svg = a.querySelector('svg');
          a.textContent = b.label || '';
          if (svg) a.appendChild(svg);
        }
      }
    } else if (d.buttonUrl || d.buttonLabel) {
      // Single button fallback
      var a0 = anchors[0];
      if (a0 && d.buttonLabel) {
        a0.href = d.buttonUrl || '#';
        var s0 = a0.querySelector('svg');
        a0.textContent = d.buttonLabel;
        if (s0) a0.appendChild(s0);
      }
    }
  }

  /* ------------------------------------------------------------------
     ABOUT injector
     ------------------------------------------------------------------ */
  function injectPartnerAbout(d) {
    var eyebrow = el('.pr-about-text .pr-section-eyebrow');
    if (eyebrow && d.eyebrow) {
      var svg = eyebrow.querySelector('svg');
      eyebrow.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(d.eyebrow);
    }

    if (d.paragraphs) {
      var aboutParas = document.querySelectorAll('.pr-about-text p');
      for (var i = 0; i < Math.min(aboutParas.length, d.paragraphs.length); i++) {
        aboutParas[i].textContent = d.paragraphs[i];
      }
    }
  }

  /* ------------------------------------------------------------------
     CONTACT injector
     ------------------------------------------------------------------ */
  function injectPartnerContact(d) {
    // Contact cards: email, phone, website, address (in this order)
    var cards = document.querySelectorAll('.pr-contact-card');
    var values = [d.email, d.phone, d.website, d.address];
    for (var i = 0; i < Math.min(cards.length, values.length); i++) {
      var p = cards[i].querySelector('p');
      if (p && values[i]) p.textContent = values[i];
    }
  }

  /* ------------------------------------------------------------------
     CTA injector
     ------------------------------------------------------------------ */
  function injectPartnerCta(d) {
    var h2 = el('#prCta h2');
    if (h2 && d.heading) h2.textContent = d.heading;

    var btn = el('#prCta .pr-cta-actions a');
    if (btn && d.buttonLabel) {
      btn.href = d.buttonUrl || '#';
      var svg = btn.querySelector('svg');
      btn.textContent = d.buttonLabel;
      if (svg) btn.appendChild(svg);
    }
  }

  /* ------------------------------------------------------------------
     Dispatch
     ------------------------------------------------------------------ */
  function injectSection(section) {
    if (!section || !section.enabled) return;
    var type = section.type;
    var data = section.data || {};

    if (type === 'hero') return injectHero(data);
    if (type === 'cta') return injectPartnerCta(data);

    if (type === 'custom') {
      switch (data._renderer) {
        case 'partnerAbout':   return injectPartnerAbout(data);
        case 'partnerContact': return injectPartnerContact(data);
        case 'partnerCta':     return injectPartnerCta(data);
      }
    }

    console.log('[Partner CMS] Unhandled:', type, data._renderer);
  }

  /* ------------------------------------------------------------------
     Supabase fetch
     ------------------------------------------------------------------ */
  function loadFromSupabase(callback) {
    var slug = detectSlug();
    console.log('[Partner CMS] Detected slug:', slug);

    var MAX_RETRIES = 30;
    var RETRY_MS = 200;

    function tryLoad(retries) {
      var S = window.Supabase;
      if (!S || !S.getClient) {
        if (retries < MAX_RETRIES) { setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS); return; }
        return callback(null);
      }
      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) { setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS); return; }
        return callback(null);
      }

      client
        .from('pages')
        .select('id, title, slug, status')
        .eq('slug', slug)
        .eq('status', 'published')
        .single()
        .then(function (pageResult) {
          if (pageResult.error || !pageResult.data) {
            console.log('[Partner CMS] Page not found or not published:', slug);
            return callback(null);
          }
          var page = pageResult.data;
          console.log('[Partner CMS] Page found:', page.title, page.slug);

          client
            .from('page_sections')
            .select('id, section_type, content, settings, styles, visible, sort_order')
            .eq('page_id', page.id)
            .eq('visible', true)
            .order('sort_order', { ascending: true })
            .then(function (sectionsResult) {
              if (sectionsResult.error || !sectionsResult.data || !sectionsResult.data.length) {
                console.log('[Partner CMS] No sections found');
                return callback(null);
              }
              var rows = sectionsResult.data;
              console.log('[Partner CMS] Loaded', rows.length, 'sections');

              var sections = [];
              for (var i = 0; i < rows.length; i++) {
                var row = rows[i], data = {};
                var content = row.content || {};
                var settings = row.settings || {};
                for (var ck in content) { if (Object.prototype.hasOwnProperty.call(content, ck)) data[ck] = content[ck]; }
                for (var sk in settings) { if (Object.prototype.hasOwnProperty.call(settings, sk)) data[sk] = settings[sk]; }
                sections.push({ id: row.id, type: row.section_type, enabled: row.visible, order: row.sort_order, data: data });
              }
              return callback(sections);
            })
            .catch(function () { return callback(null); });
        })
        .catch(function () { return callback(null); });
    }
    tryLoad(0);
  }

  /* ------------------------------------------------------------------
     Bootstrap
     ------------------------------------------------------------------ */
  function init() {
    console.log('[Partner CMS] Starting...');
    loadFromSupabase(function (sections) {
      if (sections && sections.length > 0) {
        console.log('[Partner CMS] Rendering', sections.length, 'CMS sections...');
        for (var i = 0; i < sections.length; i++) { injectSection(sections[i]); }
        console.log('[Partner CMS] Rendering complete');
      } else {
        console.log('[Partner CMS] No CMS sections — using HTML fallback');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
