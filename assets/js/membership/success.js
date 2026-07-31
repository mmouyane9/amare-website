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

  function generateMembershipNumber() {
    var year = new Date().getFullYear();
    var rand = String(Math.floor(10000 + Math.random() * 90000));
    return 'AMARE-' + year + '-' + rand;
  }

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
    if (!root.PDFLib) throw new Error('مكتبة إنشاء PDF غير محملة');
    var pdfDoc = await root.PDFLib.PDFDocument.create();

    if (root.fontkit && pdfDoc.registerFontkit) {
      pdfDoc.registerFontkit(root.fontkit);
    }

    var fonts = await loadFonts(pdfDoc);

    var page = pdfDoc.addPage([595.28, 841.89]);
    var W = page.getWidth();

    var navy = root.PDFLib.rgb(18 / 255, 59 / 255, 120 / 255);
    var dark = root.PDFLib.rgb(34 / 255, 34 / 255, 34 / 255);
    var soft = root.PDFLib.rgb(91 / 255, 107 / 255, 124 / 255);
    var gold = root.PDFLib.rgb(246 / 255, 179 / 255, 0);
    var light = root.PDFLib.rgb(0.9, 0.92, 0.96);
    var white = root.PDFLib.rgb(1, 1, 1);

    var data = buildPayload();

    /* Header band */
    page.drawRectangle({ x: 0, y: 780, width: W, height: 62, color: navy });
    page.drawRectangle({ x: 0, y: 772, width: W, height: 8, color: gold });

    drawRtl(page, fonts.bold, 'الجمعية المغربية لهواة البحث والاستكشاف', W - 40, 812, 17, white);
    drawRtl(page, fonts.regular, 'وثيقة طلب الانخراط الإلكتروني', W - 40, 794, 11, root.PDFLib.rgb(0.86, 0.91, 0.97));

    /* Membership number + date */
    drawRtl(page, fonts.bold, 'رقم العضوية', W - 40, 748, 10, soft);
    drawRtl(page, fonts.bold, data.membership_number || '—', W - 40, 730, 12, navy);
    drawRtl(page, fonts.bold, 'تاريخ الطلب', 320, 748, 10, soft);
    drawRtl(page, fonts.regular, formatArDate(new Date()), 320, 730, 12, dark);

    page.drawLine({ start: { x: 40, y: 706 }, end: { x: W - 40, y: 706 }, thickness: 1, color: light });

    /* Personal info section */
    drawRtl(page, fonts.bold, 'المعلومات الشخصية', W - 40, 676, 13, navy);
    page.drawRectangle({ x: W - 40 - 90, y: 668, width: 90, height: 3, color: gold });

    var rows = [
      ['الاسم الشخصي', data.first_name],
      ['الاسم العائلي', data.last_name],
      ['تاريخ الازدياد', data.birth_date],
      ['مكان الازدياد', data.birth_place],
      ['رقم البطاقة الوطنية', data.national_id],
      ['رقم الهاتف', data.phone],
      ['البريد الإلكتروني', data.email],
      ['العنوان', data.address],
    ];

    var rowTop = 634;
    rows.forEach(function (row, index) {
      drawRtl(page, fonts.regular, row[0], W - 40, rowTop - index * 30, 10, soft);
      drawRtl(page, fonts.bold, row[1] || '—', W - 40, rowTop - index * 30 - 15, 11.5, dark);
      page.drawLine({
        start: { x: 40, y: rowTop - index * 30 - 24 },
        end: { x: W - 40, y: rowTop - index * 30 - 24 },
        thickness: 0.5,
        color: light,
      });
    });

    /* Documents section */
    var docsTop = 634 - rows.length * 30 - 16; // below last row
    drawRtl(page, fonts.bold, 'الوثائق المرفقة', W - 40, docsTop, 13, navy);
    page.drawRectangle({ x: W - 40 - 90, y: docsTop - 8, width: 90, height: 3, color: gold });

    var boxes = [
      { x: 40, y: 60, w: 92, h: 118, title: 'الصورة الشخصية', img: data.photo },
      { x: 200, y: 60, w: 176, h: 118, title: 'الوجه الأمامي للبطاقة الوطنية', img: data.cin_front },
      { x: 380, y: 60, w: 176, h: 118, title: 'الوجه الخلفي للبطاقة الوطنية', img: data.cin_back },
    ];

    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      drawRtl(page, fonts.regular, box.title, box.x + box.w - 20, 196, 9, soft);
      page.drawRectangle({ x: box.x, y: 60, width: box.w, height: 118, borderColor: light, borderWidth: 1.5 });
      if (box.img) {
        try {
          drawImageInBox(page, await embedImage(pdfDoc, box.img), {
            x: box.x + 6,
            y: 66,
            w: box.w - 12,
            h: 106,
          });
        } catch (e) {
          /* skip unreadable image */
        }
      }
    }

    /* Footer */
    page.drawLine({ start: { x: 40, y: 30 }, end: { x: W - 40, y: 30 }, thickness: 1, color: light });
    drawRtl(page, fonts.regular, 'الوثيقة صادرة إلكترونيًا عن الجمعية المغربية لهواة البحث والاستكشاف', W - 40, 16, 9, soft);

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
      var number = app.getState().membershipNumber || generateMembershipNumber();
      app.setState({ membershipNumber: number });

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
