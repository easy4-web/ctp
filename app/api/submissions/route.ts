import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session.isTD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tournamentId = req.nextUrl.searchParams.get('tournament_id')
  if (!tournamentId) return NextResponse.json({ error: 'Missing tournament_id' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('submissions')
    .select('*, ctp_holes(hole_number, sponsor_name)')
    .eq('tournament_id', tournamentId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { tournament_id, hole_id, player_name, gender, distance_m, device_id } = await req.json()

  if (!tournament_id || !hole_id || !player_name || !gender || distance_m == null || !device_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  if (!['M', 'F'].includes(gender)) {
    return NextResponse.json({ error: 'Invalid gender' }, { status: 400 })
  }
  if (distance_m <= 0) {
    return NextResponse.json({ error: 'Distance must be positive' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('submissions')
    .insert({ tournament_id, hole_id, player_name, gender, distance_m, device_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
