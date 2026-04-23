'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/td/logout', { method: 'POST' })
    router.push('/td')
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm border border-gray-700 hover:border-gray-500 rounded-lg transition-colors text-gray-400 hover:text-white"
    >
      Logout
    </button>
  )
}
