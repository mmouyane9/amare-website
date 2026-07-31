/* ==========================================================================
   upload.js — Drag & drop / click-to-upload handlers for the membership form
   Handles: photo, CIN front, CIN back. Files stored in shared state.
   Exposes: MembershipForm.Upload
   ========================================================================== */

;(function (root) {
  'use strict';

  var app = root.MembershipForm = root.MembershipForm || {};

  var ACCEPTED_TYPES = ['image/png', 'image/jpeg'];
  var ACCEPTED_EXT = /\.(png|jpe?g)$/i;
  var MAX_SIZE = 5 * 1024 * 1024; // 5MB

  var CONFIG = [
    { id: 'msPhoto',    inputId: 'msPhotoInput' },
    { id: 'msCinFront', inputId: 'msCinFrontInput' },
    { id: 'msCinBack',  inputId: 'msCinBackInput' },
  ];

  function el(id) {
    return root.document.getElementById(id);
  }

  function isAccepted(file) {
    if (ACCEPTED_TYPES.indexOf(file.type) !== -1) return true;
    return ACCEPTED_EXT.test(file.name || '');
  }

  function readAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsDataURL(file);
    });
  }

  function handleFile(id, file) {
    var validation = app.Validation;
    if (!validation) return;

    if (!isAccepted(file)) {
      validation.setError(id, validation.messages.imageType);
      return;
    }
    if (file.size > MAX_SIZE) {
      validation.setError(id, validation.messages.imageSize);
      return;
    }

    readAsDataUrl(file).then(function (dataUrl) {
      var files = app.getState().files;
      files[id] = { file: file, dataUrl: dataUrl, name: file.name || '' };

      var preview = el(id + 'Preview');
      if (preview) preview.src = dataUrl;
      var zone = el(id + 'Zone');
      if (zone) zone.classList.add('has-file');
      var nameEl = el(id + 'Name');
      if (nameEl) nameEl.textContent = files[id].name;

      validation.clearError(id);
      app.emit('upload:change', id);
    });
  }

  function remove(id) {
    var files = app.getState().files;
    delete files[id];

    var input = el(id + 'Input');
    if (input) input.value = '';

    var zone = el(id + 'Zone');
    if (zone) zone.classList.remove('has-file');

    var nameEl = el(id + 'Name');
    if (nameEl) nameEl.textContent = '';

    if (app.Validation) app.Validation.clearError(id);
    app.emit('upload:change', id);
  }

  function setupUpload(conf) {
    var zone = el(conf.id + 'Zone');
    var input = el(conf.inputId);
    if (!zone || !input) return;

    zone.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.ms-upload-remove')) return;
      input.click();
    });

    zone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });

    input.addEventListener('change', function () {
      if (input.files && input.files[0]) handleFile(conf.id, input.files[0]);
    });

    ['dragenter', 'dragover'].forEach(function (evt) {
      zone.addEventListener(evt, function (e) {
        e.preventDefault();
        zone.classList.add('is-dragover');
      });
    });

    ['dragleave', 'dragend'].forEach(function (evt) {
      zone.addEventListener(evt, function () {
        zone.classList.remove('is-dragover');
      });
    });

    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      zone.classList.remove('is-dragover');
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(conf.id, e.dataTransfer.files[0]);
      }
    });

    var removeBtn = el(conf.id + 'Remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        remove(conf.id);
      });
    }
  }

  app.Upload = {
    init: function () {
      CONFIG.forEach(setupUpload);
      return app;
    },
    remove: remove,
    isComplete: function () {
      var files = app.getState().files;
      return !!(files.msPhoto && files.msCinFront && files.msCinBack);
    },
  };
})(typeof window !== 'undefined' ? window : this);
