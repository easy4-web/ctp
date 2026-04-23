'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function TDLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/td/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/td/dashboard')
    } else {
      setError('Invalid password.')
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6" style={{ background: '#0f0f0f' }}>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-10">
          <Image src="/easy4-logo-white.png" alt="Easy4" width={120} height={45} className="object-contain" />
        </div>
        <h1 className="text-xl font-bold mb-1">Tournament Director</h1>
        <p className="text-gray-500 text-sm mb-8">Enter your password to continue.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all"
            style={{ background: '#191919', border: '1px solid #2a2a2a' }}
            onFocus={e => e.target.style.borderColor = '#F5A423'}
            onBlur={e => e.target.style.borderColor = '#2a2a2a'}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: '#F5A423' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
