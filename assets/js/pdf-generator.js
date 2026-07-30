(function () {
  'use strict';

  var PDFDocument = PDFLib.PDFDocument;
  var StandardFonts = PDFLib.StandardFonts;
  var rgb = PDFLib.rgb;

  var BUTTON_ID = 'rGeneratePdf';
  var IMAGE_PATH = '../assets/pdf/membership-template.png.png';
  var PDF_FILENAME = 'membership-form.pdf';

  var A4_WIDTH = 595.28;
  var A4_HEIGHT = 841.89;

  var ROYAL_BLUE = rgb(18 / 255, 59 / 255, 120 / 255);

  var PHOTO_WIDTH = 75;
  var PHOTO_HEIGHT = 90;

  var btn = document.getElementById(BUTTON_ID);
  if (!btn) return;

  btn.addEventListener('click', async function generatePdf() {
    try {
      console.log('Loading template image...');

      var response = await fetch(IMAGE_PATH);
      if (!response.ok) {
        console.error(
          'Failed to load template image:',
          response.status,
          response.statusText
        );
        return;
      }

      var imageBytes = await response.arrayBuffer();

      var pdfDoc = await PDFDocument.create();

      var image;
      if (IMAGE_PATH.toLowerCase().endsWith('.png')) {
        image = await pdfDoc.embedPng(imageBytes);
      } else {
        image = await pdfDoc.embedJpg(imageBytes);
      }

      var page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

      var imageScale = Math.min(A4_WIDTH / image.width, A4_HEIGHT / image.height);
      var scaledW = image.width * imageScale;
      var scaledH = image.height * imageScale;
      var imageOffsetX = (A4_WIDTH - scaledW) / 2;
      var imageOffsetY = (A4_HEIGHT - scaledH) / 2;

      page.drawImage(image, {
        x: imageOffsetX,
        y: imageOffsetY,
        width: scaledW,
        height: scaledH,
      });

      function convertImageToPdfCoordinates(field) {
        return {
          x: imageOffsetX + field.x * imageScale,
          y: imageOffsetY + (image.height - field.y) * imageScale,
        };
      }

      var font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      var FIELD_MAP = [
        { inputId: 'rNom', pdfField: 'firstName' },
        { inputId: 'rPrenom', pdfField: 'lastName' },
        { inputId: 'rDateNaissance', pdfField: 'birthDate' },
        { inputId: 'rLieuNaissance', pdfField: 'birthPlace' },
        { inputId: 'rCIN', pdfField: 'cin' },
        { inputId: 'rTelephone', pdfField: 'phone' },
        { inputId: 'rAdresse', pdfField: 'address' },
      ];

      FIELD_MAP.forEach(function (entry) {
        var input = document.getElementById(entry.inputId);
        if (!input) {
          console.warn('Input not found: ' + entry.inputId);
          return;
        }
        var value = input.value.trim();
        if (!value) return;
        var coords = convertImageToPdfCoordinates(PDF_FIELDS[entry.pdfField]);
        page.drawText(value, {
          x: coords.x,
          y: coords.y,
          size: 12,
          font: font,
          color: ROYAL_BLUE,
        });
      });

      // --- Photo ---
      var photoInput = document.getElementById('rPhotoInput');
      if (photoInput && photoInput.files && photoInput.files[0]) {
        var photoFile = photoInput.files[0];
        var photoName = photoFile.name.toLowerCase();
        if (photoName.match(/\.(jpg|jpeg|png)$/)) {
          var photoBytes = await photoFile.arrayBuffer();
          var photoImg = photoName.endsWith('.png')
            ? await pdfDoc.embedPng(photoBytes)
            : await pdfDoc.embedJpg(photoBytes);

          var photoFrame = convertImageToPdfCoordinates(PDF_FIELDS.photo);
          var imgAspect = photoImg.width / photoImg.height;
          var frameAspect = PHOTO_WIDTH / PHOTO_HEIGHT;

          var drawW, drawH;
          if (imgAspect > frameAspect) {
            drawH = PHOTO_HEIGHT;
            drawW = drawH * imgAspect;
          } else {
            drawW = PHOTO_WIDTH;
            drawH = drawW / imgAspect;
          }

          var drawX = photoFrame.x + (PHOTO_WIDTH - drawW) / 2;
          var drawY = photoFrame.y + (PHOTO_HEIGHT - drawH) / 2;

          page.drawImage(photoImg, {
            x: drawX,
            y: drawY,
            width: drawW,
            height: drawH,
          });
        } else {
          console.warn('Unsupported photo format, skipping');
        }
      }

      var pdfBytes = await pdfDoc.save();
      var blob = new Blob([pdfBytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);

      var link = document.createElement('a');
      link.href = url;
      link.download = PDF_FILENAME;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      console.log('PDF generated successfully');
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
  });
})();
