/**
 * form-handler.js — Form data collection, validation, PDF generation & download
 *
 * Dependencies (loaded globally, in order):
 *   1. pdf-lib CDN              → window.PDFLib
 *   2. @pdf-lib/fontkit CDN      → window.fontkit
 *   3. bidi-js CDN               → window.bidi_js (factory)
 *   4. js/arabic.js              → window.ArabicUtils
 *   5. js/pdf-utils.js           → window.PDFUtils
 *   6. js/pdf-generator.js       → window.generateMembershipPDF
 *
 * This file depends on the HTML form field IDs in join-us-online.html:
 *   firstName, lastName, birthDate, birthPlace, cin,
 *   phone, email, address, photoInput, sigMember
 */

;(function (root) {
  var FormHandler = {}

  // ── Field name mapping: HTML input ID → PDF engine property ──

  var FIELD_MAP = {
    firstName:  'first_name',
    lastName:   'last_name',
    birthDate:  'birth_date',
    birthPlace: 'birth_place',
    cin:        'national_id',
    phone:      'phone',
    email:      'email',
    address:    'address',
  }

  // ── Validation rules ─────────────────────────────────────────

  var VALIDATION_RULES = [
    { key: 'first_name',  label: 'الاسم الشخصي',       required: true },
    { key: 'last_name',   label: 'الاسم العائلي',       required: true },
    { key: 'birth_date',  label: 'تاريخ الازدياد',      required: true },
    { key: 'birth_place', label: 'مكان الازدياد',       required: true },
    { key: 'national_id', label: 'رقم البطاقة الوطنية', required: true },
    { key: 'phone',       label: 'رقم الهاتف',          required: true },
    { key: 'email',       label: 'البريد الإلكتروني',   required: true },
    { key: 'address',     label: 'العنوان',             required: true },
  ]

  // ── Collect data ────────────────────────────────────────────

  FormHandler.collectData = function () {
    var data = {}

    // Read text / date fields
    Object.keys(FIELD_MAP).forEach(function (inputId) {
      var el = root.document.getElementById(inputId)
      data[FIELD_MAP[inputId]] = el ? el.value.trim() : ''
    })

    // Read photo (from <img> preview which holds the dataURL)
    var previewImg = root.document.getElementById('previewImage')
    if (previewImg && previewImg.src && previewImg.src.indexOf('data:') === 0) {
      data.photo = previewImg.src
    }

    // Read signature (from canvas)
    var sigCanvas = root.document.getElementById('sigMember')
    if (sigCanvas) {
      var ctx = sigCanvas.getContext('2d')
      var imageData = ctx.getImageData(0, 0, sigCanvas.width, sigCanvas.height)
      var hasContent = false
      for (var i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] > 10) {
          hasContent = true
          break
        }
      }
      if (hasContent) {
        data.signature = sigCanvas.toDataURL('image/png')
      }
    }

    return data
  }

  // ── Validate ────────────────────────────────────────────────

  FormHandler.validate = function (data) {
    var errors = []

    VALIDATION_RULES.forEach(function (rule) {
      var val = data[rule.key]
      if (!val || val === '') {
        errors.push({
          field: rule.key,
          message: 'حقل "' + rule.label + '" مطلوب',
        })
      }
    })

    if (!data.photo) {
      errors.push({ field: 'photo', message: 'الصورة الشخصية مطلوبة' })
    }

    if (!data.signature) {
      errors.push({ field: 'signature', message: 'التوقيع مطلوب' })
    }

    return errors
  }

  // ── Highlight fields on error ─────────────────────────────

  FormHandler.highlightErrors = function (errors) {
    // Map PDF field keys back to HTML input IDs
    var reverseMap = {}
    Object.keys(FIELD_MAP).forEach(function (inputId) {
      reverseMap[FIELD_MAP[inputId]] = inputId
    })

    errors.forEach(function (err) {
      if (err.field === 'photo') {
        var uploadArea = root.document.getElementById('uploadArea')
        if (uploadArea) uploadArea.style.borderColor = '#E74C3C'
        return
      }
      if (err.field === 'signature') {
        var sigWrap = root.document.querySelector('.m-sig-canvas-wrap')
        if (sigWrap) sigWrap.style.borderColor = '#E74C3C'
        return
      }
      var inputId = reverseMap[err.field]
      if (inputId) {
        var input = root.document.getElementById(inputId)
        if (input) input.classList.add('error')
      }
    })
  }

  FormHandler.clearHighlights = function () {
    root.document.querySelectorAll('.join-input.error').forEach(function (el) {
      el.classList.remove('error')
    })
    var uploadArea = root.document.getElementById('uploadArea')
    if (uploadArea) uploadArea.style.borderColor = ''
    var sigWrap = root.document.querySelector('.m-sig-canvas-wrap')
    if (sigWrap) sigWrap.style.borderColor = ''
  }

  // ── Show error message in UI ──────────────────────────────

  var ERROR_CONTAINER_ID = 'formErrorContainer'

  FormHandler.showErrorMessage = function (message) {
    FormHandler.clearErrorMessage()
    var container = root.document.getElementById(ERROR_CONTAINER_ID)
    if (!container) return
    container.innerHTML =
      '<div class="m-form-error" style="background:#FEF2F2;border:1px solid #FCA5A5;border-radius:16px;padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;gap:12px;font-size:14px;color:#991B1B;font-weight:600;">' +
      '<i class="fas fa-exclamation-circle" style="font-size:18px;color:#EF4444;"></i>' +
      '<span>' + message + '</span>' +
      '</div>'
  }

  FormHandler.clearErrorMessage = function () {
    var container = root.document.getElementById(ERROR_CONTAINER_ID)
    if (container) container.innerHTML = ''
  }

  // ── Generate PDF & download ──────────────────────────────────

  FormHandler.generateAndDownload = async function (data) {
    if (typeof generateMembershipPDF !== 'function') {
      throw new Error('مكتبة إنشاء PDF غير محملة. يرجى التحقق من اتصال الإنترنت.')
    }

    // Add loading text
    var submitBtn = root.document.getElementById('submitBtn')
    var submitText = root.document.getElementById('submitText')
    if (submitBtn) submitBtn.classList.add('loading')
    if (submitText) {
      submitText.innerHTML = '<span class="join-spinner"></span> جارٍ إنشاء ملف الانخراط...'
    }

    try {
      var pdfBytes = await generateMembershipPDF(data)

      var blob = new Blob([pdfBytes], { type: 'application/pdf' })
      var url = URL.createObjectURL(blob)
      var a = root.document.createElement('a')
      a.href = url
      a.download = 'استمارة_الانخراط_' +
        (data.first_name || '') + '_' +
        (data.last_name || '') + '.pdf'
      root.document.body.appendChild(a)
      a.click()
      root.document.body.removeChild(a)

      setTimeout(function () { URL.revokeObjectURL(url) }, 5000)
    } finally {
      if (submitBtn) submitBtn.classList.remove('loading')
      if (submitText) {
        submitText.innerHTML = '<i class="fas fa-file-pdf"></i> إنشاء استمارة الانخراط'
      }
    }
  }

  root.FormHandler = FormHandler
})(typeof window !== 'undefined' ? window : globalThis)
