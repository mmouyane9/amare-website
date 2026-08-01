/* ==========================================================================
   upload.js — Drag & drop / click-to-upload handlers for the membership form
   Handles: photo, CIN front, CIN back. Files stored in shared state and
   uploaded to Supabase Storage with progress feedback.
   Exposes: MembershipForm.Upload
   ========================================================================== */

;(function (root) {
  'use strict';

  var app = root.MembershipForm = root.MembershipForm || {};

  var ACCEPTED_TYPES = ['image/png', 'image/jpeg'];
  var ACCEPTED_EXT = /\.(png|jpe?g)$/i;
  var MAX_SIZE = 5 * 1024 * 1024; // 5MB

  var UPLOAD_TIMEOUT_MS = 120000;
  var UPLOAD_ERROR_MSG = 'تعذر رفع الملف، يرجى المحاولة مرة أخرى';

  var CONFIG = [
    { id: 'msPhoto',    inputId: 'msPhotoInput' },
    { id: 'msCinFront', inputId: 'msCinFrontInput' },
    { id: 'msCinBack',  inputId: 'msCinBackInput' },
  ];

  var STORAGE_CONFIG = {
    msPhoto:    { bucket: 'profile-photos',      folder: '' },
    msCinFront: { bucket: 'identity-documents', folder: 'front' },
    msCinBack:  { bucket: 'identity-documents', folder: 'back' },
  };

  var MEMBER_FIELDS = {
    msPhoto:    { url: 'profile_photo_url' },
    msCinFront: { url: 'national_id_front_url' },
    msCinBack:  { url: 'national_id_back_url' },
  };

  function uploadStepNumber(id) {
    if (id === 'msPhoto') return 7;
    if (id === 'msCinFront') return 8;
    return 9;
  }

  function el(id) {
    return root.document.getElementById(id);
  }

  function isAccepted(file) {
    if (ACCEPTED_TYPES.indexOf(file.type) !== -1) return true;
    return ACCEPTED_EXT.test(file.name || '');
  }

  function fileExt(file) {
    if (file.type === 'image/png') return 'png';
    if (file.type === 'image/jpeg') return 'jpg';
    var m = /\.([a-z0-9]+)$/i.exec(file.name || '');
    if (m) return m[1].toLowerCase() === 'jpeg' ? 'jpg' : m[1].toLowerCase();
    return 'png';
  }

  function uniqueName(file) {
    var uuid = '';
    if (root.crypto && typeof root.crypto.randomUUID === 'function') {
      uuid = root.crypto.randomUUID();
    } else {
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
    }
    return uuid + '.' + fileExt(file);
  }

  function readAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsDataURL(file);
    });
  }

  function setMemberFields(id, path) {
    var fields = MEMBER_FIELDS[id];
    var db = root.membershipData;
    if (!fields || !db) return;
    db[fields.url] = path;
  }

  function clearMemberFields(id) {
    var fields = MEMBER_FIELDS[id];
    var db = root.membershipData;
    if (!fields || !db) return;
    db[fields.url] = '';
  }

  function uploadFailed(id, entry) {
    var files = app.getState().files;
    if (files[id] !== entry) return;

    entry.uploading = false;
    entry.uploaded = false;
    entry.error = UPLOAD_ERROR_MSG;

    var nameEl = el(id + 'Name');
    if (nameEl) nameEl.textContent = 'تعذر رفع الملف';
    if (app.Validation) app.Validation.setError(id, UPLOAD_ERROR_MSG);
    app.emit('upload:change', id);
  }

  function startUpload(id, entry) {
    var client = root.supabaseClient;
    var conf = STORAGE_CONFIG[id];
    var step = uploadStepNumber(id);

    if (!client || !client.supabaseUrl || !client.supabaseKey) {
      uploadFailed(id, entry);
      console.error('[Membership][STEP ' + step + '] FATAL: supabaseClient missing url/key -> upload ' + id + ' aborted.');
      return Promise.reject(new Error('Supabase client is not initialised'));
    }
    if (!conf) {
      uploadFailed(id, entry);
      console.error('[Membership][STEP ' + step + '] FATAL: no storage config for ' + id);
      return Promise.reject(new Error('Unknown upload slot: ' + id));
    }

    var file = entry.file;
    var path = (conf.folder ? conf.folder + '/' : '') + uniqueName(file);
    var url = client.supabaseUrl + '/storage/v1/object/' + conf.bucket + '/' + path;
    var key = client.supabaseKey;

    entry.uploading = true;
    entry.uploaded = false;
    entry.progress = 0;
    entry.path = '';
    entry.url = '';
    entry.error = '';

    var nameEl = el(id + 'Name');
    if (nameEl) nameEl.textContent = 'جارٍ الرفع... 0%';

    console.log('[Membership][STEP ' + step + '] Upload started: ' + id + ' -> bucket="' + conf.bucket + '" path="' + path + '"');

    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.timeout = UPLOAD_TIMEOUT_MS;
      xhr.setRequestHeader('Authorization', 'Bearer ' + key);
      xhr.setRequestHeader('apikey', key);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.setRequestHeader('x-upsert', 'true');

      xhr.upload.onprogress = function (e) {
        if (!e.lengthComputable) return;
        entry.progress = Math.round((e.loaded / e.total) * 100);
        if (nameEl) nameEl.textContent = 'جارٍ الرفع... ' + entry.progress + '%';
      };

      xhr.onload = function () {
        if (app.getState().files[id] !== entry) {
          entry.promise = null;
          console.error('[Membership][STEP ' + step + '] Upload ' + id + ' aborted: file slot replaced mid-upload.');
          reject(new Error('Upload slot replaced'));
          return;
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          var returnedPath = path;
          try {
            var body = JSON.parse(xhr.responseText || '{}');
            if (body && body.Key) returnedPath = body.Key;
          } catch (e) { }

          entry.uploading = false;
          entry.uploaded = true;
          entry.progress = 100;
          entry.path = returnedPath;
          entry.url = '';
          entry.error = '';
          entry.promise = null;
          if (nameEl) nameEl.textContent = entry.name;
          if (app.Validation) app.Validation.clearError(id);
          setMemberFields(id, returnedPath);
          app.emit('upload:change', id);
          console.log('[Membership][STEP ' + step + '] Upload OK: ' + id + ' -> storage path "' + returnedPath + '"');
          resolve(returnedPath);
        } else {
          uploadFailed(id, entry);
          entry.promise = null;
          console.error('[Membership][STEP ' + step + '] Upload FAILED: ' + id + ' HTTP status ' + xhr.status + '. Response: ' + xhr.responseText);
          reject(new Error('Upload failed with status ' + xhr.status));
        }
      };

      xhr.onerror = function () {
        uploadFailed(id, entry);
        entry.promise = null;
        console.error('[Membership][STEP ' + step + '] Upload FAILED: ' + id + ' network error (no response from server).');
        reject(new Error('Upload network error'));
      };

      xhr.ontimeout = function () {
        uploadFailed(id, entry);
        entry.promise = null;
        console.error('[Membership][STEP ' + step + '] Upload FAILED: ' + id + ' timed out after ' + UPLOAD_TIMEOUT_MS + 'ms.');
        reject(new Error('Upload timed out'));
      };

      xhr.send(file);
    });
  }

  function uploadFile(id) {
    var files = app.getState().files;
    var entry = files[id];
    var step = uploadStepNumber(id);

    if (!entry || !entry.file) {
      console.error('[Membership][STEP ' + step + '] uploadFile(' + id + '): NO FILE SELECTED for this slot -> upload skipped.');
      return Promise.reject(new Error('No file selected for ' + id));
    }
    if (entry.uploaded && entry.path) {
      console.log('[Membership][STEP ' + step + '] uploadFile(' + id + '): already uploaded, reusing storage path "' + entry.path + '" (no duplicate upload).');
      return Promise.resolve(entry.path);
    }
    if (entry.promise) {
      console.log('[Membership][STEP ' + step + '] uploadFile(' + id + '): upload already in progress, reusing promise.');
      return entry.promise;
    }

    entry.promise = startUpload(id, entry);
    return entry.promise;
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
      files[id] = {
        file: file,
        dataUrl: dataUrl,
        name: file.name || '',
        uploading: false,
        uploaded: false,
        progress: 0,
        path: '',
        url: '',
        error: '',
        promise: null,
      };

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
    var entry = files[id];

    if (entry && entry.path && root.supabaseClient && root.supabaseClient.storage) {
      var conf = STORAGE_CONFIG[id];
      if (conf) {
        root.supabaseClient.storage
          .from(conf.bucket)
          .remove([entry.path])
          .then(
            function () {},
            function () {}
          );
      }
    }

    delete files[id];

    var input = el(id + 'Input');
    if (input) input.value = '';

    var zone = el(id + 'Zone');
    if (zone) zone.classList.remove('has-file');

    var nameEl = el(id + 'Name');
    if (nameEl) nameEl.textContent = '';

    if (app.Validation) app.Validation.clearError(id);
    clearMemberFields(id);
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
    uploadFile: uploadFile,
    isComplete: function () {
      var files = app.getState().files;
      return ['msPhoto', 'msCinFront', 'msCinBack'].every(function (id) {
        var f = files[id];
        return !!(f && f.uploaded === true && f.uploading !== true);
      });
    },
    waitForPending: function () {
      var files = app.getState().files;
      var pending = ['msPhoto', 'msCinFront', 'msCinBack'].map(function (id) {
        var f = files[id];
        return f && f.promise ? f.promise : Promise.resolve();
      });
      return Promise.all(pending).then(function () {
        return app.Upload.isComplete();
      });
    },
    cleanupUploaded: function () {
      var client = root.supabaseClient;
      var files = app.getState().files;

      var deletions = ['msPhoto', 'msCinFront', 'msCinBack'].map(function (id) {
        var f = files[id];
        var conf = STORAGE_CONFIG[id];
        if (!f || !f.path || !conf || !client || !client.storage) return Promise.resolve();
        return Promise.resolve(client.storage.from(conf.bucket).remove([f.path])).then(
          function () {},
          function () {}
        );
      });

      return Promise.all(deletions).then(function () {
        app.Upload.resetUploaded();
      });
    },
    resetUploaded: function () {
      var files = app.getState().files;
      ['msPhoto', 'msCinFront', 'msCinBack'].forEach(function (id) {
        var f = files[id];
        if (!f) return;
        f.uploading = false;
        f.uploaded = false;
        f.progress = 0;
        f.path = '';
        f.url = '';
        f.error = '';
        f.promise = null;
        clearMemberFields(id);
      });
      return app;
    },
  };
})(typeof window !== 'undefined' ? window : this);
