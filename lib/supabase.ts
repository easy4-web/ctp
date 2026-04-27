import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Safe to use in client and server components
export const supabase = createClient(url, anon)

export type Tournament = {
  id: string
  name: string
  date: string
  active: boolean
  created_at: string
}

export type CategoryMode = 'gendered' | 'open' | 'men_only' | 'women_only'

export type CtpHole = {
  id: string
  tournament_id: string
  hole_number: number
  sponsor_name: string | null
  active: boolean
  category_mode: CategoryMode
  created_at: string
}

export type Submission = {
  id: string
  tournament_id: string
  hole_id: string
  player_name: string
  gender: 'M' | 'F' | 'O'  // O = Open (no category)
  distance_m: number
  device_id: string
  created_at: string
}

export type Leader = {
  hole_id: string
  gender: 'M' | 'F' | 'O'  // O = Open
  player_name: string
  distance_m: number
  submission_id: string
  updated_at: string
}
