export interface City {
  id: string
  region_id?: string
  name_ar: string
  name_fr?: string
  name_en?: string
  slug: string
  description?: string
  description_ar?: string
  description_fr?: string
  cover_image?: string
  address?: string
  phone?: string
  email?: string
  facebook?: string
  whatsapp?: string
  published?: boolean
  members: number
  posts: number
  created_at?: string
  updated_at?: string
}

export interface Region {
  id: string
  name_ar: string
  name_fr?: string
  name_en?: string
  slug: string
  description?: string
  description_ar?: string
  description_fr?: string
  cover_image?: string
  display_order?: number
  published?: boolean
  cities?: City[]
  created_at?: string
  updated_at?: string
}

export interface RegionFormData {
  name_ar: string
  name_fr: string
  slug: string
  description_ar: string
  description_fr: string
  cover_image: string
  published: boolean
}

export interface CityFormData {
  name_ar: string
  name_fr: string
  slug: string
  description_ar: string
  description_fr: string
  cover_image: string
  address: string
  phone: string
  email: string
  facebook: string
  whatsapp: string
  published: boolean
}

export function regionToForm(r: Region): RegionFormData {
  return {
    name_ar: r.name_ar || '',
    name_fr: r.name_fr || '',
    slug: r.slug || '',
    description_ar: r.description_ar || r.description || '',
    description_fr: r.description_fr || '',
    cover_image: r.cover_image || '',
    published: r.published !== false,
  }
}

export const EMPTY_REGION_FORM: RegionFormData = {
  name_ar: '',
  name_fr: '',
  slug: '',
  description_ar: '',
  description_fr: '',
  cover_image: '',
  published: true,
}

export const EMPTY_CITY_FORM: CityFormData = {
  name_ar: '',
  name_fr: '',
  slug: '',
  description_ar: '',
  description_fr: '',
  cover_image: '',
  address: '',
  phone: '',
  email: '',
  facebook: '',
  whatsapp: '',
  published: true,
}

export function cityToForm(c: City): CityFormData {
  return {
    name_ar: c.name_ar || '',
    name_fr: c.name_fr || '',
    slug: c.slug || '',
    description_ar: c.description_ar || c.description || '',
    description_fr: c.description_fr || '',
    cover_image: c.cover_image || '',
    address: c.address || '',
    phone: c.phone || '',
    email: c.email || '',
    facebook: c.facebook || '',
    whatsapp: c.whatsapp || '',
    published: c.published !== false,
  }
}

// Keep mock data for reference (not imported by dashboard anymore)
