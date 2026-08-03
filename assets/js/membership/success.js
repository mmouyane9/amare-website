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

  var FONT_REGULAR_URL = '../fonts/Cairo-Regular.ttf';
  var FONT_BOLD_URL = '../fonts/Cairo-Bold.ttf';

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

  function drawRtl(page, font, text, rightX, y, size, color) {
    var prepared = prepareArabic(String(text || ''));
    var width = font.widthOfTextAtSize(prepared, size);
    page.drawText(prepared, {
      x: rightX - width,
      y: y,
      size: size,
      font: font,
      color: color,
    });
  }

  async function loadFonts(pdfDoc) {
    var regularBytes = await fetch(FONT_REGULAR_URL).then(function (res) {
      if (!res.ok) throw new Error('Font load failed');
      return res.arrayBuffer();
    });
    var regular = await pdfDoc.embedFont(regularBytes);

    var bold = regular;
    try {
      var boldBytes = await fetch(FONT_BOLD_URL).then(function (res) {
        if (!res.ok) throw new Error('Bold font load failed');
        return res.arrayBuffer();
      });
      bold = await pdfDoc.embedFont(boldBytes);
    } catch (e) {
      bold = regular;
    }

    return { regular: regular, bold: bold };
  }

  function embedImage(pdfDoc, dataUrl) {
    var base64 = String(dataUrl).split(',')[1];
    var bytes = base64ToArrayBuffer(base64);
    if (/^data:image\/png/i.test(dataUrl)) return pdfDoc.embedPng(bytes);
    return pdfDoc.embedJpg(bytes);
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

  async function generateMembershipPdf() {
    var response = await fetch('../assets/pdf/membership-form-template.pdf');
    if (!response.ok) throw new Error('Template load failed');
    return response.arrayBuffer();
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
