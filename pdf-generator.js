var PDF_FIELD_POSITIONS = {
  firstName: { x: 50, y: 720, size: 14 },
  lastName: { x: 50, y: 690, size: 14 },
  birthDate: { x: 50, y: 660, size: 14 },
  birthPlace: { x: 50, y: 630, size: 14 },
  cin: { x: 50, y: 590, size: 14 },
  phone: { x: 50, y: 560, size: 14 },
  email: { x: 50, y: 530, size: 14 },
  address: { x: 50, y: 480, size: 12 },
  photo: { x: 420, y: 640, width: 120, height: 150 },
  sigMember: { x: 50, y: 180, width: 200, height: 80 },
};

function isArabic(str) {
  return /[\u0600-\u06FF]/.test(str);
}

function reverseArabic(str) {
  if (!isArabic(str)) return str;
  var result = '';
  var segment = '';
  for (var i = str.length - 1; i >= 0; i--) {
    var ch = str.charAt(i);
    if (isArabic(ch) || ch === ' ') {
      segment = ch + segment;
    } else {
      result = segment + result;
      segment = ch;
    }
  }
  result = segment + result;
  return result;
}

async function generateMembershipPDF(formData) {
  const {
    PDFDocument,
    rgb,
  } = PDFLib;

  const doc = await PDFDocument.create();

  const templateUrl = 'Amare%20files%20/%D8%A7%D8%B3%D8%AA%D9%85%D8%A7%D8%B1%D8%A9%20%20%D8%A7%D9%84%D8%A7%D9%86%D8%AE%D8%B1%D8%A7%D8%B7%202026%20%20.pdf';
  const templateResponse = await fetch(templateUrl);
  const templateBytes = await templateResponse.arrayBuffer();
  const templateDoc = await PDFDocument.load(templateBytes);
  const [templatePage] = await doc.copyPages(templateDoc, [0]);
  doc.addPage(templatePage);

  const pages = doc.getPages();
  const page = pages[0];
  const { width, height } = page.getSize();

  const fontUrl = 'Amare%20files%20/Cairo-Regular.ttf';
  const fontResponse = await fetch(fontUrl);
  const fontBytes = await fontResponse.arrayBuffer();
  const cairoFont = await doc.embedFont(fontBytes);

  const boldFontUrl = 'Amare%20files%20/Cairo-Bold.ttf';
  const boldFontResponse = await fetch(boldFontUrl);
  const boldFontBytes = await boldFontResponse.arrayBuffer();
  const cairoBold = await doc.embedFont(boldFontBytes);

  function drawField(label, value, yPos) {
    const labelX = width - 50;
    const valX = 50;
    const maxValWidth = width - 160;

    var labelToDraw = label ? reverseArabic(label) : '';
    var labelWidth = labelToDraw ? cairoBold.widthOfTextAtSize(labelToDraw, 10) : 0;
    if (labelToDraw) {
      page.drawText(labelToDraw, {
        x: labelX - labelWidth,
        y: yPos,
        size: 10,
        font: cairoBold,
        color: rgb(0.1, 0.2, 0.4),
      });
    }

    if (value) {
      var displayValue = reverseArabic(value);
      var fontSize = 12;
      var valWidth = cairoFont.widthOfTextAtSize(displayValue, fontSize);
      if (valWidth > maxValWidth) {
        fontSize = 10;
      }
      page.drawText(displayValue, {
        x: valX,
        y: yPos,
        size: fontSize,
        font: cairoFont,
        color: rgb(0, 0, 0),
      });
    }
  }

  drawField('الاسم الشخصي', formData.firstName, PDF_FIELD_POSITIONS.firstName.y);
  drawField('الاسم العائلي', formData.lastName, PDF_FIELD_POSITIONS.lastName.y);
  drawField('تاريخ الازدياد', formData.birthDate, PDF_FIELD_POSITIONS.birthDate.y);
  drawField('مكان الازدياد', formData.birthPlace, PDF_FIELD_POSITIONS.birthPlace.y);
  drawField('رقم البطاقة الوطنية', formData.cin, PDF_FIELD_POSITIONS.cin.y);
  drawField('رقم الهاتف', formData.phone, PDF_FIELD_POSITIONS.phone.y);
  drawField('البريد الإلكتروني', formData.email, PDF_FIELD_POSITIONS.email.y);

  if (formData.address) {
    const addrLines = formData.address.split('\n').filter(Boolean);
    let addrY = PDF_FIELD_POSITIONS.address.y;
    for (const line of addrLines) {
      drawField('', line, addrY);
      addrY -= 16;
    }
  }

  function base64ToUint8(b64) {
    const raw = atob(b64);
    const arr = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
  }

  if (formData.photoBase64) {
    try {
      const rawData = formData.photoBase64.split(',')[1];
      const imgBytes = base64ToUint8(rawData);
      let photoImage;
      if (formData.photoBase64.startsWith('data:image/png')) {
        photoImage = await doc.embedPng(imgBytes);
      } else {
        photoImage = await doc.embedJpg(imgBytes);
      }

      const pos = PDF_FIELD_POSITIONS.photo;
      page.drawImage(photoImage, {
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
      });
    } catch (e) {
      console.warn('Could not embed photo:', e);
    }
  }

  if (formData.sigMemberDataUrl) {
    try {
      const sigData = formData.sigMemberDataUrl.split(',')[1];
      const sigBytes = base64ToUint8(sigData);
      const sigImage = await doc.embedPng(sigBytes);
      const pos = PDF_FIELD_POSITIONS.sigMember;
      page.drawImage(sigImage, {
        x: pos.x,
        y: pos.y,
        width: pos.width,
        height: pos.height,
      });
    } catch (e) {
      console.warn('Could not embed signature:', e);
    }
  }

  const pdfBytes = await doc.save();
  return pdfBytes;
}
