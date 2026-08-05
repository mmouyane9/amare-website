/* ==========================================================================
   الجمعية المغربية لهواة البحث والاستكشاف — script.js
   Organized, commented, vanilla JS only
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- 1. Loading Screen ---------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    // small delay so the loader doesn't just flash
    setTimeout(() => loader && loader.classList.add('loaded'), 350);
  });

  /* ---------- 2. Sticky Navbar with blur on scroll ---------- */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  function handleScrollEffects() {
    const scrolled = window.scrollY > 30;
    navbar.classList.toggle('scrolled', scrolled);
    backToTop.classList.toggle('show', window.scrollY > 500);
  }
  handleScrollEffects();
  window.addEventListener('scroll', handleScrollEffects, { passive: true });

  /* ---------- 2.1 Prevent stuck :hover on touch devices ---------- */
  var navLinksAll = document.querySelectorAll('.nav-links a, li[data-dropdown] > a');
  for (var i = 0; i < navLinksAll.length; i++) {
    navLinksAll[i].addEventListener('touchstart', function() {}, { passive: true });
  }

  /* ---------- 3. Mobile Hamburger Menu with slide panel + scroll lock ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  let overlay = null;

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('open'));
    overlay.addEventListener('click', closeMenu);
  }

  function removeOverlay() {
    if (!overlay) return;
    overlay.classList.remove('open');
    setTimeout(() => {
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
      overlay = null;
    }, 300);
  }

  function openMenu() {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    createOverlay();
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    removeOverlay();
    navLinks.querySelectorAll('.mobile-submenu.open').forEach(function(s) { s.classList.remove('open'); });
    navLinks.querySelectorAll('.sub-toggle.open').forEach(function(t) { t.classList.remove('open'); t.setAttribute('aria-expanded', 'false'); });
    navLinks.querySelectorAll('.nav-link-chevron.rotated').forEach(function(c) { c.classList.remove('rotated'); });
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close mobile menu after a link is tapped (skip dropdown parent links)
  navLinks.querySelectorAll('a').forEach((link) => {
    if (link.closest('li[data-dropdown]') && !link.closest('.mobile-submenu')) return;
    link.addEventListener('click', closeMenu);
  });

  /* ---------- 4. Active link highlighting on scroll ---------- */
  const sections = document.querySelectorAll('main section[id], footer[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  var activeLinkRaf = null;
  function setActiveLink() {
    if (activeLinkRaf) return;
    activeLinkRaf = requestAnimationFrame(function() {
      activeLinkRaf = null;
      var currentId = '';
      var offset = 140;
      sections.forEach(function(section) {
        var top = section.offsetTop - offset;
        if (window.scrollY >= top) currentId = section.id;
      });
      navAnchors.forEach(function(a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + currentId);
      });
    });
  }
  window.addEventListener('scroll', setActiveLink, { passive: true });

  /* ---------- 5. Back to top button ---------- */
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 6. Scroll reveal animations (Intersection Observer) ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-scale, .store-reveal-left, .store-reveal-right, .store-reveal-btn');

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- 7. Counter animation for statistics ---------- */
  const counters = document.querySelectorAll('.about-stat-num');

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || '';
    const duration = 1600; // ms
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  /* ---------- 8. Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ---------- 9. Mega Dropdown ---------- */
  (function() {
    const icons = {
      org: '<path d="M3 21h18M6 21V7l6-4 6 4v14M10 21v-6h4v6"/>',
      eye: '<circle cx="12" cy="12" r="3"/><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>',
      target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
      users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
      heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
      map: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
      compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
      calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
      globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
      star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
      book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
      bag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
      userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
      image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
      video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',
      folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
      download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
      bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
      mail: '<path d="M22 6 12 13 2 6"/><path d="M2 6h20v12H2z"/>',
      clipboard: '<rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="9" y1="14" x2="15" y2="14"/>',
      helpCircle: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
      search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
      barChart: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
      mic: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>',
      tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    };

    const dropdownData = {
      about: {
        title: 'من نحن', href: '#about',
        items: [
          { icon: 'org', title: 'الرئية الوطنية', desc: 'تعرف على تاريخ ومسيرة الجمعية', href:"/Who%20are%20we/national-vision.html" },
          { icon: 'eye', title: 'الرسالة', desc: 'رؤيتنا نحو مستقبل أفضل' ,href:"/Who%20are%20we/our-mission.html"},
          { icon: 'target', title: 'القيم', desc: 'الأهداف الاستراتيجية للجمعية' ,href:"/Who%20are%20we/our-values.html"},
          { icon: 'users', title: 'المكتب المركزي', desc: 'الهيكل الإداري للجمعية' ,href:"/Who%20are%20we/central-office.html" },
          { icon: 'file', title: 'خارطة التوسع', desc: 'القانون الأساسي للجمعية' ,href:"/Who%20are%20we/expansion-map.html"},
   
        ]
      },
      activities: {
        title: 'أنشطتنا', href: '#',
        items: [
          { icon: 'map', title: 'خرجات', desc: 'أنشطة وفعاليات ميدانية' },
          { icon: 'heart', title: 'مسابقات وراليات ', desc: 'حملات تطوعية من أجل المجتمع' },
          { icon: 'compass', title: 'تكوينات', desc: 'استكشاف تراثنا الطبيعي' },
          { icon: 'tool', title: 'معارض', desc: 'ورشات تكوينية وتأهيلية' },
          { icon: 'image', title: 'لقاءات', desc: 'معارض وفعاليات ثقافية' },
          { icon: 'calendar', title: 'حملات بيئية', desc: 'تعرف على فعالياتنا القادمة' },
        ]
      },
      partners: {
        title: 'شركاؤنا', href: '#',
        items: [
          { icon: 'map', title: 'LeFouilleurma ', desc: 'شركاؤنا على المستوى الوطني' },
          { icon: 'globe', title: 'SENOTEC ', desc: 'شركاؤنا على المستوى الدولي' },
          { icon: 'userPlus', title: 'ASTROMET', desc: 'انضم إلى قائمة شركائنا' },
          { icon: 'file', title: 'AssociationDetectionCentre ', desc: 'اتفاقيات الشراكة والتعاون' },
          { icon: 'star', title: 'ANCPP ', desc: 'قصص نجاح شراكاتنا' },
          { icon: 'star', title: 'OMSDS ', desc: 'قصص نجاح شراكاتنا' },
        ]
      },
      services: {
        title: 'خدماتنا', href: '#services',
        items: [
          { icon: 'book', title: 'SOS AMARE', desc: 'دورات وورشات تكوينية' },
          { icon: 'bag', title: 'متجر AMARE', desc: 'منتجات تدعم أنشطة الجمعية', href: 'amare store/index.html' },
          { icon: 'userPlus', title: ' بيت المستكشف Amare', desc: 'انضم إلى مجتمع AMARE' },
          { icon: 'clipboard', title: 'مجلة Amare ', desc: 'برامج تدريبية متخصصة' },
          { icon: 'leaf', title: ' اكاديمية Amare', desc: 'استشارات في المجال البيئي' },
          { icon: 'search', title: 'النوادي', desc: 'دعم للباحثين والمستكشفين' },
          { icon: 'leaf', title: 'المستشار القانوني', desc: 'استشارات في المجال البيئي' },
          { icon: 'search', title: 'عقد التامين', desc: 'دعم للباحثين والمستكشفين' },
        ]
      },
      news: {
        title: 'الأخبار', href: '#news',
        items: [
          { icon: 'bell', title: 'آخر الأخبار', desc: 'أحدث أخبار الجمعية' },
          { icon: 'mic', title: 'المقالات', desc: 'مقالات وحوارات حصرية' },
          { icon: 'file', title: 'البلاغات', desc: 'بلاغات وإعلانات رسمية' },
          { icon: 'mail', title: 'البيانات الصحفية', desc: 'بيانات صحفية وإعلامية' },
          { icon: 'mail', title: 'النشرة الإخبارية', desc: 'اشترك في نشرتنا البريدية' },
        ]
      },
      archive: {
        title: 'الأرشيف', href: '#',
        items: [
          { icon: 'image', title: 'الصور', desc: 'ألبوم صور الفعاليات' },
          { icon: 'video', title: 'الفيديوهات', desc: 'مكتبة فيديوهات الجمعية' },
          { icon: 'folder', title: 'الوثائق', desc: 'مستندات ووثائق رسمية' },
          { icon: 'barChart', title: 'التقارير السنوية', desc: 'تقارير الأداء السنوية' },
          { icon: 'book', title: 'المجلات', desc: 'مجلة AMARE الدورية' },
          { icon: 'download', title: 'الملفات القابلة للتحميل', desc: 'تحميل الملفات والاستمارات' },
        ]
      },
      branches: {
        title: 'الفروع الجهوية', href: '#',
        items: [
          { icon: 'map', title: 'جهة طنجة تطوان الحسيمة', desc: 'فرع جهة الرباط سلا' },
          { icon: 'map', title: 'جهة الشرق ', desc: 'فرع جهة الدار البيضاء' },
          { icon: 'map', title: 'جهة فاس مكناس', desc: 'فرع جهة مراكش آسفي' },
          { icon: 'map', title: 'جهة الرباط سلا القنيطرة', desc: 'فرع جهة طنجة تطوان' },
          { icon: 'map', title: 'جهة بني ملال خنيفرة', desc: 'فرع جهة فاس مكناس' },
          { icon: 'map', title: 'جهة الدار البيضاء سطات', desc: 'فرع جهة الرباط سلا' },
          { icon: 'map', title: 'جهة مراكش آسفي ', desc: 'فرع جهة الدار البيضاء' },
          { icon: 'map', title: 'جهة درعة تافيلالت ', desc: 'فرع جهة مراكش آسفي' },
          { icon: 'map', title: 'جهة سوس ماسة', desc: 'فرع جهة طنجة تطوان' },
          { icon: 'map', title: 'جهة كلميم واد نون', desc: 'فرع جهة فاس مكناس' },
          { icon: 'map', title: 'جهة العيون الساقية الحمراء ', desc: 'فرع جهة طنجة تطوان' },
          { icon: 'map', title: 'جهة الداخلة وادي الذهب  ', desc: 'فرع جهة فاس مكناس' },
        ]
      },
      join: {
        title: 'انخرط معنا', href: '/Join%20us/index.html',
        items: [
          { icon: 'userPlus', title: 'الانخراط online', desc: 'كن عضواً في الجمعية', href: '/Join%20us/join-us-online.html' },
          {
            icon: 'calendar',
            title: 'تجديد الانخراط',
            desc: 'تعبئة طلب تجديد الانخراط',
            href: '/Join%20us/membership-renewal.html'
          },
          { icon: 'file', title: 'وثائق الانخراط', desc: 'حمّل وثائق الانخراط', href: '/Join%20us/documents.html' },
          { icon: 'book', title: 'القانون الأساسي', desc: 'النظام الأساسي للجمعية', href: '/Join%20us/bylaws.html' },
          {
            icon: 'book',
            title: 'القانون الداخلي',
            desc: 'القانون الداخلي للجمعية',
            href: '/Join%20us/internal-regulations.html'
          },
                    {
            icon: 'calendar',
            title: 'تجديد الانخراط',
            desc: 'تعبئة طلب تجديد الانخراط',
            href: '/Join%20us/membership-renewal.html'
          },
          {
            icon: 'compass',
            title: 'ميثاق الاستكشاف المسؤول',
            desc: 'ميثاق المستكشف المسؤول',
            href: '/Join%20us/charter.html'
          },
          {
            icon: 'folder',
            title: 'الإيداع الخارجي',
            desc: 'إيداع الملفات الخارجية',
            href: '/Join%20us/external-deposit-receipt.html'
          },
          {
            icon: 'folder',
            title: 'الإيداع الداخلي',
            desc: 'إيداع الملفات الداخلية',
            href: '/Join%20us/deposit-receipt.html'
          },
          {
            icon: 'bell',
            title: 'الإشعار بالخرجات',
            desc: 'الإشعارات الخاصة بالخرجات',
            href: '/Join%20us/activity-notifications.html'
          },

        ]
      }
    };

    function svg(path) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' + path + '</svg>';
    }

    var dropdownContainer = document.getElementById('megaDropdown');
    var triggers = document.querySelectorAll('li[data-dropdown]');
    var closeTimer = null;
    var activeKey = null;

    function buildPanels() {
      var html = '';
      for (var key in dropdownData) {
        var group = dropdownData[key];
        html += '<div class="mega-panel" data-panel="' + key + '">';
        html += '<div class="mega-panel-inner">';
        html += '<div class="mega-panel-head">';
        html += '<span class="mega-panel-title">' + group.title + '</span>';
        html += '<a href="' + group.href + '" class="mega-panel-link">عرض الكل <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></a>';
        html += '</div>';
        html += '<div class="mega-grid">';
        for (var i = 0; i < group.items.length; i++) {
          var item = group.items[i];
          html += '<a href="' + (item.href || '#') + '" class="mega-item">';
          html += '<span class="mega-icon">' + svg(icons[item.icon]) + '</span>';
          html += '<span class="mega-text">';
          html += '<span class="mega-title">' + item.title + '</span>';
          html += '<span class="mega-desc">' + item.desc + '</span>';
          html += '</span></a>';
        }
        html += '</div></div></div>';
      }
      dropdownContainer.innerHTML = html;
    }

    function setChevron(key, active) {
      var selector = 'li[data-dropdown="' + key + '"] .nav-link-chevron';
      var ch = document.querySelector(selector);
      if (ch) ch.classList.toggle('rotated', active);
      var link = document.querySelector('li[data-dropdown="' + key + '"] > a');
      if (link) link.setAttribute('aria-expanded', active ? 'true' : 'false');
    }

    function resetAllChevrons() {
      var all = document.querySelectorAll('.nav-link-chevron.rotated');
      for (var i = 0; i < all.length; i++) all[i].classList.remove('rotated');
      var links = document.querySelectorAll('li[data-dropdown] > a[aria-expanded]');
      for (var i = 0; i < links.length; i++) links[i].setAttribute('aria-expanded', 'false');
    }

    function showPanel(key) {
      if (activeKey === key) return;
      if (activeKey) setChevron(activeKey, false);
      var panels = dropdownContainer.querySelectorAll('.mega-panel');
      for (var i = 0; i < panels.length; i++) {
        panels[i].classList.toggle('active', panels[i].dataset.panel === key);
      }
      setChevron(key, true);
      activeKey = key;
      dropdownContainer.classList.add('visible');
    }

    function hideDropdown() {
      dropdownContainer.classList.remove('visible');
      var panels = dropdownContainer.querySelectorAll('.mega-panel');
      for (var i = 0; i < panels.length; i++) {
        panels[i].classList.remove('active');
      }
      resetAllChevrons();
      activeKey = null;
    }

    function addChevrons() {
      for (var i = 0; i < triggers.length; i++) {
        var link = triggers[i].querySelector('a');
        link.setAttribute('aria-expanded', 'false');
        var ns = 'http://www.w3.org/2000/svg';
        var svgEl = document.createElementNS(ns, 'svg');
        svgEl.setAttribute('class', 'nav-link-chevron');
        svgEl.setAttribute('viewBox', '0 0 24 24');
        svgEl.setAttribute('fill', 'none');
        svgEl.setAttribute('stroke', 'currentColor');
        svgEl.setAttribute('stroke-width', '2.5');
        var path = document.createElementNS(ns, 'path');
        path.setAttribute('d', 'M6 9l6 6 6-6');
        svgEl.appendChild(path);
        link.appendChild(svgEl);
      }
    }

    function buildMobileSubmenus() {
      for (var i = 0; i < triggers.length; i++) {
        var li = triggers[i];
        var key = li.getAttribute('data-dropdown');
        var group = dropdownData[key];
        if (!group) continue;

        var link = li.querySelector('a');
        var linkWrap = document.createElement('div');
        linkWrap.className = 'nav-link-row';
        link.parentNode.insertBefore(linkWrap, link);
        linkWrap.appendChild(link);

        var toggle = document.createElement('button');
        toggle.className = 'sub-toggle';
        toggle.setAttribute('aria-label', 'فتح القائمة الفرعية');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>';
        linkWrap.appendChild(toggle);

        var submenu = document.createElement('ul');
        submenu.className = 'mobile-submenu';
        for (var j = 0; j < group.items.length; j++) {
          var item = group.items[j];
          var subLi = document.createElement('li');
          subLi.innerHTML = '<a href="' + (item.href || '#') + '">' + svg(icons[item.icon]) + item.title + '</a>';
          submenu.appendChild(subLi);
        }
        li.appendChild(submenu);

        var chevron = li.querySelector('.nav-link-chevron');

        toggle.addEventListener('click', function(tog, sub, ch) {
          return function(e) {
            if (!isMobile()) return;
            e.stopPropagation();
            var isOpen = sub.classList.contains('open');
            closeAllMobileSubmenus();
            if (!isOpen) {
              sub.classList.add('open');
              tog.classList.add('open');
              tog.setAttribute('aria-expanded', 'true');
              if (ch) ch.classList.add('rotated');
            }
          };
        }(toggle, submenu, chevron));

        link.addEventListener('click', function(tog, sub, ch) {
          return function(e) {
            if (!isMobile()) return;
            if (sub.classList.contains('open')) return;
            e.preventDefault();
            closeAllMobileSubmenus();
            sub.classList.add('open');
            tog.classList.add('open');
            tog.setAttribute('aria-expanded', 'true');
            if (ch) ch.classList.add('rotated');
          };
        }(toggle, submenu, chevron));
      }
    }

    function closeAllMobileSubmenus() {
      var submenus = document.querySelectorAll('.mobile-submenu.open');
      for (var i = 0; i < submenus.length; i++) {
        submenus[i].classList.remove('open');
      }
      var toggles = document.querySelectorAll('.sub-toggle.open');
      for (var i = 0; i < toggles.length; i++) {
        toggles[i].classList.remove('open');
        toggles[i].setAttribute('aria-expanded', 'false');
      }
      var chevrons = document.querySelectorAll('li[data-dropdown] .nav-link-chevron.rotated');
      for (var i = 0; i < chevrons.length; i++) {
        chevrons[i].classList.remove('rotated');
      }
    }

    function isMobile() {
      return window.innerWidth <= 768;
    }

    function setupDesktop() {
      if (!dropdownContainer) return;
      for (var i = 0; i < triggers.length; i++) {
        var li = triggers[i];
        li.addEventListener('mouseenter', function() {
          if (isMobile()) return;
          clearTimeout(closeTimer);
          showPanel(this.getAttribute('data-dropdown'));
        });
        li.addEventListener('mouseleave', function() {
          if (isMobile()) return;
          clearTimeout(closeTimer);
          closeTimer = setTimeout(function() {
            hideDropdown();
          }, 150);
        });
      }
      dropdownContainer.addEventListener('mouseenter', function() {
        clearTimeout(closeTimer);
      });
      dropdownContainer.addEventListener('mouseleave', function() {
        clearTimeout(closeTimer);
        closeTimer = setTimeout(function() {
          hideDropdown();
        }, 150);
      });
    }

    function handleKeydown(e) {
      if (e.key === 'Escape') {
        hideDropdown();
        var active = document.activeElement;
        if (active && active.closest('.mega-dropdown')) {
          var key = activeKey;
          if (key) {
            var selector = 'li[data-dropdown="' + key + '"] a';
            var navLink = document.querySelector(selector);
            if (navLink) navLink.focus();
          }
        }
      }
    }

    var scrollHideTimer = null;
    window.addEventListener('scroll', function() {
      clearTimeout(scrollHideTimer);
      scrollHideTimer = setTimeout(function() {
        if (dropdownContainer && dropdownContainer.classList.contains('visible')) {
          clearTimeout(closeTimer);
          hideDropdown();
        }
      }, 50);
    }, { passive: true });

    function buildMobileDrawer() {
      var items = document.querySelectorAll('.mobile-drawer-dropdown');
      for (var i = 0; i < items.length; i++) {
        var dd = items[i];
        var key = dd.getAttribute('data-dd');
        var group = dropdownData[key];
        if (!group) continue;
        var sub = dd.querySelector('.mobile-drawer-sub');
        if (!sub) continue;
        for (var j = 0; j < group.items.length; j++) {
          var item = group.items[j];
          var li = document.createElement('li');
          li.innerHTML = '<a href="' + (item.href || '#') + '">' + svg(icons[item.icon]) + item.title + '</a>';
          sub.appendChild(li);
        }
      }
    }

    function init() {
      addChevrons();
      buildPanels();
      setupDesktop();
      buildMobileSubmenus();
      buildMobileDrawer();
      document.addEventListener('keydown', handleKeydown);
    }

    init();
  })();

  /* ---------- 10. Mobile Drawer Toggle ---------- */
  (function() {
    var hamburger = document.getElementById('mobileHamburger');
    var drawer = document.getElementById('mobileDrawer');
    var closeBtn = document.getElementById('mobileDrawerClose');
    var links = document.getElementById('mobileDrawerLinks');
    var overlay = null;
    if (!hamburger || !drawer) return;

    function createOverlay() {
      if (overlay && overlay.parentNode) return;
      overlay = document.createElement('div');
      overlay.className = 'mobile-drawer-backdrop';
      document.body.appendChild(overlay);
      requestAnimationFrame(function() { overlay.classList.add('open'); });
      overlay.addEventListener('click', closeDrawer);
    }

    function removeOverlay() {
      if (!overlay) return;
      overlay.classList.remove('open');
      setTimeout(function() {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        overlay = null;
      }, 350);
    }

    function openDrawer() {
      hamburger.classList.add('open');
      drawer.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      createOverlay();
    }

    function closeDrawer() {
      hamburger.classList.remove('open');
      drawer.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      removeOverlay();
      var subs = drawer.querySelectorAll('.mobile-drawer-sub.open');
      for (var i = 0; i < subs.length; i++) subs[i].classList.remove('open');
      var toggles = drawer.querySelectorAll('.mobile-drawer-toggle.open');
      for (var i = 0; i < toggles.length; i++) {
        toggles[i].classList.remove('open');
        toggles[i].setAttribute('aria-expanded', 'false');
      }
    }

    hamburger.addEventListener('click', function() {
      var isOpen = drawer.classList.contains('open');
      isOpen ? closeDrawer() : openDrawer();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    // Accordion toggles
    var toggles = drawer.querySelectorAll('.mobile-drawer-toggle');
    for (var i = 0; i < toggles.length; i++) {
      toggles[i].addEventListener('click', function(e) {
        e.stopPropagation();
        var btn = this;
        var isOpen = btn.classList.contains('open');
        var parent = btn.closest('.mobile-drawer-dropdown');
        if (!parent) return;
        var sub = parent.querySelector('.mobile-drawer-sub');
        if (!sub) return;
        if (isOpen) {
          sub.classList.remove('open');
          btn.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          sub.classList.add('open');
          btn.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    }

    // Close drawer on any link tap
    if (links) {
      var allLinks = links.querySelectorAll('a');
      for (var i = 0; i < allLinks.length; i++) {
        (function(l) {
          l.addEventListener('click', closeDrawer);
        })(allLinks[i]);
      }
    }

    // Close drawer on bottom action buttons
    var bottomLinks = drawer.querySelectorAll('.mobile-drawer-action');
    for (var i = 0; i < bottomLinks.length; i++) {
      (function(l) {
        l.addEventListener('click', closeDrawer);
      })(bottomLinks[i]);
    }
  })();

  /* ---------- 10. Newsletter form (front-end only demo) ---------- */
  const newsletterForm = document.getElementById('newsletterForm');
  const formMsg = document.getElementById('formMsg');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletterEmail');
      const email = emailInput.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (emailPattern.test(email)) {
        formMsg.textContent = 'شكرًا لك! تم تسجيل اشتراكك بنجاح.';
        newsletterForm.reset();
      } else {
        formMsg.textContent = 'يرجى إدخال بريد إلكتروني صحيح.';
      }
    });
  }

  /* =====================================================================
     JOIN PAGE — Premium Membership Application
     Only runs when join page elements are detected
     ===================================================================== */
  const joinForm = document.getElementById('joinForm');
  if (!joinForm) return;

  /* ---------- AOS Init ---------- */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      once: true,
      offset: 80,
      duration: 800,
      easing: 'cubic-bezier(0.22, 0.8, 0.32, 1)',
    });
  }

  /* ---------- Form Elements ---------- */
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const birthDate = document.getElementById('birthDate');
  const birthPlace = document.getElementById('birthPlace');
  const cin = document.getElementById('cin');
  const phone = document.getElementById('phone');
  const email = document.getElementById('email');
  const address = document.getElementById('address');
  const agreeCheck = document.getElementById('agreeCheck');
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const submitLoading = document.getElementById('submitLoading');
  const joinSuccess = document.getElementById('joinSuccess');
  const requestId = document.getElementById('requestId');

  const errorEls = {
    firstName: document.getElementById('firstNameError'),
    lastName: document.getElementById('lastNameError'),
    birthDate: document.getElementById('birthDateError'),
    birthPlace: document.getElementById('birthPlaceError'),
    cin: document.getElementById('cinError'),
    phone: document.getElementById('phoneError'),
    email: document.getElementById('emailError'),
    address: document.getElementById('addressError'),
    photo: document.getElementById('photoError'),
    sigMember: document.getElementById('sigMemberError'),
    agree: document.getElementById('agreeError'),
  };

  /* ---------- Photo Upload ---------- */
  const uploadArea = document.getElementById('uploadArea');
  const uploadContent = document.getElementById('uploadContent');
  const photoInput = document.getElementById('photoInput');
  const previewImage = document.getElementById('previewImage');
  const removeImage = document.getElementById('removeImage');
  let uploadedFile = null;

  uploadArea.addEventListener('click', function() {
    if (!uploadArea.classList.contains('has-image')) {
      photoInput.click();
    }
  });

  photoInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  // Drag & Drop
  uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', function() {
    uploadArea.classList.remove('dragover');
  });
  uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  function handleFile(file) {
    if (!file.type.match('image/(png|jpeg|jpg)')) {
      showError('photo', 'يرجى اختيار صورة بصيغة PNG أو JPG');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError('photo', 'حجم الصورة يتجاوز 5MB');
      return;
    }
    uploadedFile = file;
    clearError('photo');
    const reader = new FileReader();
    reader.onload = function(e) {
      previewImage.src = e.target.result;
      uploadArea.classList.add('has-image');
    };
    reader.readAsDataURL(file);
  }

  removeImage.addEventListener('click', function(e) {
    e.stopPropagation();
    uploadedFile = null;
    previewImage.src = '';
    uploadArea.classList.remove('has-image');
    photoInput.value = '';
  });

  /* ---------- Signature Pads ---------- */
  function initSignature(canvasId, placeholderId) {
    const canvas = document.getElementById(canvasId);
    const placeholder = document.getElementById(placeholderId);
    if (!canvas || !placeholder) return;

    const ctx = canvas.getContext('2d');
    let drawing = false;
    let hasDrawn = false;

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      let clientX, clientY;
      if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    }

    function startDrawing(e) {
      drawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      placeholder.classList.add('hidden');
    }

    function draw(e) {
      if (!drawing) return;
      hasDrawn = true;
      const pos = getPos(e);
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#123B78';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }

    function stopDrawing() {
      drawing = false;
      if (!hasDrawn) placeholder.classList.remove('hidden');
    }

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return canvas;
  }

  const sigMember = initSignature('sigMember', 'sigMemberPlaceholder');
  const sigPresident = initSignature('sigPresident', 'sigPresidentPlaceholder');

  function clearSignature(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const placeholder = document.getElementById(canvasId === 'sigMember' ? 'sigMemberPlaceholder' : 'sigPresidentPlaceholder');
    if (placeholder) placeholder.classList.remove('hidden');
  }

  document.querySelectorAll('.join-sig-clear').forEach(function(btn) {
    btn.addEventListener('click', function() {
      clearSignature(this.dataset.canvas);
    });
  });

  function isSignatureEmpty(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    for (var i = 3; i < pixels.length; i += 4) {
      if (pixels[i] > 10) return false;
    }
    return true;
  }

  /* ---------- Validation Helpers ---------- */
  function showError(field, message) {
    if (errorEls[field]) {
      errorEls[field].textContent = message;
      var input = document.getElementById(field);
      if (input && input.classList) input.classList.add('error');
    }
  }

  function clearError(field) {
    if (errorEls[field]) {
      errorEls[field].textContent = '';
      var input = document.getElementById(field);
      if (input && input.classList) input.classList.remove('error');
    }
  }

  function clearAllErrors() {
    for (var key in errorEls) {
      if (errorEls[key]) errorEls[key].textContent = '';
    }
    document.querySelectorAll('.join-input.error').forEach(function(el) {
      el.classList.remove('error');
    });
  }

  /* Live validation on input */
  joinForm.querySelectorAll('.join-input').forEach(function(input) {
    input.addEventListener('input', function() {
      clearError(this.id);
    });
    input.addEventListener('blur', function() {
      if (this.hasAttribute('required') && this.value.trim() === '') {
        showError(this.id, 'هذا الحقل مطلوب');
      }
    });
  });

  /* ---------- Form Submission ---------- */
  joinForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearAllErrors();
    var isValid = true;

    if (!firstName.value.trim()) { showError('firstName', 'هذا الحقل مطلوب'); isValid = false; }
    if (!lastName.value.trim()) { showError('lastName', 'هذا الحقل مطلوب'); isValid = false; }
    if (!birthDate.value) { showError('birthDate', 'هذا الحقل مطلوب'); isValid = false; }
    if (!birthPlace.value.trim()) { showError('birthPlace', 'هذا الحقل مطلوب'); isValid = false; }

    if (!cin.value.trim()) { showError('cin', 'هذا الحقل مطلوب'); isValid = false; }
    else if (!/^[A-Za-z0-9]{5,10}$/.test(cin.value.trim())) {
      showError('cin', 'يرجى إدخال رقم بطاقة وطنية صحيح');
      isValid = false;
    }
    if (!phone.value.trim()) { showError('phone', 'هذا الحقل مطلوب'); isValid = false; }
    else if (!/^[0-9+\-\s]{8,15}$/.test(phone.value.trim())) {
      showError('phone', 'يرجى إدخال رقم هاتف صحيح');
      isValid = false;
    }
    if (!email.value.trim()) { showError('email', 'هذا الحقل مطلوب'); isValid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showError('email', 'يرجى إدخال بريد إلكتروني صحيح');
      isValid = false;
    }

    if (!address.value.trim()) { showError('address', 'هذا الحقل مطلوب'); isValid = false; }

    if (!uploadedFile) { showError('photo', 'يرجى إرفاق صورة شخصية'); isValid = false; }

    if (isSignatureEmpty('sigMember')) { showError('sigMember', 'يرجى التوقيع'); isValid = false; }

    if (!agreeCheck.checked) { showError('agree', 'يرجى الموافقة على الشروط'); isValid = false; }

    if (!isValid) {
      var firstError = document.querySelector('.join-error:not(:empty)');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    submitBtn.classList.add('loading');

    try {
      var photoBase64 = '';
      if (uploadedFile) {
        photoBase64 = await new Promise(function(resolve) {
          var reader = new FileReader();
          reader.onload = function(ev) { resolve(ev.target.result); };
          reader.readAsDataURL(uploadedFile);
        });
      }

      var formData = {
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        birthDate: birthDate.value,
        birthPlace: birthPlace.value.trim(),
        cin: cin.value.trim(),
        phone: phone.value.trim(),
        email: email.value.trim(),
        address: address.value.trim(),
        photoBase64: photoBase64,
        sigMemberDataUrl: '',
        sigPresidentDataUrl: '',
      };

      var sigMemberCanvas = document.getElementById('sigMember');
      if (sigMemberCanvas && !isSignatureEmpty('sigMember')) {
        formData.sigMemberDataUrl = sigMemberCanvas.toDataURL('image/png');
      }
      var sigPresidentCanvas = document.getElementById('sigPresident');
      if (sigPresidentCanvas && !isSignatureEmpty('sigPresident')) {
        formData.sigPresidentDataUrl = sigPresidentCanvas.toDataURL('image/png');
      }

      var saveResult = await saveMembership(formData);
      if (saveResult.error) {
        throw new Error(saveResult.error.message || 'خطأ في حفظ البيانات');
      }

      submitText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إنشاء PDF...';

      var pdfBytes = await generateMembershipPDF(formData);

      var base64 = '';
      var binary = '';
      var bytes = new Uint8Array(pdfBytes);
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64 = btoa(binary);

      sessionStorage.setItem('amare_pdf_bytes', base64);

      submitBtn.classList.remove('loading');
      joinForm.reset();
      uploadArea.classList.remove('has-image');
      previewImage.src = '';
      uploadedFile = null;
      clearSignature('sigMember');
      clearSignature('sigPresident');

      window.location.href = 'preview.html';

    } catch (err) {
      submitBtn.classList.remove('loading');
      submitText.innerHTML = '<i class="fas fa-file-pdf"></i> إنشاء استمارة الانخراط';
      showError('firstName', err.message || 'حدث خطأ أثناء إنشاء الاستمارة');
      console.error(err);
    }
  });

})();
