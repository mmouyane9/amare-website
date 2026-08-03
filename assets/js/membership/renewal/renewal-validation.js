/* ==========================================================================
   renewal-validation.js — Client-side validation for the renewal form
   Exposes: MembershipRenewal.Validation
   Mirrors the validation.js architecture used by join-us-online.html.
   ========================================================================== */

;(function (root) {
  'use strict';

  var app = root.MembershipRenewal = root.MembershipRenewal || {};

  var MESSAGES = {
    required: 'هذا الحقل مطلوب'
  };

  var FIELD_IDS = ['first_name', 'last_name', 'membership_number'];

  function el(id) {
    return root.document.getElementById(id);
  }

  function setError(id, message) {
    var input = el(id);
    var errEl = el(id + '_error');
    if (input) input.classList.add('is-invalid');
    if (errEl) errEl.textContent = message;
  }

  function clearError(id) {
    var input = el(id);
    var errEl = el(id + '_error');
    if (input) input.classList.remove('is-invalid');
    if (errEl) errEl.textContent = '';
  }

  function validateField(id) {
    var input = el(id);
    var value = input ? input.value.trim() : '';
    if (!value) {
      setError(id, MESSAGES.required);
      return false;
    }
    return true;
  }

  function validateAll() {
    var valid = true;
    FIELD_IDS.forEach(function (id) {
      if (!validateField(id)) valid = false;
    });
    return valid;
  }

  function clearAll() {
    FIELD_IDS.forEach(clearError);
  }

  app.Validation = {
    messages: MESSAGES,
    fieldIds: FIELD_IDS,
    validateAll: validateAll,
    clearAll: clearAll,
    setError: setError,
    clearError: clearError
  };
})(typeof window !== 'undefined' ? window : this);
