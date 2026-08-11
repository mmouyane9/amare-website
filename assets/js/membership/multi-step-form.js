/* ==========================================================================
   multi-step-form.js — Orchestrator for the multi-step membership form
   Initializes all membership modules and wires step navigation.
   ========================================================================== */

;(function (root) {
  'use strict';

  var app = root.MembershipForm = root.MembershipForm || {};
  var doc = root.document;

  var FIELD_IDS = [
    'msFirstName',
    'msLastName',
    'msBirthDate',
    'msBirthPlace',
    'msCin',
    'msPhone',
    'msEmail',
    'msAddress',
  ];

  var FIELD_MAP = {
    msFirstName: 'first_name',
    msLastName: 'last_name',
    msBirthDate: 'birth_date',
    msBirthPlace: 'birth_place',
    msCin: 'national_id',
    msPhone: 'phone',
    msEmail: 'email',
    msAddress: 'address',
  };

  var PANEL_COUNT = 4;

  function el(id) {
    return doc.getElementById(id);
  }

  /* ---------- AOS (optional scroll animations) ---------- */

  function initAos() {
    if (typeof root.AOS !== 'undefined' && !root.AOS.initiated) {
      root.AOS.init({
        once: true,
        offset: 60,
        duration: 700,
        easing: 'cubic-bezier(0.22, 0.8, 0.32, 1)',
      });
      root.AOS.initiated = true;
    }
  }

  /* ---------- Data collection (Supabase-ready payload) ---------- */

  function collectFields() {
    var dbState = root.membershipData;
    FIELD_IDS.forEach(function (id) {
      var input = el(id);
      if (!input) return;
      var value = input.value.trim();
      app.setField(id, value);
      if (dbState && FIELD_MAP[id]) dbState[FIELD_MAP[id]] = value;
    });
    var declaration = el('msDeclaration');
    if (declaration) {
      app.setField('declaration', declaration.checked);
      if (dbState) dbState.declaration_accepted = declaration.checked;
    }
  }

  /* ---------- Panel switching ---------- */

  function switchPanels(step) {
    if (step === PANEL_COUNT) {
      console.log('[Membership][STEP 13] switchPanels: rendering success page (goTo(4) reached via finish).');
      doc.querySelectorAll('.ms-panel').forEach(function (panel) {
        panel.hidden = true;
        panel.classList.remove('is-active');
      });
      el('msFormNav').hidden = true;
      var success = el('msSuccess');
      success.hidden = false;
      success.classList.remove('is-active');
      void success.offsetWidth; // restart animation
      success.classList.add('is-active');
      app.Success.show();
      return;
    }

    el('msSuccess').hidden = true;
    el('msFormNav').hidden = false;

    doc.querySelectorAll('.ms-panel').forEach(function (panel) {
      var isActive = parseInt(panel.getAttribute('data-panel'), 10) === step;
      if (isActive) {
        panel.hidden = false;
        panel.classList.remove('is-active');
        void panel.offsetWidth; // restart animation
        panel.classList.add('is-active');
      } else {
        panel.hidden = true;
        panel.classList.remove('is-active');
      }
    });

    if (step === 3) app.Review.render();
  }

  function updateNav(step) {
    el('msBtnPrev').hidden = step === 1;
    el('msBtnNext').hidden = step === 3;
    el('msBtnSubmit').hidden = step !== 3;
  }

  function focusPanelTitle(step) {
    if (step === PANEL_COUNT) return;
    var title = doc.querySelector('.ms-panel[data-panel="' + step + '"] .ms-panel-title');
    if (title) {
      title.setAttribute('tabindex', '-1');
      title.focus({ preventScroll: true });
    }
  }

  function scrollToCard() {
    var card = el('msCard');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function goTo(step) {
    if (step >= 2) collectFields();
    app.goTo(step);
  }

  /* ---------- Step actions ---------- */

  function tryNext() {
    var current = app.getState().step;
    if (current === 1 && app.Validation.validateStep(1)) {
      collectFields();
      app.goTo(2);
    } else if (current === 2 && app.Validation.validateStep(2)) {
      collectFields();
      app.goTo(3);
    }
  }

  function tryPrev() {
    if (app.getState().step > 1) app.goTo(app.getState().step - 1);
  }

  function resetTemporaryState() {
    var data = root.membershipData;
    if (data) {
      for (var key in data) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
        if (key === 'declaration_accepted' || key === 'email_verified') data[key] = false;
        else data[key] = '';
      }
    }
  }

  function finalize(e) {
    if (e) e.preventDefault();

    console.log('[Membership][STEP 1] User clicked Submit');

    console.log('[Membership][STEP 3] validate(): step 1');
    if (!app.Validation.validateStep(1)) {
      console.log('[Membership][STEP 3] validate(): step 1 INVALID -> going back to step 1. NO uploads, NO insert.');
      app.goTo(1);
      return;
    }
    console.log('[Membership][STEP 3] validate(): step 2');
    if (!app.Validation.validateStep(2)) {
      console.log('[Membership][STEP 3] validate(): step 2 INVALID -> going back to step 2. NO uploads, NO insert.');
      app.goTo(2);
      return;
    }
    console.log('[Membership][STEP 3] validate(): OK');

    console.log('[Membership][STEP 4] finalize(): collecting fields');
    collectFields();

    var submitBtn = el('msBtnSubmit');
    if (submitBtn) submitBtn.disabled = true;

    var finish = function (member) {
      console.log(
        '[Membership][STEP 13] SUCCESS page. registerMember() resolved with member_number =',
        member && member.member_number ? member.member_number : '?',
        ', member id =',
        member && member.id ? member.id : '?'
      );
      if (member && member.member_number) {
        app.setState({ membershipNumber: member.member_number });
      }
      resetTemporaryState();
      app.goTo(4);
    };

    var fail = function (err) {
      if (submitBtn) submitBtn.disabled = false;
      console.error('[Membership] FAILED:', err && err.message ? err.message : err);
      console.error('[Membership] Aborting. Success page NOT shown because the pipeline did not complete.');
      if (app.Upload && app.Upload.cleanupUploaded) {
        app.Upload.cleanupUploaded();
      }
      if (app.Validation) {
        app.Validation.setError('msPhoto', 'تعذر حفظ الطلب، يرجى المحاولة مرة أخرى');
      }
      app.goTo(3);
    };

    var run = function () {
      if (window.MembershipDatabase && window.MembershipDatabase.registerMember) {
        console.log('[Membership][STEP 5] Calling registerMember() ...');
        return window.MembershipDatabase.registerMember().then(finish, fail);
      }
      console.error('[Membership][STEP 5] FATAL: window.MembershipDatabase.registerMember is NOT a function.');
      console.error(
        '[Membership][STEP 5] Register module state:',
        window.MembershipDatabase
          ? 'loaded, keys = [' + Object.keys(window.MembershipDatabase).join(', ') + ']'
          : 'window.MembershipDatabase is UNDEFINED (did assets/js/membership/database.js load?)'
      );
      console.error('[Membership][STEP 5] Not calling registerMember(), NOT showing success.');
      fail(new Error('Registration module unavailable: registerMember() not found. Nothing was uploaded or inserted.'));
      return undefined;
    };

    return run();
  }

  /* ---------- Input enhancements ---------- */

  function setupInputs() {
    doc.querySelectorAll('.ms-input').forEach(function (input) {
      var wrap = input.closest('.ms-input-wrap');

      function sync() {
        if (wrap) wrap.classList.toggle('is-filled', input.value.length > 0);
      }

      input.addEventListener('input', function () {
        sync();
        if (input.classList.contains('is-invalid') && app.Validation) {
          app.Validation.clearError(input.id);
        }
      });
      input.addEventListener('change', sync);
      input.addEventListener('blur', function () {
        if (input.required && input.value.trim() === '' && app.Validation) {
          app.Validation.setError(input.id, app.Validation.messages.required);
        }
      });
      sync();
    });

    var declaration = el('msDeclaration');
    if (declaration) {
      declaration.addEventListener('change', function () {
        if (declaration.checked && app.Validation) {
          app.Validation.clearError('msDeclaration');
        }
      });
    }
  }

  /* ---------- Init ---------- */

  function init() {
    initAos();

    app.Stepper.init();
    app.Upload.init();
    app.Review.init();
    app.Success.init();
    app.EmailVerification.init();

    el('msBtnPrev').addEventListener('click', tryPrev);
    el('msBtnNext').addEventListener('click', tryNext);

    var form = el('membershipForm');
    form.addEventListener('submit', finalize);

    console.log(
      '[Membership] init(): submit listener wired. Registration module =',
      window.MembershipDatabase && window.MembershipDatabase.registerMember
        ? 'registerMember() available'
        : 'MISSING (database.js did not load or registerMember is undefined)'
    );

    setupInputs();

    app.on('step:change', function (step) {
      switchPanels(step);
      updateNav(step);
      focusPanelTitle(step);
      scrollToCard();
    });

    var card = el('msCard');
    card.classList.add('is-enter');

    app.goTo(1);

    // Re-translate after navbar/footer renderers have injected their DOM content
    if (root.I18n && typeof root.I18n.translateContent === 'function') {
      root.I18n.translateContent(doc);
    }
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);

