/* ==========================================================================
   من نحن Content Service — loads the من نحن page sections from Supabase
   page_sections table and injects dynamic content into every section.

   Architecture:
     1. Load pages WHERE slug='/Who%20are%20we/index.html' AND status='published'
     2. Load page_sections WHERE page_id = about.id AND visible = true
     3. Merge content + settings + styles → flat data object
     4. Inject each section into the existing DOM
     5. Hardcoded fallback for every section — website never breaks
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
     Hardcoded fallback data
     ------------------------------------------------------------------ */
  var FALLBACK = {
    hero: {
      heading: 'تعرف على الجمعية',
      subheading: 'من نحن',
      description: 'اكتشف رؤية الجمعية الوطنية ورسالتها وقيمها، وتعرف على مكتبها المركزي وخارطة توسعها في مختلف جهات المملكة المغربية.',
      buttons: [
        { label: 'الرؤية الوطنية', url: '#national-vision' },
        { label: 'الرسالة', url: '#mission' },
        { label: 'القيم', url: '#values' },
        { label: 'المكتب المركزي', url: '#central-office' },
        { label: 'خارطة التوسع', url: '#expansion-map' },
      ],
    },
    nationalVision: {
      eyebrow: 'ماذا نطمح إليه',
      heading: 'الرؤية الوطنية',
      description: 'نطمح إلى أن نكون الجمعية الوطنية الرائدة في توحيد هواة البحث والاستكشاف تحت رؤية مشتركة ترتكز على العلم والمعرفة والوعي البيئي والانتماء الوطني. نؤمن بأن الإنسان المغربي الواعي، حين يُمنح الفرصة والمعرفة، قادر على حماية ثروات بلاده الطبيعية والثقافية وضمان استدامتها للأجيال القادمة، عبر استكشاف مسؤول يزاوج بين شغف المغامرة والالتزام بالأخلاقيات والممارسات المثلى.',
      cards: [
        { title: 'أجيال واعية', description: 'نعمل على تكوين أجيال شابة واعية بأهمية العلم والبحث، قادرة على فهم تراثها الوطني والمساهمة في تطويره وحمايته بمسؤولية.' },
        { title: 'تراث مستدام', description: 'نحافظ على التراث الطبيعي والثقافي المغربي ونثمّنه، لضمان انتقاله بكامل قيمته إلى الأجيال القادمة.' },
        { title: 'استكشاف مسؤول', description: 'نلتزم بمدونة أخلاقية صارمة تجعل من كل خرج ميداني فرصة للاستكشاف العلمي الآمن والمحترم للبيئة والمجتمعات المحلية.' },
      ],
    },
    mission: {
      eyebrow: 'غايتنا',
      heading: 'رسالتنا',
      description: 'تتمثل رسالتنا في نشر ثقافة البحث والاستكشاف وتشجيع الشباب على المشاركة في المبادرات العلمية والبيئية، والمساهمة في حماية التراث الطبيعي والثقافي المغربي، وبناء مجتمع واعٍ يعتمد على المعرفة والعمل التطوعي. نعمل على تجسيد هذه الرسالة عبر برامج ميدانية وأنشطة توثيقية وتكوينية ترافق الهواة من مختلف الفئات والأعمار، وتكرّس القيم العلمية والأخلاقية في كل خطوة نقوم بها.',
    },
    values: {
      eyebrow: 'ماذا نؤمن به',
      heading: 'قيمنا',
      description: 'ثماني قيم جوهرية تترجم مبادئنا إلى سلوك يومي ملموس في كل ما نقوم به.',
      cards: [
        { title: 'النزاهة', description: 'الالتزام بالشفافية والصدق في جميع أعمال الجمعية.' },
        { title: 'العمل الجماعي', description: 'نؤمن بأن النجاح يتحقق من خلال التعاون وروح الفريق.' },
        { title: 'الابتكار', description: 'تشجيع الأفكار الجديدة والحلول الإبداعية في البحث والاستكشاف.' },
        { title: 'المسؤولية', description: 'تحمل المسؤولية تجاه المجتمع والبيئة والتراث الوطني.' },
        { title: 'الاحترام', description: 'احترام الجميع وتعزيز ثقافة الحوار والتعاون.' },
        { title: 'التطوع', description: 'غرس روح المبادرة وخدمة المجتمع دون مقابل.' },
        { title: 'الاستدامة', description: 'المحافظة على الموارد الطبيعية للأجيال القادمة.' },
        { title: 'التميز', description: 'السعي المستمر نحو الجودة والاحترافية في جميع المبادرات.' },
      ],
    },
    centralOffice: {
      eyebrow: 'عن المكتب المركزي',
      heading: 'المكتب المركزي',
      description: 'يُعد المكتب المركزي الهيئة التنفيذية العليا للجمعية المغربية لهواة البحث والاستكشاف؛ فهو المسؤول عن إدارة شؤون الجمعية، ووضع الخطط الاستراتيجية، وتنسيق الأنشطة الوطنية بين الفروع، وتعزيز الشراكات مع المؤسسات، وضمان تحقيق أهداف الجمعية ورسالتها في مختلف جهات المملكة، مع الحرص على الالتزام بالقيم والمبادئ التي تقوم عليها الجمعية.',
      teamEyebrow: 'فريق القيادة',
      teamHeading: 'أعضاء المكتب المركزي',
      teamDescription: 'يتكون المكتب المركزي من نخبة من الكفاءات الوطنية التي تسهر على تحقيق أهداف الجمعية وترجمة رؤيتها إلى واقع.',
      members: [
        { name: 'عبد الرحيم العسري', role: 'رئيس المكتب المركزي', bio: 'خبرة واسعة في تدبير الشأن الجمعوي وقيادة الفرق، يشرف على تنفيذ الرؤية الاستراتيجية للجمعية ومتابعة برامجها الوطنية.', color: '#123B78', facebook: '#', instagram: '#', linkedin: '#', profileUrl: '#' },
        { name: 'فاطمة الزهراء بنعلي', role: 'عضو المكتب المركزي', bio: 'تساهم في تنسيق العمل بين اللجان والمكتب المركزي، وتدبير ملفات التكوين والتأطير لفائدة المنخرطين والمنخرطات.', color: '#0F9CD1', facebook: '#', instagram: '#', linkedin: '#', profileUrl: '#' },
        { name: 'يوسف أيت لحسن', role: 'عضو المكتب المركزي', bio: 'يساهم في تدبير الميزانية والمحاسبة، ويحرص على الشفافية في تدبير الموارد المالية وفق مقتضيات القانون الأساسي للجمعية.', color: '#17A44E', facebook: '#', instagram: '#', linkedin: '#', profileUrl: '#' },
        { name: 'خديجة إدريسي', role: 'عضو المكتب المركزي', bio: 'تساهم في تدبير الجانب الإداري والتوثيقي، وتتبع أشغال المكتب والجمع العام، وتنسيق المراسلات مع الشركاء والمؤسسات.', color: '#DB2777', facebook: '#', instagram: '#', linkedin: '#', profileUrl: '#' },
        { name: 'محمد الصقلي', role: 'عضو المكتب المركزي', bio: 'يساهم في إعداد التقارير ومحاضر الاجتماعات، ومواكبة الملفات الإدارية والقانونية المرتبطة بتسيير الجمعية.', color: '#2563EB', facebook: '#', instagram: '#', linkedin: '#', profileUrl: '#' },
      ],
    },
    expansionMap: {
      eyebrow: 'رؤيتنا للتوسع',
      heading: 'خارطة التوسع الوطني',
      description: 'تنبني استراتيجية التوسع لدى الجمعية على مبدأ التقريب: تقريب الهيكل التنظيمي من الهواة أينما كانوا، وتمكينهم من الانخراط في العمل الجمعوي دون عناء التنقل، مع الحرص على توحيد معايير العمل وجودة البرامج عبر جميع الفروع، وتعزيز الشراكات المحلية والجهوية، والاستثمار في قيادات محلية مؤهلة قادرة على ترجمة رسالة الجمعية داخل جهاتها.',
      mapEyebrow: 'الخريطة التفاعلية',
      mapHeading: 'خريطة جهات المملكة',
      mapDescription: 'انقر على أي جهة لاستكشاف حالة التوسع، وعدد الفروع النشطة أو المرتقبة في كل جهة.',
      legendTitle: 'دليل الألوان',
      legendSub: 'حالة التوسع في جهات المملكة',
      legendActive: 'فروع نشطة',
      legendUpcoming: 'فروع مرتقبة',
      legendFuture: 'توسع مستقبلي',
      emptyDetail: 'انقر على أي جهة في الخريطة لعرض تفاصيل التوسع بها.',
      regions: [
        { id: 'MA09', name: 'سوس - ماسة', status: 'active', branches: 4 },
        { id: 'MA01', name: 'طنجة - تطوان - الحسيمة', status: 'active', branches: 1 },
        { id: 'MA03', name: 'فاس - مكناس', status: 'active', branches: 2 },
        { id: 'MA04', name: 'الرباط - سلا - القنيطرة', status: 'active', branches: 2 },
        { id: 'MA06', name: 'الدار البيضاء - سطات', status: 'active', branches: 3 },
        { id: 'MA02', name: 'الشرق', status: 'upcoming', branches: 0 },
        { id: 'MA05', name: 'بني ملال - خنيفرة', status: 'upcoming', branches: 1 },
        { id: 'MA07', name: 'مراكش - آسفي', status: 'upcoming', branches: 1 },
        { id: 'MA08', name: 'درعة - تافيلالت', status: 'upcoming', branches: 0 },
        { id: 'MA10', name: 'كلميم - واد نون', status: 'future', branches: 0 },
        { id: 'MA11', name: 'العيون - الساقية الحمراء', status: 'future', branches: 0 },
        { id: 'MA12', name: 'الداخلة - وادي الذهب', status: 'future', branches: 0 },
      ],
    },
    cta: {
      heading: 'كن جزءاً من مسيرتنا',
      description: 'انضم إلى شبكة الهواة والباحثين والمتطوعين الذين يشاركوننا الشغف بالاستكشاف والالتزام بحماية تراث المغرب، وساهم معنا في بناء غدٍ أكثر استدامة.',
      buttonLabel: 'انخرط معنا',
      buttonUrl: '../Join us/join-us-online.html',
    },
  };

  /* ------------------------------------------------------------------
     HERO injector
     ------------------------------------------------------------------ */
  function injectHero(d) {
    var badge = el('.about-hero-badge');
    if (badge && d.subheading) {
      var svg = badge.querySelector('svg');
      badge.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(d.subheading);
    }

    var h1 = el('.about-hero h1');
    if (h1 && d.heading) {
      var parts = (d.heading || '').split(' ');
      var lastWord = parts.pop();
      var rest = parts.join(' ');
      h1.innerHTML = esc(rest) + ' <span>' + esc(lastWord) + '</span>';
    }

    var desc = el('.about-hero p');
    if (desc && d.description) desc.textContent = d.description;

    var navLinks = el('.about-nav-links');
    if (navLinks && d.buttons) {
      var anchors = navLinks.querySelectorAll('a');
      for (var i = 0; i < anchors.length; i++) {
        var a = anchors[i];
        var b = d.buttons[i];
        if (b) {
          a.href = b.url || '#';
          a.textContent = b.label || '';
          a.style.display = '';
        } else {
          a.style.display = 'none';
        }
      }
    }
  }

  /* ------------------------------------------------------------------
     NATIONAL VISION injector
     ------------------------------------------------------------------ */
  function injectNationalVision(d) {
    var eyebrow = el('#national-vision .eyebrow');
    if (eyebrow && d.eyebrow) eyebrow.textContent = d.eyebrow;

    var heading = el('#national-vision .nv-vision-title');
    if (heading && d.heading) heading.textContent = d.heading;

    var desc = el('#national-vision .nv-vision-lead');
    if (desc && d.description) desc.textContent = d.description;

    var cards = document.querySelectorAll('#national-vision .nv-vision-card');
    if (d.cards) {
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var h3 = cards[i].querySelector('h3');
        var p = cards[i].querySelector('p');
        if (h3) h3.textContent = d.cards[i].title || '';
        if (p) p.textContent = d.cards[i].description || '';
      }
    }
  }

  /* ------------------------------------------------------------------
     MISSION injector
     ------------------------------------------------------------------ */
  function injectMission(d) {
    var eyebrow = el('#mission .eyebrow');
    if (eyebrow && d.eyebrow) eyebrow.textContent = d.eyebrow;

    var heading = el('#mission .om-mission-title');
    if (heading && d.heading) heading.textContent = d.heading;

    var desc = el('#mission .om-mission-lead');
    if (desc && d.description) desc.textContent = d.description;
  }

  /* ------------------------------------------------------------------
     VALUES injector
     ------------------------------------------------------------------ */
  function injectValues(d) {
    var eyebrow = el('#values .eyebrow');
    if (eyebrow && d.eyebrow) eyebrow.textContent = d.eyebrow;

    var heading = el('#values .section-title');
    if (heading && d.heading) heading.textContent = d.heading;

    var desc = el('#values .section-desc');
    if (desc && d.description) desc.textContent = d.description;

    var cards = document.querySelectorAll('#values .ov-value-card');
    if (d.cards) {
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var h3 = cards[i].querySelector('h3');
        var p = cards[i].querySelector('p');
        if (h3) h3.textContent = d.cards[i].title || '';
        if (p) p.textContent = d.cards[i].description || '';
      }
    }
  }

  /* ------------------------------------------------------------------
     CENTRAL OFFICE injector
     ------------------------------------------------------------------ */
  function injectCentralOffice(d) {
    var eyebrow = el('#central-office .co-about .eyebrow');
    if (eyebrow && d.eyebrow) eyebrow.textContent = d.eyebrow;

    var heading = el('#central-office .co-about-title');
    if (heading && d.heading) heading.textContent = d.heading;

    var desc = el('#central-office .co-about-lead');
    if (desc && d.description) desc.textContent = d.description;

    var teamEyebrow = el('#central-office .co-team .eyebrow');
    if (teamEyebrow && d.teamEyebrow) teamEyebrow.textContent = d.teamEyebrow;

    var teamHeading = el('#central-office .co-team .section-title');
    if (teamHeading && d.teamHeading) teamHeading.textContent = d.teamHeading;

    var teamDesc = el('#central-office .co-team .section-desc');
    if (teamDesc && d.teamDescription) teamDesc.textContent = d.teamDescription;

    if (d.members) {
      window.__AMARE_ABOUT_CO_MEMBERS = d.members;
    }
  }

  /* ------------------------------------------------------------------
     EXPANSION MAP injector
     ------------------------------------------------------------------ */
  function injectExpansionMap(d) {
    var eyebrow = el('#expansion-map .em-vision .eyebrow');
    if (eyebrow && d.eyebrow) eyebrow.textContent = d.eyebrow;

    var heading = el('#expansion-map .em-vision-title');
    if (heading && d.heading) heading.textContent = d.heading;

    var desc = el('#expansion-map .em-vision-lead');
    if (desc && d.description) desc.textContent = d.description;

    var mapEyebrow = el('#expansion-map .em-map .eyebrow');
    if (mapEyebrow && d.mapEyebrow) mapEyebrow.textContent = d.mapEyebrow;

    var mapHeading = el('#expansion-map .em-map .section-title');
    if (mapHeading && d.mapHeading) mapHeading.textContent = d.mapHeading;

    var mapDesc = el('#expansion-map .em-map .section-desc');
    if (mapDesc && d.mapDescription) mapDesc.textContent = d.mapDescription;

    var legendTitle = el('.em-legend-title');
    if (legendTitle && d.legendTitle) legendTitle.textContent = d.legendTitle;

    var legendSub = el('.em-legend-sub');
    if (legendSub && d.legendSub) legendSub.textContent = d.legendSub;

    var legendItems = document.querySelectorAll('.em-legend-item');
    if (legendItems.length >= 3) {
      if (d.legendActive) legendItems[0].childNodes[legendItems[0].childNodes.length - 1].textContent = d.legendActive;
      if (d.legendUpcoming) legendItems[1].childNodes[legendItems[1].childNodes.length - 1].textContent = d.legendUpcoming;
      if (d.legendFuture) legendItems[2].childNodes[legendItems[2].childNodes.length - 1].textContent = d.legendFuture;
    }

    var emptyDetail = el('.em-map-detail.is-empty span');
    if (emptyDetail && d.emptyDetail) emptyDetail.textContent = d.emptyDetail;

    if (d.regions) {
      window.__AMARE_ABOUT_REGIONS = d.regions;
    }
  }

  /* ------------------------------------------------------------------
     CTA injector
     ------------------------------------------------------------------ */
  function injectCta(d) {
    var h2 = el('#about-cta h2');
    if (h2 && d.heading) h2.textContent = d.heading;

    var p = el('#about-cta p');
    if (p && d.description) p.textContent = d.description;

    var buttons = document.querySelectorAll('#about-cta .about-cta-actions a');
    if (buttons.length > 0) {
      var btn = buttons[0];
      if (d.buttonLabel) {
        var svg = btn.querySelector('svg');
        btn.textContent = d.buttonLabel;
        if (svg) btn.appendChild(svg);
      }
      if (d.buttonUrl) btn.href = d.buttonUrl;
    }
  }

  /* ------------------------------------------------------------------
     Dispatch
     ------------------------------------------------------------------ */
  function injectSection(section) {
    if (!section || !section.enabled) return;
    var type = section.type;
    var data = section.data || {};
    var renderer = data._renderer || '';

    console.log('[About CMS] Dispatching section:', { type: type, renderer: renderer, fields: Object.keys(data) });

    if (type === 'hero') {
      return injectHero(data);
    }

    if (type === 'cta') {
      return injectCta(data);
    }

    if (type === 'custom') {
      switch (renderer) {
        case 'nationalVision': return injectNationalVision(data);
        case 'mission':        return injectMission(data);
        case 'values':         return injectValues(data);
        case 'centralOffice':  return injectCentralOffice(data);
        case 'expansionMap':   return injectExpansionMap(data);
      }
    }

    console.log('[About CMS] Unhandled section:', type, renderer);
  }

  /* ------------------------------------------------------------------
     Supabase fetch
     ------------------------------------------------------------------ */
  function loadAboutFromSupabase(callback) {
    var MAX_RETRIES = 30;
    var RETRY_MS = 200;

    function tryLoad(retries) {
      var S = window.Supabase;
      if (!S || !S.getClient) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        console.log('[About CMS] Supabase client not available');
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

      console.log('[About CMS] Fetching about page data...');

      client
        .from('pages')
        .select('id, title, slug, status')
        .eq('slug', '/about')
        .eq('status', 'published')
        .single()
        .then(function (pageResult) {
          if (pageResult.error || !pageResult.data) {
            console.log('[About CMS] Page not found or not published:', pageResult.error);
            return callback(null);
          }
          var pageId = pageResult.data.id;

          client
            .from('page_sections')
            .select('id, section_type, section_key, content, settings, styles, visible, sort_order')
            .eq('page_id', pageId)
            .eq('visible', true)
            .order('sort_order', { ascending: true })
            .then(function (sectionsResult) {
              if (sectionsResult.error || !sectionsResult.data) {
                console.log('[About CMS] page_sections error:', sectionsResult.error);
                return callback(null);
              }

              var rows = sectionsResult.data;
              console.log('[About CMS] page_sections loaded:', rows.length);

              if (!Array.isArray(rows) || rows.length === 0) return callback(null);

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
                  section_key: row.section_key || null,
                  data: data,
                });
              }

              return callback(sections);
            })
            .catch(function () {
              return callback(null);
            });
        })
        .catch(function () {
          return callback(null);
        });
    }

    tryLoad(0);
  }

  /* ------------------------------------------------------------------
     Inject all fallbacks
     ------------------------------------------------------------------ */
  function injectAllFallbacks() {
    injectHero(FALLBACK.hero);
    injectNationalVision(FALLBACK.nationalVision);
    injectMission(FALLBACK.mission);
    injectValues(FALLBACK.values);
    injectCentralOffice(FALLBACK.centralOffice);
    injectExpansionMap(FALLBACK.expansionMap);
    injectCta(FALLBACK.cta);
  }

  /* ------------------------------------------------------------------
     Bootstrap
     ------------------------------------------------------------------ */
  function init() {
    console.log('[About CMS] Starting...');

    loadAboutFromSupabase(function (sections) {
      if (sections && sections.length > 0) {
        console.log('[About CMS] Loaded', sections.length, 'CMS sections — injecting...');
        for (var i = 0; i < sections.length; i++) {
          injectSection(sections[i]);
        }
        console.log('[About CMS] All sections injected.');
      } else {
        console.log('[About CMS] No CMS sections — using fallbacks.');
        injectAllFallbacks();
      }

      /* Signal that CMS data is ready (triggers map + member grid init) */
      var event = new CustomEvent('about-cms-ready');
      document.dispatchEvent(event);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
