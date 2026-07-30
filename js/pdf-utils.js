/**
 * pdf-utils.js — Reusable PDF generation helpers for pdf-lib + fontkit
 *
 * Dependencies (loaded globally):
 *   - PDFLib      from pdf-lib CDN
 *   - fontkit     from @pdf-lib/fontkit CDN (optional, for custom fonts)
 *   - ArabicUtils from js/arabic.js
 */

;(function (root) {
  var PDFLib = root.PDFLib

  if (!PDFLib) {
    console.error('[PDFUtils] pdf-lib not loaded. Include pdf-lib CDN script first.')
    return
  }

  function ensureFontkit(doc) {
    if (typeof fontkit !== 'undefined') {
      doc.registerFontkit(fontkit)
    }
  }

  var PDFUtils = {}

  PDFUtils.loadTemplate = async function (doc, urlOrBytes) {
    var bytes
    if (typeof urlOrBytes === 'string') {
      var response = await fetch(urlOrBytes)
      if (!response.ok)
        throw new Error('Failed to load PDF template (HTTP ' + response.status + ')')
      bytes = await response.arrayBuffer()
    } else {
      bytes = urlOrBytes
    }
    var templateDoc = await PDFLib.PDFDocument.load(bytes)
    var pages = await doc.copyPages(templateDoc, [0])
    doc.addPage(pages[0])
  }

  PDFUtils.loadFont = async function (doc, urlOrBytes) {
    ensureFontkit(doc)
    var bytes
    if (typeof urlOrBytes === 'string') {
      var response = await fetch(urlOrBytes)
      if (!response.ok)
        throw new Error('Failed to load font (HTTP ' + response.status + ')')
      bytes = await response.arrayBuffer()
    } else {
      bytes = urlOrBytes
    }
    return await doc.embedFont(bytes)
  }

  PDFUtils.drawText = function (page, text, x, y, opts) {
    if (!text) return
    opts = opts || {}
    var font = opts.font
    var size = opts.size || 12
    var maxWidth = opts.maxWidth
    var color = opts.color || PDFLib.rgb(0, 0, 0)
    var lineHeight = opts.lineHeight || size * 1.4

    // Split into words from original text for multiline wrapping
    var words = String(text).split(/\s+/)
    var rawLines = []

    if (maxWidth && font && words.length > 1) {
      var currentLine = ''
      words.forEach(function (word) {
        var testLine = currentLine ? currentLine + ' ' + word : word
        var prepared = root.ArabicUtils
          ? root.ArabicUtils.prepareArabic(testLine)
          : testLine
        var w = font.widthOfTextAtSize(prepared, size)
        if (w <= maxWidth) {
          currentLine = testLine
        } else {
          if (currentLine) rawLines.push(currentLine)
          currentLine = word
        }
      })
      if (currentLine) rawLines.push(currentLine)
    } else {
      rawLines = [String(text)]
    }

    // Auto-fit: reduce font size if longest line exceeds maxWidth
    if (maxWidth && font) {
      var maxLineW = 0
      rawLines.forEach(function (line) {
        var prepared = root.ArabicUtils
          ? root.ArabicUtils.prepareArabic(line)
          : line
        var w = font.widthOfTextAtSize(prepared, size)
        if (w > maxLineW) maxLineW = w
      })
      if (maxLineW > maxWidth) {
        size = size * (maxWidth / maxLineW) * 0.95
        lineHeight = size * 1.4
      }
    }

    // Draw each line
    rawLines.forEach(function (line, idx) {
      var displayText = root.ArabicUtils
        ? root.ArabicUtils.prepareArabic(line)
        : line
      if (!displayText) return

      var lineY = y - idx * lineHeight

      page.drawText(displayText, {
        x: x,
        y: lineY,
        size: size,
        font: font,
        color: color,
        maxWidth: maxWidth,
      })
    })
  }

  PDFUtils.drawImage = async function (doc, page, dataUrl, x, y, opts) {
    if (!dataUrl) return
    opts = opts || {}
    try {
      var raw = dataUrl.split(',')[1]
      if (!raw) return
      var binary = atob(raw)
      var bytes = new Uint8Array(binary.length)
      for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

      var image
      if (dataUrl.startsWith('data:image/png')) {
        image = await doc.embedPng(bytes)
      } else {
        image = await doc.embedJpg(bytes)
      }

      var boxW = opts.width || 100
      var boxH = opts.height || 100
      var imgW = image.width
      var imgH = image.height
      var fit = opts.fit || 'cover'

      var drawX, drawY, drawW, drawH

      if (fit === 'contain') {
        var scale = Math.min(boxW / imgW, boxH / imgH)
        drawW = imgW * scale
        drawH = imgH * scale
        drawX = x + (boxW - drawW) / 2
        drawY = y + (boxH - drawH) / 2
      } else {
        var scale = Math.max(boxW / imgW, boxH / imgH)
        drawW = imgW * scale
        drawH = imgH * scale
        drawX = x + (boxW - drawW) / 2
        drawY = y + (boxH - drawH) / 2
      }

      page.drawImage(image, {
        x: drawX,
        y: drawY,
        width: drawW,
        height: drawH,
      })
    } catch (e) {
      console.warn('[PDFUtils] Could not embed image:', e)
    }
  }

  PDFUtils.savePDF = async function (doc) {
    var bytes = await doc.save()
    var ok =
      bytes[0] === 0x25 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x44 &&
      bytes[3] === 0x46
    if (!ok) throw new Error('PDF generation failed — invalid PDF header')
    return bytes
  }

  root.PDFUtils = PDFUtils
})(typeof window !== 'undefined' ? window : globalThis)
