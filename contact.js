/* ==========================================================================
   Contact Page — FAQ accordion + contact form handling
   ========================================================================== */

(function () {
  'use strict';

  /* ---------- 1. FAQ Accordion ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));

  function closeAllFaq() {
    faqItems.forEach(function (item) {
      item.classList.remove('open');
      var btn = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (answer) answer.style.maxHeight = '0px';
    });
  }

  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      closeAllFaq();
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ---------- 2. Contact Form ---------- */
  var form = document.getElementById('contactForm');
  if (!form) return;

  var fields = {
    name: {
      input: document.getElementById('contactName'),
      error: document.getElementById('contactNameError'),
      msg: 'يرجى إدخال الاسم الكامل.',
      validate: function (v) { return v.trim().length >= 3; }
    },
    email: {
      input: document.getElementById('contactEmail'),
      error: document.getElementById('contactEmailError'),
      msg: 'يرجى إدخال بريد إلكتروني صحيح.',
      validate: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
    },
    phone: {
      input: document.getElementById('contactPhone'),
      error: document.getElementById('contactPhoneError'),
      msg: 'يرجى إدخال رقم هاتف صحيح.',
      validate: function (v) { return /^\+?[0-9\s\-()]{8,20}$/.test(v.trim()); }
    },
    subject: {
      input: document.getElementById('contactSubject'),
      error: document.getElementById('contactSubjectError'),
      msg: 'يرجى اختيار موضوع الرسالة.',
      validate: function (v) { return v.trim().length > 0; }
    },
    message: {
      input: document.getElementById('contactMessage'),
      error: document.getElementById('contactMessageError'),
      msg: 'يرجى كتابة رسالتك (10 أحرف على الأقل).',
      validate: function (v) { return v.trim().length >= 10; }
    }
  };

  var msgEl = document.getElementById('contactFormMsg');

  function clearFieldError(field) {
    field.input.classList.remove('invalid');
    if (field.error) field.error.textContent = '';
  }

  Object.keys(fields).forEach(function (key) {
    var field = fields[key];
    field.input.addEventListener('input', function () { clearFieldError(field); });
    field.input.addEventListener('change', function () { clearFieldError(field); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var firstInvalid = null;

    Object.keys(fields).forEach(function (key) {
      var field = fields[key];
      var value = field.input.value.trim();
      var ok = field.validate(value);

      field.input.classList.toggle('invalid', !ok);
      if (field.error) field.error.textContent = ok ? '' : field.msg;
      if (!ok && !firstInvalid) firstInvalid = field.input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      if (msgEl) {
        msgEl.className = 'contact-form-msg error';
        msgEl.textContent = 'يرجى تصحيح الحقول المحددة قبل الإرسال.';
      }
      return;
    }

    if (msgEl) {
      msgEl.className = 'contact-form-msg success';
      msgEl.textContent = 'شكرًا لتواصلكم معنا! تم استلام رسالتكم بنجاح وسنعاود الاتصال بكم في أقرب وقت.';
    }
    form.reset();
  });
})();
