import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSession } from '@/lib/session'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isTD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, date } = await req.json()
  if (!name || !date) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('tournaments')
    .insert({ name, date })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
