/* ==========================================================================
   الجمعية المغربية لهواة البحث والاستكشاف — Login Page
   Real authentication wired to the shared Supabase auth service
   (Supabase.auth: signIn / signUp / signInWithGoogle).
   ========================================================================== */

(function () {
  'use strict';

  var AUTH = (window.Supabase && window.Supabase.auth) || null;

  /* ---------- 1. Loading Screen ---------- */
  var loader = document.getElementById('loader');
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (loader) loader.classList.add('loaded');
    }, 350);
  });

  /* ---------- 2. Password visibility toggle ---------- */
  var toggle = document.getElementById('passwordToggle');
  var password = document.getElementById('loginPassword');

  if (toggle && password) {
    toggle.addEventListener('click', function () {
      var isVisible = password.type === 'text';
      password.type = isVisible ? 'password' : 'text';
      toggle.classList.toggle('is-visible', !isVisible);
      toggle.setAttribute('aria-pressed', isVisible ? 'false' : 'true');
      toggle.setAttribute('aria-label', isVisible ? 'إظهار كلمة المرور' : 'إخفاء كلمة المرور');
      password.focus();
    });
  }

  /* ---------- 3. Button ripple ---------- */
  var rippleBtns = document.querySelectorAll('.login-btn');

  rippleBtns.forEach(function (btn) {
    btn.addEventListener('pointerdown', function (e) {
      var rect = btn.getBoundingClientRect();
      var diameter = Math.max(rect.width, rect.height) * 2;
      var ink = document.createElement('span');
      ink.className = 'login-ripple-ink';
      ink.style.width = ink.style.height = diameter + 'px';
      ink.style.left = (e.clientX - rect.left - diameter / 2) + 'px';
      ink.style.top = (e.clientY - rect.top - diameter / 2) + 'px';
      btn.appendChild(ink);
      setTimeout(function () { ink.remove(); }, 700);
    });
  });

  /* ---------- 4. Elements ---------- */
  var form = document.getElementById('loginForm');
  var submit = document.getElementById('loginSubmit');
  var statusEl = document.getElementById('loginStatus');
  var email = document.getElementById('loginEmail');
  var name = document.getElementById('loginName');
  var nameField = document.getElementById('loginNameField');
  var titleEl = document.getElementById('login-title');
  var subEl = document.getElementById('login-sub');
  var submitText = document.getElementById('loginSubmitText');
  var registerText = document.getElementById('loginRegisterText');
  var modeToggle = document.getElementById('loginModeToggle');

  var mode = 'signin'; // 'signin' | 'signup'

  /* ---------- 5. Mode toggle (sign in / sign up) ---------- */
  function setMode(next) {
    mode = next;
    var signup = mode === 'signup';
    if (nameField) nameField.hidden = !signup;
    if (name) {
      name.value = '';
      name.classList.remove('is-invalid');
      var nameError = document.getElementById('loginNameError');
      if (nameError) nameError.textContent = '';
    }
    if (titleEl) titleEl.textContent = signup ? 'إنشاء حساب' : 'تسجيل الدخول';
    if (subEl) subEl.textContent = signup
      ? 'أنشئ حسابك للانضمام إلى الجمعية.'
      : 'قم بتسجيل الدخول للوصول إلى حسابك.';
    if (submitText) submitText.textContent = signup ? 'إنشاء حساب' : 'تسجيل الدخول';
    if (registerText) registerText.textContent = signup ? 'لدي حساب بالفعل؟' : 'ليس لديك حساب؟';
    if (modeToggle) modeToggle.textContent = signup ? 'تسجيل الدخول' : 'إنشاء حساب';
    showStatus('', false);
  }

  if (modeToggle) {
    modeToggle.addEventListener('click', function (e) {
      e.preventDefault();
      setMode(mode === 'signup' ? 'signin' : 'signup');
    });
  }

  /* ---------- 6. Validation ---------- */
  [email, password, name].forEach(function (input) {
    if (!input) return;
    input.addEventListener('input', function () {
      input.classList.remove('is-invalid');
      var errorEl = document.getElementById(input.id + 'Error');
      if (errorEl) errorEl.textContent = '';
    });
  });

  function validateEmail() {
    var valid = email && email.checkValidity();
    if (email) email.classList.toggle('is-invalid', !valid);
    var errorEl = document.getElementById('loginEmailError');
    if (errorEl) errorEl.textContent = valid ? '' : 'يرجى إدخال بريد إلكتروني صحيح.';
    return valid;
  }

  function validatePassword() {
    var valid = password && password.value.length >= 6;
    if (password) password.classList.toggle('is-invalid', !valid);
    var errorEl = document.getElementById('loginPasswordError');
    if (errorEl) errorEl.textContent = valid ? '' : 'كلمة المرور يجب ألا تقل عن 6 أحرف.';
    return valid;
  }

  function validateName() {
    if (mode !== 'signup') return true;
    var valid = !!(name && name.value.trim().length >= 2);
    if (name) name.classList.toggle('is-invalid', !valid);
    var errorEl = document.getElementById('loginNameError');
    if (errorEl) errorEl.textContent = valid ? '' : 'يرجى إدخال اسمك الكامل.';
    return valid;
  }

  /* ---------- 7. Loading + status helpers ---------- */
  function setLoading(on) {
    submit.classList.toggle('is-loading', on);
    submit.setAttribute('aria-busy', on ? 'true' : 'false');
    submit.disabled = on;
    var text = submit.querySelector('.login-submit-text');
    if (text) {
      text.textContent = on
        ? (mode === 'signup' ? 'جارٍ إنشاء الحساب...' : 'جارٍ تسجيل الدخول...')
        : (mode === 'signup' ? 'إنشاء حساب' : 'تسجيل الدخول');
    }
  }

  function showStatus(message, isSuccess) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.hidden = !message;
    statusEl.style.color = isSuccess
      ? 'var(--color-primary-dark)'
      : '#E74C3C';
    if (message) {
      statusEl.style.background = isSuccess
        ? 'rgba(25, 184, 242, 0.07)'
        : 'rgba(231, 76, 60, 0.07)';
      statusEl.style.borderColor = isSuccess
        ? 'rgba(25, 184, 242, 0.4)'
        : 'rgba(231, 76, 60, 0.4)';
    }
  }

  /* ---------- 8. Error translation ---------- */
  function translateError(err) {
    var msg = (err && err.message) || '';
    if (/invalid login credentials/i.test(msg)) {
      return 'بيانات الدخول غير صحيحة. تحقق من البريد الإلكتروني وكلمة المرور.';
    }
    if (/email not confirmed|confirm your email/i.test(msg)) {
      return 'يرجى تأكيد بريدك الإلكتروني أولاً (ستجد رابط التأكيد في بريدك).';
    }
    if (/user already registered|already been registered/i.test(msg)) {
      return 'هذا البريد الإلكتروني مسجّل بالفعل. سجّل الدخول بدلاً من ذلك.';
    }
    if (/password.*(short|minimum|6)/i.test(msg)) {
      return 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.';
    }
    if (/failed to fetch|network|fetch/i.test(msg)) {
      return 'تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت وحاول مرة أخرى.';
    }
    return 'حدث خطأ غير متوقع. حاول مرة أخرى.';
  }

  /* ---------- 9. Redirect after auth ---------- */
  var _redirected = false;

  function redirectToHome() {
    if (_redirected) return;
    _redirected = true;
    // Warm the profile cache so the navbar renders the user immediately.
    if (AUTH && AUTH.getCurrentProfile) {
      AUTH.getCurrentProfile().catch(function () {
        // Profile may not exist yet — the trigger will create it. Never let a
        // missing profile block the redirect.
      });
    }
    window.location.assign('index.html');
  }

  /* ---------- 10. Form submit ---------- */
  if (form && submit && AUTH) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateEmail() || !validatePassword() || !validateName()) return;

      setLoading(true);
      showStatus('', false);

      var emailVal = email.value.trim();
      var passVal = password.value;

      var promise = mode === 'signup'
        ? AUTH.signUp(emailVal, passVal, name ? name.value.trim() : '')
        : AUTH.signIn(emailVal, passVal);

      promise
        .then(function (res) {
          if (mode === 'signup' && res && !res.session) {
            // Email confirmation is enabled — no active session yet.
            setLoading(false);
            showStatus('تم إنشاء حسابك. تحقق من بريدك الإلكتروني لتأكيد الحساب، ثم سجّل الدخول.', true);
            setMode('signin');
            return;
          }
          redirectToHome();
        })
        .catch(function (err) {
          setLoading(false);
          showStatus(translateError(err), false);
        });
    });
  }

  /* ---------- 11. Google Sign-In ---------- */
  var googleBtn = document.getElementById('googleSignIn');

  if (googleBtn && AUTH) {
    googleBtn.addEventListener('click', function () {
      if (googleBtn.classList.contains('is-loading')) return;
      setGoogleLoading(true);
      statusEl.hidden = true;

      AUTH.signInWithGoogle().catch(function () {
        setGoogleLoading(false);
        showStatus('تعذر تسجيل الدخول عبر Google. تأكد من تفعيل مزوّد Google في إعدادات المشروع.', false);
      });
    });
  } else if (googleBtn) {
    googleBtn.addEventListener('click', function () {
      if (googleBtn.classList.contains('is-loading')) return;
      setGoogleLoading(true);
      setTimeout(function () {
        setGoogleLoading(false);
        showStatus('لم يكتمل الاتصال بعد. تأكد من تحميل خدمة المصادقة ثم أعد المحاولة.', false);
      }, 1200);
    });
  }

  function setGoogleLoading(on) {
    googleBtn.classList.toggle('is-loading', on);
    googleBtn.setAttribute('aria-busy', on ? 'true' : 'false');
    googleBtn.disabled = on;
  }

  /* ---------- 12. Session restore + authenticated-user redirect ---------- */
  function redirectAuthenticatedUser() {
    if (!AUTH) return;

    var session = AUTH.getSession ? AUTH.getSession() : null;
    if (session && session.user) {
      redirectToHome();
      return;
    }

    if (AUTH.onAuthStateChange) {
      AUTH.onAuthStateChange(function (event, session) {
        if (event !== 'INITIAL_SESSION' && event !== 'SIGNED_IN' && event !== 'TOKEN_REFRESHED') {
          return;
        }
        if (session && session.user) {
          redirectToHome();
        }
      });
    }
  }

  if (AUTH && AUTH.init) AUTH.init();
  redirectAuthenticatedUser();
})();
