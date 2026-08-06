/* ==========================================================================
   Home Content Service — loads the Home page from Supabase and injects
   dynamic content into EVERY section of the public website.

   Architecture (reused from Hero):
     1. Fetch content_pages WHERE page_key='home' AND status='published'
     2. Extract all sections from content.sections
     3. Inject each section's data into the existing DOM
     4. Hardcoded fallback for every section — website never breaks
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Hardcoded fallback data — mirrors the original index.html content.
     Used when Supabase is unreachable or a section is missing.
     All general fields (name, phone, email, address, map) are sourced
     from window.__AMARE_SETTINGS__ (set by website-settings.js) when
     available, so they automatically reflect Control Panel changes.
     ------------------------------------------------------------------ */
  function getSetting(key, defaultValue) {
    var s = window.__AMARE_SETTINGS__;
    return (s && s[key]) || defaultValue;
  }

  var FALLBACK = {
    hero: {
      heading: 'اكتشف...\nشارك...\nوانضم إلى الجمعية المغربية',
      subheading: 'لهواة البحث والاستكشاف',
      description:
        'شارك في المسابقة الوطنية، وانخرط إلكترونياً في الجمعية، أو جدد عضويتك بسهولة، واطلع على آخر الأنشطة والفعاليات والأخبار عبر المنصة الرسمية.',
      backgroundImage: '',
      buttons: [
        { label: 'شارك في المسابقة', url: 'competition.html', variant: 'primary' },
        { label: 'الانخراط Online', url: 'Join us/join-us-online.html', variant: 'primary' },
        { label: 'تجديد الانخراط', url: 'Join us/membership-renewal.html', variant: 'outline' },
      ],
    },
    about: {
      eyebrow: 'من نحن',
      heading: 'نبني اليوم',
      headingHighlight: 'غدًا',
      headingSub: 'أكثر إشراقًا للأجيال القادمة',
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
      buttonUrl: '#',
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
      brandLogo: getSetting('logo_url', 'Amare%20files%20/logo.png'),
      description: getSetting('association_name', 'الجمعية المغربية لهواة البحث والاستكشاف') + ' هي إطار قانوني وني يجمع الهواة تحت راية واحدة لصون التراث الوطني المغربي.',
      socialLinks: [
        { platform: 'facebook', url: '#' },
        { platform: 'instagram', url: '#' },
        { platform: 'linkedin', url: '#' },
      ],
      quickLinksHeading: 'روابط سريعة',
      quickLinks: [
        { label: 'الرئيسية', url: '#home' }, { label: 'اتصل بنا', url: '#about' },
        { label: 'خدماتنا', url: '#services' }, { label: 'الاخبار', url: '#news' },
        { label: 'الارشيف', url: '#newsletter' }, { label: 'الفروع الجهوية', url: '#home' },
        { label: 'انخرط معنا', url: '#about' }, { label: 'شركاؤنا', url: '#services' },
        { label: 'انشطتنا', url: '#news' }, { label: 'من نحن', url: '#newsletter' },
      ],
      programsHeading: 'برامجنا',
      programs: [
        { label: 'SOS Amare', url: '#services' }, { label: 'متجر Amare', url: 'amare store/index.html' },
        { label: 'بيت المستكشف Amare', url: '#services' }, { label: 'مجلة Amare', url: '#services' },
        { label: 'أكاديمية Amare', url: '#services' }, { label: 'النوادي', url: '#services' },
        { label: 'المستشار القانوني', url: '#services' }, { label: 'عقد التأمين', url: '#services' },
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

  /* ------------------------------------------------------------------
     Section injectors — each updates one section's DOM
     ------------------------------------------------------------------ */

  /* HERO */
  function injectHero(d) {
    var h1 = el('.hero-inner h1');
    if (h1) {
      var lines = (d.heading || '').split('\n');
      var html = '';
      for (var i = 0; i < lines.length; i++) {
        html += esc(lines[i]);
        if (i < lines.length - 1) html += '<br>';
      }
      if (d.subheading) html += '<br><span>' + esc(d.subheading) + '</span>';
      h1.innerHTML = html;
    }

    var eyebrow = el('.hero-inner .hero-eyebrow');
    if (eyebrow && d.eyebrow) {
      eyebrow.textContent = d.eyebrow;
    }

    var desc = el('.hero-inner p.hero-fade');
    if (desc && d.description) desc.textContent = d.description;

    var actions = el('.hero-actions');
    if (actions && d.buttons) {
      var anchors = actions.querySelectorAll('a');
      for (var j = 0; j < Math.min(anchors.length, d.buttons.length); j++) {
        var a = anchors[j], b = d.buttons[j];
        if (!b.label) { a.style.display = 'none'; continue; }
        a.style.display = '';
        var svgs = a.querySelectorAll('svg'), svgHtml = '';
        for (var k = 0; k < svgs.length; k++) svgHtml += svgs[k].outerHTML;
        a.href = b.url || '#';
        a.innerHTML = esc(b.label) + ' ' + svgHtml;
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
    if (eyebrow && d.eyebrow) {
      var svg = eyebrow.querySelector('svg');
      eyebrow.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(d.eyebrow);
    }

    var title = el('.about-title');
    if (title && d.heading !== undefined) {
      var hl = d.headingHighlight || '';
      var sub = d.headingSub || '';
      title.innerHTML = esc(d.heading || '') + ' <span class="about-title-em">' + esc(hl) + '</span> ' + esc(sub);
    }

    var descHead = el('.about-desc-head');
    if (descHead && d.description) descHead.textContent = d.description;

    var paragraphs = document.querySelectorAll('.about-content .about-text');
    if (d.paragraphs) {
      for (var p = 0; p < Math.min(paragraphs.length, d.paragraphs.length); p++) {
        paragraphs[p].textContent = d.paragraphs[p];
      }
    }

    var featureItems = document.querySelectorAll('.about-features .about-feature');
    if (d.features) {
      for (var f = 0; f < Math.min(featureItems.length, d.features.length); f++) {
        var ft = featureItems[f].querySelector('.about-ftitle');
        var fd = featureItems[f].querySelector('.about-fdesc');
        if (ft) ft.textContent = d.features[f].title || '';
        if (fd) fd.textContent = d.features[f].description || '';
      }
    }

    var aboutBtns = document.querySelectorAll('.about-actions a');
    if (d.buttons) {
      for (var ab = 0; ab < Math.min(aboutBtns.length, d.buttons.length); ab++) {
        var ba = aboutBtns[ab], bb = d.buttons[ab];
        ba.href = bb.url || '#';
        var bSpan = ba.querySelector('span');
        if (bSpan) bSpan.textContent = bb.label;
        else {
          var bsvgs = ba.querySelectorAll('svg'), bsvg = '';
          for (var bs = 0; bs < bsvgs.length; bs++) bsvg += bsvgs[bs].outerHTML;
          ba.innerHTML = bsvg + '<span>' + esc(bb.label) + '</span>';
        }
      }
    }

    var aboutImg = el('.about-visual .about-img');
    if (aboutImg && d.image) {
      aboutImg.src = d.image.url || '';
      aboutImg.alt = d.image.alt || '';
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
        if (statLbl) statLbl.textContent = d.stats[s].label;
      }
    }
  }

  /* FEATURES GRID (renderer: featuresGrid) */
  function injectFeaturesGrid(d) {
    var eyebrow = el('#features .eyebrow');
    if (eyebrow && d.eyebrow) eyebrow.textContent = d.eyebrow;

    var heading = el('#features .section-title');
    if (heading && d.heading) heading.textContent = d.heading;

    var desc = el('#features .section-desc');
    if (desc && d.description) desc.textContent = d.description;

    var cards = document.querySelectorAll('#features .feature-card');
    if (d.cards) {
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var h3 = cards[i].querySelector('h3');
        var p = cards[i].querySelector('p');
        if (h3) h3.textContent = d.cards[i].heading || '';
        if (p) p.textContent = d.cards[i].description || '';
      }
    }
  }

  /* ACTIVITIES GRID (renderer: activitiesGrid) */
  function injectActivitiesGrid(d) {
    var heading = el('.activities-title');
    if (heading && d.heading) heading.textContent = d.heading;

    var desc = el('.activities-desc');
    if (desc && d.description) desc.textContent = d.description;

    var cards = document.querySelectorAll('#services .activity-card');
    if (d.cards) {
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var img = cards[i].querySelector('img');
        var title = cards[i].querySelector('.activity-title');
        var cardDesc = cards[i].querySelector('.activity-desc');
        var link = cards[i].querySelector('.activity-link');

        if (img && d.cards[i].image) {
          img.src = d.cards[i].image;
          img.alt = d.cards[i].title || '';
        }
        if (title) title.textContent = d.cards[i].title || '';
        if (cardDesc) cardDesc.textContent = d.cards[i].description || '';
        if (link) {
          link.href = d.cards[i].linkUrl || '#';
          var arrow = link.querySelector('.activity-link-arrow');
          link.innerHTML = esc(d.cards[i].linkText || '') + (arrow ? ' <span class="activity-link-arrow">' + arrow.textContent + '</span>' : '');
        }
      }
    }
  }

  /* NEWS GRID (renderer: newsGrid) */
  function injectNewsGrid(d) {
    var eyebrow = el('#news .eyebrow');
    if (eyebrow && d.eyebrow) eyebrow.textContent = d.eyebrow;

    var heading = el('#news .section-title');
    if (heading && d.heading) heading.textContent = d.heading;

    var cards = document.querySelectorAll('#news .news-card');
    if (d.cards) {
      for (var i = 0; i < Math.min(cards.length, d.cards.length); i++) {
        var img = cards[i].querySelector('.news-img img');
        var badge = cards[i].querySelector('.news-badge');
        var date = cards[i].querySelector('.news-date');
        var title = cards[i].querySelector('h3');
        var more = cards[i].querySelector('.news-more');

        if (img && d.cards[i].image) { img.src = d.cards[i].image; img.alt = d.cards[i].title || ''; }
        if (badge && d.cards[i].badge) badge.textContent = d.cards[i].badge;
        if (date && d.cards[i].date) {
          var svg = date.querySelector('svg');
          date.innerHTML = (svg ? svg.outerHTML + ' ' : '') + esc(d.cards[i].date);
        }
        if (title) title.textContent = d.cards[i].title || '';
        if (more) {
          more.href = d.cards[i].linkUrl || '#';
          var msvg = more.querySelector('svg');
          more.innerHTML = esc(d.cards[i].linkText || '') + ' ' + (msvg ? msvg.outerHTML : '');
        }
      }
    }
  }

  /* CTA — used by Store and Newsletter */
  function injectCta(d, sectionId) {
    if (sectionId === 'store') {
      var heading = el('.store-title');
      if (heading && d.heading) heading.innerHTML = esc(d.heading).replace(/\n/g, '<br>');

      var desc = el('.store-desc');
      if (desc && d.description) desc.textContent = d.description;

      var btn = el('.store-btn');
      if (btn) {
        btn.href = d.buttonUrl || '#';
        var span = btn.querySelector('span');
        var svg = btn.querySelector('svg');
        btn.innerHTML = (svg ? svg.outerHTML + ' ' : '') + '<span>' + esc(d.buttonLabel || '') + '</span>';
      }

      if (d.backgroundImage) {
        var img = el('.store-image');
        if (img) img.src = d.backgroundImage;
      }
    }

    if (sectionId === 'newsletter') {
      var nh = el('#newsletter h2');
      if (nh && d.heading) nh.textContent = d.heading;

      var nd = el('#newsletter p');
      if (nd && d.description) nd.textContent = d.description;

      var nbtn = el('#newsletter button[type="submit"]');
      if (nbtn && d.buttonLabel) nbtn.textContent = d.buttonLabel;
    }
  }

  /* FOOTER (renderer: footer) */
  function injectFooter(d) {
    var brandName = el('.footer-brand .brand-name');
    if (brandName && d.brandName) brandName.textContent = d.brandName;

    var brandLogo = el('.footer-brand .brand-mark img');
    if (brandLogo && d.brandLogo) brandLogo.src = d.brandLogo;

    var desc = el('.footer-about p');
    if (desc && d.description) desc.textContent = d.description;

    /* Social links */
    var socialAnchors = document.querySelectorAll('.footer-social a');
    if (d.socialLinks) {
      for (var s = 0; s < Math.min(socialAnchors.length, d.socialLinks.length); s++) {
        socialAnchors[s].href = d.socialLinks[s].url || '#';
      }
    }

    /* Quick links */
    var quickNavs = document.querySelectorAll('.footer nav');
    var quickUl = null, programsUl = null;
    for (var qn = 0; qn < quickNavs.length; qn++) {
      var navH4 = quickNavs[qn].querySelector('h4');
      if (navH4) {
        if (navH4.textContent.indexOf('روابط سريعة') !== -1 || navH4.textContent.indexOf('Quick') !== -1) {
          if (d.quickLinksHeading) navH4.textContent = d.quickLinksHeading;
          quickUl = quickNavs[qn].querySelector('ul');
        }
        if (navH4.textContent.indexOf('برامجنا') !== -1 || navH4.textContent.indexOf('Program') !== -1) {
          if (d.programsHeading) navH4.textContent = d.programsHeading;
          programsUl = quickNavs[qn].querySelector('ul');
        }
      }
    }

    injectLinkList(quickUl, d.quickLinks);
    injectLinkList(programsUl, d.programs);

    /* Contact */
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

    /* Map */
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

    /* Copyright */
    var copyright = el('.footer-bottom p');
    if (copyright && d.copyright) copyright.textContent = d.copyright;

    var bottomLinkAnchors = document.querySelectorAll('.footer-bottom-links a');
    if (d.bottomLinks) {
      for (var bl = 0; bl < Math.min(bottomLinkAnchors.length, d.bottomLinks.length); bl++) {
        bottomLinkAnchors[bl].href = d.bottomLinks[bl].url || '#';
        bottomLinkAnchors[bl].textContent = d.bottomLinks[bl].label || '';
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
     Dispatch: find section by type and renderer, inject into DOM
     ------------------------------------------------------------------ */
  function injectSection(section) {
    if (!section || !section.enabled) return;
    var type = section.type;
    var data = section.data || {};

    switch (type) {
      case 'hero': return injectHero(data);
      case 'cta':  return injectCta(data, section.id || '');
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
      default: break;
    }
  }

  /* ------------------------------------------------------------------
     Supabase fetch — get page and its sections from the new schema.
     Queries pages (slug='/') then page_sections (visible=true).
     ------------------------------------------------------------------ */
  function loadHomeFromSupabase(callback) {
    var S = window.Supabase;
    if (!S || !S.getClient) return callback(null);

    var client = S.getClient();
    if (!client) return callback(null);

    // Step 1: find the Home page by slug
    client
      .from('pages')
      .select('id, title, slug, status')
      .eq('slug', '/')
      .eq('status', 'published')
      .single()
      .then(function (pageResult) {
        if (pageResult.error || !pageResult.data) return callback(null);
        var pageId = pageResult.data.id;

        // Step 2: load all visible sections for this page
        client
          .from('page_sections')
          .select('id, section_type, section_key, content, settings, styles, visible, sort_order')
          .eq('page_id', pageId)
          .eq('visible', true)
          .order('sort_order', { ascending: true })
          .then(function (sectionsResult) {
            if (sectionsResult.error || !sectionsResult.data) return callback(null);

            var rows = sectionsResult.data;
            if (!Array.isArray(rows) || rows.length === 0) return callback(null);

            // Step 3: map page_sections rows into the format injectSection() expects
            var sections = [];
            for (var i = 0; i < rows.length; i++) {
              var row = rows[i];
              // Merge content + settings → flat data object (mimics old section.data)
              var data = {};
              var content = row.content || {};
              var settings = row.settings || {};
              var styles = row.styles || {};

              // Copy content fields
              for (var ck in content) {
                if (Object.prototype.hasOwnProperty.call(content, ck)) data[ck] = content[ck];
              }
              // Copy settings fields (prefixed with _)
              for (var sk in settings) {
                if (Object.prototype.hasOwnProperty.call(settings, sk)) data[sk] = settings[sk];
              }
              // Copy _styles if present
              if (Object.keys(styles).length > 0) data._styles = styles;

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
          .catch(function () {
            return callback(null);
          });
      })
      .catch(function () {
        return callback(null);
      });
  }

  /* ------------------------------------------------------------------
     Bootstrap
     ------------------------------------------------------------------ */
  function injectNonHeroFallbacks() {
    injectAbout(FALLBACK.about);
    injectFeaturesGrid(FALLBACK.featuresGrid);
    injectActivitiesGrid(FALLBACK.activitiesGrid);
    injectNewsGrid(FALLBACK.newsGrid);
    injectCta(FALLBACK.storeCta, 'store');
    injectCta(FALLBACK.newsletterCta, 'newsletter');
    injectFooter(FALLBACK.footer);
  }

  function init() {
    /* 1. Inject default Hero immediately — zero flicker, zero layout shift */
    injectHero(FALLBACK.hero);

    /* 2. Fetch live Hero from hero_updates → replace if available */
    var heroService = window.__AMARE_HERO_SERVICE;
    if (heroService && heroService.loadHeroFromSupabase) {
      heroService.loadHeroFromSupabase(function (cmsHero) {
        if (cmsHero) injectHero(cmsHero);
      });
    }

    /* 3. Fetch remaining sections from content_pages */
    loadHomeFromSupabase(function (sections) {
      if (sections && sections.length > 0) {
        for (var i = 0; i < sections.length; i++) {
          var section = sections[i];
          if (section.type !== 'hero') {
            injectSection(section);
          }
        }
      } else {
        injectNonHeroFallbacks();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
