import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password !== process.env.TD_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const session = await getSession()
  session.isTD = true
  await session.save()

  return NextResponse.json({ ok: true })
}
