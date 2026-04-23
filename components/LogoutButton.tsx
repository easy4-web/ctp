'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/td/logout', { method: 'POST' })
    router.push('/td')
  }

  return (
    <button onClick={handleLogout}
      className="px-4 py-2 text-sm rounded-lg transition-colors text-gray-400 hover:text-white"
      style={{ background: '#191919', border: '1px solid #2a2a2a' }}>
      Logout
    </button>
  )
}
