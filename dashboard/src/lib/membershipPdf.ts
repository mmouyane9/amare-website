import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import type { Member } from '@/services/members.service'

const TEMPLATE_PATH = '/Amare%20files%20/%D8%A7%D8%B3%D8%AA%D9%85%D8%A7%D8%B1%D8%A9%20%20%D8%A7%D9%84%D8%A7%D9%86%D8%AE%D8%B1%D8%A7%D8%B7%202026%20%20.pdf'

function isArabic(str: string): boolean {
  return /[\u0600-\u06FF]/.test(str)
}

function reverseArabic(str: string): string {
  if (!isArabic(str)) return str
  let result = ''
  let segment = ''
  for (let i = str.length - 1; i >= 0; i--) {
    const ch = str.charAt(i)
    if (isArabic(ch) || ch === ' ') {
      segment = ch + segment
    } else {
      result = segment + result
      segment = ch
    }
  }
  return segment + result
}

const FIELD_POSITIONS: Record<string, { x: number; y: number; size: number }> = {
  firstName: { x: 50, y: 720, size: 14 },
  lastName: { x: 50, y: 690, size: 14 },
  birthDate: { x: 50, y: 660, size: 14 },
  birthPlace: { x: 50, y: 630, size: 14 },
  cin: { x: 50, y: 590, size: 14 },
  phone: { x: 50, y: 560, size: 14 },
  email: { x: 50, y: 530, size: 14 },
  address: { x: 50, y: 480, size: 12 },
  photo: { x: 420, y: 640, width: 120, height: 150 },
}

export async function generateMembershipPdfBlob(member: Member): Promise<Blob> {
  const doc = await PDFDocument.create()

  const font = await doc.embedFont(StandardFonts.Helvetica)

  // Load and embed template
  const templateResponse = await fetch(TEMPLATE_PATH)
  if (!templateResponse.ok) throw new Error('Failed to load PDF template')
  const templateBytes = await templateResponse.arrayBuffer()
  const templateDoc = await PDFDocument.load(templateBytes)
  const [templatePage] = await doc.copyPages(templateDoc, [0])
  const page = doc.addPage(templatePage)

  // Draw text fields
  const fields: Record<string, string | null> = {
    firstName: member.first_name,
    lastName: member.last_name,
    birthDate: member.birth_date ? member.birth_date.split('T')[0] : null,
    birthPlace: member.birth_place,
    cin: member.national_id,
    phone: member.phone,
    email: member.email,
    address: member.address,
  }

  for (const [key, value] of Object.entries(fields)) {
    const pos = FIELD_POSITIONS[key]
    if (!pos || !value) continue
    const text = isArabic(value) ? reverseArabic(value) : value
    page.drawText(text, {
      x: pos.x,
      y: pos.y,
      size: pos.size,
      font,
      color: rgb(0, 0, 0),
    })
  }

  // Embed photo if available
  if (member.profile_photo_url) {
    try {
      const photoResponse = await fetch(member.profile_photo_url)
      if (photoResponse.ok) {
        const photoBytes = await photoResponse.arrayBuffer()
        let image
        if (member.profile_photo_url.endsWith('.png')) {
          image = await doc.embedPng(photoBytes)
        } else {
          image = await doc.embedJpg(photoBytes)
        }
        const pp = FIELD_POSITIONS.photo
        page.drawImage(image, {
          x: pp.x,
          y: pp.y,
          width: (pp as any).width || 120,
          height: (pp as any).height || 150,
        })
      }
    } catch {
      // Photo load failure is non-fatal
    }
  }

  const pdfBytes = await doc.save()
  return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' })
}

export function downloadPdf(blob: Blob, memberNumber: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `AMARE-${memberNumber}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
