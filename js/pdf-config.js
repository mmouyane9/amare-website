/**
 * pdf-config.js — Central configuration for PDF field positions
 *
 * All field coordinates live here. The generator reads from PDFConfig.FIELD_POSITIONS.
 * Set PDFConfig.CALIBRATION_MODE = true to draw a coordinate grid + field debug info.
 *
 * Helper functions for interactive calibration:
 *   PDFConfig.moveField(name, dx, dy)
 *   PDFConfig.resizeField(name, width, height)
 *   PDFConfig.resetField(name)
 */

;(function (root) {
  // ── Toggle calibration mode ─────────────────────────────────
  // Set to true to draw coordinate grid + field debug markers on the PDF
  var CALIBRATION_MODE = false

  // ── Default field positions (origin bottom-left, A4 = 595.32 × 841.92 pts) ──
  // Tm positions from template content stream:
  // Rows y ≈ 746 → 663 (7 rows, spacing ~14 pt)
  // Photo/signature section y ≈ 306–388
  // Address box at y ≈ 436 (middle section)

  var DEFAULT_POSITIONS = {
    first_name:  { x: 60,  y: 746.5, size: 12 },
    last_name:   { x: 60,  y: 732.7, size: 12 },
    birth_date:  { x: 135, y: 718.9, size: 12 },
    birth_place: { x: 60,  y: 705.1, size: 12 },
    national_id: { x: 60,  y: 691.3, size: 12 },
    phone:       { x: 60,  y: 677.5, size: 12 },
    email:       { x: 60,  y: 663.7, size: 12 },
    address:     { x: 25,  y: 436.0, size: 10, maxWidth: 180 },
    photo:       { x: 380, y: 340,   width: 85, height: 40 },
    signature:   { x: 380, y: 310,   width: 85, height: 30 },
  }

  // Live positions (initialised from defaults, may be tweaked at runtime)
  var FIELD_POSITIONS = {}
  resetAllFields()

  // ── Helper: define text-field keys for iteration ────────────
  var TEXT_FIELDS = [
    'first_name', 'last_name', 'birth_date', 'birth_place',
    'national_id', 'phone', 'email', 'address',
  ]

  var IMAGE_FIELDS = ['photo', 'signature']

  // ── Public API ──────────────────────────────────────────────

  var PDFConfig = {}

  Object.defineProperty(PDFConfig, 'CALIBRATION_MODE', {
    get: function () { return CALIBRATION_MODE },
    set: function (v) { CALIBRATION_MODE = !!v },
  })

  Object.defineProperty(PDFConfig, 'FIELD_POSITIONS', {
    get: function () { return FIELD_POSITIONS },
  })

  Object.defineProperty(PDFConfig, 'TEXT_FIELDS', {
    get: function () { return TEXT_FIELDS },
  })

  Object.defineProperty(PDFConfig, 'IMAGE_FIELDS', {
    get: function () { return IMAGE_FIELDS },
  })

  // ── Reset ──────────────────────────────────────────────────

  function resetAllFields() {
    Object.keys(DEFAULT_POSITIONS).forEach(function (k) {
      FIELD_POSITIONS[k] = {}
      copyProps(FIELD_POSITIONS[k], DEFAULT_POSITIONS[k])
    })
  }

  function copyProps(target, source) {
    Object.keys(source).forEach(function (k) {
      target[k] = source[k]
    })
  }

  PDFConfig.resetField = function (name) {
    if (name && DEFAULT_POSITIONS[name]) {
      copyProps(FIELD_POSITIONS[name], DEFAULT_POSITIONS[name])
    } else if (!name) {
      resetAllFields()
    }
  }

  // ── Move field ──────────────────────────────────────────────

  PDFConfig.moveField = function (name, dx, dy) {
    var pos = FIELD_POSITIONS[name]
    if (!pos) return
    if (dx != null) pos.x = (pos.x || 0) + dx
    if (dy != null) pos.y = (pos.y || 0) + dy
  }

  // ── Resize field ────────────────────────────────────────────

  PDFConfig.resizeField = function (name, width, height) {
    var pos = FIELD_POSITIONS[name]
    if (!pos) return
    if (width != null) pos.width = width
    if (height != null) pos.height = height
    if (width != null) pos.maxWidth = width
  }

  // ── Get default ─────────────────────────────────────────────

  PDFConfig.getDefault = function (name) {
    return DEFAULT_POSITIONS[name] || null
  }

  // ── Export ──────────────────────────────────────────────────

  root.PDFConfig = PDFConfig
})(typeof window !== 'undefined' ? window : globalThis)
