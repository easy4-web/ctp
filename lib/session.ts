import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export interface SessionData {
  isTD: boolean
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'ctp_td',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions)
}

export async function requireTD() {
  const session = await getSession()
  if (!session.isTD) redirect('/td')
  return session
}
