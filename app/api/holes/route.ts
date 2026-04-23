import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isTD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tournament_id, hole_number, sponsor_name } = await req.json()
  if (!tournament_id || !hole_number) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('ctp_holes')
    .insert({ tournament_id, hole_number, sponsor_name })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
