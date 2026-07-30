/**
 * pdf-generator.js — PDF generation engine for membership forms
 *
 * Dependencies (loaded globally, in order):
 *   1. pdf-lib CDN             → window.PDFLib
 *   2. @pdf-lib/fontkit CDN     → window.fontkit
 *   3. bidi-js CDN              → window.bidi_js (factory)
 *   4. js/arabic.js             → window.ArabicUtils
 *   5. js/pdf-config.js         → window.PDFConfig
 *   6. js/pdf-utils.js          → window.PDFUtils
 *
 * Reads all field positions from PDFConfig (central config).
 * When CALIBRATION_MODE = true, draws coordinate grid + debug markers.
 */

// ── Main entry point ──────────────────────────────────────────

;(function (root) {

root.generateMembershipPDF = async function (formData) {
    var PDFLib = root.PDFLib
  if (!PDFLib) throw new Error('pdf-lib not loaded')

  console.log('[PDF] Starting PDF generation...')

  var doc = await PDFLib.PDFDocument.create()
  console.log('[PDF] Document created')

  // Load template page
  if (typeof PDFUtils !== 'undefined' && PDFUtils.loadTemplate) {
    var templateUrl = '../templates/membership-template.pdf'
    console.log('[PDF] Loading template:', templateUrl)
    await PDFUtils.loadTemplate(doc, templateUrl)
    console.log('[PDF] Template loaded')
  }

  // Load fonts
  if (typeof PDFUtils !== 'undefined' && PDFUtils.loadFont) {
    var fontUrl = '../fonts/Cairo-Regular.ttf'
    console.log('[PDF] Loading font:', fontUrl)
    var cairoFont = await PDFUtils.loadFont(doc, fontUrl)
    console.log('[PDF] Font loaded')

    var boldFontUrl = '../fonts/Cairo-Bold.ttf'
    var cairoBold = await PDFUtils.loadFont(doc, boldFontUrl)
    console.log('[PDF] Bold font loaded')
  }

  var pages = doc.getPages()
  var page = pages[pages.length - 1]

  var config = root.PDFConfig
  var cal = config.CALIBRATION_MODE

  // ── Draw calibration grid (behind content) ──────────────────
  if (cal) {
    var pw = 595.32
    var ph = 841.92
    var gridColor = PDFLib.rgb(0.8, 0.8, 0.8)
    var labelColor = PDFLib.rgb(0.6, 0.6, 0.6)
    var markerColor = PDFLib.rgb(0.9, 0.2, 0.2)

    // Vertical grid lines every 20 pts
    for (var gx = 0; gx <= pw; gx += 20) {
      page.drawLine({
        start: { x: gx, y: 0 },
        end: { x: gx, y: ph },
        color: gridColor,
        thickness: 0.3,
      })
    }
    // Horizontal grid lines every 20 pts
    for (var gy = 0; gy <= ph; gy += 20) {
      page.drawLine({
        start: { x: 0, y: gy },
        end: { x: pw, y: gy },
        color: gridColor,
        thickness: 0.3,
      })
    }

    // X-axis labels along bottom edge
    for (var lx = 20; lx <= pw; lx += 20) {
      page.drawText(String(lx), {
        x: lx - 4, y: 2, size: 6, color: labelColor,
      })
    }
    // Y-axis labels along left edge
    for (var ly = 20; ly <= ph; ly += 20) {
      page.drawText(String(ly), {
        x: 2, y: ly - 2, size: 6, color: labelColor,
      })
    }

    // Field markers
    var fields = config.FIELD_POSITIONS
    Object.keys(fields).forEach(function (k) {
      var p = fields[k]
      if (!p) return
      var fx = p.x
      var fy = p.y
      var cs = 3

      page.drawLine({ start: { x: fx - cs, y: fy }, end: { x: fx + cs, y: fy }, color: markerColor, thickness: 0.5 })
      page.drawLine({ start: { x: fx, y: fy - cs }, end: { x: fx, y: fy + cs }, color: markerColor, thickness: 0.5 })

      page.drawText(k + ' (' + fx.toFixed(0) + ', ' + fy.toFixed(0) + ')', {
        x: fx + 4, y: fy - 3, size: 7, color: markerColor,
      })
    })
  }

  // ── Draw text fields ───────────────────────────────────────
  config.TEXT_FIELDS.forEach(function (key) {
    var pos = config.FIELD_POSITIONS[key]
    if (!pos) return
    var val = formData[key]
    if (!val) return
    PDFUtils.drawText(page, val, pos.x, pos.y, {
      font: cairoFont,
      size: pos.size || 12,
      maxWidth: pos.maxWidth,
    })
  })

  // ── Embed photo & signature ────────────────────────────────
  config.IMAGE_FIELDS.forEach(function (key) {
    if (!formData[key]) return
    var pos = config.FIELD_POSITIONS[key]
    if (!pos) return
    PDFUtils.drawImage(doc, page, formData[key], pos.x, pos.y, {
      width: pos.width,
      height: pos.height,
      fit: key === 'photo' ? 'cover' : 'contain',
    })
  })

  // Save
  if (typeof PDFUtils !== 'undefined' && PDFUtils.savePDF) {
    var pdfBytes = await PDFUtils.savePDF(doc)
    console.log('[PDF] Document saved (' + pdfBytes.length + ' bytes)')
    return pdfBytes
  }

  return await doc.save()
}

})(typeof window !== 'undefined' ? window : globalThis)
