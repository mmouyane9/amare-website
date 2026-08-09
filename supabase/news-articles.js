/* ==========================================================================
   الأخبار (NEWS) — Real articles from the public.news table
   --------------------------------------------------------------------------
   Replaces the old static/demo news store on /News/news.html with live
   articles fetched from the Supabase `public.news` table.

   Rules:
     - Reuses the shared client: window.Supabase.getClient()  (no duplicate).
     - Only fetches rows with status = 'published'.
     - Orders by published_at DESC.
     - The page must never request or display drafts / archived articles.
     - RLS (news_public_published_select) additionally enforces this.

   The page store (window.NewsPage, defined inside News/news.html) renders
   the cards. This loader:
     - feeds mapped articles via NewsPage.setData(...) + render()
     - shows the empty state via NewsPage.showEmpty()
     - shows the error state via NewsPage.showError()
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

  function isNewsPage() {
    return /news\.html/i.test(window.location.pathname);
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

  // Map a public.news row onto the page's card data model.
  function mapRow(row) {
    var slug = String(row.slug || '').trim();
    return {
      id: row.id,
      title: row.title || 'بدون عنوان',
      slug: slug,
      image: row.featured_image || null,
      summary: row.excerpt || null,
      content: row.content || null,
      date: formatArabicDate(row.published_at),
      published_at: row.published_at,
      // The news table has no category column — use a single neutral category.
      category: 'association',
      catLabel: 'أخبار',
      catClass: 'cat-association',
      author: '',
      featured: false,
      linkUrl: slug
        ? 'article.html?slug=' + encodeURIComponent(slug)
        : '#',
      linkLabel: 'اقرأ المزيد',
    };
  }

  function fetchNews(callback) {
    var MAX_RETRIES = 30;
    var RETRY_MS = 200;

    function tryLoad(retries) {
      var S = window.Supabase;
      if (!S || !S.getClient) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        console.warn('[NEWS] Supabase chain not ready after ' + (MAX_RETRIES * RETRY_MS) + 'ms');
        return callback({ error: true });
      }
      var client = S.getClient();
      if (!client) {
        if (retries < MAX_RETRIES) {
          setTimeout(function () { tryLoad(retries + 1); }, RETRY_MS);
          return;
        }
        console.warn('[NEWS] Supabase client unavailable after ' + (MAX_RETRIES * RETRY_MS) + 'ms');
        return callback({ error: true });
      }

      client
        .from('news')
        .select('id, title, slug, excerpt, content, featured_image, status, published_at, author_id, created_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .then(function (r) {
          if (r.error) {
            console.error('[NEWS] Query error:', r.error);
            return callback({ error: true });
          }
          callback({ data: r.data || [] });
        })
        .catch(function (err) {
          console.error('[NEWS] Load failed:', err);
          callback({ error: true });
        });
    }
    tryLoad(0);
  }

  function wireRetry() {
    var btn = document.getElementById('newsRetryBtn');
    if (btn && !btn._amareWired) {
      btn._amareWired = true;
      btn.addEventListener('click', function () {
        if (window.AMARE_NewsArticles) window.AMARE_NewsArticles.reload();
      });
    }
  }

  function init() {
    if (!isNewsPage()) return;

    fetchNews(function (result) {
      var page = window.NewsPage;
      if (!page) {
        setTimeout(init, 50);
        return;
      }
      if (result.error) {
        page.showError();
        wireRetry();
        return;
      }
      var rows = result.data;
      if (!rows.length) {
        page.showEmpty();
        wireRetry();
        return;
      }
      page.setData(rows.map(mapRow));
      page.render();
    });
  }

  // Public API — used by the retry button on the error state.
  window.AMARE_NewsArticles = { reload: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
