/* ==========================================================================
   validation.js — Client-side validation for the membership form
   Exposes: MembershipForm.Validation
   ========================================================================== */

;(function (root) {
  'use strict';

  var app = root.MembershipForm = root.MembershipForm || {};

  var MESSAGES = {
    required: 'هذا الحقل مطلوب',
    cin: 'يرجى إدخال رقم بطاقة وطنية صحيح',
    phone: 'يرجى إدخال رقم هاتف مغربي صحيح',
    email: 'يرجى إدخال بريد إلكتروني صحيح',
    dateFuture: 'تاريخ الازدياد غير صالح',
    declare: 'يرجى الإقرار بصحة المعلومات المدخلة',
    imageRequired: 'يرجى إرفاق هذا الملف',
    imageType: 'يُقبل فقط ملفات الصور PNG أو JPG',
    imageSize: 'حجم الملف يتجاوز 5MB',
  };

  var TEXT_RULES = [
    { id: 'msFirstName',  type: 'text' },
    { id: 'msLastName',   type: 'text' },
    { id: 'msBirthDate',  type: 'date' },
    { id: 'msBirthPlace', type: 'text' },
    { id: 'msCin',        type: 'cin' },
    { id: 'msPhone',      type: 'phone' },
    { id: 'msEmail',      type: 'email' },
    { id: 'msAddress',    type: 'text' },
  ];

  var IMAGE_IDS = ['msPhoto', 'msCinFront', 'msCinBack'];

  function el(id) {
    return root.document.getElementById(id);
  }

  function setError(id, message) {
    var input = el(id);
    var errEl = el(id + 'Error');
    if (input && input.classList) input.classList.add('is-invalid');
    if (errEl) errEl.textContent = message;
  }

  function clearError(id) {
    var input = el(id);
    var errEl = el(id + 'Error');
    if (input && input.classList) input.classList.remove('is-invalid');
    if (errEl) errEl.textContent = '';
  }

  function clearStep(step) {
    var ids = step === 1 ? TEXT_RULES.map(function (r) { return r.id; }).concat(['msDeclaration']) : IMAGE_IDS;
    ids.forEach(clearError);
  }

  function validateTextField(rule) {
    var input = el(rule.id);
    var value = input ? input.value.trim() : '';

    if (!value) {
      setError(rule.id, MESSAGES.required);
      return false;
    }

    switch (rule.type) {
      case 'cin':
        if (!/^[A-Za-z0-9]{5,10}$/.test(value)) {
          setError(rule.id, MESSAGES.cin);
          return false;
        }
        break;
      case 'phone':
        var digits = value.replace(/[\s\-()]/g, '');
        if (!/^(\+?212|0)?[5-7]\d{8}$/.test(digits)) {
          setError(rule.id, MESSAGES.phone);
          return false;
        }
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          setError(rule.id, MESSAGES.email);
          return false;
        }
        break;
      case 'date':
        var date = new Date(value + 'T00:00:00');
        if (isNaN(date.getTime()) || date > new Date()) {
          setError(rule.id, MESSAGES.dateFuture);
          return false;
        }
        break;
    }

    return true;
  }

  app.Validation = {
    messages: MESSAGES,

    validateStep: function (step) {
      clearStep(step);
      var valid = true;

      if (step === 1) {
        TEXT_RULES.forEach(function (rule) {
          if (!validateTextField(rule)) valid = false;
        });
        var declaration = el('msDeclaration');
        if (declaration && !declaration.checked) {
          setError('msDeclaration', MESSAGES.declare);
          valid = false;
        }
      } else if (step === 2) {
        var files = app.getState().files;
        IMAGE_IDS.forEach(function (id) {
          if (!files[id]) {
            setError(id, MESSAGES.imageRequired);
            valid = false;
          }
        });
      }

      return valid;
    },

    clearStep: clearStep,
    setError: setError,
    clearError: clearError,
  };
})(typeof window !== 'undefined' ? window : this);
