/* ==========================================================================
   National Vision — Content Service
   Loads page sections from Supabase and injects into the DOM.
   Slug: /Who%20are%20we/national-vision.html
   ========================================================================== */

(function () {
  'use strict';

  var PAGE_SLUG = '/Who%20are%20we/national-vision.html';

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function el(selector) {
    return document.querySelector(selector);
  }

  function els(selector) {
    return document.querySelectorAll(selector);
  }

  /* ------------------------------------------------------------------
     Section injectors
     ------------------------------------------------------------------ */

  /* HERO — badge (subheading) + h1 + heading span + description + buttons */
  function injectHero(d) {
    var badge = el('.nv-hero-badge');
    if (badge) {
      var svg = badge.querySelector('svg');
      badge.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(d.subheading || '');
    }

    var h1 = el('.nv-hero-content h1');
    if (h1) {
      var heading = d.heading || '';
      var spanMatch = heading.match(/(.*)<span>(.*)<\/span>(.*)/);
      if (spanMatch) {
        h1.innerHTML = esc(spanMatch[1]) + '<span>' + esc(spanMatch[2]) + '</span>' + esc(spanMatch[3]);
      } else {
        var words = heading.split(' ');
        var lastWord = words.pop();
        h1.innerHTML = esc(words.join(' ')) + ' <span>' + esc(lastWord) + '</span>';
      }
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

  /* VISION STATEMENT — eyebrow + heading + lead + vision cards */
  function injectVisionStatement(d) {
    var eyebrow = el('.nv-vision-head .eyebrow');
    if (eyebrow && d.eyebrow) eyebrow.textContent = d.eyebrow;

    var title = el('.nv-vision-title');
    if (title && d.heading) title.textContent = d.heading;

    var lead = el('.nv-vision-lead');
    if (lead && d.description) lead.textContent = d.description;

    var cards = els('.nv-vision-card');
    if (d.cards) {
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var h3 = cards[i].querySelector('h3');
        var p = cards[i].querySelector('p');
        if (h3) h3.textContent = d.cards[i].heading || '';
        if (p) p.textContent = d.cards[i].description || '';
      }
    }
  }

  /* STRATEGIC OBJECTIVES — section-head + objective cards */
  function injectObjectives(d) {
    var eyebrow = el('#nvObjectives .section-head .eyebrow');
    if (eyebrow && d.eyebrow) eyebrow.textContent = d.eyebrow;

    var title = el('#nvObjectives .section-title');
    if (title && d.heading) title.textContent = d.heading;

    var desc = el('#nvObjectives .section-desc');
    if (desc && d.description) desc.textContent = d.description;

    var cards = els('.nv-obj-card');
    if (d.cards) {
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var h3 = cards[i].querySelector('h3');
        var p = cards[i].querySelector('p');
        if (h3) h3.textContent = d.cards[i].heading || '';
        if (p) p.textContent = d.cards[i].description || '';
      }
    }
  }

  /* NATIONAL PRIORITIES (TIMELINE) — section-head + timeline items */
  function injectPriorities(d) {
    var eyebrow = el('#nvPriorities .section-head .eyebrow');
    if (eyebrow && d.eyebrow) eyebrow.textContent = d.eyebrow;

    var title = el('#nvPriorities .section-title');
    if (title && d.heading) title.textContent = d.heading;

    var desc = el('#nvPriorities .section-desc');
    if (desc && d.description) desc.textContent = d.description;

    var items = els('.nv-tl-item');
    if (d.items) {
      for (var i = 0; i < Math.min(items.length, d.items.length); i++) {
        var num = items[i].querySelector('.nv-tl-num');
        var h3 = items[i].querySelector('h3');
        var p = items[i].querySelector('p');
        if (num) num.textContent = d.items[i].number || '';
        if (h3) h3.textContent = d.items[i].heading || '';
        if (p) p.textContent = d.items[i].description || '';
      }
    }
  }

  /* STATISTICS — eyebrow + heading + stat cards */
  function injectStatistics(d) {
    var eyebrow = el('#nvStats .section-head .eyebrow');
    if (eyebrow && d.description) eyebrow.textContent = d.description;

    var title = el('#nvStats .section-title');
    if (title && d.heading) title.textContent = d.heading;

    var stats = els('.nv-stat');
    if (d.stats) {
      for (var i = 0; i < Math.min(stats.length, d.stats.length); i++) {
        var num = stats[i].querySelector('.nv-stat-num');
        var label = stats[i].querySelector('.nv-stat-label');
        if (num) {
          num.textContent = d.stats[i].value + (d.stats[i].suffix || '');
          num.setAttribute('data-count', d.stats[i].value);
          num.setAttribute('data-suffix', d.stats[i].suffix || '');
        }
        if (label) label.textContent = d.stats[i].label || '';
      }
    }
  }

  /* QUOTE */
  function injectQuote(d) {
    var blockquote = el('.nv-quote-box blockquote');
    if (blockquote && d.quote) blockquote.textContent = '«' + d.quote + '»';

    var figcaption = el('.nv-quote-box figcaption');
    if (figcaption && d.attribution) {
      var rule = figcaption.querySelector('.nv-quote-rule');
      figcaption.innerHTML = (rule ? rule.outerHTML + ' ' : '') + esc(d.attribution);
    }
  }

  /* CTA */
  function injectCta(d) {
    var h2 = el('.nv-cta-inner h2');
    if (h2 && d.heading) h2.textContent = d.heading;

    var p = el('.nv-cta-inner p');
    if (p && d.description) p.textContent = d.description;

    var actions = el('.nv-cta-actions');
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

  /* FOOTER */
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
        var spans0 = contactLis[0].querySelectorAll('span');
        if (spans0.length > 0) spans0[spans0.length - 1].textContent = d.contact.address || '';
        var spans1 = contactLis[1].querySelectorAll('span');
        if (spans1.length > 0) spans1[spans1.length - 1].textContent = d.contact.phone || '';
        var spans2 = contactLis[2].querySelectorAll('span');
        if (spans2.length > 0) spans2[spans2.length - 1].textContent = d.contact.email || '';
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
      if (a) {
        a.href = items[i].url || '#';
        a.textContent = items[i].label || '';
      }
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
        console.log('[Loader] Supabase client not available after waiting');
        return callback(null);
      }

      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        console.log('[Loader] Supabase client init failed after waiting');
        return callback(null);
      }

      console.log('[Loader] Supabase client ready — fetching page data...');

      client
        .from('pages')
        .select('id, title, slug, status')
        .eq('slug', PAGE_SLUG)
        .eq('status', 'published')
        .single()
        .then(function (pageResult) {
          if (pageResult.error) {
            console.log('[National Vision CMS] Page query error:', pageResult.error.message, '| code:', pageResult.error.code);
            return callback(null);
          }
          if (!pageResult.data) {
            console.log('[National Vision CMS] Page not found — slug:', PAGE_SLUG, '| status filter: published');
            return callback(null);
          }
          var pageId = pageResult.data.id;
          console.log('[National Vision CMS] Page found — id:', pageId, '| slug:', pageResult.data.slug, '| status:', pageResult.data.status);

          client
            .from('page_sections')
            .select('id, section_type, section_key, title, content, settings, styles, visible, sort_order')
            .eq('page_id', pageId)
            .eq('visible', true)
            .order('sort_order', { ascending: true })
            .then(function (secResult) {
              if (secResult.error) {
                console.log('[National Vision CMS] Sections query error:', secResult.error.message, '| code:', secResult.error.code);
                return callback(null);
              }
              if (!secResult.data || !Array.isArray(secResult.data) || secResult.data.length === 0) {
                console.log('[National Vision CMS] No sections found — page_id:', pageId, '| visible filter: true');
                return callback(null);
              }
              var rows = secResult.data;
              console.log('[National Vision CMS] Loaded', rows.length, 'sections for page_id:', pageId);

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

              sections.push({
                  id: row.id,
                  type: row.section_type,
                  enabled: row.visible,
                  order: row.sort_order,
                  section_key: row.section_key,
                  title: row.title,
                  data: data,
                });
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
     Section dispatcher — routes by section_type for hero/statistics/cta,
     by _renderer for footer, and by sequential order for other custom sections.
     ------------------------------------------------------------------ */
  function dispatchSection(section) {
    if (!section || !section.enabled) return;
    var type = section.type;
    var data = section.data || {};
    var key = section.section_key;
    var title = section.title || '';

    console.log('[National Vision CMS] Dispatching:', { type: type, section_key: key, title: title });

    try {
      switch (type) {
        case 'hero': return injectHero(data);
        case 'statistics': return injectStatistics(data);
        case 'cta': return injectCta(data);
        case 'custom': {
          var renderer = data._renderer || '';
          if (renderer === 'footer') return injectFooter(data);

          if (key === 'nv.vision' || title === 'رؤيتنا') return injectVisionStatement(data);
          if (key === 'nv.objectives' || title === 'الأهداف الاستراتيجية') return injectObjectives(data);
          if (key === 'nv.priorities' || title === 'أولوياتنا الوطنية') return injectPriorities(data);
          if (key === 'nv.quote' || title === 'اقتباس ملهم') return injectQuote(data);

          console.log('[National Vision CMS] Unmatched custom — key:', key, '| title:', title, '| skipping');
          break;
        }
        default:
          console.log('[National Vision CMS] Unknown section type:', type, '— skipping');
      }
    } catch (err) {
      console.error('[National Vision CMS] Render error:', err, { type: type, section_key: key, title: title });
    }
  }

  function init() {
    loadSections(function (sections) {
      if (!sections || sections.length === 0) {
        console.log('[National Vision CMS] No sections — using HTML fallback');
        return;
      }
      console.log('[National Vision CMS] Loaded ' + sections.length + ' sections — injecting...');
      for (var i = 0; i < sections.length; i++) {
        dispatchSection(sections[i]);
      }
      console.log('[National Vision CMS] Rendering complete — ' + sections.length + ' sections processed');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
