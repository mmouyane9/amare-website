/* ==========================================================================
   renewal-form.js — Orchestrator for the membership renewal form
   Wires validation + Supabase persistence + UI states (loading / success /
   error). Fully independent from the online membership (join-us-online) flow.
   Exposes: MembershipRenewal.Form
   ========================================================================== */

;(function (root) {
  'use strict';

  var app = root.MembershipRenewal = root.MembershipRenewal || {};
  var doc = root.document;

  var FORM_ID = 'renewalForm';
  var SUBMIT_ID = 'renewalSubmit';
  var SUCCESS_ID = 'renewalSuccess';
  var ALERT_ID = 'renewalAlert';

  var ERROR_MESSAGE = 'تعذر إرسال الطلب، يرجى المحاولة مرة أخرى.';

  function el(id) {
    return doc.getElementById(id);
  }

  function initAos() {
    if (typeof root.AOS !== 'undefined' && !root.AOS.initiated) {
      root.AOS.init({
        once: true,
        offset: 60,
        duration: 700,
        easing: 'cubic-bezier(0.22, 0.8, 0.32, 1)'
      });
      root.AOS.initiated = true;
    }
  }

  function collectData() {
    return {
      first_name: el('first_name').value.trim(),
      last_name: el('last_name').value.trim(),
      membership_number: el('membership_number').value.trim()
    };
  }

  function setLoading(loading) {
    var btn = el(SUBMIT_ID);
    if (!btn) return;
    btn.disabled = loading;
    btn.setAttribute('aria-busy', loading ? 'true' : 'false');
    var label = btn.querySelector('[data-renewal-btn-label]');
    var spinner = btn.querySelector('[data-renewal-btn-spinner]');
    if (label) label.hidden = loading;
    if (spinner) spinner.hidden = !loading;
  }

  function showAlert(message) {
    var alert = el(ALERT_ID);
    if (!alert) return;
    var text = alert.querySelector('[data-renewal-alert-text]');
    if (text) text.textContent = message;
    alert.hidden = false;
    alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideAlert() {
    var alert = el(ALERT_ID);
    if (alert) alert.hidden = true;
  }

  function resetForm() {
    var form = el(FORM_ID);
    if (form) form.reset();
  }

  function showSuccess() {
    var form = el(FORM_ID);
    var success = el(SUCCESS_ID);
    if (form) form.hidden = true;
    if (success) {
      success.hidden = false;
      success.classList.remove('is-active');
      void success.offsetWidth; /* restart the checkmark animation */
      success.classList.add('is-active');
    }
    var card = el('msCard');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function submit(e) {
    if (e) e.preventDefault();

    hideAlert();
    app.Validation.clearAll();

    if (!app.Validation.validateAll()) {
      var firstInvalid = doc.querySelector('.ms-input.is-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    app.Database
      .submitRenewalRequest(collectData())
      .then(function () {
        setLoading(false);
        resetForm();
        showSuccess();
      })
      .catch(function (err) {
        console.error('[MembershipRenewal] Submission failed:', err);
        setLoading(false);
        showAlert(ERROR_MESSAGE);
      });
  }

  function setupInputs() {
    doc.querySelectorAll('.ms-input').forEach(function (input) {
      var wrap = input.closest('.ms-input-wrap');

      function sync() {
        if (wrap) wrap.classList.toggle('is-filled', input.value.length > 0);
      }

      input.addEventListener('input', function () {
        sync();
        app.Validation.clearError(input.id);
      });
      input.addEventListener('change', sync);
      input.addEventListener('blur', function () {
        if (input.required && input.value.trim() === '') {
          app.Validation.setError(input.id, app.Validation.messages.required);
        }
      });
      sync();
    });
  }

  function init() {
    initAos();
    setupInputs();

    var form = el(FORM_ID);
    if (form) form.addEventListener('submit', submit);

    var card = el('msCard');
    if (card) card.classList.add('is-enter');
  }

  app.Form = { init: init };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(typeof window !== 'undefined' ? window : this);
