import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side (anon key, respects RLS)
export const supabase = createClient(url, anon)

// Server-side (service role, bypasses RLS)
export const supabaseAdmin = createClient(url, serviceRole)

export type Tournament = {
  id: string
  name: string
  date: string
  active: boolean
  created_at: string
}

export type CtpHole = {
  id: string
  tournament_id: string
  hole_number: number
  sponsor_name: string | null
  active: boolean
  created_at: string
}

export type Submission = {
  id: string
  tournament_id: string
  hole_id: string
  player_name: string
  gender: 'M' | 'F'
  distance_m: number
  device_id: string
  created_at: string
}

export type Leader = {
  hole_id: string
  gender: 'M' | 'F'
  player_name: string
  distance_m: number
  submission_id: string
  updated_at: string
}
