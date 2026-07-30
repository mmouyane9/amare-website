// Calibrate FIELD_POSITIONS from template content stream
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const PDFLib = require('pdf-lib')
globalThis.PDFLib = PDFLib

;(async function () {
  const rawBytes = new Uint8Array(fs.readFileSync(path.join(__dirname, 'templates/membership-template.pdf')))
  const doc = await PDFLib.PDFDocument.load(rawBytes)
  const ctx = doc.context
  const objects = ctx.enumerateIndirectObjects()
  var contentText = ''

  for (const [ref, obj] of objects) {
    if (!obj || typeof obj !== 'object') continue
    if (obj.constructor && obj.constructor.name === 'PDFRawStream') {
      const len = obj.contents ? obj.contents.length : 0
      if (len > 100 && len < 600000) {
        try {
          const dec = zlib.inflateSync(obj.contents)
          const text = dec.toString('utf8')
          if (text.includes('BT')) {
            contentText = text
            break
          }
        } catch (e) {}
      }
    }
  }

  if (!contentText) { console.error('No content stream found'); process.exit(1) }

  const lines = contentText.split('\n')
  console.log('Content stream: ' + lines.length + ' lines\n')

  // ── Parse all drawing operations ─────────────────────────────
  var ops = []
  var currentLine = ''
  lines.forEach(function (line, idx) {
    var t = line.trim()
    if (!t) return
    currentLine += (currentLine ? ' ' : '') + t
    // Check if line ends with an operator
    var lastToken = t.split(/\s+/).pop()
    var operators = ['BT','ET','Tf','Td','Tm','Tj','TJ','cm','re','m','l','c','v','y','h','S','s','f','f*','F','B','B*','b','b*','W','W*','Q','q','w','J','j','M','d','ri','gs','n','G','g','RG','rg','K','k','cs','CS','sc','SC','scn','SCN','sh','Do','BMC','BDC','EMC','MP','DP']
    if (operators.includes(lastToken)) {
      ops.push({ line: idx, text: currentLine })
      currentLine = ''
    }
  })
  if (currentLine.trim()) ops.push({ line: lines.length, text: currentLine.trim() })

  // ── Extract rectangles ──────────────────────────────────────
  console.log('=== RECTANGLES (re) ===')
  var rects = []
  ops.forEach(function (op) {
    var m = op.text.match(/^([\d.\s-]+)\s+re$/)
    if (m) {
      var parts = m[1].trim().split(/\s+/).map(parseFloat)
      if (parts.length === 4) {
        rects.push({ x: parts[0], y: parts[1], w: parts[2], h: parts[3], line: op.line })
      }
    }
  })
  rects.forEach(function (r) {
    console.log('  L' + r.line + ': rect(' + r.x.toFixed(2) + ', ' + r.y.toFixed(2) + ', ' + r.w.toFixed(2) + ', ' + r.h.toFixed(2) + ')')
  })

  // ── Extract line operations (underlines) ────────────────────
  console.log('\n=== LINE DRAWING (underlines and borders) ===')
  // Look for m/l/S sequences
  var paths = []
  var currentPath = null
  ops.forEach(function (op) {
    var t = op.text
    if (/^[\d.\s-]+\s+m$/.test(t)) {
      currentPath = { type: 'path', start: t.match(/^([\d.\s-]+)\s+m$/)[1].trim().split(/\s+/).map(parseFloat), segments: [], line: op.line }
    } else if (currentPath && /^[\d.\s-]+\s+l$/.test(t)) {
      var pts = t.match(/^([\d.\s-]+)\s+l$/)[1].trim().split(/\s+/).map(parseFloat)
      currentPath.segments.push(pts)
    } else if (currentPath && (t === 'S' || t === 's' || t === 'f' || t === 'f*' || t === 'B' || t === 'b')) {
      currentPath.endOp = t
      paths.push(currentPath)
      currentPath = null
    } else if (t === 'Q') {
      currentPath = null
    } else if (currentPath && t !== 'h') {
      currentPath = null
    }
  })

  // Filter for horizontal lines (likely underlines)
  var underlines = []
  var borders = []
  paths.forEach(function (p) {
    if (p.segments.length === 1) {
      var x1 = p.start[0], y1 = p.start[1]
      var x2 = p.segments[0][0], y2 = p.segments[0][1]
      if (Math.abs(y2 - y1) < 0.5 && Math.abs(x2 - x1) > 10) {
        underlines.push({ x1: x1, x2: x2, y: y1, line: p.line })
      } else {
        borders.push(p)
      }
    } else {
      borders.push(p)
    }
  })

  console.log('Underlines (horizontal lines):')
  underlines.forEach(function (u) {
    console.log('  L' + u.line + ': line(' + u.x1.toFixed(2) + ', ' + u.y.toFixed(2) + ') → (' + u.x2.toFixed(2) + ', ' + u.y.toFixed(2) + ') width=' + (u.x2 - u.x1).toFixed(1))
  })

  // ── Extract Tm positions with font info ─────────────────────
  console.log('\n=== Tm POSITIONS (text matrix) ===')
  var tms = []
  var currentFont = ''
  ops.forEach(function (op) {
    var t = op.text
    var fontMatch = t.match(/^\/(\w+)\s+([\d.]+)\s+Tf$/)
    if (fontMatch) { currentFont = '/' + fontMatch[1]; return }
    var tmMatch = t.match(/^1\s+0\s+0\s+1\s+([\d.]+)\s+([\d.]+)\s+Tm$/)
    if (tmMatch) { tms.push({ x: parseFloat(tmMatch[1]), y: parseFloat(tmMatch[2]), font: currentFont, line: op.line }) }
  })

  tms.forEach(function (tm) {
    console.log('  L' + tm.line + ': Tm(' + tm.x.toFixed(2) + ', ' + tm.y.toFixed(2) + ') ' + tm.font)
  })

  // ── Group by y-coordinate (cluster nearby y values) ─────────
  console.log('\n=== GROUPED BY ROW (y clusters) ===')
  var clusters = []
  var sorted = tms.slice().sort(function (a, b) { return b.y - a.y })
  sorted.forEach(function (tm) {
    var found = false
    for (var i = 0; i < clusters.length; i++) {
      if (Math.abs(clusters[i].y - tm.y) < 5) {
        clusters[i].items.push(tm)
        clusters[i].y = (clusters[i].y + tm.y) / 2
        found = true
        break
      }
    }
    if (!found) clusters.push({ y: tm.y, items: [tm] })
  })

  // Group underlines by row too
  console.log('\n=== FIELD ROWS (Tm + underlines matched) ===')
  clusters.forEach(function (c) {
    if (c.items.length === 0) return
    var matchU = underlines.filter(function (u) { return Math.abs(u.y - c.y) < 10 })
    var matchR = rects.filter(function (r) { return Math.abs(r.y - c.y) < 10 || (r.y <= c.y && r.y + r.h >= c.y) })
    console.log('\n  y≈' + c.y.toFixed(0) + ' (' + c.items.length + ' Tm items):')
    c.items.forEach(function (tm) {
      console.log('    Tx(' + tm.x.toFixed(1) + ') ' + tm.font + ' L' + tm.line)
    })
    matchU.forEach(function (u) {
      console.log('    Underline: x=' + u.x1.toFixed(0) + '→' + u.x2.toFixed(0) + ' at y=' + u.y.toFixed(0))
    })
    matchR.forEach(function (r) {
      console.log('    Rect: (' + r.x.toFixed(0) + ', ' + r.y.toFixed(0) + ', ' + r.w.toFixed(0) + ', ' + r.h.toFixed(0) + ')')
    })
  })

  // ── Look for dash patterns (dotted underlines) ──────────────
  console.log('\n=== DASH PATTERNS ===')
  ops.forEach(function (op) {
    var m = op.text.match(/^\[([\d.\s]+)\]\s+(\d+)\s+d$/)
    if (m) {
      console.log('  L' + op.line + ': d=' + m[0])
    }
  })

  // ── Extract color changes near underlines ───────────────────
  console.log('\n=== STROKE COLORS ===')
  ops.forEach(function (op) {
    var m = op.text.match(/^([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+RG$/)
    if (m) {
      console.log('  L' + op.line + ': RG(' + m[1] + ', ' + m[2] + ', ' + m[3] + ')')
    }
  })

})()
