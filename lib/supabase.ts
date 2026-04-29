import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Room = {
  id: string
  title: string
  image_url: string
  description: string | null
  status: 'active' | 'closed'
  created_at: string
  expires_at: string
}

export type Comment = {
  id: string
  room_id: string
  content: string
  created_at: string
  color: string
  x_position: number
  y_position: number
}
