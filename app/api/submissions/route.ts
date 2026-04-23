import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

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

  // Upsert: same device can update their submission for this hole+gender
  const { data, error } = await supabaseAdmin
    .from('submissions')
    .upsert(
      { tournament_id, hole_id, player_name, gender, distance_m, device_id },
      { onConflict: 'hole_id,gender,device_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
