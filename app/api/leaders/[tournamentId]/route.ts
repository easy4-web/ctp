import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(_: NextRequest, { params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params

  const { data: holes } = await supabaseAdmin
    .from('ctp_holes')
    .select('id')
    .eq('tournament_id', tournamentId)

  if (!holes?.length) return NextResponse.json([])

  const { data, error } = await supabaseAdmin
    .from('leaders')
    .select('*')
    .in('hole_id', holes.map(h => h.id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
