/* ==========================================================================
   Our Mission — Content Service
   Loads page sections from Supabase and injects into the DOM.
   Slug: /Who%20are%20we/our-mission.html
   ========================================================================== */

(function () {
  'use strict';

  var PAGE_SLUG = '/Who%20are%20we/our-mission.html';

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function el(selector) { return document.querySelector(selector); }
  function els(selector) { return document.querySelectorAll(selector); }

  /* ------------------------------------------------------------------
     HERO — badge, h1 + span, description, buttons
     ------------------------------------------------------------------ */
  function injectHero(d) {
    var badge = el('.nv-hero-badge');
    if (badge) {
      var svg = badge.querySelector('svg');
      badge.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(d.subheading || '');
    }

    var h1 = el('.nv-hero-content h1');
    if (h1) {
      var heading = d.heading || '';
      var words = heading.split(' ');
      var last = words.pop();
      h1.innerHTML = esc(words.join(' ')) + ' <span>' + esc(last) + '</span>';
    }

    var desc = el('.nv-hero-content p.hero-fade');
    if (desc && d.description) desc.textContent = d.description;

    var actions = el('.nv-hero-actions');
    if (actions && d.buttons) {
      var anchors = actions.querySelectorAll('a');
      for (var j = 0; j < Math.min(anchors.length, d.buttons.length); j++) {
        var a = anchors[j], b = d.buttons[j];
        if (!b.label) { a.style.display = 'none'; continue; }
        a.style.display = '';
        a.href = b.url || '#';
        var svgs = a.querySelectorAll('svg'), svgHtml = '';
        for (var k = 0; k < svgs.length; k++) svgHtml += svgs[k].outerHTML;
        a.innerHTML = esc(b.label) + ' ' + svgHtml;
      }
    }
  }

  /* ------------------------------------------------------------------
     MISSION STATEMENT — eyebrow, heading, lead paragraph
     ------------------------------------------------------------------ */
  function injectMissionStatement(d) {
    var eyebrow = el('.om-mission-inner .eyebrow');
    if (eyebrow && d.eyebrow) eyebrow.textContent = d.eyebrow;

    var title = el('.om-mission-title');
    if (title && d.heading) title.textContent = d.heading;

    var lead = el('.om-mission-lead');
    if (lead && d.description) lead.textContent = d.description;
  }

  /* ------------------------------------------------------------------
     PILLARS — section-head + 4 pillar cards
     ------------------------------------------------------------------ */
  function injectPillars(d) {
    var eyebrow = el('#omPillars .section-head .eyebrow');
    if (eyebrow && d.eyebrow) eyebrow.textContent = d.eyebrow;

    var title = el('#omPillars .section-title');
    if (title && d.heading) title.textContent = d.heading;

    var desc = el('#omPillars .section-desc');
    if (desc && d.description) desc.textContent = d.description;

    var cards = els('.om-pillar-card');
    if (d.cards) {
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var h3 = cards[i].querySelector('h3');
        var p = cards[i].querySelector('p');
        if (h3) h3.textContent = d.cards[i].heading || '';
        if (p) p.textContent = d.cards[i].description || '';
      }
    }
  }

  /* ------------------------------------------------------------------
     HOW WE ACHIEVE — section-head, image, floating highlights, checklist
     ------------------------------------------------------------------ */
  function injectApproach(d) {
    var eyebrow = el('#omApproach .section-head .eyebrow');
    if (eyebrow && d.eyebrow) eyebrow.textContent = d.eyebrow;

    var title = el('#omApproach .section-title');
    if (title && d.heading) title.textContent = d.heading;

    var desc = el('#omApproach .section-desc');
    if (desc && d.description) desc.textContent = d.description;

    var img = el('.om-approach-frame img');
    if (img && d.image) {
      img.src = d.image.url || '';
      img.alt = d.image.alt || '';
    }

    var floats = els('.om-approach-float');
    if (d.highlights) {
      for (var f = 0; f < Math.min(floats.length, d.highlights.length); f++) {
        var strong = floats[f].querySelector('strong');
        if (strong) strong.textContent = d.highlights[f].label || '';
      }
    }

    var checks = els('.om-check');
    if (d.checklist) {
      for (var c = 0; c < Math.min(checks.length, d.checklist.length); c++) {
        var h3 = checks[c].querySelector('h3');
        var p = checks[c].querySelector('p');
        if (h3) h3.textContent = d.checklist[c].heading || '';
        if (p) p.textContent = d.checklist[c].description || '';
      }
    }
  }

  /* ------------------------------------------------------------------
     QUOTE — blockquote + figcaption
     ------------------------------------------------------------------ */
  function injectQuote(d) {
    var blockquote = el('.om-quote-inner blockquote');
    if (blockquote && d.quote) blockquote.textContent = '«' + d.quote + '»';

    var figcaption = el('.om-quote-inner figcaption');
    if (figcaption && d.attribution) {
      var rule = figcaption.querySelector('.om-quote-rule');
      figcaption.innerHTML = (rule ? rule.outerHTML + ' ' : '') + esc(d.attribution);
    }
  }

  /* ------------------------------------------------------------------
     CTA — heading, description, buttons
     ------------------------------------------------------------------ */
  function injectCta(d) {
    var h2 = el('.om-cta-inner h2');
    if (h2 && d.heading) h2.textContent = d.heading;

    var p = el('.om-cta-inner p');
    if (p && d.description) p.textContent = d.description;

    var actions = el('.om-cta-actions');
    if (actions) {
      var anchors = actions.querySelectorAll('a');
      if (anchors.length > 0 && d.buttonLabel) {
        anchors[0].href = d.buttonUrl || '#';
        var svgs0 = anchors[0].querySelectorAll('svg'), svgHtml0 = '';
        for (var k = 0; k < svgs0.length; k++) svgHtml0 += svgs0[k].outerHTML;
        anchors[0].innerHTML = esc(d.buttonLabel) + ' ' + svgHtml0;
      }
    }
  }

  /* ------------------------------------------------------------------
     FOOTER — brand, social, quick links, programs, contact, map, copyright
     ------------------------------------------------------------------ */
  function injectFooter(d) {
    var brandName = el('.footer-brand .brand-name');
    if (brandName && d.brandName) brandName.textContent = d.brandName;

    var brandLogo = el('.footer-brand .brand-mark img');
    if (brandLogo && d.brandLogo) brandLogo.src = d.brandLogo;

    var desc = el('.footer-about p');
    if (desc && d.description) desc.textContent = d.description;

    var socialAnchors = els('.footer-social a');
    if (d.socialLinks) {
      for (var s = 0; s < Math.min(socialAnchors.length, d.socialLinks.length); s++) {
        socialAnchors[s].href = d.socialLinks[s].url || '#';
      }
    }

    var quickNavs = els('.footer nav');
    var quickUl = null, programsUl = null;
    for (var qn = 0; qn < quickNavs.length; qn++) {
      var navH4 = quickNavs[qn].querySelector('h4');
      if (navH4) {
        if (navH4.textContent.indexOf('روابط سريعة') !== -1) {
          if (d.quickLinksHeading) navH4.textContent = d.quickLinksHeading;
          quickUl = quickNavs[qn].querySelector('ul');
        }
        if (navH4.textContent.indexOf('برامجنا') !== -1) {
          if (d.programsHeading) navH4.textContent = d.programsHeading;
          programsUl = quickNavs[qn].querySelector('ul');
        }
      }
    }
    injectLinkList(quickUl, d.quickLinks);
    injectLinkList(programsUl, d.programs);

    var contactH4 = el('.footer-contact');
    if (contactH4) {
      var contactParent = contactH4.parentElement;
      var contactHeading = contactParent ? contactParent.querySelector('h4') : null;
      if (contactHeading && d.contactHeading) contactHeading.textContent = d.contactHeading;
      var contactLis = contactH4.querySelectorAll('li');
      if (d.contact && contactLis.length >= 3) {
        var s0 = contactLis[0].querySelectorAll('span');
        if (s0.length > 0) s0[s0.length - 1].textContent = d.contact.address || '';
        var s1 = contactLis[1].querySelectorAll('span');
        if (s1.length > 0) s1[s1.length - 1].textContent = d.contact.phone || '';
        var s2 = contactLis[2].querySelectorAll('span');
        if (s2.length > 0) s2[s2.length - 1].textContent = d.contact.email || '';
      }
    }

    var mapBadge = el('.footer-map-badge');
    if (mapBadge && d.mapLabel) mapBadge.textContent = d.mapLabel;

    var mapHeading = el('.footer-location h4');
    if (mapHeading && d.mapHeading) mapHeading.textContent = d.mapHeading;

    var mapIframe = el('.footer-map-frame');
    if (mapIframe && d.googleMapsUrl) {
      mapIframe.src = d.googleMapsUrl.replace('&output=embed', '') + '&output=embed';
    }

    var mapBtn = el('.footer-map-btn');
    if (mapBtn && d.googleMapsUrl) {
      mapBtn.href = d.googleMapsUrl.replace('&z=16&output=embed', '');
    }

    var copyright = el('.footer-bottom p');
    if (copyright && d.copyright) copyright.textContent = d.copyright;

    var bottomAnchors = els('.footer-bottom-links a');
    if (d.bottomLinks) {
      for (var bl = 0; bl < Math.min(bottomAnchors.length, d.bottomLinks.length); bl++) {
        bottomAnchors[bl].href = d.bottomLinks[bl].url || '#';
        bottomAnchors[bl].textContent = d.bottomLinks[bl].label || '';
      }
    }
  }

  function injectLinkList(ul, items) {
    if (!ul || !items) return;
    var lis = ul.querySelectorAll('li');
    for (var i = 0; i < Math.min(lis.length, items.length); i++) {
      var a = lis[i].querySelector('a');
      if (a) { a.href = items[i].url || '#'; a.textContent = items[i].label || ''; }
    }
  }

  /* ------------------------------------------------------------------
     Supabase fetch
     ------------------------------------------------------------------ */
  function loadSections(callback) {
    var MAX_RETRIES = 30;
    var RETRY_MS = 200;

    function tryLoad(retries) {
      var S = window.Supabase;
      if (!S || !S.getClient) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        console.log('[Mission CMS] Supabase client not available after waiting');
        return callback(null);
      }

      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        console.log('[Mission CMS] Supabase client init failed after waiting');
        return callback(null);
      }

      console.log('[Mission CMS] Supabase client ready — fetching page data...');

      client
        .from('pages')
        .select('id, title, slug, status')
        .eq('slug', PAGE_SLUG)
        .eq('status', 'published')
        .single()
        .then(function (pageResult) {
          if (pageResult.error || !pageResult.data) {
            console.log('[Mission CMS] Page not found or not published:', pageResult.error);
            return callback(null);
          }
          var pageId = pageResult.data.id;
          console.log('[Mission CMS] Page UUID:', pageId);

          client
            .from('page_sections')
            .select('id, section_type, section_key, content, settings, styles, visible, sort_order')
            .eq('page_id', pageId)
            .eq('visible', true)
            .order('sort_order', { ascending: true })
            .then(function (secResult) {
              if (secResult.error || !secResult.data) {
                console.log('[Mission CMS] No sections found:', secResult.error);
                return callback(null);
              }
              var rows = secResult.data;
              console.log('[Mission CMS] Loaded page_sections count:', rows.length);

              var sections = [];
              for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                var data = {};
                var content = row.content || {};
                var settings = row.settings || {};
                var styles = row.styles || {};

                for (var ck in content) {
                  if (Object.prototype.hasOwnProperty.call(content, ck)) data[ck] = content[ck];
                }
                for (var sk in settings) {
                  if (Object.prototype.hasOwnProperty.call(settings, sk)) data[sk] = settings[sk];
                }
                if (Object.keys(styles).length > 0) data._styles = styles;

                console.log('[Mission CMS] Section ' + i + ': type=' + row.section_type + ', renderer=' + (data._renderer || 'none'));

                sections.push({
                  id: row.id,
                  type: row.section_type,
                  enabled: row.visible,
                  order: row.sort_order,
                  section_key: row.section_key,
                  data: data,
                });
              }
              return callback(sections);
            })
            .catch(function (err) { console.log('[Mission CMS] Error:', err); return callback(null); });
        })
        .catch(function (err) { console.log('[Mission CMS] Error:', err); return callback(null); });
    }
    tryLoad(0);
  }

  /* ------------------------------------------------------------------
     Dispatcher — routes by type for hero/cta, _renderer for footer,
     sequential order for other custom sections.
     ------------------------------------------------------------------ */
  var CUSTOM_ORDER = 0;

  function dispatchSection(section) {
    if (!section || !section.enabled) return;
    var type = section.type;
    var data = section.data || {};

    switch (type) {
      case 'hero':    console.log('[Mission CMS] Rendering hero');      return injectHero(data);
      case 'cta':     console.log('[Mission CMS] Rendering cta');       return injectCta(data);
      case 'custom':  {
        var renderer = data._renderer || '';
        if (renderer === 'footer') { console.log('[Mission CMS] Rendering footer'); return injectFooter(data); }
        CUSTOM_ORDER++;
        if (CUSTOM_ORDER === 1) { console.log('[Mission CMS] Rendering mission statement'); return injectMissionStatement(data); }
        if (CUSTOM_ORDER === 2) { console.log('[Mission CMS] Rendering pillars'); return injectPillars(data); }
        if (CUSTOM_ORDER === 3) { console.log('[Mission CMS] Rendering approach'); return injectApproach(data); }
        if (CUSTOM_ORDER === 4) { console.log('[Mission CMS] Rendering quote'); return injectQuote(data); }
        break;
      }
    }
  }

  function init() {
    loadSections(function (sections) {
      if (!sections || sections.length === 0) {
        console.log('[Mission CMS] No CMS sections — using HTML fallback');
        return;
      }
      CUSTOM_ORDER = 0;
      for (var i = 0; i < sections.length; i++) {
        dispatchSection(sections[i]);
      }
      console.log('[Mission CMS] Rendering complete —', sections.length, 'sections rendered');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
