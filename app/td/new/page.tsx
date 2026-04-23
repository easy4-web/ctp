'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

type HoleDraft = { hole_number: number; sponsor_name: string }

export default function NewTournament() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [holes, setHoles] = useState<HoleDraft[]>([{ hole_number: 1, sponsor_name: '' }])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function addHole() {
    const next = Math.max(...holes.map(h => h.hole_number), 0) + 1
    setHoles([...holes, { hole_number: next, sponsor_name: '' }])
  }

  function removeHole(index: number) {
    setHoles(holes.filter((_, i) => i !== index))
  }

  function updateHole(index: number, field: keyof HoleDraft, value: string | number) {
    setHoles(holes.map((h, i) => i === index ? { ...h, [field]: value } : h))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !date) { setError('Name and date are required.'); return }
    if (holes.length === 0) { setError('Add at least one CTP basket.'); return }
    const nums = holes.map(h => h.hole_number)
    if (new Set(nums).size !== nums.length) { setError('Duplicate basket numbers.'); return }

    setSaving(true)
    const tRes = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), date }),
    })
    if (!tRes.ok) { setError('Failed to create tournament.'); setSaving(false); return }

    const tournament = await tRes.json()
    await Promise.all(holes.map(h =>
      fetch('/api/holes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournament_id: tournament.id, hole_number: h.hole_number, sponsor_name: h.sponsor_name.trim() || null }),
      })
    ))
    router.push(`/td/${tournament.id}`)
  }

  const inputStyle = { background: '#191919', border: '1px solid #2a2a2a' }

  return (
    <div className="min-h-screen" style={{ background: '#0f0f0f' }}>
      <header className="border-b px-6 py-4 flex items-center gap-4" style={{ borderColor: '#2a2a2a' }}>
        <Image src="/easy4-logo-white.png" alt="Easy4" width={80} height={30} className="object-contain" />
        <div className="w-px h-6 bg-gray-700" />
        <Link href="/td/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">← Back</Link>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mt-2 mb-8">New Tournament</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Tournament name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Tartu Open 2025"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none"
                style={inputStyle} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-white outline-none"
                style={inputStyle} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-400">CTP Baskets</label>
              <button type="button" onClick={addHole}
                className="text-sm font-semibold transition-opacity hover:opacity-80"
                style={{ color: '#F5A423' }}>
                + Add basket
              </button>
            </div>
            <div className="space-y-2">
              {holes.map((h, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <input type="number" min="1" max="99" value={h.hole_number}
                    onChange={e => updateHole(i, 'hole_number', parseInt(e.target.value))}
                    placeholder="#"
                    className="w-20 rounded-xl px-3 py-2.5 text-white text-sm outline-none text-center"
                    style={inputStyle} />
                  <input type="text" value={h.sponsor_name}
                    onChange={e => updateHole(i, 'sponsor_name', e.target.value)}
                    placeholder="Sponsor name (optional)"
                    className="flex-1 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 outline-none"
                    style={inputStyle} />
                  <button type="button" onClick={() => removeHole(i)}
                    className="text-gray-600 hover:text-red-400 text-xl leading-none px-1 transition-colors">×</button>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={saving}
            className="w-full py-3.5 rounded-xl font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: '#F5A423' }}>
            {saving ? 'Creating...' : 'Create tournament'}
          </button>
        </form>
      </main>
    </div>
  )
}
