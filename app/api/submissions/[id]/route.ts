import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSession } from '@/lib/session'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session.isTD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Get hole_id + gender before deleting so we can recalculate leader
  const { data: sub } = await supabaseAdmin
    .from('submissions')
    .select('hole_id, gender')
    .eq('id', id)
    .single()

  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabaseAdmin.from('submissions').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Recalculate leader for this hole + gender
  const { data: best } = await supabaseAdmin
    .from('submissions')
    .select('id, player_name, distance_m')
    .eq('hole_id', sub.hole_id)
    .eq('gender', sub.gender)
    .order('distance_m', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (best) {
    await supabaseAdmin.from('leaders').upsert({
      hole_id: sub.hole_id,
      gender: sub.gender,
      player_name: best.player_name,
      distance_m: best.distance_m,
      submission_id: best.id,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'hole_id,gender' })
  } else {
    // No submissions left for this hole+gender — remove leader entry
    await supabaseAdmin.from('leaders')
      .delete()
      .eq('hole_id', sub.hole_id)
      .eq('gender', sub.gender)
  }

  return NextResponse.json({ ok: true })
}
