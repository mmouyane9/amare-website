/* ==========================================================================
   Supabase — Authentication service
   --------------------------------------------------------------------------
   Full auth service built on the shared Supabase client (Supabase.client).

   Methods:
     signUp(email, password, fullName?)   email + password sign up
     signIn(email, password)              email + password sign in
     signInWithGoogle()                   Google OAuth sign in
     signOut()                            sign the current user out
     getCurrentUser()                     current auth user (Promise)
     getCurrentProfile(force?)            profile from the profiles table
     isAuthenticated()                    is a session active (sync)
     isAdmin()                            role === 'super_admin' | 'admin' from profiles (Promise)
     getSession()                         current session (sync)
     init()                               session restore + cross-page sync
     onAuthStateChange(cb)                subscribe to auth events

   Security:
     - Auth is handled entirely by Supabase Auth.
     - The role is ALWAYS read from the profiles table via getCurrentProfile()
       / isAdmin(). Client-side values are never trusted.
     - Profiles are auto-created server-side by the handle_new_user()
       trigger; ensureProfile() below is a client-side safety net only.
   ========================================================================== */
(function (window) {
  'use strict';

  var Supabase = (window.Supabase = window.Supabase || {});

  var _session = null;
  var _profile = null;
  var _profilePromise = null;
  var _subscribed = false;

  function resolveClient() {
    var client = Supabase.getClient ? Supabase.getClient() : Supabase.client;
    if (!client) {
      throw new Error('Supabase client is not initialised');
    }
    return client;
  }

  function currentUser() {
    return _session && _session.user ? _session.user : null;
  }

  function notify(profile) {
    var detail = {
      session: _session,
      user: currentUser(),
      profile: profile || _profile || null,
    };
    if (typeof window.CustomEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('amare:authchange', { detail: detail })
      );
    }
  }

  function refreshProfile() {
    if (!currentUser()) return;
    getCurrentProfile()
      .then(function (profile) {
        if (profile) notify(profile);
      })
      .catch(function () {
        // Profile may not exist yet; the trigger/ensureProfile will create it.
        // Ignore here so a missing profile never breaks the UI.
      });
  }

  /* -------- session restore + cross-page sync --------------------------- */

  function init() {
    var client = resolveClient();

    if (!_subscribed) {
      _subscribed = true;
      client.auth.onAuthStateChange(function (event, session) {
        _session = session || null;
        _profile = null;
        _profilePromise = null;
        notify();

        if (_session && _session.user) {
          refreshProfile();
        }
      });
    }

    return Supabase.auth;
  }

  function onAuthStateChange(callback) {
    return resolveClient().auth.onAuthStateChange(callback);
  }

  /* -------- authentication methods ------------------------------------- */

  function signUp(email, password, fullName) {
    var options = { email: email, password: password };
    if (fullName) {
      options.options = { data: { full_name: fullName } };
    }
    return resolveClient()
      .auth.signUp(options)
      .then(function (res) {
        if (res.error) throw res.error;
        return res.data;
      });
  }

  function signIn(email, password) {
    return resolveClient()
      .auth.signInWithPassword({ email: email, password: password })
      .then(function (res) {
        if (res.error) throw res.error;
        return res.data;
      });
  }

  function signInWithGoogle() {
    var redirectTo = window.location.origin + window.location.pathname;
    return resolveClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectTo },
    });
  }

  function signOut() {
    _session = null;
    _profile = null;
    _profilePromise = null;
    return resolveClient()
      .auth.signOut()
      .then(function (res) {
        if (res && res.error) throw res.error;
        notify();
        return res;
      });
  }

  function getSession() {
    return _session;
  }

  function getCurrentUser() {
    if (_session && _session.user) {
      return Promise.resolve(_session.user);
    }
    return resolveClient()
      .auth.getUser()
      .then(function (res) {
        if (res.error) return null;
        var user = res.data && res.data.user ? res.data.user : null;
        if (user) _session = { user: user };
        return user;
      })
      .catch(function () {
        return null;
      });
  }

  function isAuthenticated() {
    return !!currentUser();
  }

  /* -------- profile (role source of truth) ------------------------------ */

  function getCurrentProfile(force) {
    if (force) {
      _profile = null;
      _profilePromise = null;
    }
    if (_profile) return Promise.resolve(_profile);
    if (_profilePromise) return _profilePromise;

    _profilePromise = ensureProfile()
      .then(function (profile) {
        _profile = profile;
        _profilePromise = null;
        return profile;
      })
      .catch(function (err) {
        _profilePromise = null;
        throw err;
      });
    return _profilePromise;
  }

  function ensureProfile() {
    var user = currentUser();
    if (!user) return Promise.resolve(null);

    return resolveClient()
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(function (res) {
        if (res.error) throw res.error;
        if (res.data) return res.data;
        return createProfile(user);
      });
  }

  function createProfile(user) {
    var metadata = user.user_metadata || {};
    var row = {
      id: user.id,
      email: user.email || '',
      full_name:
        metadata.full_name || metadata.name || metadata.fullName || '',
      avatar_url:
        metadata.avatar_url || metadata.picture || metadata.avatarUrl || '',
      role: 'member',
    };
    return resolveClient()
      .from('profiles')
      .upsert(row, { onConflict: 'id', ignoreDuplicates: true })
      .then(function (res) {
        if (res.error) throw res.error;
        return row;
      });
  }

  function isAdmin() {
    return getCurrentProfile().then(function (profile) {
      return !!(
        profile &&
        (profile.role === 'super_admin' || profile.role === 'admin')
      );
    });
  }

  /* -------- public API -------------------------------------------------- */

  Supabase.auth = {
    init: init,
    signUp: signUp,
    signIn: signIn,
    signInWithGoogle: signInWithGoogle,
    signOut: signOut,
    getCurrentUser: getCurrentUser,
    getCurrentProfile: getCurrentProfile,
    ensureProfile: ensureProfile,
    isAuthenticated: isAuthenticated,
    isAdmin: isAdmin,
    getSession: getSession,
    onAuthStateChange: onAuthStateChange,
  };
})(window);
