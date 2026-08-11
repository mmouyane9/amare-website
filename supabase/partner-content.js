/* ==========================================================================
   شركاؤنا — Unified Partner Page Content Loader (8 sections)

   Auto-detects which partner from the page URL.
   Injects hero, about, services, benefits, gallery, contact, form, CTA.
   Hardcoded HTML serves as fallback.
   ========================================================================== */

(function () {
  'use strict';

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function detectSlug() {
    var path = window.location.pathname;
    var match = path.match(/\/Our[^/]*\/([^.]+)/i) || path.match(/\/partners\/([^/.]+)/i);
    var raw = match ? match[1] : (path.split('/').pop() || '').replace('.html', '');
    var MAP = { 'senotec': '/partners/scnotce', 'association-detection-centre': '/partners/detection-centre' };
    if (MAP[raw]) return MAP[raw];
    return '/partners/' + raw;
  }

  /* ------------------------------------------------------------------ */
  function injectHero(d) {
    var badge = document.querySelector('.pr-hero-badge');
    if (badge && d.subheading) {
      var svg = badge.querySelector('svg');
      badge.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(d.subheading);
    }
    var h1 = document.querySelector('.pr-hero h1 span') || document.querySelector('.pr-hero h1');
    if (h1 && d.heading) h1.textContent = d.heading;
    var sub = document.querySelector('.pr-hero-subtitle');
    if (sub && d.description) sub.textContent = d.description;
    var anchors = document.querySelectorAll('.pr-hero-actions a, .pr-cta-actions a');
    if (d.buttons && d.buttons.length) {
      for (var i = 0; i < anchors.length; i++) {
        if (d.buttons[i]) {
          anchors[i].href = d.buttons[i].url || '#';
          var svg = anchors[i].querySelector('svg');
          anchors[i].textContent = d.buttons[i].label || '';
          if (svg) anchors[i].appendChild(svg);
        }
      }
    }
  }

  function injectPartnerAbout(d) {
    var eyebrow = document.querySelector('.pr-about-text .pr-section-eyebrow');
    if (eyebrow && d.eyebrow) {
      var svg = eyebrow.querySelector('svg');
      eyebrow.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(d.eyebrow);
    }
    var heading = document.querySelector('.pr-about-text h2');
    if (heading && d.heading) heading.textContent = d.heading;
    if (d.paragraphs) {
      var paras = document.querySelectorAll('.pr-about-text p');
      for (var i = 0; i < Math.min(paras.length, d.paragraphs.length); i++) {
        paras[i].textContent = d.paragraphs[i];
      }
    }
    if (d.image) {
      var aboutImg = document.querySelector('.pr-about-img');
      if (aboutImg) {
        aboutImg.innerHTML = '<img src="' + esc(d.image) + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:18px" />';
      }
    }
  }

  function injectPartnerServices(d) {
    var sec = document.querySelector('#prServices');
    if (!sec) return;
    var eyebrow = sec.querySelector('.pr-section-eyebrow');
    if (eyebrow && d.eyebrow) {
      var svg = eyebrow.querySelector('svg');
      eyebrow.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(d.eyebrow);
    }
    var h2 = sec.querySelector('.pr-section-title');
    if (h2 && d.heading) h2.textContent = d.heading;
    var desc = sec.querySelector('.pr-section-desc');
    if (desc && d.description) desc.textContent = d.description;
    if (d.cards) {
      var cards = sec.querySelectorAll('.pr-service-card');
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var h3 = cards[i].querySelector('h3');
        var p = cards[i].querySelector('p');
        if (h3) h3.textContent = d.cards[i].title || '';
        if (p) p.textContent = d.cards[i].description || '';
      }
    }
  }

  function injectPartnerWhy(d) {
    var sec = document.querySelector('#prWhy');
    if (!sec) return;
    var eyebrow = sec.querySelector('.pr-section-eyebrow');
    if (eyebrow && d.eyebrow) {
      var svg = eyebrow.querySelector('svg');
      eyebrow.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(d.eyebrow);
    }
    var h2 = sec.querySelector('.pr-section-title');
    if (h2 && d.heading) h2.textContent = d.heading;
    var desc = sec.querySelector('.pr-section-desc');
    if (desc && d.description) desc.textContent = d.description;
    if (d.cards) {
      var cards = sec.querySelectorAll('.pr-why-card');
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var h3 = cards[i].querySelector('h3');
        var p = cards[i].querySelector('p');
        if (h3) h3.textContent = d.cards[i].title || '';
        if (p) p.textContent = d.cards[i].description || '';
      }
    }
  }

  function injectPartnerGallery(d) {
    var sec = document.querySelector('#prGallery');
    if (!sec) return;
    var eyebrow = sec.querySelector('.pr-section-eyebrow');
    if (eyebrow && d.eyebrow) {
      var svg = eyebrow.querySelector('svg');
      eyebrow.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(d.eyebrow);
    }
    var h2 = sec.querySelector('.pr-section-title');
    if (h2 && d.heading) h2.textContent = d.heading;
    var desc = sec.querySelector('.pr-section-desc');
    if (desc && d.description) desc.textContent = d.description;
    if (d.images) {
      var items = sec.querySelectorAll('.pr-gallery-item');
      for (var i = 0; i < Math.min(items.length, d.images.length); i++) {
        var url = (typeof d.images[i] === 'string') ? d.images[i] : (d.images[i] && d.images[i].url);
        if (url) {
          var placeholder = items[i].querySelector('.pr-gallery-placeholder');
          if (placeholder) {
            placeholder.innerHTML = '<img src="' + esc(url) + '" alt="" style="width:100%;height:100%;object-fit:cover" />';
          }
        }
      }
    }
  }

  function injectPartnerContact(d) {
    var sec = document.querySelector('#prContactInfo');
    if (!sec) return;
    var h2 = sec.querySelector('.pr-section-title');
    if (h2 && d.heading) h2.textContent = d.heading;
    var desc = sec.querySelector('.pr-section-desc');
    if (desc && d.description) desc.textContent = d.description;
    var cards = sec.querySelectorAll('.pr-contact-card');
    var values = [d.email, d.phone, d.website, d.address];
    for (var i = 0; i < Math.min(cards.length, values.length); i++) {
      var p = cards[i].querySelector('p');
      if (p && values[i]) p.textContent = values[i];
    }
  }

  function injectPartnerForm(d) {
    var sec = document.querySelector('#prForm');
    if (!sec) return;
    var h2 = sec.querySelector('.pr-section-title');
    if (h2 && d.heading) h2.textContent = d.heading;
    var desc = sec.querySelector('.pr-section-desc');
    if (desc && d.description) desc.textContent = d.description;
  }

  function injectPartnerCta(d) {
    var sec = document.querySelector('#prCta');
    if (!sec) return;
    var h2 = sec.querySelector('h2');
    if (h2 && d.heading) h2.textContent = d.heading;
    if (d.buttons && d.buttons.length) {
      var anchors = sec.querySelectorAll('.pr-cta-actions a');
      for (var i = 0; i < anchors.length; i++) {
        if (d.buttons[i]) {
          anchors[i].href = d.buttons[i].url || '#';
          var svg = anchors[i].querySelector('svg');
          anchors[i].textContent = d.buttons[i].label || '';
          if (svg) anchors[i].appendChild(svg);
        }
      }
    }
  }

  /* ------------------------------------------------------------------ */
  function injectSection(section) {
    if (!section || !section.enabled) return;
    var type = section.type;
    var data = section.data || {};

    if (type === 'hero') return injectHero(data);
    if (type === 'cta') return injectPartnerCta(data);

    if (type === 'custom') {
      switch (data._renderer) {
        case 'partnerAbout':   return injectPartnerAbout(data);
        case 'partnerServices': return injectPartnerServices(data);
        case 'partnerWhy':     return injectPartnerWhy(data);
        case 'partnerGallery': return injectPartnerGallery(data);
        case 'partnerContact': return injectPartnerContact(data);
        case 'partnerForm':    return injectPartnerForm(data);
        case 'partnerCta':     return injectPartnerCta(data);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  var _lastSections = null;

  function loadFromSupabase(callback) {
    var slug = detectSlug();
    var MAX_RETRIES = 30, RETRY_MS = 200;

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

      client.from('pages').select('id, title, slug, status').eq('slug', slug).eq('status', 'published').single()
        .then(function (r) {
          if (r.error || !r.data) { console.log('[Partner CMS] Page not found:', slug); return callback(null); }
          var page = r.data;
          console.log('[Partner CMS] Page found:', page.title, page.slug);
          client.from('page_sections').select('id, section_type, content, settings, styles, visible, sort_order')
            .eq('page_id', page.id).eq('visible', true).order('sort_order')
            .then(function (sr) {
              if (sr.error || !sr.data || !sr.data.length) { console.log('[Partner CMS] No sections'); return callback(null); }
              var rows = sr.data;
              console.log('[Partner CMS] Loaded', rows.length, 'sections');
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
      console.log('[Partner CMS] Re-rendering', _lastSections.length, 'CMS sections...');
      for (var i = 0; i < _lastSections.length; i++) injectSection(_lastSections[i]);
    }
  }

  function init() {
    loadFromSupabase(function (sections) {
      if (sections && sections.length > 0) {
        _lastSections = sections;
        console.log('[Partner CMS] Rendering', sections.length, 'CMS sections...');
        for (var i = 0; i < sections.length; i++) injectSection(sections[i]);
        console.log('[Partner CMS] Rendering complete');
      } else {
        console.log('[Partner CMS] No CMS sections — HTML fallback');
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
