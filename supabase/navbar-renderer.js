/* ==========================================================================
   AMARE — Dynamic Navbar Renderer
   --------------------------------------------------------------------------
   Loads all navigation from Supabase in real‑time and renders:
     • Desktop nav‑links (#navLinks)
     • Mega‑dropdown panels (#megaDropdown)
     • Mobile drawer links (#mobileDrawerLinks)

   Every change made in the Dashboard propagates instantly via Realtime.
   ========================================================================== */

(function (window) {
  'use strict';

  var Supabase = window.Supabase || {};
  var db = Supabase.db;
  if (!db) {
    console.error('[NavbarRenderer] supabase/database.js must be loaded first.');
    return;
  }

  var channel = null;

  /* -------------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------------- */

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function normalizeUrl(url) {
    if (!url || url === '#') return url || '#';
    if (/^(https?:|mailto:|tel:|javascript:|#|\/)/i.test(url)) return url;
    return '/' + url;
  }

  /* Resolve a nav label/description for the active language (Arabic stored
     in the DB, English title_en when available, or the i18n dynamic map). */
  function navLabel(item) {
    if (window.I18n && window.I18n.resolveNavLabel) {
      return window.I18n.resolveNavLabel(item);
    }
    return item.title_ar || item.title_en || '';
  }

  function navDesc(item) {
    if (window.I18n && window.I18n.resolveNavDesc) {
      return window.I18n.resolveNavDesc(item);
    }
    return item.description_ar || '';
  }

  function buildTree(items) {
    var map = {};
    var roots = [];

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      item.children = [];
      map[item.id] = item;
    }

    for (var j = 0; j < items.length; j++) {
      var it = items[j];
      if (it.parent_id && map[it.parent_id]) {
        map[it.parent_id].children.push(it);
      } else if (!it.parent_id) {
        roots.push(it);
      }
    }

    // Collapse consolidated dropdowns: "من نحن" and "أنشطتنا" become plain links.
    for (var k = 0; k < roots.length; k++) {
      collapseConsolidatedNodes(roots[k]);
    }

    // Remove links to deleted service pages from the tree.
    for (var m = 0; m < roots.length; m++) {
      filterDeletedServices(roots[m]);
    }

    return roots;
  }

  // URLs of deleted service pages — remove these from the navbar.
  var DELETED_SERVICE_URLS = [
    '/Our%20services/explorer-house.html',
    '/Our%20services/amare-academy.html',
    '/clubs/index.html',
    '/clubs/',
    '/Our%20services/legal-advisor.html',
    '/Our%20services/insurance-contract.html',
    // Deleted Join Us pages
    '/Join%20us/bylaws.html',
    '/Join%20us/internal-regulations.html',
    '/Join%20us/charter.html',
    '/Join%20us/deposit-receipt.html',
    '/Join%20us/external-deposit-receipt.html',
    '/Join%20us/activity-notifications.html',
    '/Join%20us/application.html',
    '/Join%20us/commitment.html',
  ];

  function isDeletedService(url) {
    if (!url) return false;
    for (var i = 0; i < DELETED_SERVICE_URLS.length; i++) {
      if (url.indexOf(DELETED_SERVICE_URLS[i]) !== -1) return true;
    }
    return false;
  }

  function filterDeletedServices(node) {
    if (!node.children || node.children.length === 0) return;
    var filtered = [];
    for (var i = 0; i < node.children.length; i++) {
      if (!isDeletedService(node.children[i].url)) {
        filtered.push(node.children[i]);
      }
    }
    node.children = filtered;
    for (var j = 0; j < node.children.length; j++) {
      filterDeletedServices(node.children[j]);
    }
  }

  function collapseConsolidatedNodes(node) {
    if (!node.children || node.children.length === 0) return;

    // Check if all children point to a consolidated section
    var childUrl0 = (node.children[0].url || '');
    var dest = '';

    if (childUrl0.indexOf('/Who%20are%20we/') !== -1 || childUrl0.indexOf('/Who are we/') !== -1) {
      dest = '/Who%20are%20we/index.html';
    } else if (childUrl0.indexOf('/Our%20activities/') !== -1 || childUrl0.indexOf('/Our activities/') !== -1) {
      dest = '/Our%20activities/index.html';
    }

    if (dest) {
      var allMatch = true;
      for (var i = 1; i < node.children.length; i++) {
        var u = (node.children[i].url || '');
        if (u.indexOf(dest.replace('/index.html', '')) === -1) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) {
        node.children = [];
        node.url = dest;
        return;
      }
    }

    // Recurse into remaining children
    for (var j = 0; j < node.children.length; j++) {
      collapseConsolidatedNodes(node.children[j]);
    }
  }

  /* -------------------------------------------------------------------------
     Desktop nav‑links
     ------------------------------------------------------------------------- */

  function renderDesktopNav(tree) {
    var ul = document.getElementById('navLinks');
    if (!ul) return;

    var html = '';
    for (var i = 0; i < tree.length; i++) {
      var item = tree[i];
      if (!item.is_visible) continue;

      var href = normalizeUrl(item.url);
      var hasChildren = item.children.length > 0;

      if (hasChildren) {
        html += '<li data-dropdown="nav-dd-' + item.id + '">';
        html += '<a href="' + escapeHtml(href) + '">' + escapeHtml(navLabel(item)) + '</a>';
        html += '</li>';
      } else {
        html += '<li>';
        html += '<a href="' + escapeHtml(href) + '"';
        if (item.target_blank) html += ' target="_blank" rel="noopener"';
        html += '>' + escapeHtml(navLabel(item)) + '</a>';
        html += '</li>';
      }
    }
    ul.innerHTML = html;
  }

  /* -------------------------------------------------------------------------
     Mega‑dropdown panels
     ------------------------------------------------------------------------- */

  function renderMegaDropdown(tree) {
    var container = document.getElementById('megaDropdown');
    if (!container) return;

    var html = '';
    for (var i = 0; i < tree.length; i++) {
      var item = tree[i];
      if (!item.is_visible) continue;
      if (item.children.length === 0) continue;

      html += '<div class="mega-panel" data-panel="nav-dd-' + item.id + '">';
      html += '<div class="mega-panel-inner">';
      html += '<div class="mega-panel-head">';
      html += '<span class="mega-panel-title">' + escapeHtml(navLabel(item)) + '</span>';
      if (item.url && item.url !== '#') {
        html += '<a href="' + escapeHtml(normalizeUrl(item.url)) + '" class="mega-panel-link">' + (window.I18n ? window.I18n.t('nav.viewAll') : 'عرض الكل') + ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></a>';
      }
      html += '</div>';
      html += '<div class="mega-grid">';

      for (var j = 0; j < item.children.length; j++) {
        var child = item.children[j];
        if (!child.is_visible) continue;
        html += '<a href="' + escapeHtml(normalizeUrl(child.url)) + '" class="mega-item"';
        if (child.target_blank) html += ' target="_blank" rel="noopener"';
        html += '>';
        html += '<span class="mega-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg></span>';
        html += '<span class="mega-text">';
        html += '<span class="mega-title">' + escapeHtml(navLabel(child)) + '</span>';
        html += '<span class="mega-desc">' + escapeHtml(navDesc(child)) + '</span>';
        html += '</span></a>';
      }

      html += '</div></div></div>';
    }
    container.innerHTML = html;
  }

  /* -------------------------------------------------------------------------
     Mobile drawer links
     ------------------------------------------------------------------------- */

  function renderMobileDrawer(tree) {
    var ul = document.getElementById('mobileDrawerLinks');
    if (!ul) return;

    var html = '';
    for (var i = 0; i < tree.length; i++) {
      var item = tree[i];
      if (!item.is_visible) continue;

      var href = normalizeUrl(item.url);
      var hasChildren = item.children.length > 0;

      if (hasChildren) {
        html += '<li class="mobile-drawer-dropdown" data-dd="nav-dd-' + item.id + '">';
        html += '<div class="mobile-drawer-row">';
        html += '<a href="' + escapeHtml(href) + '">' + escapeHtml(navLabel(item)) + '</a>';
        html += '<button class="mobile-drawer-toggle" aria-label="' + (window.I18n ? window.I18n.t('nav.submenu') : 'فتح القائمة الفرعية') + '" aria-expanded="false">';
        html += '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>';
        html += '</button>';
        html += '</div>';
        html += '<ul class="mobile-drawer-sub">';
        for (var j = 0; j < item.children.length; j++) {
          var child = item.children[j];
          if (!child.is_visible) continue;
          html += '<li><a href="' + escapeHtml(normalizeUrl(child.url)) + '"';
          if (child.target_blank) html += ' target="_blank" rel="noopener"';
          html += '>' + escapeHtml(navLabel(child)) + '</a></li>';
        }
        html += '</ul>';
        html += '</li>';
      } else {
        html += '<li><a href="' + escapeHtml(href) + '"';
        if (item.target_blank) html += ' target="_blank" rel="noopener"';
        html += '>' + escapeHtml(navLabel(item)) + '</a></li>';
      }
    }
    ul.innerHTML = html;
  }

  /* -------------------------------------------------------------------------
     Dropdown interaction (self-contained, no dependency on script.js)
     ------------------------------------------------------------------------- */

  var dropdownContainer = null;
  var closeTimer = null;
  var activeKey = null;

  function isMobileView() {
    return window.innerWidth <= 768;
  }

  function setChevron(key, active) {
    var ch = document.querySelector(
      'li[data-dropdown="' + key + '"] .nav-link-chevron'
    );
    if (ch) ch.classList.toggle('rotated', active);
    var link = document.querySelector(
      'li[data-dropdown="' + key + '"] > a'
    );
    if (link) link.setAttribute('aria-expanded', active ? 'true' : 'false');
  }

  function resetAllChevrons() {
    var all = document.querySelectorAll('.nav-link-chevron.rotated');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('rotated');
    var links = document.querySelectorAll(
      'li[data-dropdown] > a[aria-expanded]'
    );
    for (var j = 0; j < links.length; j++)
      links[j].setAttribute('aria-expanded', 'false');
  }

  function showPanel(key) {
    if (!dropdownContainer) return;
    if (activeKey === key) return;
    if (activeKey) setChevron(activeKey, false);
    var panels = dropdownContainer.querySelectorAll('.mega-panel');
    for (var i = 0; i < panels.length; i++) {
      panels[i].classList.toggle(
        'active',
        panels[i].dataset.panel === key
      );
    }
    setChevron(key, true);
    activeKey = key;
    dropdownContainer.classList.add('visible');
  }

  function hideDropdown() {
    if (!dropdownContainer) return;
    dropdownContainer.classList.remove('visible');
    var panels = dropdownContainer.querySelectorAll('.mega-panel');
    for (var i = 0; i < panels.length; i++)
      panels[i].classList.remove('active');
    resetAllChevrons();
    activeKey = null;
  }

  function addChevronIcons() {
    var triggers = document.querySelectorAll('li[data-dropdown]');
    for (var i = 0; i < triggers.length; i++) {
      var link = triggers[i].querySelector('a');
      if (!link) continue;
      link.setAttribute('aria-expanded', 'false');

      // Skip if chevron already exists
      if (triggers[i].querySelector('.nav-link-chevron')) continue;

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

  function setupDropdownEvents() {
    dropdownContainer = document.getElementById('megaDropdown');
    if (!dropdownContainer) return;

    var triggers = document.querySelectorAll('li[data-dropdown]');

    for (var i = 0; i < triggers.length; i++) {
      var li = triggers[i];

      li.addEventListener('mouseenter', function () {
        if (isMobileView()) return;
        clearTimeout(closeTimer);
        showPanel(this.getAttribute('data-dropdown'));
      });

      li.addEventListener('mouseleave', function () {
        if (isMobileView()) return;
        clearTimeout(closeTimer);
        closeTimer = setTimeout(hideDropdown, 150);
      });

      // Prevent default click on desktop
      (function (key) {
        var link = document.querySelector(
          'li[data-dropdown="' + key + '"] > a'
        );
        if (link) {
          link.addEventListener('click', function (e) {
            if (isMobileView()) return;
            e.preventDefault();
          });
        }
      })(li.getAttribute('data-dropdown'));
    }

    dropdownContainer.addEventListener('mouseenter', function () {
      clearTimeout(closeTimer);
    });

    dropdownContainer.addEventListener('mouseleave', function () {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(hideDropdown, 150);
    });

    document.removeEventListener('keydown', handleDropdownKey);
    document.addEventListener('keydown', handleDropdownKey);

    window.removeEventListener('scroll', handleDropdownScroll, true);
    window.addEventListener('scroll', handleDropdownScroll, { passive: true });
  }

  function handleDropdownKey(e) {
    if (e.key === 'Escape') hideDropdown();
  }

  var scrollIdleTimer = null;
  function handleDropdownScroll() {
    clearTimeout(scrollIdleTimer);
    scrollIdleTimer = setTimeout(function () {
      if (
        dropdownContainer &&
        dropdownContainer.classList.contains('visible')
      ) {
        clearTimeout(closeTimer);
        hideDropdown();
      }
    }, 50);
  }

  /* -------------------------------------------------------------------------
     Mobile drawer toggle (event delegation)
     ------------------------------------------------------------------------- */

  function setupMobileDrawerToggles() {
    var drawer = document.getElementById('mobileDrawer');
    if (!drawer) return;

    drawer.removeEventListener('click', mobileDrawerClickHandler);
    drawer.addEventListener('click', mobileDrawerClickHandler);
  }

  function mobileDrawerClickHandler(e) {
    var target = e.target;
    if (!target || !target.closest) return;

    var toggle = target.closest('.mobile-drawer-toggle');
    if (toggle) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var isOpen = toggle.classList.contains('open');
      var parent = toggle.closest('.mobile-drawer-dropdown');
      if (!parent) return;
      var sub = parent.querySelector('.mobile-drawer-sub');
      if (!sub) return;
      if (isOpen) {
        sub.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        sub.classList.add('open');
        toggle.classList.add('open');
        toggle.setAttribute('aria-expanded', 'true');
      }
    }
  }

  /* -------------------------------------------------------------------------
     Re-attach all interaction handlers
     ------------------------------------------------------------------------- */

  function reattachHandlers() {
    addChevronIcons();
    setupDropdownEvents();
    setupMobileDrawerToggles();

    // Also notify script.js if it exists (for its own internal state)
    if (typeof window.AMARE_REATTACH_DROPDOWN === 'function') {
      window.AMARE_REATTACH_DROPDOWN();
    }
  }

  /* -------------------------------------------------------------------------
     Fetch & render
     ------------------------------------------------------------------------- */

  var lastRendered = '';

  function fetchAndRender() {
    db.select('navigation_items', '*', null, { column: 'sort_order', ascending: true })
      .then(function (res) {
        var items = (res && res.data) || (Array.isArray(res) ? res : []);

        var fingerprint = JSON.stringify(items.map(function (i) {
          return [i.id, i.title_ar, i.url, i.parent_id, i.sort_order, i.is_visible].join('|');
        }));

        if (fingerprint === lastRendered) return;
        lastRendered = fingerprint;

        var tree = buildTree(items);

        renderDesktopNav(tree);
        renderMegaDropdown(tree);
        renderMobileDrawer(tree);

        reattachHandlers();
      })
      .catch(function (err) {
        console.error('[NavbarRenderer] Failed to fetch navigation:', err);
      });
  }

  /* -------------------------------------------------------------------------
     Realtime subscription
     ------------------------------------------------------------------------- */

  function subscribe() {
    if (channel) channel.unsubscribe();

    var client = window.supabaseClient;
    if (!client) {
      fetchAndRender();
      return;
    }

    channel = client
      .channel('public-nav-items')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'navigation_items' },
        function () {
          fetchAndRender();
        }
      )
      .subscribe(function (status) {
        if (status === 'SUBSCRIBED') {
          console.log('[NavbarRenderer] Realtime subscription active.');
        }
      });
  }

  /* -------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------- */

  function boot() {
    fetchAndRender().then(subscribe);

    // Re-render labels when the language changes (data is unchanged, so the
    // fingerprint cache must be reset to force a repaint).
    window.addEventListener('amare:langchange', function () {
      lastRendered = '';
      fetchAndRender();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
