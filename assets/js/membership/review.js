/* ==========================================================================
   review.js — Renders the "مراجعة المعلومات" summary from shared state
   Exposes: MembershipForm.Review
   ========================================================================== */

;(function (root) {
  'use strict';

  var app = root.MembershipForm = root.MembershipForm || {};
  var doc = root.document;

  var FIELDS = [
    { id: 'msFirstName',  label: 'الاسم الشخصي' },
    { id: 'msLastName',   label: 'الاسم العائلي' },
    { id: 'msBirthDate',  label: 'تاريخ الازدياد', format: 'date' },
    { id: 'msBirthPlace', label: 'مكان الازدياد' },
    { id: 'msCin',        label: 'رقم البطاقة الوطنية' },
    { id: 'msPhone',      label: 'رقم الهاتف' },
    { id: 'msEmail',      label: 'البريد الإلكتروني' },
    { id: 'msAddress',    label: 'العنوان' },
  ];

  var IMAGE_THUMBS = [
    { id: 'msPhoto',    holder: 'msPhotoHolder' },
    { id: 'msCinFront', holder: 'msCinFrontHolder' },
    { id: 'msCinBack',  holder: 'msCinBackHolder' },
  ];

  function el(id) {
    return doc.getElementById(id);
  }

  function escapeHtml(str) {
    var div = doc.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatDate(value) {
    if (!value) return '—';
    var parts = value.split('-');
    if (parts.length !== 3) return value;
    try {
      return new Date(value + 'T00:00:00').toLocaleDateString('ar-MA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return value;
    }
  }

  function fieldValue(field) {
    var input = el(field.id);
    var value = input ? input.value.trim() : '';
    if (!value) return '—';
    return field.format === 'date' ? formatDate(value) : value;
  }

  function renderFields() {
    var wrap = el('msReviewFields');
    if (!wrap) return;

    wrap.innerHTML = FIELDS.map(function (field) {
      return (
        '<div class="ms-review-row">' +
        '<span class="ms-review-row-label">' + escapeHtml(field.label) + '</span>' +
        '<span class="ms-review-row-value">' + escapeHtml(fieldValue(field)) + '</span>' +
        '</div>'
      );
    }).join('');
  }

  function renderImages() {
    var files = app.getState().files;

    IMAGE_THUMBS.forEach(function (item) {
      var img = el(item.id + 'Thumb');
      var holder = el(item.holder);
      var file = files[item.id];

      if (holder) holder.classList.toggle('has-file', !!file);
      if (img) {
        img.src = file ? file.dataUrl : '';
        img.alt = file ? file.name : '';
      }
    });
  }

  app.Review = {
    init: function () {
      var edit1 = el('msEditStep1');
      if (edit1) edit1.addEventListener('click', function () { app.goTo(1); });
      var edit2 = el('msEditStep2');
      if (edit2) edit2.addEventListener('click', function () { app.goTo(2); });
      return app;
    },

    render: function () {
      renderFields();
      renderImages();
      return app;
    },
  };
})(typeof window !== 'undefined' ? window : this);
