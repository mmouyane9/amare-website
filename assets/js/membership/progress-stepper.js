/* ==========================================================================
   progress-stepper.js — Horizontal progress stepper for the membership form
   Owns the shared state + tiny event bus used by all membership modules.
   ========================================================================== */

;(function (root) {
  'use strict';

  var app = (root.MembershipForm = root.MembershipForm || {});

  /* ---------- Shared state ---------- */
  var state = {
    step: 1,
    fields: {},
    files: {},
    membershipNumber: null,
  };

  app.getState = function () {
    return state;
  };

  app.setState = function (patch) {
    for (var key in patch) {
      if (Object.prototype.hasOwnProperty.call(patch, key)) state[key] = patch[key];
    }
    return app;
  };

  app.setField = function (name, value) {
    state.fields[name] = value;
    return app;
  };

  /* ---------- Tiny event bus ---------- */
  var listeners = {};

  app.on = function (event, fn) {
    (listeners[event] = listeners[event] || []).push(fn);
    return app;
  };

  app.emit = function (event, data) {
    (listeners[event] || []).forEach(function (fn) {
      try {
        fn(data);
      } catch (err) {
        /* keep going even if one listener fails */
      }
    });
    return app;
  };

  /* ---------- Step navigation ---------- */
  var TOTAL_STEPS = 4;

  app.goTo = function (step) {
    if (typeof step !== 'number' || step < 1 || step > TOTAL_STEPS) return app;
    state.step = step;
    app.emit('step:change', step);
    return app;
  };

  app.nextStep = function () {
    if (state.step < TOTAL_STEPS) app.goTo(state.step + 1);
    return app;
  };

  app.prevStep = function () {
    if (state.step > 1) app.goTo(state.step - 1);
    return app;
  };

  /* ---------- Stepper rendering ---------- */
  var stepperEl = null;
  var stepEls = [];

  function renderStepper(current) {
    if (!stepperEl) return;
    stepperEl.setAttribute('data-current', current);

    var fill = ((current - 1) / (TOTAL_STEPS - 1)) * 100;
    stepperEl.style.setProperty('--ms-fill', fill + '%');

    stepEls.forEach(function (stepEl) {
      var num = parseInt(stepEl.getAttribute('data-step'), 10);
      var btn = stepEl.querySelector('.ms-step-btn');

      stepEl.classList.toggle('is-complete', num < current);
      stepEl.classList.toggle('is-active', num === current);

      if (num === current) {
        btn.setAttribute('aria-current', 'step');
      } else {
        btn.removeAttribute('aria-current');
      }

      btn.disabled = num > current;
    });
  }

  app.Stepper = {
    init: function () {
      stepperEl = root.document.getElementById('msStepper');
      if (!stepperEl) return app;

      stepEls = Array.prototype.slice.call(stepperEl.querySelectorAll('.ms-step'));

      stepEls.forEach(function (stepEl) {
        var btn = stepEl.querySelector('.ms-step-btn');
        btn.addEventListener('click', function () {
          var target = parseInt(stepEl.getAttribute('data-step'), 10);
          if (target < state.step) app.goTo(target);
        });
      });

      app.renderStepper(state.step);
      return app;
    },
    render: renderStepper,
  };

  app.renderStepper = renderStepper;
  app.on('step:change', renderStepper);
})(typeof window !== 'undefined' ? window : this);
