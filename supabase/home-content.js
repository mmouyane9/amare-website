/* ==========================================================================
   Home Content Service — loads the Home page sections from Supabase
   page_sections table and injects dynamic content into every section.

   Architecture:
     1. Load pages WHERE slug='/' AND status='published'
     2. Load page_sections WHERE page_id = home.id AND visible = true
     3. Merge content + settings + styles → flat data object
     4. Inject each section into the existing DOM
     5. Hardcoded fallback for every section — website never breaks
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Hardcoded fallback data — mirrors the CMS content format.
     All general fields (name, phone, email, address, map) are sourced
     from window.__AMARE_SETTINGS__ when available.
     ------------------------------------------------------------------ */
  function getSetting(key, defaultValue) {
    var s = window.__AMARE_SETTINGS__;
    return (s && s[key]) || defaultValue;
  }

  /* Bilingual helper — picks key_lang, falls back to key_ar, then key. */
  function pickBilingual(data, key) {
    if (!data) return '';
    var lang = (window.I18n && window.I18n.getCurrentLanguage) ? window.I18n.getCurrentLanguage() : 'ar';
    var value = data[key + '_' + lang];
    if (value != null && value !== '') return value;
    value = data[key + '_ar'];
    if (value != null && value !== '') return value;
    return data[key] || '';
  }

  /* Use the translated fallback from I18n when available (Arabic is the
     default), otherwise the hardcoded Arabic fallback below. */
  function localizedFallback() {
    if (window.I18n && window.I18n.home) {
      var fb = window.I18n.home();
      if (fb) {
        // Re-apply dynamic settings (association name) for the Arabic UI,
        // matching the historic hardcoded fallback behaviour.
        if (window.I18n.getCurrentLanguage() === 'ar') {
          if (fb.about && fb.about.paragraphs && fb.about.paragraphs.length > 0) {
            fb.about.paragraphs[0] =
              'تأسست ' + getSetting('association_name', 'الجمعية المغربية لهواة البحث والاستكشاف') +
              ' سنة 2014 على يد مجموعة من الفاعلين المدنيين، بهدف الاستجابة للاحتياجات الحقيقية للمجتمعات المحلية عبر برامج ميدانية في التعليم والصحة والتمكين الاقتصادي.';
          }
          if (fb.featuresGrid) {
            fb.featuresGrid.eyebrow =
              'لماذا ' + getSetting('association_name', 'الجمعية المغربية لهواة البحث والاستكشاف');
          }
        }
        return fb;
      }
    }
    return FALLBACK;
  }

  var FALLBACK = {
    hero: {
      heading:
        'اكتشف...\nشارك...\nوانضم إلى الجمعية المغربية\nلهواة البحث والاستكشاف',
      subheading: 'التسجيل في المسابقة الوطنية مفتوح الآن',
      description:
        'شارك في المسابقة الوطنية، وانخرط إلكترونياً في الجمعية، أو جدد عضويتك بسهولة، واطلع على آخر الأنشطة والفعاليات والأخبار عبر المنصة الرسمية.',
      backgroundImage: '',
      buttons: [
        { label: 'شارك في المسابقة', url: '/competition.html', variant: 'secondary' },
        { label: 'انخرط في الجمعية', url: '/Join us/join-us-online.html', variant: 'primary' },
        { label: 'تجديد الانخراط', url: '/Join us/membership-renewal.html', variant: 'outline' },
      ],
    },
    about: {
      eyebrow: 'من نحن',
      heading: 'نبني اليوم',
      headingHighlight: 'غدًا',
      description: 'منذ 2014 ونحن نصنع الفرق في حياة آلاف الأسر المغربية',
      paragraphs: [
        'تأسست ' + getSetting('association_name', 'الجمعية المغربية لهواة البحث والاستكشاف') + ' سنة 2014 على يد مجموعة من الفاعلين المدنيين، بهدف الاستجابة للاحتياجات الحقيقية للمجتمعات المحلية عبر برامج ميدانية في التعليم والصحة والتمكين الاقتصادي.',
        'نؤمن بأن التغيير المستدام يبدأ من الأفراد، لذلك نعمل جنبًا إلى جنب مع السكان المحليين والمتطوعين والشركاء لبناء حلول تدوم أثرها لسنوات قادمة.',
      ],
      features: [
        { title: 'برامج تعليمية', description: 'دعم مدرسي ومحو أمية لتمكين الأطفال والكبار من فرص تعليمية عادلة.' },
        { title: 'رعاية صحية', description: 'قوافل طبية مجانية دورية لفائدة الأسر في المناطق النائية.' },
        { title: 'تمكين اقتصادي', description: 'تكوين مهني ودعم المشاريع المدرة للدخل للنساء والشباب.' },
      ],
      buttons: [
        { label: 'تعرف على برامجنا', url: '#services' },
        { label: 'تواصل معنا', url: '#contact' },
      ],
      image: {
        url: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?q=80&w=1000&auto=format&fit=crop',
        alt: 'متطوعون ميدانيون',
      },
      stats: [
        { value: '500', suffix: '+', label: 'مستفيد' },
        { value: '120', suffix: '+', label: 'متطوع' },
        { value: '12', suffix: '+', label: 'سنة' },
      ],
    },
    featuresGrid: {
      eyebrow: 'لماذا ' + getSetting('association_name', 'الجمعية المغربية لهواة البحث والاستكشاف'),
      heading: 'ما يميز عملنا',
      description: 'نجمع بين الخبرة الميدانية والشفافية الكاملة لضمان أثر حقيقي وملموس في كل مشروع ننفذه.',
      cards: [
        { heading: 'برامج تعليمية', description: 'دعم مدرسي ومحو أمية لتمكين الأطفال والكبار من فرص تعليمية عادلة.' },
        { heading: 'رعاية صحية', description: 'قوافل طبية مجانية دورية لفائدة الأسر في المناطق النائية.' },
        { heading: 'تمكين اقتصادي', description: 'تكوين مهني ودعم للمشاريع المدرة للدخل للنساء والشباب.' },
        { heading: 'شفافية كاملة', description: 'تقارير مالية وميدانية دورية متاحة لجميع الداعمين والشركاء.' },
      ],
    },
    activitiesGrid: {
      heading: 'أنشطتنا',
      description: 'اكتشف أبرز الأنشطة والبرامج التي تنظمها الجمعية على مدار السنة.',
      cards: [
        { title: 'خرجات', description: 'رحلات ميدانية واستكشافية لاكتشاف الطبيعة والتراث المغربي.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=900&auto=format&fit=crop', linkText: 'اكتشف المزيد', linkUrl: '#' },
        { title: 'مسابقات وراليات', description: 'تنظيم مسابقات وتحديات وراليات استكشافية لتعزيز روح الفريق.', image: 'https://www.kechpresse.com/wp-content/uploads/2022/01/%D8%B1%D8%A7%D9%84%D9%8A-%D8%AF%D9%83%D8%A7%D8%B1-%D8%B3%D8%B9%D9%88%D8%AF%D9%8A.jpg', linkText: 'اكتشف المزيد', linkUrl: '#' },
        { title: 'تكوينات', description: 'دورات وورشات تكوينية في مجالات البحث والاستكشاف والإسعافات الأولية.', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=900&auto=format&fit=crop', linkText: 'اكتشف المزيد', linkUrl: '#' },
        { title: 'معارض', description: 'معارض علمية وثقافية للتعريف بالتراث الطبيعي والاستكشاف.', image: 'https://www.aldeereh.com/wp-content/uploads/2024/09/%D8%A7%D9%84%D8%B2%D9%88%D8%A7%D8%B1-%D9%8A%D8%AA%D9%88%D8%A7%D9%81%D8%AF%D9%88%D9%86-%D8%B9%D9%84%D9%89-%D9%85%D8%B9%D8%B1%D8%B6-%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6-%D8%A7%D9%84%D8%AF%D9%88%D9%84%D9%8A-%D9%84%D9%84%D9%83%D8%AA%D8%A7%D8%A8-2.jpg', linkText: 'اكتشف المزيد', linkUrl: '#' },
        { title: 'لقاءات', description: 'لقاءات علمية وتواصلية مع الخبراء والمهتمين بمجال الاستكشاف.', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=900&auto=format&fit=crop', linkText: 'اكتشف المزيد', linkUrl: '#' },
        { title: 'حملات بيئية', description: 'حملات للتوعية البيئية وحماية الطبيعة والمحافظة على الموارد.', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=900&auto=format&fit=crop', linkText: 'اكتشف المزيد', linkUrl: '#' },
      ],
    },
    newsGrid: {
      eyebrow: 'آخر المستجدات',
      heading: 'أخبار وفعاليات الجمعية',
      cards: [
        { title: 'إطلاق برنامج المنح الدراسية للموسم الجديد', date: '12 يوليوز 2026', badge: 'تعليم', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=700&auto=format&fit=crop', linkText: 'اقرأ المزيد', linkUrl: '#' },
        { title: 'قافلة طبية مجانية استفاد منها أكثر من 300 شخص', date: '28 يونيو 2026', badge: 'صحة', image: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=700&auto=format&fit=crop', linkText: 'اقرأ المزيد', linkUrl: '#' },
        { title: 'انطلاق ورشات التكوين المهني لفائدة 40 امرأة', date: '05 يونيو 2026', badge: 'تمكين', image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=700&auto=format&fit=crop', linkText: 'اقرأ المزيد', linkUrl: '#' },
      ],
    },
    storeCta: {
      heading: 'ادعم رسالتنا\nبمنتجات حصرية',
      description: 'اكتشف مجموعة منتجات AMARE الحصرية. كل عملية شراء تساهم في دعم أنشطة الجمعية، وتمويل برامج البحث والاستكشاف، وحماية التراث الوطني.',
      buttonLabel: 'تسوق الآن',
      buttonUrl: '/amare store/index.html',
      backgroundImage: 'Amare files /amare-shop.png',
    },
    newsletterCta: {
      heading: 'اشترك في نشرتنا الإخبارية',
      description: 'كن أول من يعلم بآخر برامجنا وفعالياتنا وقصص النجاح التي نصنعها معًا.',
      buttonLabel: 'اشترك الآن',
      buttonUrl: '#newsletter',
    },
    footer: {
      brandName: getSetting('association_name', 'الجمعية المغربية لهواة البحث والاستكشاف'),
      brandLogo: getSetting('logo_url', '/Amare%20files%20/logo.png'),
      description: getSetting('association_name', 'الجمعية المغربية لهواة البحث والاستكشاف') + ' هي إطار قانوني وطني يجمع الهواة تحت راية واحدة لصون التراث الوطني المغربي.',
      socialLinks: [
        { platform: 'facebook', url: '#' },
        { platform: 'instagram', url: '#' },
        { platform: 'linkedin', url: '#' },
      ],
      quickLinksHeading: 'روابط سريعة',
      quickLinks: [
        { label: 'الرئيسية', url: '/index.html' }, { label: 'اتصل بنا', url: '#about' },
        { label: 'خدماتنا', url: '#services' }, { label: 'الاخبار', url: '#news' },
        { label: 'الارشيف', url: '#newsletter' }, { label: 'الفروع الجهوية', url: '#home' },
        { label: 'انخرط معنا', url: '#about' }, { label: 'شركاؤنا', url: '#services' },
        { label: 'انشطتنا', url: '#news' }, { label: 'من نحن', url: '#newsletter' },
      ],
      programsHeading: 'برامجنا',
      programs: [
        { label: 'SOS Amare', url: '/Our%20services/sos-amare.html' }, { label: 'متجر Amare', url: '/amare store/index.html' },
        { label: 'بيت المستكشف Amare', url: '/Our%20services/explorer-house.html' }, { label: 'مجلة Amare', url: '/Our%20services/amare-magazine.html' },
        { label: 'أكاديمية Amare', url: '/Our%20services/amare-academy.html' }, { label: 'النوادي', url: '/clubs/' },
        { label: 'المستشار القانوني', url: '/Our%20services/legal-advisor.html' }, { label: 'عقد التأمين', url: '/Our%20services/insurance-contract.html' },
      ],
      contactHeading: 'تواصل معنا',
      contact: { address: getSetting('address', 'ص.ب 749 أيت ملول 86150'), phone: getSetting('phone', '+212 684869996'), email: getSetting('contact_email', 'association.amare.agadir@gmail.com') },
      mapHeading: 'موقعنا',
      mapLabel: '📍 Ait Melloul, Agadir',
      googleMapsUrl: getSetting('google_maps_url', 'https://www.google.com/maps?q=30.385528,-9.448611'),
      copyright: '© 2026 ' + getSetting('association_name', 'الجمعية المغربية لهواة البحث والاستكشاف') + '. جميع الحقوق محفوظة.',
      bottomLinks: [
        { label: 'سياسة الخصوصية', url: '#' },
        { label: 'الشروط والأحكام', url: '#' },
      ],
    },
  };

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

  /* Translate a text value via the page-content dictionary for the
     active language. Arabic values stay as-is in Arabic mode; in every
     other language, an I18n.t() lookup is performed. Translations that
     do not match any dictionary key fall back to the original Arabic
     (per the user's rule), never keys, never null/undefined. */
  function L(text) {
    if (text == null || text === '') return '';
    if (!window.I18n) return text;
    var lang = window.I18n.getCurrentLanguage();
    if (lang === 'ar') return text;
    var result = window.I18n.t(text);
    if (result !== text) return result;
    /* If the full string contains \n, try per-line translation. */
    if (String(text).indexOf('\n') !== -1) {
      var parts = String(text).split('\n');
      var changed = false, rebuilt = [];
      for (var i = 0; i < parts.length; i++) {
        var p = window.I18n.t(parts[i]);
        if (p !== parts[i]) changed = true;
        rebuilt.push(p);
      }
      if (changed) return rebuilt.join('\n');
    }
    return text;
  }

  /* ------------------------------------------------------------------
     HERO injector
     heading lines → <br> separated in h1 (last line wrapped in <span>)
     subheading or eyebrow → .hero-eyebrow element
     ------------------------------------------------------------------ */
  function injectHero(d) {
    var h1 = el('.hero-inner h1');
    if (h1) {
      var lines = (L(pickBilingual(d, 'heading') || '')).split('\n');
      var html = '';
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line) continue;
        if (i === lines.length - 1) {
          html += '<span>' + esc(line) + '</span>';
        } else {
          if (html) html += '<br>';
          html += esc(line);
        }
      }
      h1.innerHTML = html;
    }

    var eyebrow = el('.hero-inner .hero-eyebrow');
    if (eyebrow) {
      var eyebrowText = L(pickBilingual(d, 'eyebrow') || pickBilingual(d, 'subheading') || '');
      /* Strip misplaced Arabic "إلى" when followed by a competition name
         like "DETECTLAND MAROC 2" (CMS data artifact). */
      eyebrowText = eyebrowText.replace(/^إلى\s+(?=[A-Z])/i, '');
      eyebrow.textContent = eyebrowText;
    }

    var desc = el('.hero-inner p.hero-fade');
    if (desc && pickBilingual(d, 'description')) desc.textContent = L(pickBilingual(d, 'description'));

    var actions = el('.hero-actions');
    if (actions && d.buttons) {
      var heroCtaKeys = ['hero.cta1', 'hero.cta2', 'hero.cta3'];
      var anchors = actions.querySelectorAll('a');
      for (var j = 0; j < anchors.length; j++) {
        var a = anchors[j], b = d.buttons[j];
        if (!b || !pickBilingual(b, 'label')) { a.style.display = 'none'; continue; }
        a.style.display = '';
        var svgs = a.querySelectorAll('svg'), svgHtml = '';
        for (var k = 0; k < svgs.length; k++) svgHtml += svgs[k].outerHTML;
        a.href = b.url || '';
        var btnLabel = L(pickBilingual(b, 'label'));
        if (btnLabel === pickBilingual(b, 'label')) {
          var key = heroCtaKeys[j] || '';
          var keyVal = (window.I18n && key && window.I18n.t(key));
          if (keyVal && keyVal !== key) btnLabel = keyVal;
        }
        a.innerHTML = esc(btnLabel) + ' ' + svgHtml;
      }
    }

    if (d.backgroundImage) {
      var bg = el('.hero-bg');
      if (bg) bg.style.backgroundImage = 'url(' + d.backgroundImage + ')';
    }
  }

  /* ABOUT (renderer: about) */
  function injectAbout(d) {
    var eyebrow = el('.about-eyebrow');
    if (eyebrow && pickBilingual(d, 'eyebrow')) {
      var svg = eyebrow.querySelector('svg');
      eyebrow.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(L(pickBilingual(d, 'eyebrow')));
    }

    var title = el('.about-title');
    if (title && pickBilingual(d, 'heading') !== undefined) {
      var hl = L(pickBilingual(d, 'headingHighlight') || '');
      title.innerHTML = esc(L(pickBilingual(d, 'heading') || '')) + ' <span class="about-title-em">' + esc(hl) + '</span>';
      if (pickBilingual(d, 'headingSub')) title.innerHTML += ' ' + esc(L(pickBilingual(d, 'headingSub')));
    }

    var descHead = el('.about-desc-head');
    if (descHead && pickBilingual(d, 'description')) descHead.textContent = L(pickBilingual(d, 'description'));

    var paragraphs = document.querySelectorAll('.about-content .about-text');
    if (d.paragraphs) {
      for (var p = 0; p < Math.min(paragraphs.length, d.paragraphs.length); p++) {
        paragraphs[p].textContent = L(pickBilingual(d.paragraphs, p));
      }
    }

    var featureItems = document.querySelectorAll('.about-features .about-feature');
    if (d.features) {
      for (var f = 0; f < Math.min(featureItems.length, d.features.length); f++) {
        var ft = featureItems[f].querySelector('.about-ftitle');
        var fd = featureItems[f].querySelector('.about-fdesc');
        if (ft) ft.textContent = L(pickBilingual(d.features[f], 'title') || '');
        if (fd) fd.textContent = L(pickBilingual(d.features[f], 'description') || '');
      }
    }

    var aboutBtns = document.querySelectorAll('.about-actions a');
    if (d.buttons) {
      for (var ab = 0; ab < Math.min(aboutBtns.length, d.buttons.length); ab++) {
        var ba = aboutBtns[ab], bb = d.buttons[ab];
        ba.href = bb.url || '#';
        var translatedLabel = L(pickBilingual(bb, 'label'));
        var bSpan = ba.querySelector('span');
        if (bSpan) bSpan.textContent = translatedLabel;
        else {
          var bsvgs = ba.querySelectorAll('svg'), bsvg = '';
          for (var bs = 0; bs < bsvgs.length; bs++) bsvg += bsvgs[bs].outerHTML;
          ba.innerHTML = bsvg + '<span>' + esc(translatedLabel) + '</span>';
        }
      }
    }

    var aboutImg = el('.about-visual .about-img');
    if (aboutImg && d.image) {
      aboutImg.src = d.image.url || '';
      aboutImg.alt = L(pickBilingual(d.image, 'alt') || '');
    }

    if (d.stats) {
      var statMap = ['.about-stat-1', '.about-stat-2', '.about-stat-3'];
      for (var s = 0; s < Math.min(statMap.length, d.stats.length); s++) {
        var statNum = el(statMap[s] + ' .about-stat-num');
        var statLbl = el(statMap[s] + ' .about-stat-lbl');
        if (statNum) {
          statNum.textContent = d.stats[s].value + (d.stats[s].suffix || '');
          statNum.setAttribute('data-count', d.stats[s].value);
          statNum.setAttribute('data-suffix', d.stats[s].suffix || '');
        }
        if (statLbl) statLbl.textContent = L(pickBilingual(d.stats[s], 'label'));
      }
    }
  }

  /* FEATURES GRID (renderer: featuresGrid) */
  function injectFeaturesGrid(d) {
    var eyebrow = el('#features .eyebrow');
    if (eyebrow && pickBilingual(d, 'eyebrow')) eyebrow.textContent = L(pickBilingual(d, 'eyebrow'));

    var heading = el('#features .section-title');
    if (heading && pickBilingual(d, 'heading')) heading.textContent = L(pickBilingual(d, 'heading'));

    var desc = el('#features .section-desc');
    if (desc && pickBilingual(d, 'description')) desc.textContent = L(pickBilingual(d, 'description'));

    var cards = document.querySelectorAll('#features .feature-card');
    if (d.cards) {
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var h3 = cards[i].querySelector('h3');
        var p = cards[i].querySelector('p');
        if (h3) h3.textContent = L(pickBilingual(d.cards[i], 'heading') || '');
        if (p) p.textContent = L(pickBilingual(d.cards[i], 'description') || '');
      }
    }
  }

  /* ACTIVITIES GRID (renderer: activitiesGrid) */
  function injectActivitiesGrid(d) {
    var heading = el('.activities-title');
    if (heading && pickBilingual(d, 'heading')) heading.textContent = L(pickBilingual(d, 'heading'));

    var desc = el('.activities-desc');
    if (desc && pickBilingual(d, 'description')) desc.textContent = L(pickBilingual(d, 'description'));

    var cards = document.querySelectorAll('#services .activity-card');
    if (d.cards) {
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var img = cards[i].querySelector('img');
        var title = cards[i].querySelector('.activity-title');
        var cardDesc = cards[i].querySelector('.activity-desc');
        var link = cards[i].querySelector('.activity-link');

        if (img && d.cards[i].image) {
          img.src = d.cards[i].image;
          img.alt = L(pickBilingual(d.cards[i], 'title') || '');
        }
        if (title) title.textContent = L(pickBilingual(d.cards[i], 'title') || '');
        if (cardDesc) cardDesc.textContent = L(pickBilingual(d.cards[i], 'description') || '');
        if (link) {
          link.href = d.cards[i].linkUrl || '#';
          var arrow = link.querySelector('.activity-link-arrow');
          link.innerHTML = esc(L(pickBilingual(d.cards[i], 'linkText') || '')) + (arrow ? ' <span class="activity-link-arrow">' + arrow.textContent + '</span>' : '');
        }
      }
    }
  }

  /* NEWS GRID (renderer: newsGrid) */
  function injectNewsGrid(d) {
    var eyebrow = el('#news .eyebrow');
    if (eyebrow && pickBilingual(d, 'eyebrow')) eyebrow.textContent = L(pickBilingual(d, 'eyebrow'));

    var heading = el('#news .section-title');
    if (heading && pickBilingual(d, 'heading')) heading.textContent = L(pickBilingual(d, 'heading'));

    var cards = document.querySelectorAll('#news .news-card');
    if (d.cards) {
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var img = cards[i].querySelector('.news-img img');
        var badge = cards[i].querySelector('.news-badge');
        var date = cards[i].querySelector('.news-date');
        var title = cards[i].querySelector('h3');
        var more = cards[i].querySelector('.news-more');

        if (img && d.cards[i].image) { img.src = d.cards[i].image; img.alt = L(pickBilingual(d.cards[i], 'title') || ''); }
        if (badge && pickBilingual(d.cards[i], 'badge')) badge.textContent = L(pickBilingual(d.cards[i], 'badge'));
        if (date && pickBilingual(d.cards[i], 'date')) {
          var svg = date.querySelector('svg');
          date.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(L(pickBilingual(d.cards[i], 'date')));
        }
        if (title) title.textContent = L(pickBilingual(d.cards[i], 'title') || '');
        if (more) {
          more.href = d.cards[i].linkUrl || '#';
          var msvg = more.querySelector('svg');
          more.innerHTML = esc(L(pickBilingual(d.cards[i], 'linkText') || '')) + ' ' + (msvg ? msvg.outerHTML : '');
        }
      }
    }
  }

  /* CTA — dispatched to store banner or newsletter. When called from
     injectAllFallbacks the caller knows which variant, so the `isNewsletter`
     hint prevents a wrong branch on translated headings. When called from
     CMS dispatch, detection is done on the raw Arabic heading. */
  function injectCta(d, isNewsletter) {
    var heading = pickBilingual(d, 'heading') || '';

    /* Detect which CTA section by heading keywords (raw Arabic) */
    var isNl = isNewsletter !== undefined
      ? isNewsletter
      : (heading.indexOf('نشرتنا') !== -1 || heading.indexOf('اشترك') !== -1);

    if (isNl) {
      /* Newsletter */
      var nh = el('#newsletter h2');
      if (nh && pickBilingual(d, 'heading')) {
        var nlHeading = L(pickBilingual(d, 'heading'));
        if (nlHeading === pickBilingual(d, 'heading') && !/[\u0600-\u06FF]/.test(pickBilingual(d, 'heading'))) {
          nlHeading = (window.I18n && window.I18n.t('newsletter.title')) || nlHeading;
        }
        nh.textContent = nlHeading;
      }

      var nd = el('#newsletter p');
      if (nd && pickBilingual(d, 'description')) {
        var nlDesc = L(pickBilingual(d, 'description'));
        if (nlDesc === pickBilingual(d, 'description') && !/[\u0600-\u06FF]/.test(pickBilingual(d, 'description'))) {
          nlDesc = (window.I18n && window.I18n.t('newsletter.desc')) || nlDesc;
        }
        nd.textContent = nlDesc;
      }

      var nbtn = el('#newsletter button[type="submit"]');
      if (nbtn && pickBilingual(d, 'buttonLabel')) {
        var nlBtn = L(pickBilingual(d, 'buttonLabel'));
        if (nlBtn === pickBilingual(d, 'buttonLabel') && !/[\u0600-\u06FF]/.test(pickBilingual(d, 'buttonLabel'))) {
          nlBtn = (window.I18n && window.I18n.t('newsletter.cta')) || nlBtn;
        }
        nbtn.textContent = nlBtn;
      }
    } else {
      /* Store banner */

      /* Eyebrow / badge */
      var se = el('.store-eyebrow');
      if (se) {
        var seSvg = se.querySelector('svg');
        var seLabel = L(pickBilingual(d, 'eyebrowLabel') || 'متجر AMARE');
        /* If the L() helper could not translate a non-Arabic source,
           fall back to the key-based translation. */
        if (seLabel === (pickBilingual(d, 'eyebrowLabel') || 'متجر AMARE') && !/[\u0600-\u06FF]/.test(seLabel)) {
          seLabel = (window.I18n && window.I18n.t('store.eyebrow')) || seLabel;
        }
        se.innerHTML = (seSvg ? seSvg.outerHTML + ' ' : '') + esc(seLabel);
      }

      /* Heading / title */
      var sh = el('.store-title');
      if (sh && pickBilingual(d, 'heading')) {
        var headingTranslated = L(pickBilingual(d, 'heading'));
        /* If L() returned the source unchanged and it has no Arabic chars,
           fall back to the i18n key (which already carries the <br>). */
        if (headingTranslated === pickBilingual(d, 'heading') && !/[\u0600-\u06FF]/.test(pickBilingual(d, 'heading'))) {
          headingTranslated = (window.I18n && window.I18n.t('store.title')) || headingTranslated;
          sh.innerHTML = headingTranslated;
        } else {
          sh.innerHTML = esc(headingTranslated).replace(/\n/g, '<br>');
        }
      }

      /* Description */
      var sd = el('.store-desc');
      if (sd && pickBilingual(d, 'description')) {
        var descTranslated = L(pickBilingual(d, 'description'));
        if (descTranslated === pickBilingual(d, 'description') && !/[\u0600-\u06FF]/.test(pickBilingual(d, 'description'))) {
          descTranslated = (window.I18n && window.I18n.t('store.desc')) || descTranslated;
        }
        sd.textContent = descTranslated;
      }

      /* CTA button */
      var sbtn = el('.store-btn');
      if (sbtn) {
        sbtn.href = d.buttonUrl || '#';
        var btnSvg = sbtn.querySelector('svg');
        var btnLabel = L(pickBilingual(d, 'buttonLabel') || '');
        if (btnLabel === (pickBilingual(d, 'buttonLabel') || '') && !/[\u0600-\u06FF]/.test(pickBilingual(d, 'buttonLabel') || '')) {
          btnLabel = (window.I18n && window.I18n.t('store.cta')) || btnLabel;
        }
        sbtn.innerHTML = (btnSvg ? btnSvg.outerHTML + ' ' : '') + '<span>' + esc(btnLabel) + '</span>';
      }

      if (d.backgroundImage) {
        var img = el('.store-image');
        if (img) img.src = d.backgroundImage;
      }
    }
  }

  /* FOOTER (renderer: footer) */
  function injectFooter(d) {
    var brandName = el('.footer-brand .brand-name');
    if (brandName && pickBilingual(d, 'brandName')) brandName.textContent = pickBilingual(d, 'brandName');

    var brandLogo = el('.footer-brand .brand-mark img');
    if (brandLogo && d.brandLogo) brandLogo.src = d.brandLogo;

    var desc = el('.footer-about p');
    if (desc && pickBilingual(d, 'description')) desc.textContent = pickBilingual(d, 'description');

    /* Social links */
    var socialAnchors = document.querySelectorAll('.footer-social a');
    if (d.socialLinks) {
      for (var s = 0; s < Math.min(socialAnchors.length, d.socialLinks.length); s++) {
        socialAnchors[s].href = d.socialLinks[s].url || '#';
      }
    }

    /* Contact */
    var contactH4 = el('.footer-contact');
    if (contactH4) {
      var contactParent = contactH4.parentElement;
      var contactHeading = contactParent ? contactParent.querySelector('h4') : null;
      if (contactHeading && pickBilingual(d, 'contactHeading')) contactHeading.textContent = pickBilingual(d, 'contactHeading');

      var contactLis = contactH4.querySelectorAll('li');
      if (d.contact && contactLis.length >= 3) {
        var spans0 = contactLis[0].querySelectorAll('span');
        if (spans0.length > 0) spans0[spans0.length - 1].textContent = pickBilingual(d.contact, 'address') || '';
        var spans1 = contactLis[1].querySelectorAll('span');
        if (spans1.length > 0) spans1[spans1.length - 1].textContent = d.contact.phone || '';
        var spans2 = contactLis[2].querySelectorAll('span');
        if (spans2.length > 0) spans2[spans2.length - 1].textContent = d.contact.email || '';
      }
    }

    /* Map */
    var mapBadge = el('.footer-map-badge');
    if (mapBadge && pickBilingual(d, 'mapLabel')) mapBadge.textContent = pickBilingual(d, 'mapLabel');

    var mapHeading = el('.footer-location h4');
    if (mapHeading && pickBilingual(d, 'mapHeading')) mapHeading.textContent = pickBilingual(d, 'mapHeading');

    var gmUrl = d.googleMapsUrl;
    if (!gmUrl && d.mapLat && d.mapLon) {
      gmUrl = 'https://www.google.com/maps?q=' + d.mapLat + ',' + d.mapLon;
    }

    var mapIframe = el('.footer-map-frame');
    if (mapIframe && gmUrl) {
      mapIframe.src = gmUrl.replace('&output=embed', '') + '&output=embed';
    }

    var mapBtn = el('.footer-map-btn');
    if (mapBtn && gmUrl) {
      mapBtn.href = gmUrl.replace('&z=16&output=embed', '');
    }

    /* Copyright */
    var copyright = el('.footer-bottom p');
    if (copyright && pickBilingual(d, 'copyright')) copyright.textContent = pickBilingual(d, 'copyright');

    var bottomLinkAnchors = document.querySelectorAll('.footer-bottom-links a');
    if (d.bottomLinks) {
      for (var bl = 0; bl < Math.min(bottomLinkAnchors.length, d.bottomLinks.length); bl++) {
        bottomLinkAnchors[bl].href = d.bottomLinks[bl].url || '#';
        bottomLinkAnchors[bl].textContent = pickBilingual(d.bottomLinks[bl], 'label') || '';
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
        a.textContent = pickBilingual(items[i], 'label') || '';
      }
    }
  }

  /* ------------------------------------------------------------------
     Data mappers — translate CMS content shapes to injector shapes
     ------------------------------------------------------------------ */

  function mapHeroData(d) {
    var buttons = [];
    if (Array.isArray(d.buttons) && d.buttons.length > 0) {
      buttons = d.buttons.map(function(b) {
        return { label: b.label || '', url: b.url || '#', variant: b.variant || 'primary' };
      });
    } else {
      buttons = [
        { label: d.primaryButtonText || '', url: d.primaryButtonUrl || '#', variant: 'secondary' },
        { label: d.secondaryButtonText || '', url: d.secondaryButtonUrl || '#', variant: 'primary' },
      ];
    }
    return {
      heading: d.heading || '',
      subheading: d.subheading || '',
      description: d.description || '',
      eyebrow: d.subheading || '',
      buttons: buttons,
      backgroundImage: d.backgroundImage || '',
    };
  }

  function mapAboutData(d) {
    return {
      eyebrow: d.subheading || '',
      heading: d.heading ? d.heading.split(' ').slice(0, -1).join(' ') : '',
      headingHighlight: d.heading ? d.heading.split(' ').pop() : '',
      description: d.subheading || '',
      paragraphs: d.body ? d.body.split('\n\n').filter(function(p) { return p.trim(); }) : [],
      buttons: [
        { label: d.buttonText || '', url: d.buttonUrl || '#' },
      ],
      image: { url: d.image || '', alt: '' },
    };
  }

  function injectAboutStats(d) {
    var statMap = ['.about-stat-1', '.about-stat-2', '.about-stat-3'];
    if (d && d.stats) {
      for (var s = 0; s < Math.min(statMap.length, d.stats.length); s++) {
        var statNum = el(statMap[s] + ' .about-stat-num');
        var statLbl = el(statMap[s] + ' .about-stat-lbl');
        if (statNum) {
          var val = d.stats[s].value || d.stats[s].number || '0';
          var suffix = d.stats[s].suffix || '';
          statNum.textContent = val + suffix;
          statNum.setAttribute('data-count', val);
          statNum.setAttribute('data-suffix', suffix);
        }
        if (statLbl) statLbl.textContent = L(pickBilingual(d.stats[s], 'label'));
      }
    }
  }

  function mapStatsData(d) {
    return d;
  }

  function mapFeaturesGridData(d) {
    return {
      eyebrow: d.subheading || '',
      heading: d.heading || '',
      description: '',
      cards: (d.cards || []).map(function(c) {
        return { heading: c.title || '', description: c.description || '' };
      }),
    };
  }

  function mapActivitiesGridData(d) {
    return {
      heading: d.heading || '',
      description: d.subheading || '',
      cards: (d.cards || []).map(function(c) {
        return {
          title: c.title || '',
          description: c.description || '',
          image: c.image || '',
          linkText: 'اكتشف المزيد',
          linkUrl: c.link || '#',
        };
      }),
    };
  }

  function mapNewsGridData(d) {
    return {
      heading: d.heading || '',
      eyebrow: d.subheading || '',
      cards: [],
    };
  }

  function mapCtaData(d) {
    return {
      heading: d.heading || '',
      description: d.description || '',
      buttonLabel: d.buttonLabel || d.buttonText || '',
      buttonUrl: d.buttonUrl || '#',
      backgroundImage: d.backgroundImage || d.image || '',
    };
  }

  function mapPartnersData(d) {
    return d;
  }

  /* Inject partners logos into the partners section */
  function injectPartners(d) {
    if (!d || !d.partners) return;
    var grid = el('#partners .partners-grid') || el('.partners-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (var i = 0; i < d.partners.length; i++) {
      var p = d.partners[i];
      var card = document.createElement('div');
      card.className = 'partner-card';
      var html = '';
      if (p.logo) html += '<img src="' + esc(p.logo) + '" alt="' + esc(p.name) + '" class="partner-logo"/>';
      if (p.name) html += '<p class="partner-name">' + esc(p.name) + '</p>';
      if (p.website) html = '<a href="' + esc(p.website) + '" target="_blank" rel="noopener">' + html + '</a>';
      card.innerHTML = html;
      grid.appendChild(card);
    }
  }

  /* ------------------------------------------------------------------
     Dispatch: route section to the correct injector
     ------------------------------------------------------------------ */
  function injectSection(section) {
    if (!section || !section.enabled) return;
    var type = section.type;
    var data = section.data || {};
    var key = section.section_key || '';

    console.log('[Home CMS] Dispatching section:', { type: type, key: key, fields: Object.keys(data) });

    switch (type) {
      case 'hero':  return injectHero(mapHeroData(data));
      case 'cta': {
        var rawHeading = data.heading || '';
        var isNl = rawHeading.indexOf('نشرتنا') !== -1 || rawHeading.indexOf('اشترك') !== -1;
        return injectCta(mapCtaData(data), isNl);
      }

      case 'card_group': {
        if (key === 'features')  return injectFeaturesGrid(mapFeaturesGridData(data));
        if (key === 'activities') return injectActivitiesGrid(mapActivitiesGridData(data));
        break;
      }

      case 'text_block': {
        if (key === 'about') {
          return injectAbout(mapAboutData(data));
        }
        break;
      }

      case 'statistics': {
        return injectAboutStats(mapStatsData(data));
      }

      case 'partners': {
        return injectPartners(mapPartnersData(data));
      }

      case 'news': {
        return injectNewsGrid(mapNewsGridData(data));
      }

      /* Legacy custom renderer support */
      case 'custom': {
        var renderer = data._renderer || '';
        switch (renderer) {
          case 'about':          return injectAbout(data);
          case 'featuresGrid':   return injectFeaturesGrid(data);
          case 'activitiesGrid': return injectActivitiesGrid(data);
          case 'newsGrid':       return injectNewsGrid(data);
          case 'footer':         return injectFooter(data);
          default: break;
        }
      }
      default: {
        console.log('[Home CMS] Unknown section type:', type, key);
        break;
      }
    }
  }

  /* ------------------------------------------------------------------
     Supabase fetch — load page + sections from page_sections table
     ------------------------------------------------------------------ */
  function loadHomeFromSupabase(callback) {
    var MAX_RETRIES = 30;
    var RETRY_MS = 200;

    function tryLoad(retries) {
      var S = window.Supabase;
      if (!S || !S.getClient) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        console.log('[Home CMS] Supabase client not available after', MAX_RETRIES * RETRY_MS, 'ms');
        return callback(null);
      }

      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        console.log('[Home CMS] Supabase client init failed after waiting');
        return callback(null);
      }

      console.log('[Home CMS] Supabase client ready — fetching homepage data...');

    client
      .from('pages')
      .select('id, title, slug, status')
      .eq('slug', '/')
      .eq('status', 'published')
      .single()
      .then(function (pageResult) {
        if (pageResult.error || !pageResult.data) {
          console.log('[Home CMS] Page not found or error:', pageResult.error);
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
              console.log('[Home CMS] page_sections error or no data:', sectionsResult.error);
              return callback(null);
            }

            var rows = sectionsResult.data;
            console.log('[Home CMS] page_sections loaded:', rows.length, 'sections for page_id:', pageId);

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

              console.log('[Home CMS] Section:', row.section_type, '/', row.section_key, '| fields:', Object.keys(data).join(', '));

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
    } // end tryLoad

    tryLoad(0);
  }

  /* ------------------------------------------------------------------
     Inject all fallbacks
     ------------------------------------------------------------------ */
  function injectAllFallbacks() {
    var fb = localizedFallback();
    injectHero(fb.hero);
    injectAbout(fb.about);
    injectFeaturesGrid(fb.featuresGrid);
    injectActivitiesGrid(fb.activitiesGrid);
    injectNewsGrid(fb.newsGrid);
    injectCta(fb.storeCta, false);
    injectCta(fb.newsletterCta, true);
    injectFooter(fb.footer);
  }

  /* ------------------------------------------------------------------
     Bootstrap
     ------------------------------------------------------------------ */
  function init() {
    console.log('[Home CMS] Starting... DOM ready?', document.readyState);
    /* Inject hero fallback immediately — zero flicker */
    injectHero(localizedFallback().hero);

    /* Track loaded CMS sections and promo hero for re-rendering on
       language change. */
    var loadedSections = null;
    var promoHero = null;

    function renderAll() {
      /* Baseline: all fallbacks in the current language. */
      injectAllFallbacks();
      /* Overwrite with CMS sections (injectors translate Arabic via L()). */
      if (loadedSections) {
        for (var i = 0; i < loadedSections.length; i++) {
          injectSection(loadedSections[i]);
        }
      }
      /* Promotional hero always wins over everything else. */
      if (promoHero) injectHero(promoHero);
    }

    /* 1. Fetch the live promotional Hero from hero_updates (managed by the
          Dashboard "المستجدات" page). It wins over the default hero.
          The service returns null when no live promotion exists. */
    var heroService = window.__AMARE_HERO_SERVICE;
    if (heroService && heroService.loadHeroFromSupabase) {
      heroService.loadHeroFromSupabase(function (cmsHero) {
        if (cmsHero) {
          promoHero = cmsHero;
          injectHero(promoHero);
        }
      });
    }

    /* 2. Load all sections from page_sections (single source of truth) */
    loadHomeFromSupabase(function (sections) {
      if (sections && sections.length > 0) {
        loadedSections = sections;
        console.log('[Home CMS] Loaded', sections.length, 'CMS sections — injecting...');
        /* Inject every section from CMS — the complete page */
        for (var i = 0; i < sections.length; i++) {
          injectSection(sections[i]);
        }
        console.log('[Home CMS] All', sections.length, 'sections injected.');

        /* If the promotional Hero arrived before the CMS sections finished
           loading, re-assert it on top of the default hero section. */
        if (promoHero) injectHero(promoHero);
      } else {
        console.log('[Home CMS] No CMS sections found — using fallbacks.');
        /* Supabase unreachable or no sections — use full fallback */
        injectAllFallbacks();
        if (promoHero) injectHero(promoHero);
      }
    });

    /* 3. Re-render everything when i18n is ready (handles the case where
          home-content boots before the I18n layer initialised). */
    window.addEventListener('amare:i18nready', renderAll);

    /* 4. Re-render everything when the language changes. The injectors
          now translate all Arabic strings via the L() helper, so
          fallbacks AND CMS content are redrawn correctly in every
          language — no section is left behind. */
    window.addEventListener('amare:langchange', renderAll);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
