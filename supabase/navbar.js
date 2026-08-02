/* ==========================================================================
   Supabase — Navbar auth UI (shared, every page)
   --------------------------------------------------------------------------
   Synchronises the header with the auth session on every page:

     Logged out  ->  the default "تسجيل الدخول" button is kept as-is
                     (links to login.html).
     Logged in   ->  every login button becomes a compact user menu:
                     avatar + full name, a premium "الإدارة" badge when the
                     profile role is 'admin', and a "تسجيل الخروج" action.

   It listens to the `amare:authchange` event dispatched by Supabase.auth
   and updates the navbar immediately after login/logout — no page refresh.

   Role is read ONLY from the profiles table (never from the client).
   ========================================================================== */
(function (window) {
  'use strict';

  var Supabase = window.Supabase || {};
  var AUTH = Supabase.auth;
  if (!AUTH) {
    console.error('[Supabase][Navbar] auth service not loaded. Load supabase/auth.js before supabase/navbar.js.');
    return;
  }

  var LOGIN_LABEL = 'تسجيل الدخول';
  var LOGOUT_LABEL = 'تسجيل الخروج';
  var ADMIN_BADGE = 'الإدارة';
  var MENU_ID = 'amare-user-menu';
  var TRIGGER_SELECTOR = '.topbar-login, .mobile-drawer-action-login';

  var ICON_LOGOUT =
    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M15 3h6v18h-6M10 17l5-5-5-5M15 12H3"/></svg>';
  var ICON_CHEVRON =
    '<svg class="amare-auth-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  // Admin-only links rendered inside the user dropdown, above "تسجيل الخروج".
  var ADMIN_LINKS = [
    { icon: '🗄️', label: 'قاعدة البيانات', href: '/admin/database.html' },
    { icon: '📝', label: 'إدارة المحتوى', href: '/admin/content.html' },
    { icon: '⚙️', label: 'لوحة التحكم', href: '/admin/dashboard.html' },
  ];

  var state = { user: null, profile: null };
  var menu = null;
  var openTrigger = null;
  var originals = typeof WeakMap === 'function' ? new WeakMap() : null;

  /* -------- helpers ------------------------------------------------------ */

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, '&#96;');
  }

  // Resolve the path to login.html relative to the current page (works from
  // root and from sub-folders such as "Who are we/" and "Join us/").
  function loginPageUrl() {
    var parts = (window.location.pathname || '/').split('/');
    parts.pop();
    var depth = 0;
    for (var i = 0; i < parts.length; i++) {
      if (parts[i]) depth++;
    }
    var prefix = '';
    while (depth > 0) {
      prefix += '../';
      depth--;
    }
    return prefix + 'login.html';
  }

  function resolveName(user, profile) {
    var meta = (user && user.user_metadata) || {};
    var name = (profile && profile.full_name) || meta.full_name || meta.name || '';
    if (name) return name;
    return (user && user.email ? user.email.split('@')[0] : '') || 'مستخدم';
  }

  function resolveAvatar(user, profile) {
    var meta = (user && user.user_metadata) || {};
    return (
      (profile && profile.avatar_url) ||
      meta.avatar_url ||
      meta.picture ||
      meta.avatarUrl ||
      ''
    );
  }

  // Compact label for the mobile drawer button: first name only.
  function resolveFirstName(user, profile) {
    var name = resolveName(user, profile);
    var parts = String(name || '').trim().split(/\s+/);
    return (parts[0] || '') || 'مستخدم';
  }

  function avatarHtml(url, name) {
    if (url) {
      return (
        '<img class="amare-auth-avatar" src="' +
        escapeAttr(url) +
        '" alt="" loading="lazy" decoding="async">'
      );
    }
    var initial = ((name || '؟').trim().charAt(0) || '؟').toUpperCase();
    return (
      '<div class="amare-auth-avatar amare-auth-avatar-fallback" aria-hidden="true">' +
      escapeHtml(initial) +
      '</div>'
    );
  }

  function buildChip(user, profile, firstNameOnly) {
    var name = firstNameOnly ? resolveFirstName(user, profile) : resolveName(user, profile);
    var isAdmin = !!(profile && profile.role === 'admin');
    var html = '<div class="amare-auth-chip">';
    html += avatarHtml(resolveAvatar(user, profile), name);
    html += '<span class="amare-auth-name">' + escapeHtml(name) + '</span>';
    if (isAdmin) {
      html += '<span class="amare-auth-badge">' + ADMIN_BADGE + '</span>';
    }
    html += ICON_CHEVRON;
    html += '</div>';
    return html;
  }

  /* -------- rendering ---------------------------------------------------- */

  function capture(el) {
    if (!originals || originals.has(el)) return;
    originals.set(el, {
      href: el.getAttribute('href'),
      html: el.innerHTML,
    });
  }

  function restore(el) {
    if (originals && originals.has(el)) {
      var original = originals.get(el);
      el.setAttribute('href', original.href || '');
      el.innerHTML = original.html;
      el.removeAttribute('aria-haspopup');
      el.removeAttribute('aria-expanded');
    }
  }

  function render() {
    var user = state.user;
    var profile = state.profile;
    var triggers = document.querySelectorAll(TRIGGER_SELECTOR);

    for (var i = 0; i < triggers.length; i++) {
      var el = triggers[i];
      capture(el);
      if (user) {
        var isTopbar = el.classList.contains('topbar-login');
        el.setAttribute('href', '#');
        el.setAttribute('aria-haspopup', 'true');
        el.setAttribute('aria-expanded', 'false');
        // Desktop keeps the full name; the mobile drawer button uses first name only.
        el.innerHTML = buildChip(user, profile, !isTopbar);
      } else {
        restore(el);
      }
    }

    if (!user) closeMenu();
  }

  /* -------- dropdown menu ------------------------------------------------ */

  function ensureMenu() {
    if (menu) return;
    menu = document.createElement('div');
    menu.id = MENU_ID;
    menu.className = 'amare-user-menu';
    menu.setAttribute('role', 'menu');
    menu.style.display = 'none';
    document.body.appendChild(menu);
  }

  function populateMenu() {
    var user = state.user;
    if (!user) return;

    var name = resolveName(user, state.profile);
    var email = user.email || '';
    var isAdmin = !!(state.profile && state.profile.role === 'admin');

    var head = document.createElement('div');
    head.className = 'amare-user-menu-head';
    head.innerHTML = avatarHtml(resolveAvatar(user, state.profile), name);
    var info = document.createElement('div');
    info.className = 'amare-user-menu-info';
    info.innerHTML =
      '<div class="amare-user-menu-name">' +
      escapeHtml(name) +
      '</div>' +
      '<div class="amare-user-menu-email">' +
      escapeHtml(email) +
      '</div>';
    head.appendChild(info);
    if (isAdmin) {
      var badge = document.createElement('span');
      badge.className = 'amare-auth-badge';
      badge.textContent = ADMIN_BADGE;
      head.appendChild(badge);
    }

    var signout = document.createElement('button');
    signout.type = 'button';
    signout.className = 'amare-user-menu-signout';
    signout.setAttribute('data-amare-signout', '');
    signout.setAttribute('role', 'menuitem');
    signout.innerHTML = ICON_LOGOUT + '<span>' + LOGOUT_LABEL + '</span>';

    menu.innerHTML = '';
    menu.appendChild(head);

    if (isAdmin) {
      for (var i = 0; i < ADMIN_LINKS.length; i++) {
        var adminLink = document.createElement('a');
        adminLink.className = 'amare-user-menu-link';
        adminLink.href = ADMIN_LINKS[i].href;
        adminLink.setAttribute('role', 'menuitem');
        adminLink.innerHTML =
          '<span class="amare-user-menu-link-icon" aria-hidden="true">' +
          ADMIN_LINKS[i].icon +
          '</span><span>' + ADMIN_LINKS[i].label + '</span>';
        menu.appendChild(adminLink);
      }
      var divider = document.createElement('div');
      divider.className = 'amare-user-menu-divider';
      menu.appendChild(divider);
    }

    menu.appendChild(signout);
  }

  function openMenu(trigger) {
    ensureMenu();
    populateMenu();
    menu.style.display = 'block';
    menu.classList.add('is-open');

    var rect = trigger.getBoundingClientRect();
    var menuWidth = menu.offsetWidth || 240;
    var menuHeight = menu.offsetHeight || 180;

    var top = rect.bottom + 8;
    if (top + menuHeight > window.innerHeight - 8) {
      top = Math.max(8, rect.top - menuHeight - 8);
    }
    var left = rect.right - menuWidth;
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

    menu.style.top = top + 'px';
    menu.style.left = left + 'px';
    trigger.setAttribute('aria-expanded', 'true');
    openTrigger = trigger;
  }

  function closeMenu() {
    if (menu) {
      menu.classList.remove('is-open');
      menu.style.display = 'none';
    }
    if (openTrigger) openTrigger.setAttribute('aria-expanded', 'false');
    openTrigger = null;
  }

  function toggleMenu(trigger) {
    if (openTrigger === trigger && menu && menu.classList.contains('is-open')) {
      closeMenu();
      return;
    }
    openMenu(trigger);
  }

  /* -------- events ------------------------------------------------------- */

  function onDocumentClick(e) {
    var target = e.target;

    var trigger =
      target && target.closest ? target.closest(TRIGGER_SELECTOR) : null;
    if (trigger && trigger.getAttribute('href') === '#') {
      e.preventDefault();
      toggleMenu(trigger);
      return;
    }

    var signout = target && target.closest ? target.closest('[data-amare-signout]') : null;
    if (signout) {
      e.preventDefault();
      closeMenu();
      AUTH.signOut()
        .then(function () {
          // Explicit sign-out only — the login page is the only place a
          // signed-out user should land.
          window.location.assign(loginPageUrl());
        })
        .catch(function (err) {
          console.error('[Supabase][Navbar] Sign out failed:', err);
        });
      return;
    }

    if (menu && menu.classList.contains('is-open')) {
      var inMenu = target && target.closest ? target.closest('#' + MENU_ID) : null;
      if (!inMenu) closeMenu();
    }
  }

  function onKeydown(e) {
    if (e.key === 'Escape' || e.key === 'Esc') closeMenu();
  }

  function init() {
    ensureMenu();
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onKeydown);
    window.addEventListener('resize', closeMenu);
    window.addEventListener('scroll', closeMenu, true);

    window.addEventListener('amare:authchange', function (e) {
      state = (e && e.detail) || {};
      render();
    });

    if (AUTH.init) AUTH.init();

    // Initial paint before the restored session is resolved by Supabase.
    var session = AUTH.getSession ? AUTH.getSession() : null;
    state = { user: session && session.user ? session.user : null, profile: null };
    render();
  }

  /* -------- styles (scoped, uses the site palette) ----------------------- */

  function injectStyles() {
    if (document.getElementById('amare-auth-styles')) return;
    var style = document.createElement('style');
    style.id = 'amare-auth-styles';
    style.textContent =
      '.amare-auth-chip{display:inline-flex;align-items:center;gap:6px;max-width:100%;min-width:0;}' +
      '.amare-auth-avatar{width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;' +
      'display:flex;align-items:center;justify-content:center;background:#123B78;color:#fff;' +
      'font-weight:800;font-size:12px;line-height:1;}' +
      '.amare-auth-name{font-weight:700;font-size:12.5px;color:#222;white-space:nowrap;' +
      'overflow:hidden;text-overflow:ellipsis;max-width:130px;}' +
      '.amare-auth-badge{display:inline-block;background:linear-gradient(135deg,#F6B300 0%,#FFCE54 100%);' +
      'color:#123B78;font-size:10px;font-weight:800;line-height:1;padding:4px 8px;border-radius:999px;' +
      'white-space:nowrap;box-shadow:0 3px 10px rgba(246,179,0,.4);}' +
      '.amare-auth-chevron{flex-shrink:0;opacity:.65;}' +
      '.amare-user-menu{position:fixed;z-index:99999;width:240px;background:#fff;color:#222;' +
      'border:1px solid rgba(18,59,120,.12);border-radius:14px;padding:8px;' +
      'box-shadow:0 24px 60px rgba(18,59,120,.18);' +
      'font-family:\'Cairo\',sans-serif;text-align:right;}' +
      '.amare-user-menu.is-open{animation:amareMenuIn .18s var(--ease, ease-out);}' +
      '.amare-user-menu-head{display:flex;align-items:center;gap:10px;padding:6px 6px 10px;' +
      'border-bottom:1px solid rgba(18,59,120,.1);margin-bottom:6px;}' +
      '.amare-user-menu-head .amare-auth-avatar{width:40px;height:40px;font-size:15px;}' +
      '.amare-user-menu-info{flex:1;min-width:0;}' +
      '.amare-user-menu-name{font-weight:800;font-size:13px;color:#222;white-space:nowrap;' +
      'overflow:hidden;text-overflow:ellipsis;}' +
      '.amare-user-menu-email{font-size:11px;color:#5B6B7C;white-space:nowrap;overflow:hidden;' +
      'text-overflow:ellipsis;}' +
      '.amare-user-menu-link{display:flex;align-items:center;gap:9px;width:100%;padding:10px;' +
      'color:#123B78;font-family:\'Cairo\',sans-serif;font-size:13px;font-weight:700;' +
      'border-radius:10px;cursor:pointer;text-decoration:none;transition:background .2s ease,color .2s ease;}' +
      '.amare-user-menu-link:hover{background:rgba(25,184,242,.1);color:#0F9CD1;}' +
      '.amare-user-menu-link-icon{width:16px;text-align:center;flex-shrink:0;font-size:14px;line-height:1;}' +
      '.amare-user-menu-divider{height:1px;background:rgba(18,59,120,.1);margin:6px 0;}' +
      '.amare-user-menu-signout{display:flex;align-items:center;gap:9px;width:100%;padding:10px;' +
      'border:none;background:transparent;color:#E74C3C;font-family:\'Cairo\',sans-serif;' +
      'font-size:13px;font-weight:700;border-radius:10px;cursor:pointer;transition:background .2s ease;}' +
      '.amare-user-menu-signout:hover{background:rgba(231,76,60,.08);}' +
      '@keyframes amareMenuIn{from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);}}';
    document.head.appendChild(style);
  }

  /* -------- boot --------------------------------------------------------- */

  function boot() {
    injectStyles();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  Supabase.navbar = {
    refresh: function () {
      render();
    },
  };

  boot();
})(window);
