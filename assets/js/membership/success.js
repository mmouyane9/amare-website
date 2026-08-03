/* ==========================================================================
   success.js — Success screen + client-side membership PDF generation
   Exposes: MembershipForm.Success
   ========================================================================== */

;(function (root) {
  'use strict';

  var app = root.MembershipForm = root.MembershipForm || {};
  var doc = root.document;

  function el(id) {
    return doc.getElementById(id);
  }

  /* ---------- Membership number ---------- */
  /* The membership number is assigned by the database function
     register_member() and stored in app state as membershipNumber.
     No random numbers are generated client-side. */

  /* ---------- Payload (Supabase-ready) ---------- */

  function buildPayload() {
    var s = app.getState();
    return {
      membership_number: s.membershipNumber,
      first_name: s.fields.msFirstName || '',
      last_name: s.fields.msLastName || '',
      birth_date: s.fields.msBirthDate || '',
      birth_place: s.fields.msBirthPlace || '',
      national_id: s.fields.msCin || '',
      phone: s.fields.msPhone || '',
      email: s.fields.msEmail || '',
      address: s.fields.msAddress || '',
      photo: s.files.msPhoto ? s.files.msPhoto.dataUrl : null,
      cin_front: s.files.msCinFront ? s.files.msCinFront.dataUrl : null,
      cin_back: s.files.msCinBack ? s.files.msCinBack.dataUrl : null,
    };
  }

  /* ---------- PDF generation ---------- */

  var FONT_REGULAR_URL = '../fonts/Membership-ArialUnicode.ttf';

  function prepareArabic(text) {
    if (typeof root.ArabicUtils !== 'undefined' && root.ArabicUtils.isArabic(text)) {
      return root.ArabicUtils.prepareArabic(text);
    }
    return text;
  }

  function base64ToArrayBuffer(base64) {
    var binary = root.atob(base64);
    var len = binary.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

  async function loadFonts(pdfDoc) {
    var fontBytes = await fetch(FONT_REGULAR_URL).then(function (res) {
      if (!res.ok) throw new Error('Font load failed');
      return res.arrayBuffer();
    });
    return { regular: await pdfDoc.embedFont(fontBytes) };
  }

  function embedImage(pdfDoc, dataUrl) {
    var base64 = String(dataUrl).split(',')[1];
    var bytes = base64ToArrayBuffer(base64);
    if (/^data:image\/png/i.test(dataUrl)) return pdfDoc.embedPng(bytes);
    return pdfDoc.embedJpg(bytes);
  }

  function imageDataUrl(slot) {
    var entry = app.getState().files[slot];
    return entry && entry.dataUrl ? entry.dataUrl : null;
  }

  function drawImageInBox(page, image, box) {
    var scale = Math.min(box.w / image.width, box.h / image.height);
    var dw = image.width * scale;
    var dh = image.height * scale;
    var x = box.x + (box.w - dw) / 2;
    var y = box.y + (box.h - dh) / 2;
    page.drawImage(image, { x: x, y: y, width: dw, height: dh });
  }

  function formatArDate(date) {
    try {
      return date.toLocaleDateString('ar-MA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return date.toISOString().slice(0, 10);
    }
  }

  /* ---------- PDF form configuration ---------- */

  /* The fillable template (assets/pdf/membership-form-fillable.pdf) has
     AcroForm text fields with these names. Keys are the payload keys from
     buildPayload(); values are the AcroForm field names. */
  var PDF_FIELD_MAP = {
    first_name:  'firstName',
    last_name:   'lastName',
    birth_date:  'birthDate',
    birth_place: 'birthPlace',
    national_id: 'cin',
    phone:       'phone',
    email:       'email',
    address:     'address',
  };

  /* Text sizes (pt). The template's DA starts at 12pt (single-line) and
     11pt (address); we raise both slightly for readability. */
  var PDF_DEFAULT_FONT_SIZE = 13;
  var PDF_FIELD_SIZES = { address: 12 };

  /* Image boxes in PDF points, bottom-left origin. These match the
     pushbutton rects on the fillable template. */
  var PDF_IMAGE_BOXES = {
    photo:              { x: 76.5,  y: 96.0,  w: 166.3, h: 144.3 },
    memberSignature:    { x: 322.9, y: 95.9,  w: 214.8, h: 141.7 },
    presidentSignature: { x: 112.0, y: 190.0, w: 122.0, h: 32.0 },
  };

  /* Upload slots that provide each image (see upload.js). */
  var PDF_IMAGE_SLOTS = {
    photo:              'msPhoto',
    memberSignature:    'msMemberSignature',
    presidentSignature: 'msPresidentSignature',
  };

  /* Values are read from window.membershipData. Registration resets that
     object before the success screen is shown, so Success.show() keeps a
     snapshot (buildPayload) used as a fallback when a field is empty. */
  var pdfValuesCache = null;

  function readPdfValues() {
    var data = root.membershipData || {};
    var values = {};
    Object.keys(PDF_FIELD_MAP).forEach(function (key) {
      var raw = data[key];
      if (raw === undefined || raw === null || String(raw).trim() === '') {
        raw = pdfValuesCache ? pdfValuesCache[key] : '';
      }
      values[key] = raw === undefined || raw === null ? '' : String(raw).trim();
    });
    return values;
  }

  async function generateMembershipPdf() {
    if (!root.PDFLib) throw new Error('مكتبة إنشاء PDF غير محملة');

    var response = await fetch('../assets/pdf/membership-form-fillable.pdf');
    if (!response.ok) throw new Error('Template load failed');

    var templateBytes = await response.arrayBuffer();
    var pdfDoc = await root.PDFLib.PDFDocument.load(templateBytes, { updateMetadata: false });

    if (root.fontkit && pdfDoc.registerFontkit) {
      pdfDoc.registerFontkit(root.fontkit);
    }

    var fonts = await loadFonts(pdfDoc);
    var form = pdfDoc.getForm();
    var values = readPdfValues();

    Object.keys(PDF_FIELD_MAP).forEach(function (key) {
      var value = values[key];
      if (!value) return;
      var field = form.getTextField(PDF_FIELD_MAP[key]);
      if (!field) return;
      field.setText(prepareArabic(value));
      field.setFontSize(PDF_FIELD_SIZES[key] || PDF_DEFAULT_FONT_SIZE);
      field.updateAppearances(fonts.regular);
    });

    /* The template ships the three pushbutton slots (photo + the two
       signature boxes) with a gray placeholder fill in their appearance
       streams. Clear them so the final form shows only the real photo and
       empty outlined signature boxes — no gray rectangles anywhere. */
    function clearPlaceholderAppearance(name) {
      var button;
      try {
        button = form.getButton(name);
      } catch (e) {
        return;
      }
      if (!button) return;
      button.acroField.getWidgets().forEach(function (widget) {
        widget.dict.delete(root.PDFLib.PDFName.of('MK'));
        widget.setNormalAppearance(
          pdfDoc.context.formXObject([], {
            BBox: pdfDoc.context.obj([
              0,
              0,
              widget.getRectangle().width,
              widget.getRectangle().height,
            ]),
            Matrix: pdfDoc.context.obj([1, 0, 0, 1, 0, 0]),
          })
        );
        widget.removeRolloverAppearance();
        widget.removeDownAppearance();
      });
    }

    ['photo', 'memberSignature', 'presidentSignature'].forEach(clearPlaceholderAppearance);

    var page = pdfDoc.getPage(0);
    for (var i = 0; i < Object.keys(PDF_IMAGE_BOXES).length; i++) {
      var boxKey = Object.keys(PDF_IMAGE_BOXES)[i];
      var dataUrl = imageDataUrl(PDF_IMAGE_SLOTS[boxKey]);
      if (!dataUrl) continue;
      var image = await embedImage(pdfDoc, dataUrl);
      drawImageInBox(page, image, PDF_IMAGE_BOXES[boxKey]);
    }

    /* Appearances are already generated with the embedded font; register it
       in the form's DR so viewers that regenerate appearances (e.g. PDF.js,
       Acrobat) use the same font, and stop regeneration so the embedded
       Arabic-correct appearance streams are used. */
    var acroForm = form.acroForm.dict;
    var dr = acroForm.lookup(root.PDFLib.PDFName.of('DR'));
    if (!dr) {
      dr = pdfDoc.context.obj({ Font: {} });
      acroForm.set(root.PDFLib.PDFName.of('DR'), dr);
    }
    dr.lookup(root.PDFLib.PDFName.of('Font')).set(
      root.PDFLib.PDFName.of(fonts.regular.name),
      fonts.regular.ref
    );
    acroForm.set(root.PDFLib.PDFName.of('NeedAppearances'), pdfDoc.context.obj(false));

    return pdfDoc.save();
  }

  function triggerDownload(bytes, filename) {
    var blob = new Blob([bytes], { type: 'application/pdf' });
    var url = URL.createObjectURL(blob);
    var link = doc.createElement('a');
    link.href = url;
    link.download = filename;
    doc.body.appendChild(link);
    link.click();
    doc.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  }

  app.Success = {
    init: function () {
      var downloadBtn = el('msDownloadPdf');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', function () { app.Success.downloadPdf(); });
      }
      return app;
    },

    show: function () {
      var number = app.getState().membershipNumber;
      if (!number) {
        console.warn('[Membership] Success.show(): membershipNumber is missing from state.');
        number = '—';
      }

      var valueEl = el('msMemberNumber');
      if (valueEl) valueEl.textContent = number;

      pdfValuesCache = buildPayload();
      app.emit('success:show', buildPayload());
      return app;
    },

    downloadPdf: async function () {
      var downloadBtn = el('msDownloadPdf');
      var originalHtml = downloadBtn ? downloadBtn.innerHTML : '';
      var disabled = false;

      if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = '<span class="join-spinner"></span> جارٍ تحضير الوثيقة...';
        disabled = true;
      }

      try {
        var bytes = await generateMembershipPdf();
        var number = app.getState().membershipNumber || 'AMARE';
        triggerDownload(bytes, 'وثيقة_الانخراط_' + number + '.pdf');
      } catch (err) {
        console.error('[Membership] PDF generation failed:', err);
        root.alert('تعذر إنشاء الوثيقة حاليًا. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
      } finally {
        if (downloadBtn) {
          downloadBtn.disabled = false;
          downloadBtn.innerHTML = originalHtml;
        }
      }
    },
  };
})(typeof window !== 'undefined' ? window : this);
