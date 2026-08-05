export interface HeroUpdate {
  id: string
  created_at: string
  updated_at: string
  title: string
  banner_text: string
  description: string
  image_url: string
  button1_text: string
  button1_url: string
  button2_text: string
  button2_url: string
  button3_text: string
  button3_url: string
  status: 'live' | 'draft'
  display_order: number
  created_by: string | null
}

export interface HeroUpdateCreateInput {
  title: string
  banner_text: string
  description: string
  image_url: string
  button1_text: string
  button1_url: string
  button2_text: string
  button2_url: string
  button3_text: string
  button3_url: string
  status: 'live' | 'draft'
  display_order?: number
}
