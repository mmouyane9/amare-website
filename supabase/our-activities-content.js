/* ==========================================================================
   أنشطتنا Content Service — loads sections from Supabase page_sections
   and injects into the existing DOM on Our activities/index.html.

   Architecture:
     1. Load page WHERE slug='/activities' AND status='published'
     2. Load page_sections WHERE page_id = activities.id AND visible = true
     3. Merge content + settings → flat data object
     4. Inject each section into the DOM
     5. Hardcoded fallback keeps the page working without Supabase
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
     Bilingual helper — picks key_lang, falls back to key_ar
     ------------------------------------------------------------------ */
  function pickBilingual(data, key) {
    if (!data) return '';
    var lang = (window.I18n && window.I18n.getCurrentLanguage) ? window.I18n.getCurrentLanguage() : 'ar';
    var value = data[key + '_' + lang];
    if (value != null && value !== '') return value;
    value = data[key + '_ar'];
    if (value != null && value !== '') return value;
    return data[key] || '';
  }

  /* ------------------------------------------------------------------
     Fallback data — bilingual _ar/_fr format
     ------------------------------------------------------------------ */
  var FALLBACK = {
    hero: {
      heading_ar: 'أنشطة الجمعية',
      heading_fr: 'Activités de l\'association',
      subheading_ar: 'أنشطتنا',
      subheading_fr: 'Nos activités',
      description_ar: 'نظمت الجمعية المغربية لهواة البحث والاستكشاف مجموعة متنوعة من الأنشطة والمبادرات التي تجمع بين الاستكشاف والتكوين والعمل البيئي والتواصل المجتمعي.',
      description_fr: 'L\'Association Marocaine des Amateurs de Recherche et d\'Exploration a organisé une diversité d\'activités et d\'initiatives alliant exploration, formation, action environnementale et communication communautaire.',
    },
    activitiesGrid: {
      heading_ar: 'أنشطتنا',
      heading_fr: 'Nos activités',
      cards: [
        { title_ar: 'الخرجات', title_fr: 'Sorties', description_ar: 'خرجات ميدانية للاستكشاف والتعرف على المواقع والمجالات الطبيعية.', description_fr: 'Sorties de terrain pour l\'exploration et la découverte des sites et espaces naturels.' },
        { title_ar: 'مسابقات وراليات', title_fr: 'Compétitions et rallyes', description_ar: 'تنظيم مسابقات وراليات تجمع بين روح التحدي والاستكشاف.', description_fr: 'Organisation de compétitions et de rallyes alliant esprit de défi et exploration.' },
        { title_ar: 'تكوينات', title_fr: 'Formations', description_ar: 'تكوينات وورشات لتطوير مهارات الأعضاء والمهتمين بمجال الاستكشاف.', description_fr: 'Formations et ateliers pour développer les compétences des membres et des passionnés d\'exploration.' },
        { title_ar: 'معارض', title_fr: 'Expositions', description_ar: 'المشاركة وتنظيم معارض للتعريف بأنشطة الجمعية وإنجازاتها.', description_fr: 'Participation et organisation d\'expositions pour faire connaître les activités et réalisations de l\'association.' },
        { title_ar: 'لقاءات', title_fr: 'Rencontres', description_ar: 'لقاءات وفعاليات تجمع الأعضاء والشركاء والمهتمين.', description_fr: 'Rencontres et événements rassemblant les membres, les partenaires et les passionnés.' },
        { title_ar: 'حملات بيئية', title_fr: 'Campagnes environnementales', description_ar: 'مبادرات وحملات تهدف إلى حماية البيئة والتحسيس بأهمية المحافظة عليها.', description_fr: 'Initiatives et campagnes visant à protéger l\'environnement et à sensibiliser à l\'importance de sa préservation.' },
      ],
    },
    activitiesCta: {
      heading_ar: 'اكتشف أنشطتنا',
      heading_fr: 'Découvrez nos activités',
      description_ar: 'تابع آخر أنشطة الجمعية ومبادراتها.',
      description_fr: 'Suivez les dernières activités et initiatives de l\'association.',
      buttons: [
        { label_ar: 'آخر الأخبار', label_fr: 'Dernières actualités', url: '/News/news.html' },
        { label_ar: 'تواصل معنا', label_fr: 'Contactez-nous', url: '/contact.html' },
      ],
    },
  };

  /* ------------------------------------------------------------------
     HERO injector
     ------------------------------------------------------------------ */
  function injectHero(d) {
    var badge = el('.activities-hero-badge');
    if (badge) {
      var svg = badge.querySelector('svg');
      badge.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(pickBilingual(d, 'subheading'));
    }

    var h1 = el('.activities-hero h1');
    if (h1) {
      var parts = pickBilingual(d, 'heading').split(' ');
      var lastWord = parts.pop();
      var rest = parts.join(' ');
      h1.innerHTML = esc(rest) + ' <span>' + esc(lastWord) + '</span>';
    }

    var desc = el('.activities-hero p');
    if (desc) desc.textContent = pickBilingual(d, 'description');
  }

  /* ------------------------------------------------------------------
     ACTIVITIES GRID injector
     ------------------------------------------------------------------ */
  function injectActivitiesGrid(d) {
    var cards = document.querySelectorAll('#activities .act-card');
    if (d.cards) {
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var h3 = cards[i].querySelector('h3');
        var p = cards[i].querySelector('p');
        if (h3) h3.textContent = pickBilingual(d.cards[i], 'title');
        if (p) p.textContent = pickBilingual(d.cards[i], 'description');
      }
    }
  }

  /* ------------------------------------------------------------------
     CTA injector
     ------------------------------------------------------------------ */
  function injectActivitiesCta(d) {
    var h2 = el('#act-cta h2');
    if (h2) h2.textContent = pickBilingual(d, 'heading');

    var p = el('#act-cta p');
    if (p) p.textContent = pickBilingual(d, 'description');

    if (d.buttons) {
      var anchors = document.querySelectorAll('#act-cta .act-cta-actions a');
      for (var i = 0; i < anchors.length; i++) {
        var a = anchors[i];
        var b = d.buttons[i];
        if (b) {
          a.href = b.url || '#';
          var svg = a.querySelector('svg');
          a.textContent = pickBilingual(b, 'label');
          if (svg) a.appendChild(svg);
        }
      }
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
    if (type === 'cta') return injectActivitiesCta(data);

    if (type === 'custom') {
      var renderer = data._renderer || '';
      if (renderer === 'activitiesGrid') return injectActivitiesGrid(data);
      if (renderer === 'activitiesCta') return injectActivitiesCta(data);
    }

    console.log('[Activities CMS] Unhandled section:', type, data._renderer);
  }

  /* ------------------------------------------------------------------
     Supabase fetch
     ------------------------------------------------------------------ */
  var _lastSections = null;

  function loadFromSupabase(callback) {
    var MAX_RETRIES = 30;
    var RETRY_MS = 200;

    function tryLoad(retries) {
      var S = window.Supabase;
      if (!S || !S.getClient) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        console.log('[Activities CMS] Supabase client not available');
        return callback(null);
      }

      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        return callback(null);
      }

      console.log('[Activities CMS] Fetching page data...');

      client
        .from('pages')
        .select('id, title, slug, status')
        .eq('slug', '/activities')
        .eq('status', 'published')
        .single()
        .then(function (pageResult) {
          if (pageResult.error || !pageResult.data) {
            console.log('[Activities CMS] Page not found or not published');
            return callback(null);
          }

          var page = pageResult.data;
          console.log('[Activities CMS] Page found:', page.title, page.slug);

          client
            .from('page_sections')
            .select('id, section_type, content, settings, styles, visible, sort_order')
            .eq('page_id', page.id)
            .eq('visible', true)
            .order('sort_order', { ascending: true })
            .then(function (sectionsResult) {
              if (sectionsResult.error || !sectionsResult.data) {
                console.log('[Activities CMS] page_sections error');
                return callback(null);
              }

              var rows = sectionsResult.data;
              console.log('[Activities CMS] Loaded', rows.length, 'sections');

              if (!rows.length) return callback(null);

              var sections = [];
              for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                var data = {};
                var content = row.content || {};
                var settings = row.settings || {};

                for (var ck in content) {
                  if (Object.prototype.hasOwnProperty.call(content, ck)) data[ck] = content[ck];
                }
                for (var sk in settings) {
                  if (Object.prototype.hasOwnProperty.call(settings, sk)) data[sk] = settings[sk];
                }

                sections.push({
                  id: row.id,
                  type: row.section_type,
                  enabled: row.visible,
                  order: row.sort_order,
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
     Inject all fallbacks
     ------------------------------------------------------------------ */
  function injectAllFallbacks() {
    injectHero(FALLBACK.hero);
    injectActivitiesGrid(FALLBACK.activitiesGrid);
    injectActivitiesCta(FALLBACK.activitiesCta);
  }

  /* ------------------------------------------------------------------
     Bootstrap
     ------------------------------------------------------------------ */
  function renderAll() {
    if (_lastSections && _lastSections.length > 0) {
      console.log('[Activities CMS] Re-rendering', _lastSections.length, 'CMS sections...');
      for (var i = 0; i < _lastSections.length; i++) {
        injectSection(_lastSections[i]);
      }
    }
  }

  function init() {
    console.log('[Activities CMS] Starting...');

    loadFromSupabase(function (sections) {
      if (sections && sections.length > 0) {
        _lastSections = sections;
        console.log('[Activities CMS] Rendering', sections.length, 'CMS sections...');
        for (var i = 0; i < sections.length; i++) {
          injectSection(sections[i]);
        }
        console.log('[Activities CMS] Rendering complete');
      } else {
        console.log('[Activities CMS] No CMS sections — using HTML fallback');
        _lastSections = null;
        injectAllFallbacks();
      }
    });

    window.addEventListener('amare:langchange', function () {
      renderAll();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
