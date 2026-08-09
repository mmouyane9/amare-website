/* ==========================================================================
   الأخبار (NEWS) — Article details loader (News/article.html)
   --------------------------------------------------------------------------
   Reads ?slug=ARTICLE_SLUG from the URL, then loads the matching article
   from the Supabase `public.news` table.

   Rules:
     - Reuses the shared client: window.Supabase.getClient()  (no duplicate).
     - Matches by slug AND requires status = 'published'.
     - Never hardcodes article content.
     - A missing / invalid / unpublished slug shows the not-found state.
     - A Supabase failure shows a clean error state (no raw DB errors).
   ========================================================================== */

(function () {
  'use strict';

  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function isArticlePage() {
    return /article\.html/i.test(window.location.pathname);
  }

  function getSlug() {
    try {
      var params = new URLSearchParams(window.location.search);
      return (params.get('slug') || '').trim();
    } catch (e) {
      return '';
    }
  }

  // published_at → formatted Arabic date (e.g. "5 أغسطس 2026")
  function formatArabicDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    try {
      return d.toLocaleDateString('ar-MA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return '';
    }
  }

  // The content field may be rich HTML or plain text. Render HTML as-is;
  // otherwise escape text and split it into paragraphs.
  function renderContent(html) {
    if (!html) return '';
    var s = String(html);
    if (/<[a-z][\s\S]*>/i.test(s)) return s;
    return s
      .split(/\n{2,}/)
      .map(function (para) {
        var clean = esc(para).replace(/\n/g, '<br>');
        return clean ? '<p>' + clean + '</p>' : '';
      })
      .join('');
  }

  var els = {};

  function cacheEls() {
    els.crumb = document.getElementById('artCrumbTitle');
    els.title = document.getElementById('artTitle');
    els.meta = document.getElementById('artMeta');
    els.loading = document.getElementById('articleLoading');
    els.content = document.getElementById('articleContent');
    els.figure = document.getElementById('articleFigure');
    els.image = document.getElementById('articleImage');
    els.excerpt = document.getElementById('articleExcerpt');
    els.body = document.getElementById('articleBody');
    els.notFound = document.getElementById('articleNotFound');
    els.error = document.getElementById('articleError');
  }

  function hideAll() {
    [els.content, els.loading, els.notFound, els.error].forEach(function (el) {
      if (el) el.hidden = true;
    });
  }

  function showLoading() {
    hideAll();
    if (els.loading) els.loading.hidden = false;
  }

  function showNotFound() {
    hideAll();
    if (els.notFound) els.notFound.hidden = false;
    if (els.crumb) els.crumb.textContent = 'المقال غير موجود';
  }

  function showError() {
    hideAll();
    if (els.error) els.error.hidden = false;
    if (els.crumb) els.crumb.textContent = 'خطأ في التحميل';
  }

  function renderArticle(row) {
    var title = row.title || 'مقال';
    var date = formatArabicDate(row.published_at);

    document.title = title + ' | الأخبار | الجمعية المغربية لهواة البحث والاستكشاف';
    if (els.title) els.title.textContent = title;
    if (els.crumb) els.crumb.textContent = title;

    if (els.meta) {
      var metaHtml = '';
      if (date) {
        metaHtml +=
          '<span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
          esc(date) +
          '</span>';
      }
      els.meta.innerHTML = metaHtml;
    }

    if (row.featured_image) {
      if (els.figure) els.figure.hidden = false;
      if (els.image) {
        els.image.src = row.featured_image;
        els.image.alt = title;
      }
    } else if (els.figure) {
      els.figure.hidden = true;
    }

    if (els.excerpt) {
      els.excerpt.hidden = !row.excerpt;
      els.excerpt.textContent = row.excerpt || '';
    }

    if (els.body) els.body.innerHTML = renderContent(row.content);

    hideAll();
    if (els.content) els.content.hidden = false;
    window.scrollTo(0, 0);
  }

  function load() {
    cacheEls();
    showLoading();

    var slug = getSlug();
    if (!slug) {
      showNotFound();
      return;
    }

    var MAX_RETRIES = 30;
    var RETRY_MS = 200;

    function tryLoad(retries) {
      var S = window.Supabase;
      if (!S || !S.getClient) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        console.warn('[NEWS ARTICLE] Supabase chain not ready after ' + (MAX_RETRIES * RETRY_MS) + 'ms');
        showError();
        return;
      }
      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        console.warn('[NEWS ARTICLE] Supabase client unavailable after ' + (MAX_RETRIES * RETRY_MS) + 'ms');
        showError();
        return;
      }

      client
        .from('news')
        .select('id, title, slug, excerpt, content, featured_image, status, published_at, author_id, created_at')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle()
        .then(function (r) {
          if (r.error) {
            console.error('[NEWS ARTICLE] Query error:', r.error);
            showError();
            return;
          }
          if (!r.data) {
            showNotFound();
            return;
          }
          renderArticle(r.data);
        })
        .catch(function (err) {
          console.error('[NEWS ARTICLE] Load failed:', err);
          showError();
        });
    }
    tryLoad(0);
  }

  function init() {
    if (!isArticlePage()) return;
    cacheEls();
    var retryBtn = document.getElementById('articleRetryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', load);
    }
    load();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
