/* ==========================================================================
   المتحف الرقمي (DIGITAL MUSEUM) — public data loader + gallery renderer
   --------------------------------------------------------------------------
   Reuses the shared Supabase client (window.Supabase.getClient()) and the
   public bucket "museum-media".

   - Only reads rows where is_published = true (RLS also enforces this).
   - Orders by display_order ASC, then created_at DESC.
   - Renders a responsive gallery, category/media filters, load-more,
     accessible lightbox and graceful loading / empty / error states.
   - Exposes window.AMARE_MuseumContent = { reload } for the retry action.
   ========================================================================== */

(function (window) {
  'use strict';

  var PAGE_SIZE = 9;

  var state = {
    items: [],
    type: 'all',
    category: 'all',
    visible: PAGE_SIZE,
  };

  var els = {};
  var lastFocused = null;

  /* ---------------------------------------------------------------------- */
  /* Helpers                                                                */
  /* ---------------------------------------------------------------------- */

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Only allow https, http and site-relative URLs into media attributes. */
  function safeUrl(value) {
    if (!value) return '';
    var url = String(value).trim();
    if (!url) return '';

    if (url.charAt(0) === '/') return url;

    try {
      var parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.href;
      }
    } catch (error) {
      return '';
    }

    return '';
  }

  function normalizeType(value) {
    return value === 'video' ? 'video' : 'image';
  }

  function labelForType(type) {
    return type === 'video' ? 'فيديو' : 'صورة';
  }

  function categoryValue(item) {
    return String(item.category || '').trim();
  }

  function clientOrNull() {
    try {
      if (window.Supabase && typeof window.Supabase.getClient === 'function') {
        return window.Supabase.getClient();
      }
      return window.supabaseClient || null;
    } catch (error) {
      return null;
    }
  }

  /** Wait for navbar-loader.js to finish loading the shared Supabase chain. */
  function waitForClient() {
    var existing = clientOrNull();
    if (existing) return Promise.resolve(existing);

    return new Promise(function (resolve) {
      var attempts = 0;
      var timer = window.setInterval(function () {
        var client = clientOrNull();
        if (client || attempts >= 50) {
          window.clearInterval(timer);
          resolve(client || null);
          return;
        }
        attempts += 1;
      }, 120);
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Rendering                                                              */
  /* ---------------------------------------------------------------------- */

  function setState(kind) {
    if (!els.grid || !els.skeleton) return;

    els.skeleton.hidden = kind !== 'loading';
    els.grid.hidden = kind !== 'ready';
    if (els.empty) els.empty.hidden = kind !== 'empty';
    if (els.error) els.error.hidden = kind !== 'error';
    if (els.moreWrap) els.moreWrap.hidden = true;

    if (kind === 'loading') {
      els.grid.innerHTML = '';
      els.grid.setAttribute('aria-busy', 'true');
    } else {
      els.grid.setAttribute('aria-busy', 'false');
    }

    if (els.categoryRow && kind !== 'ready') {
      els.categoryRow.hidden = true;
    }
  }

  function setHeroCounts(items) {
    var total = items.length;
    var videos = items.filter(function (item) {
      return normalizeType(item.media_type) === 'video';
    }).length;
    var images = total - videos;

    if (els.heroTotal) els.heroTotal.textContent = String(total);
    if (els.heroImages) els.heroImages.textContent = String(images);
    if (els.heroVideos) els.heroVideos.textContent = String(videos);
  }

  function renderCategories() {
    if (!els.categoryChips || !els.categoryRow) return;

    var seen = {};
    var categories = [];

    state.items.forEach(function (item) {
      var category = categoryValue(item);
      if (!category || seen[category]) return;
      seen[category] = true;
      categories.push(category);
    });

    categories.sort(function (a, b) {
      try {
        return a.localeCompare(b, 'ar');
      } catch (error) {
        return a < b ? -1 : 1;
      }
    });

    if (!categories.length) {
      els.categoryRow.hidden = true;
      return;
    }

    els.categoryRow.hidden = false;
    var chips = [
      '<button type="button" class="ms-chip' +
        (state.category === 'all' ? ' is-active' : '') +
        '" data-category="all" aria-pressed="' +
        (state.category === 'all' ? 'true' : 'false') +
        '">كل الفئات</button>',
    ];

    categories.forEach(function (category) {
      var active = state.category === category;
      chips.push(
        '<button type="button" class="ms-chip' +
          (active ? ' is-active' : '') +
          '" data-category="' +
          escapeHtml(category) +
          '" aria-pressed="' +
          (active ? 'true' : 'false') +
          '">' +
          escapeHtml(category) +
          '</button>'
      );
    });

    els.categoryChips.innerHTML = chips.join('');
  }

  function filteredItems() {
    return state.items.filter(function (item) {
      if (
        state.type !== 'all' &&
        normalizeType(item.media_type) !== state.type
      ) {
        return false;
      }
      if (
        state.category !== 'all' &&
        categoryValue(item) !== state.category
      ) {
        return false;
      }
      return true;
    });
  }

  function mediaMarkup(item, type, mediaUrl, thumbUrl, title) {
    if (type === 'video') {
      if (thumbUrl) {
        return (
          '<img class="ms-media-el" src="' +
          escapeHtml(thumbUrl) +
          '" alt="' +
          escapeHtml(title) +
          '" loading="lazy" decoding="async" data-media-img>'
        );
      }
      return (
        '<video class="ms-media-el" src="' +
        escapeHtml(mediaUrl) +
        '" preload="metadata" muted playsinline aria-hidden="true" tabindex="-1" data-media-video></video>'
      );
    }

    if (!mediaUrl) return '';
    return (
      '<img class="ms-media-el" src="' +
      escapeHtml(mediaUrl) +
      '" alt="' +
      escapeHtml(title) +
      '" loading="lazy" decoding="async" data-media-img>'
    );
  }

  function cardMarkup(item) {
    var type = normalizeType(item.media_type);
    var title = String(item.title || 'قطعة من المتحف');
    var description = String(item.description || '').trim();
    var category = categoryValue(item);
    var mediaUrl = safeUrl(item.media_url);
    var thumbUrl = safeUrl(item.thumbnail_url);
    var id = escapeHtml(item.id);

    var media = mediaMarkup(item, type, mediaUrl, thumbUrl, title);

    return (
      '<article class="ms-card ms-reveal">' +
      '<button type="button" class="ms-card-media" data-open="' +
      id +
      '" aria-label="' +
      (type === 'video' ? 'تشغيل الفيديو: ' : 'عرض الصورة: ') +
      escapeHtml(title) +
      '">' +
      '<span class="ms-media-fallback" aria-hidden="true">' +
      (type === 'video'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L3 21"/></svg>') +
      '</span>' +
      media +
      '<span class="ms-type-tag">' +
      (type === 'video' ? 'فيديو' : 'صورة') +
      '</span>' +
      (type === 'video'
        ? '<span class="ms-play-overlay"><span class="ms-play-btn"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span></span>'
        : '') +
      '</button>' +
      '<div class="ms-card-body">' +
      (category
        ? '<span class="ms-category-tag">' + escapeHtml(category) + '</span>'
        : '') +
      '<h3 class="ms-card-title">' +
      escapeHtml(title) +
      '</h3>' +
      (description
        ? '<p class="ms-card-desc">' + escapeHtml(description) + '</p>'
        : '') +
      '<div class="ms-card-footer">' +
      '<span class="ms-card-type">' +
      labelForType(type) +
      '</span>' +
      '<button type="button" class="ms-card-link" data-open="' +
      id +
      '">مشاهدة القطعة <span aria-hidden="true">←</span></button>' +
      '</div>' +
      '</div>' +
      '</article>'
    );
  }

  function wireBrokenMedia() {
    if (!els.grid) return;
    var media = els.grid.querySelectorAll('img[data-media-img], video[data-media-video]');
    for (var i = 0; i < media.length; i++) {
      (function (element) {
        function fail() {
          element.classList.add('is-broken');
          element.setAttribute('aria-hidden', 'true');
        }
        element.addEventListener('error', fail);
        if (element.tagName === 'VIDEO') {
          element.addEventListener('loadedmetadata', function () {
            element.classList.add('is-loaded');
          });
        }
      })(media[i]);
    }
  }

  function renderGrid() {
    if (!els.grid) return;

    var items = filteredItems();
    var shown = items.slice(0, state.visible);

    if (!shown.length) {
      els.grid.innerHTML =
        '<div class="ms-no-results">لا توجد قطع مطابقة لهذه التصفية. جرّب اختيار نوع أو فئة أخرى.</div>';
    } else {
      els.grid.innerHTML = shown.map(cardMarkup).join('');
      wireBrokenMedia();
    }

    if (els.count) {
      if (!items.length) {
        els.count.textContent = 'لا توجد قطع مطابقة للتصفية الحالية.';
      } else {
        els.count.textContent =
          'يتم عرض ' +
          shown.length +
          ' من أصل ' +
          items.length +
          ' قطعة في المجموعة.';
      }
    }

    if (els.moreWrap && els.loadMore) {
      els.moreWrap.hidden = items.length <= shown.length;
    }

    if (els.reset) {
      els.reset.hidden =
        state.type === 'all' && state.category === 'all';
    }

    // Reveal cards progressively (respects reduced motion via CSS).
    window.requestAnimationFrame(function () {
      var cards = els.grid.querySelectorAll('.ms-reveal');
      for (var i = 0; i < cards.length; i++) {
        cards[i].classList.add('is-visible');
      }
    });
  }

  function updateTypeButtons() {
    if (!els.typeButtons) return;
    for (var i = 0; i < els.typeButtons.length; i++) {
      var button = els.typeButtons[i];
      var active = button.getAttribute('data-type') === state.type;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    }
  }

  function refresh(resetVisible) {
    if (resetVisible) state.visible = PAGE_SIZE;
    renderCategories();
    updateTypeButtons();
    renderGrid();
  }

  /* ---------------------------------------------------------------------- */
  /* Lightbox                                                               */
  /* ---------------------------------------------------------------------- */

  function findItem(id) {
    for (var i = 0; i < state.items.length; i++) {
      if (state.items[i].id === id) return state.items[i];
    }
    return null;
  }

  function openLightbox(item) {
    if (!item || !els.lightbox || !els.lightboxStage) return;

    var type = normalizeType(item.media_type);
    var title = String(item.title || 'قطعة من المتحف');
    var description = String(item.description || '').trim();
    var category = categoryValue(item);
    var mediaUrl = safeUrl(item.media_url);
    var thumbUrl = safeUrl(item.thumbnail_url);
    var stageHtml = '';

    if (!mediaUrl) {
      stageHtml =
        '<div class="ms-lightbox-missing">تعذر العثور على ملف هذه القطعة. يرجى المحاولة لاحقًا.</div>';
    } else if (type === 'video') {
      stageHtml =
        '<video class="ms-lightbox-video" src="' +
        escapeHtml(mediaUrl) +
        '"' +
        (thumbUrl ? ' poster="' + escapeHtml(thumbUrl) + '"' : '') +
        ' controls autoplay playsinline preload="metadata"></video>';
    } else {
      stageHtml =
        '<img class="ms-lightbox-image" src="' +
        escapeHtml(mediaUrl) +
        '" alt="' +
        escapeHtml(title) +
        '">';
    }

    els.lightboxStage.innerHTML = stageHtml;
    if (els.lightboxTitle) els.lightboxTitle.textContent = title;
    if (els.lightboxCategory) {
      els.lightboxCategory.textContent = category || labelForType(type);
      els.lightboxCategory.hidden = false;
    }
    if (els.lightboxDesc) {
      els.lightboxDesc.textContent = description;
      els.lightboxDesc.hidden = !description;
    }

    var image = els.lightboxStage.querySelector('img');
    if (image) {
      image.addEventListener('error', function () {
        els.lightboxStage.innerHTML =
          '<div class="ms-lightbox-missing">تعذر تحميل الصورة. قد يكون الملف محذوفًا أو غير متاح.</div>';
      });
    }

    lastFocused = document.activeElement;
    els.lightbox.hidden = false;
    document.body.classList.add('ms-no-scroll');
    window.requestAnimationFrame(function () {
      els.lightbox.classList.add('is-open');
      if (els.lightboxClose) els.lightboxClose.focus();
    });

    document.addEventListener('keydown', onLightboxKeydown);
  }

  function closeLightbox() {
    if (!els.lightbox || els.lightbox.hidden) return;

    var video = els.lightboxStage
      ? els.lightboxStage.querySelector('video')
      : null;
    if (video) {
      video.pause();
      video.removeAttribute('src');
    }

    els.lightbox.classList.remove('is-open');
    els.lightbox.hidden = true;
    document.body.classList.remove('ms-no-scroll');
    if (els.lightboxStage) els.lightboxStage.innerHTML = '';
    document.removeEventListener('keydown', onLightboxKeydown);

    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
    lastFocused = null;
  }

  function onLightboxKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
      return;
    }

    if (event.key !== 'Tab' || !els.lightbox) return;

    var focusable = els.lightbox.querySelectorAll(
      'button, [href], video[controls], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Events                                                                 */
  /* ---------------------------------------------------------------------- */

  function bindEvents() {
    if (els.grid) {
      els.grid.addEventListener('click', function (event) {
        var trigger = event.target.closest('[data-open]');
        if (!trigger) return;
        var item = findItem(trigger.getAttribute('data-open'));
        if (item) openLightbox(item);
      });
    }

    if (els.skeleton) {
      // Skeleton is decorative; no events.
    }

    if (els.typeButtons) {
      for (var i = 0; i < els.typeButtons.length; i++) {
        els.typeButtons[i].addEventListener('click', function () {
          state.type = this.getAttribute('data-type') || 'all';
          refresh(true);
        });
      }
    }

    if (els.categoryChips) {
      els.categoryChips.addEventListener('click', function (event) {
        var chip = event.target.closest('[data-category]');
        if (!chip) return;
        state.category = chip.getAttribute('data-category') || 'all';
        refresh(true);
      });
    }

    if (els.loadMore) {
      els.loadMore.addEventListener('click', function () {
        state.visible += PAGE_SIZE;
        renderGrid();
      });
    }

    if (els.reset) {
      els.reset.addEventListener('click', function () {
        state.type = 'all';
        state.category = 'all';
        refresh(true);
      });
    }

    if (els.retry) {
      els.retry.addEventListener('click', function () {
        load();
      });
    }

    if (els.lightboxClose) {
      els.lightboxClose.addEventListener('click', closeLightbox);
    }
    if (els.lightbox) {
      els.lightbox.addEventListener('click', function (event) {
        if (event.target.hasAttribute('data-close-lightbox')) closeLightbox();
      });
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Data loading                                                           */
  /* ---------------------------------------------------------------------- */

  async function load() {
    setState('loading');
    if (els.heroTotal) els.heroTotal.textContent = '0';
    if (els.heroImages) els.heroImages.textContent = '0';
    if (els.heroVideos) els.heroVideos.textContent = '0';

    try {
      var client = await waitForClient();
      if (!client) throw new Error('Supabase client unavailable');

      var result = await client
        .from('museum_items')
        .select(
          'id, title, description, media_type, media_url, thumbnail_url, category, display_order, created_at'
        )
        .eq('is_published', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(500);

      if (result.error) throw result.error;

      var rows = (result.data || []).filter(function (row) {
        return row && typeof row === 'object' && row.title;
      });

      state.items = rows;
      state.type = 'all';
      state.category = 'all';
      state.visible = PAGE_SIZE;

      setHeroCounts(rows);

      if (!rows.length) {
        if (els.count) {
          els.count.textContent = 'لا توجد قطع منشورة حاليًا.';
        }
        setState('empty');
        return;
      }

      setState('ready');
      refresh(true);
    } catch (error) {
      console.error('[Museum] Failed to load collection:', error);
      setState('error');
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Boot                                                                   */
  /* ---------------------------------------------------------------------- */

  function init() {
    els = {
      grid: document.getElementById('msGrid'),
      skeleton: document.getElementById('msSkeleton'),
      empty: document.getElementById('msEmpty'),
      error: document.getElementById('msError'),
      moreWrap: document.getElementById('msMoreWrap'),
      loadMore: document.getElementById('msLoadMore'),
      count: document.getElementById('msResultCount'),
      reset: document.getElementById('msResetFilters'),
      categoryRow: document.getElementById('msCategoryRow'),
      categoryChips: document.getElementById('msCategoryChips'),
      typeButtons: document.querySelectorAll('.ms-filter[data-type]'),
      retry: document.getElementById('msRetryBtn'),
      lightbox: document.getElementById('msLightbox'),
      lightboxStage: document.getElementById('msLightboxStage'),
      lightboxTitle: document.getElementById('msLightboxTitle'),
      lightboxCategory: document.getElementById('msLightboxCategory'),
      lightboxDesc: document.getElementById('msLightboxDesc'),
      lightboxClose: document.getElementById('msLightboxClose'),
      heroTotal: document.getElementById('msHeroTotal'),
      heroImages: document.getElementById('msHeroImages'),
      heroVideos: document.getElementById('msHeroVideos'),
    };

    if (!els.grid) return;

    bindEvents();
    load();
  }

  window.AMARE_MuseumContent = { reload: load };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('amare:langchange', function () {
    if (state.items.length) refresh(false);
  });
})(window);
