// Extract precise field positions - look at actual TJ operations near field rows
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
          if (text.includes('BT')) { contentText = text; break }
        } catch (e) {}
      }
    }
  }

  // Extract ALL operations in bounds of field rows (y=600 to y=800) and middle section
  const lines = contentText.split('\n')

  // Find field rows: look for Tm near y=746, 733, 719, 705, 691, 678, 664
  var fieldYs = [746.5, 732.7, 718.9, 705.1, 691.3, 677.5, 663.7]

  // For each field y, find the corresponding text operations  
  console.log('=== FIELD ROW DETAILS ===')
  fieldYs.forEach(function (fy) {
    console.log('\n--- y≈' + fy + ' ---')
    var inBlock = false
    var currentFont = ''
    var currentTmX = 0
    var currentTmY = 0
    var startLine = 0

    lines.forEach(function (line, idx) {
      var t = line.trim()
      if (t === 'BT') { inBlock = true; return }
      if (t === 'ET') { inBlock = false; currentFont = ''; return }
      if (!inBlock) return

      var fontMatch = t.match(/^\/(\w+)\s+([\d.]+)\s+Tf$/)
      if (fontMatch) { currentFont = '/' + fontMatch[1]; return }

      var tmMatch = t.match(/^1\s+0\s+0\s+1\s+([\d.]+)\s+([\d.]+)\s+Tm$/)
      if (tmMatch) {
        currentTmX = parseFloat(tmMatch[1])
        currentTmY = parseFloat(tmMatch[2])
        return
      }

      if (Math.abs(currentTmY - fy) < 5) {
        // Show everything in this BT block near this y
        if (t.startsWith('(') || t.startsWith('[')) {
          console.log('  L' + idx + ': ' + t.slice(0, 80))
        }
      }
    })
  })

  // Middle section boxes
  console.log('\n=== MIDDLE SECTION BOXES ===')
  var midBoxes = [
    { name: 'middle row 1 left', y: 578.59, x: 17.04 },
    { name: 'middle row 1 right', y: 578.11, x: 305.93 },
    { name: 'middle row 2 left', y: 507.07, x: 17.04 },
    { name: 'middle row 2 right', y: 506.71, x: 308.45 },
    { name: 'middle row 3 left (address)', y: 436.25, x: 17.04 },
    { name: 'middle row 3 right', y: 435.89, x: 308.45 },
  ]

  midBoxes.forEach(function (box) {
    console.log('\n--- ' + box.name + ' (y≈' + box.y + ') ---')
    var inBlock = false
    var currentFont = ''
    var currentTmX = 0
    var currentTmY = 0

    lines.forEach(function (line, idx) {
      var t = line.trim()
      if (t === 'BT') { inBlock = true; return }
      if (t === 'ET') { inBlock = false; currentFont = ''; return }
      if (!inBlock) return

      var fontMatch = t.match(/^\/(\w+)\s+([\d.]+)\s+Tf$/)
      if (fontMatch) { currentFont = '/' + fontMatch[1]; return }

      var tmMatch = t.match(/^1\s+0\s+0\s+1\s+([\d.]+)\s+([\d.]+)\s+Tm$/)
      if (tmMatch) {
        currentTmX = parseFloat(tmMatch[1])
        currentTmY = parseFloat(tmMatch[2])
        return
      }

      if (Math.abs(currentTmY - box.y) < 5 && (t.startsWith('(') || t.startsWith('['))) {
        console.log('  L' + idx + ': ' + t.slice(0, 80))
      }
    })
  })

  // Photo/signature section
  console.log('\n=== PHOTO/SIGNATURE SECTION ===')
  var photoY = [377.45, 363.65, 349.85, 336.05, 321.77]
  photoY.forEach(function (py) {
    console.log('\n--- y≈' + py + ' ---')
    var inBlock = false
    var currentFont = ''
    var currentTmX = 0
    var currentTmY = 0

    lines.forEach(function (line, idx) {
      var t = line.trim()
      if (t === 'BT') { inBlock = true; return }
      if (t === 'ET') { inBlock = false; currentFont = ''; return }
      if (!inBlock) return

      var fontMatch = t.match(/^\/(\w+)\s+([\d.]+)\s+Tf$/)
      if (fontMatch) { currentFont = '/' + fontMatch[1]; return }

      var tmMatch = t.match(/^1\s+0\s+0\s+1\s+([\d.]+)\s+([\d.]+)\s+Tm$/)
      if (tmMatch) {
        currentTmX = parseFloat(tmMatch[1])
        currentTmY = parseFloat(tmMatch[2])
        return
      }

      if (Math.abs(currentTmY - py) < 5 && (t.startsWith('(') || t.startsWith('['))) {
        console.log('  L' + idx + ': ' + t.slice(0, 100))
      }
    })
  })

  // Also check for any dot patterns near field rows
  console.log('\n=== SEARCHING FOR DOT UNDERLINES ===')
  var dotPattern = /\.{5,}/
  lines.forEach(function (line, idx) {
    if (dotPattern.test(line)) {
      var t = line.trim()
      if (t.length > 10) {
        console.log('  L' + idx + ': ' + t.slice(0, 120))
      }
    }
  })

  // Look for small rectangles near field rows (possible input boxes)
  console.log('\n=== SMALL RECTS NEAR FIELD ROWS ===')
  var smallRects = []
  lines.forEach(function (line, idx) {
    var m = line.trim().match(/^([\d.\s]+)\s+re$/)
    if (m) {
      var parts = m[1].trim().split(/\s+/).map(parseFloat)
      if (parts.length === 4 && parts[2] > 20 && parts[3] > 10 && parts[3] < 50) {
        var yCenter = parts[1] + parts[3] / 2
        for (var fi = 0; fi < fieldYs.length; fi++) {
          if (Math.abs(yCenter - fieldYs[fi]) < 20 || Math.abs(parts[1] - fieldYs[fi]) < 20) {
            smallRects.push({ x: parts[0], y: parts[1], w: parts[2], h: parts[3], fieldY: fieldYs[fi], line: idx })
            break
          }
        }
      }
    }
  })
  smallRects.forEach(function (r) {
    console.log('  L' + r.line + ': rect(' + r.x.toFixed(1) + ', ' + r.y.toFixed(1) + ', ' + r.w.toFixed(1) + ', ' + r.h.toFixed(1) + ') near y=' + r.fieldY)
  })

  // Also look for line-drawn rectangles in the field rows using paint operations
  // Check for light blue background rectangles
  console.log('\n=== BACKGROUND RECTS ===')
  lines.forEach(function (line, idx) {
    var t = line.trim()
    if (t.includes('re') && t.length < 60) {
      var m2 = t.match(/^([\d.\s]+)\s+re$/)
      if (m2) {
        var parts = m2[1].trim().split(/\s+/).map(parseFloat)
        if (parts.length === 4 && parts[3] > 10) {
          console.log('  L' + idx + ': rect(' + parts[0].toFixed(1) + ', ' + parts[1].toFixed(1) + ', ' + parts[2].toFixed(1) + ', ' + parts[3].toFixed(1) + ')')
        }
      }
    }
  })

})()
