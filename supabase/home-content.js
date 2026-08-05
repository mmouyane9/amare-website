/* ==========================================================================
   Home Content Service — loads the Home page from Supabase and injects
   dynamic content into the Hero section of the public website.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Hardcoded fallback — mirrors the original index.html Hero content.
     Used when Supabase is unreachable or the row is empty.
     ------------------------------------------------------------------ */
  var FALLBACK_HERO = {
    heading: 'اكتشف...\nشارك...\nوانضم إلى الجمعية المغربية',
    subheading: 'لهواة البحث والاستكشاف',
    description:
      'شارك في المسابقة الوطنية، وانخرط إلكترونياً في الجمعية، أو جدد عضويتك بسهولة، واطلع على آخر الأنشطة والفعاليات والأخبار عبر المنصة الرسمية.',
    backgroundImage: '',
    buttons: [
      { label: 'شارك في المسابقة', url: '#competition', variant: 'primary' },
      { label: 'الانخراط Online', url: 'Join us/join-us-online.html', variant: 'primary' },
      { label: 'تجديد الانخراط', url: 'Join us/membership-renewal.html', variant: 'outline' },
    ],
  };

  /* ------------------------------------------------------------------
     DOM selectors — targets the existing Hero HTML structure.
     ------------------------------------------------------------------ */
  var SELECTORS = {
    eyebrow: '.hero-eyebrow',
    heading: '.hero-inner h1',
    description: '.hero-inner p.hero-fade',
    actions: '.hero-actions',
    bg: '.hero-bg',
  };

  /* ------------------------------------------------------------------
     Inject hero data into the DOM — preserves classes, animations,
     SVG icons inside buttons, and the original layout.
     ------------------------------------------------------------------ */
  function injectHero(heroData) {
    var headingLines = (heroData.heading || '').split('\n');
    var subheading = heroData.subheading || '';
    var description = heroData.description || '';
    var buttons = heroData.buttons || [];
    var bgImage = heroData.backgroundImage || '';

    /* Eyebrow */
    var eyebrowEl = document.querySelector(SELECTORS.eyebrow);
    if (eyebrowEl) {
      eyebrowEl.textContent = headingLines.length > 0 ? '' : '';
      /* The eyebrow is different from heading — kept as the heading text
         combined approach. Actually, in the CMS, we store the eyebrow
         separately. For now, the HTML doesn't have a distinct eyebrow
         text matching the CMS — the h1 covers it. */
    }

    /* Heading + subheading */
    var h1 = document.querySelector(SELECTORS.heading);
    if (h1) {
      var html = '';
      for (var i = 0; i < headingLines.length; i++) {
        html += escapeHtml(headingLines[i]);
        if (i < headingLines.length - 1) {
          html += '<br>';
        }
      }
      if (subheading) {
        html += '<br><span>' + escapeHtml(subheading) + '</span>';
      }
      h1.innerHTML = html;
    }

    /* Description */
    var descEl = document.querySelector(SELECTORS.description);
    if (descEl && description) {
      descEl.textContent = description;
    }

    /* Buttons — update href and text, keep SVG icons */
    var actionsEl = document.querySelector(SELECTORS.actions);
    if (actionsEl) {
      var anchors = actionsEl.querySelectorAll('a');
      for (var j = 0; j < Math.min(anchors.length, buttons.length); j++) {
        var anchor = anchors[j];
        var btnData = buttons[j];
        if (!btnData) continue;

        /* Preserve SVGs */
        var svgs = anchor.querySelectorAll('svg');
        var svgHtml = '';
        for (var k = 0; k < svgs.length; k++) {
          svgHtml += svgs[k].outerHTML;
        }

        anchor.href = btnData.url || '#';
        anchor.innerHTML = escapeHtml(btnData.label) + ' ' + svgHtml;
      }
    }

    /* Background image */
    if (bgImage) {
      var bgEl = document.querySelector(SELECTORS.bg);
      if (bgEl) {
        bgEl.style.backgroundImage = 'url(' + bgImage + ')';
      }
    }
  }

  /* ------------------------------------------------------------------
     Fetch Home page from Supabase, extract the hero section.
     ------------------------------------------------------------------ */
  function loadHomeFromSupabase(callback) {
    var Supabase = window.Supabase;
    if (!Supabase || !Supabase.getClient) {
      return callback(null);
    }

    var client = Supabase.getClient();
    if (!client) {
      return callback(null);
    }

    client
      .from('content_pages')
      .select('content, status')
      .eq('page_key', 'home')
      .eq('status', 'published')
      .single()
      .then(function (result) {
        if (result.error) return callback(null);
        var data = result.data;
        if (!data || !data.content) return callback(null);

        var sections = data.content.sections;
        if (!Array.isArray(sections)) return callback(null);

        /* Find the hero section */
        for (var i = 0; i < sections.length; i++) {
          var section = sections[i];
          if (section.type === 'hero' && section.enabled !== false) {
            return callback(section.data || {});
          }
        }

        return callback(null);
      })
      .catch(function () {
        return callback(null);
      });
  }

  /* ------------------------------------------------------------------
     Simple HTML escape.
     ------------------------------------------------------------------ */
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ------------------------------------------------------------------
     Bootstrap — waits for DOMContentLoaded, then injects.
     ------------------------------------------------------------------ */
  function init() {
    loadHomeFromSupabase(function (heroData) {
      var effective = heroData || FALLBACK_HERO;
      injectHero(effective);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
