/* ==========================================================================
   email-verification.js — Step 2: Email OTP verification
   Auto-fills the email from Step 1, sends the OTP via the send-otp.php
   endpoint with a 2-minute resend countdown, and verifies the code
   before allowing Step 3.
   Exposes: MembershipForm.EmailVerification
   ========================================================================== */

;(function (root) {
  'use strict';

  var app = root.MembershipForm = root.MembershipForm || {};
  var doc = root.document;

  var COUNTDOWN_SECONDS = 120;

  var otpCode = '';
  var otpSent = false;
  var countdownLeft = 0;
  var countdownTimer = null;

  function el(id) {
    return doc.getElementById(id);
  }

  function pad2(value) {
    return (value < 10 ? '0' : '') + value;
  }

  function formatTime(seconds) {
    return pad2(Math.floor(seconds / 60)) + ':' + pad2(seconds % 60);
  }

  /* ---------- Email auto-fill ---------- */

  function populateEmail() {
    var input = el('msOtpEmail');
    if (!input) return;

    var db = root.membershipData;
    var source = el('msEmail');
    var email = (db && db.email) || (source ? source.value.trim() : '');

    if (email && input.value !== email) {
      input.value = email;
      var wrap = input.closest('.ms-input-wrap');
      if (wrap) wrap.classList.add('is-filled');
    }
  }

  /* ---------- OTP send + countdown ---------- */

  function clearCountdown() {
    if (countdownTimer) {
      root.clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  function updateSendLabel() {
    var label = el('msOtpSendText');
    if (label) label.textContent = 'إعادة الإرسال (' + formatTime(countdownLeft) + ')';
  }

  function resetSendButton() {
    var label = el('msOtpSendText');
    if (label) label.textContent = 'إرسال رمز التحقق';
    var sendBtn = el('msOtpSend');
    if (sendBtn) sendBtn.disabled = false;
  }

  function tick() {
    countdownLeft -= 1;
    if (countdownLeft <= 0) {
      clearCountdown();
      resetSendButton();
      return;
    }
    updateSendLabel();
  }

  function showSendError(message) {
    otpSent = false;
    clearCountdown();
    resetSendButton();

    var errEl = el('msOtpError');
    if (errEl) errEl.textContent = message;
  }

  function sendOtp() {
    var emailInput = el('msOtpEmail');
    var email = emailInput ? emailInput.value.trim() : '';

    populateEmail();

    if (!email) {
      showSendError('يرجى إدخال البريد الإلكتروني أولاً');
      return;
    }

    otpCode = String(Math.floor(100000 + Math.random() * 900000));
    otpSent = false;

    var errEl = el('msOtpError');
    if (errEl) errEl.textContent = '';
    var codeInput = el('msOtpCode');
    if (codeInput) codeInput.classList.remove('is-invalid');
    var success = el('msOtpSuccess');
    if (success) success.hidden = true;
    var demo = el('msOtpDemo');
    if (demo) demo.textContent = '';

    var sendBtn = el('msOtpSend');
    if (sendBtn) sendBtn.disabled = true;
    var label = el('msOtpSendText');
    if (label) label.textContent = 'جارٍ إرسال رمز التحقق...';

    fetch('https://api.amare.ma/send-otp.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: 'MSJ_SOVEREIGN_2026',
        email: email,
        otp: otpCode,
      }),
    })
      .then(function (res) {
        return res.json().catch(function () {
          return {};
        });
      })
      .then(function (data) {
        if (data && data.status === 'success') {
          otpSent = true;

          clearCountdown();
          countdownLeft = COUNTDOWN_SECONDS;
          countdownTimer = root.setInterval(tick, 1000);

          var demoHint = el('msOtpDemo');
          if (demoHint) demoHint.textContent = 'تم إرسال رمز التحقق إلى بريدك الإلكتروني';

          var verifyBtn = el('msOtpVerify');
          if (verifyBtn) verifyBtn.disabled = false;

          updateSendLabel();
        } else {
          showSendError((data && data.message) || 'تعذر إرسال رمز التحقق، يرجى المحاولة لاحقًا');
        }
      })
      .catch(function () {
        showSendError('تعذر الاتصال بالخادم، يرجى المحاولة لاحقًا');
      });
  }

  /* ---------- OTP verification ---------- */

  function verifyOtp() {
    var codeInput = el('msOtpCode');
    var errEl = el('msOtpError');
    var value = codeInput ? codeInput.value.trim() : '';

    if (errEl) errEl.textContent = '';
    if (codeInput) codeInput.classList.remove('is-invalid');

    if (!otpSent) {
      if (errEl) errEl.textContent = 'يرجى إرسال رمز التحقق أولاً';
      return;
    }

    if (!value) {
      if (errEl) errEl.textContent = 'يرجى إدخال رمز التحقق';
      if (codeInput) codeInput.classList.add('is-invalid');
      return;
    }

    if (value !== otpCode) {
      if (errEl) errEl.textContent = 'رمز التحقق غير صحيح';
      if (codeInput) codeInput.classList.add('is-invalid');
      return;
    }

    if (root.membershipData) root.membershipData.email_verified = true;

    var verifyBtn = el('msOtpVerify');
    if (verifyBtn) verifyBtn.disabled = true;

    var success = el('msOtpSuccess');
    if (success) success.hidden = false;

    var demo = el('msOtpDemo');
    if (demo) demo.textContent = '';

    app.goTo(3);
  }

  /* ---------- Init ---------- */

  app.EmailVerification = {
    init: function () {
      populateEmail();

      app.on('step:change', function (step) {
        if (step === 2) populateEmail();
      });

      var sendBtn = el('msOtpSend');
      if (sendBtn) sendBtn.addEventListener('click', sendOtp);

      var verifyBtn = el('msOtpVerify');
      if (verifyBtn) verifyBtn.addEventListener('click', verifyOtp);

      var codeInput = el('msOtpCode');
      if (codeInput) {
        codeInput.addEventListener('input', function () {
          codeInput.classList.remove('is-invalid');
          var errEl = el('msOtpError');
          if (errEl) errEl.textContent = '';
        });
      }

      return app;
    },
    send: sendOtp,
    verify: verifyOtp,
  };
})(typeof window !== 'undefined' ? window : this);
