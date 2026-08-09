/* ==========================================================================
   اتصل بنا (CONTACT) Page Content Loader

   Loads the published CMS content for the Contact page (slug '/contact.html')
   and injects it into the existing page DOM.

   The page's contact info elements (cards, info card, map iframe) also carry
   `data-amare-setting` attributes filled by supabase/website-settings.js from
   the GLOBAL website_settings table. To keep the Contact page's own CMS
   content authoritative for this page, this loader re-applies its values on
   the 'amare:settingschange' event (dispatched by website-settings.js after
   every settings update). The footer/navbar keep the global values — this
   loader only touches Contact page sections.

   The contact form keeps its full validation logic — this loader only edits
   labels, placeholders, subject options and the submit label, never the
   field IDs or the inline validation script.

   The page has NO content images (hero art is CSS, cards render inline SVG
   icons), so there are no image fields and no image handling here.

   Hardcoded HTML serves as fallback when no CMS content is available.

   ONLY runs on the CONTACT page — the slug is fixed and guarded, so it can
   never render another page's content (and vice versa).
   ========================================================================== */

(function () {
  'use strict';

  var SLUG = '/contact.html';

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function isContactPage() {
    var path = window.location.pathname;
    return /contact/i.test(path);
  }

  // Set text while preserving the first <svg> icon child.
  function setTextWithIcon(el, text) {
    if (!el) return;
    var icon = el.querySelector('svg');
    el.textContent = text || '';
    if (icon) el.insertBefore(icon, el.firstChild);
  }

  function setSectionHead(sec, eyebrow, heading, description) {
    var e = sec.querySelector('.section-head .eyebrow');
    if (e && eyebrow) setTextWithIcon(e, eyebrow);
    var t = sec.querySelector('.section-head .section-title');
    if (t && heading) t.textContent = heading;
    var d = sec.querySelector('.section-head .section-desc');
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

  // Contact info items loaded from the contactCards section — reused to fill
  // the info-card list (single source of truth) and re-applied on settingschange.
  var contactItems = null;

  /* ---------- 1. Hero (#home) ---------- */
  function injectHero(d) {
    var h1 = document.querySelector('.contact-hero h1');
    if (h1) h1.textContent = d.heading || '';
    var badge = document.querySelector('.contact-hero-badge');
    if (badge && d.subheading) setTextWithIcon(badge, d.subheading);
    var subtitle = document.querySelector('.contact-hero-content > p');
    if (subtitle && d.description) subtitle.textContent = d.description;
    injectButtons(document.querySelectorAll('.contact-hero-actions a'), d.buttons);
  }

  /* ---------- 2. Contact Cards (#contactCards) ---------- */
  function applyContactItems(items) {
    if (!items || !items.length) return;
    var cards = document.querySelectorAll('.contact-cards-grid .contact-card');
    for (var i = 0; i < Math.min(cards.length, items.length); i++) {
      var item = items[i];
      var card = cards[i];
      var h3 = card.querySelector('h3');
      if (h3 && item.title) h3.textContent = item.title;
      var value = card.querySelector('p');
      if (value && item.value !== undefined && item.value !== '') value.textContent = item.value;
      var small = card.querySelector('small');
      if (small) {
        if (item.detail) {
          small.textContent = item.detail;
          small.style.display = '';
        } else {
          small.textContent = '';
          small.style.display = 'none';
        }
      }
    }
  }

  function injectContactCards(d) {
    var sec = document.querySelector('#contactCards');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);
    contactItems = d.items || null;
    applyContactItems(contactItems);
  }

  /* ---------- 3. Contact Form + Info Card (#contactFormSection) ---------- */
  function applyInfoList(items) {
    if (!items || !items.length) return;
    var list = document.querySelector('#contactInfo .contact-info-list');
    if (!list) return;
    var li = list.querySelectorAll('li');
    for (var i = 0; i < Math.min(li.length, items.length); i++) {
      var item = items[i];
      var span = li[i].querySelector('.ci-text span');
      if (span && item.value !== undefined && item.value !== '') span.textContent = item.value;
    }
  }

  function applySocialLinks(social) {
    if (!social || !social.length) return;
    for (var i = 0; i < social.length; i++) {
      var s = social[i];
      if (!s || !s.id) continue;
      var link = document.querySelector('.contact-social-btn.social-' + s.id);
      if (link && s.url) link.href = s.url;
    }
  }

  function applyFormFields(fields) {
    if (!fields || !fields.length) return;
    var map = { name: 'contactName', email: 'contactEmail', phone: 'contactPhone', subject: 'contactSubject', message: 'contactMessage' };
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      var inputId = map[f.id];
      if (!inputId) continue;
      var label = document.querySelector('label[for="' + inputId + '"]');
      if (label && f.label) label.textContent = f.label;
      var input = document.getElementById(inputId);
      if (input && f.placeholder) input.setAttribute('placeholder', f.placeholder);
    }
  }

  function applySubjects(subjects) {
    var select = document.getElementById('contactSubject');
    if (!select || !subjects || !subjects.length) return;
    var placeholder = select.querySelector('option:first-child');
    while (select.options.length > 1) select.remove(1);
    for (var i = 0; i < subjects.length; i++) {
      var opt = document.createElement('option');
      opt.value = subjects[i];
      opt.textContent = subjects[i];
      select.appendChild(opt);
    }
    if (placeholder) select.insertBefore(placeholder, select.firstChild);
  }

  function injectContactForm(d) {
    var sec = document.querySelector('#contactFormSection');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);

    var infoTitle = sec.querySelector('.contact-info-head h3');
    if (infoTitle && d.infoTitle) infoTitle.textContent = d.infoTitle;
    var infoDesc = sec.querySelector('.contact-info-head p');
    if (infoDesc && d.infoDescription) infoDesc.textContent = d.infoDescription;
    var socialTitle = sec.querySelector('.ci-social-title');
    if (socialTitle && d.socialTitle) socialTitle.textContent = d.socialTitle;

    var formTitle = sec.querySelector('.contact-form-head h3');
    if (formTitle && d.formTitle) formTitle.textContent = d.formTitle;
    var formDesc = sec.querySelector('.contact-form-head p');
    if (formDesc && d.formDescription) formDesc.textContent = d.formDescription;

    var submit = sec.querySelector('.contact-submit span');
    if (submit && d.submitLabel) submit.textContent = d.submitLabel;

    applyInfoList(contactItems);
    applySocialLinks(d.social);
    applyFormFields(d.fields);
    applySubjects(d.subjects);
  }

  /* ---------- 4. Map (#contactMap) ---------- */
  function applyMapUrl(mapUrl) {
    if (!mapUrl) return;
    var iframe = document.querySelector('.contact-map-wrap iframe');
    if (iframe) iframe.src = mapUrl;
  }

  function injectContactMap(d) {
    var sec = document.querySelector('#contactMap');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading);
    applyMapUrl(d.mapUrl);
  }

  /* ---------- 5. FAQ (#contactFaq) ---------- */
  function injectContactFaq(d) {
    var sec = document.querySelector('#contactFaq');
    if (!sec) return;
    setSectionHead(sec, d.eyebrow, d.heading, d.description);
    if (d.items && d.items.length) {
      var items = sec.querySelectorAll('.faq-item');
      for (var i = 0; i < Math.min(items.length, d.items.length); i++) {
        var q = items[i].querySelector('.faq-q-text');
        if (q && d.items[i].question) q.textContent = d.items[i].question;
        var answerEl = items[i].querySelector('.faq-answer-inner');
        if (answerEl && d.items[i].answer) {
          var p = answerEl.querySelector('p');
          if (p) p.textContent = d.items[i].answer;
          else answerEl.textContent = d.items[i].answer;
        }
      }
    }
  }

  /* ---------- 6. Final CTA (#contactCta) ---------- */
  function injectContactCta(d) {
    var sec = document.querySelector('#contactCta');
    if (!sec) return;
    var title = sec.querySelector('.contact-cta-inner h2');
    if (title && d.heading) title.textContent = d.heading;
    var desc = sec.querySelector('.contact-cta-inner p');
    if (desc && d.description) desc.textContent = d.description;
    if (d.button && d.button.label) {
      var btn = sec.querySelector('.contact-cta-btn');
      if (btn) {
        btn.href = d.button.url || btn.href;
        setTextWithIcon(btn, d.button.label);
      }
    }
  }

  /* ---------- Section dispatcher ---------- */
  function injectSection(section) {
    if (!section || !section.enabled) return;
    var type = section.type;
    var data = section.data || {};

    if (type === 'hero') return injectHero(data);

    if (type === 'custom') {
      switch (data._renderer) {
        case 'contactCards': return injectContactCards(data);
        case 'contactForm':  return injectContactForm(data);
        case 'contactMap':   return injectContactMap(data);
        case 'contactFaq':   return injectContactFaq(data);
        case 'contactCta':   return injectContactCta(data);
      }
    }
  }

  /* ---------- Load from Supabase (same pattern as archive/news loaders) ---------- */
  function loadFromSupabase(callback) {
    var MAX_RETRIES = 30, RETRY_MS = 200;

    function tryLoad(retries) {
      var S = window.Supabase;
      if (!S || !S.getClient) {
        if (retries < MAX_RETRIES) { setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS); return; }
        console.warn('[CONTACT CMS] Supabase chain not ready after ' + (MAX_RETRIES * RETRY_MS) + 'ms — falling back to HTML');
        return callback(null);
      }
      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) { setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS); return; }
        console.warn('[CONTACT CMS] Supabase client unavailable after ' + (MAX_RETRIES * RETRY_MS) + 'ms — falling back to HTML');
        return callback(null);
      }

      client.from('pages').select('id, title, slug, status').eq('slug', SLUG).eq('status', 'published').single()
        .then(function (r) {
          if (r.error || !r.data) { console.log('[CONTACT CMS] Page not found:', SLUG); return callback(null); }
          var page = r.data;
          console.log('[CONTACT CMS] Page found:', page.title, page.slug);
          client.from('page_sections').select('id, section_type, content, settings, styles, visible, sort_order')
            .eq('page_id', page.id).eq('visible', true).order('sort_order')
            .then(function (sr) {
              if (sr.error || !sr.data || !sr.data.length) { console.log('[CONTACT CMS] No sections'); return callback(null); }
              var rows = sr.data;
              console.log('[CONTACT CMS] Loaded', rows.length, 'sections');
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

  // Re-apply Contact page values after website-settings.js updates the global
  // settings (it fills the same data-amare-setting elements). Keeps the
  // Contact page CMS content authoritative for THIS page only.
  function reapplyContactInfo() {
    applyContactItems(contactItems);
    applyInfoList(contactItems);
    for (var i = 0; i < loadedSections.length; i++) {
      var sec = loadedSections[i];
      if (!sec) continue;
      if (sec.type === 'custom' && sec.data && sec.data._renderer === 'contactForm') {
        applySocialLinks(sec.data.social);
      }
      if (sec.type === 'custom' && sec.data && sec.data._renderer === 'contactMap') {
        applyMapUrl(sec.data.mapUrl);
      }
    }
  }

  var loadedSections = [];

  function init() {
    if (!isContactPage()) return;

    // Re-apply our values every time the global settings change.
    window.addEventListener('amare:settingschange', reapplyContactInfo);

    loadFromSupabase(function (sections) {
      if (sections && sections.length > 0) {
        loadedSections = sections;
        console.log('[CONTACT CMS] Rendering', sections.length, 'CMS sections...');
        for (var i = 0; i < sections.length; i++) injectSection(sections[i]);
        console.log('[CONTACT CMS] Rendering complete');
      } else {
        console.log('[CONTACT CMS] No CMS sections — HTML fallback');
      }
    });
  }

  function start() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  start();
})();
