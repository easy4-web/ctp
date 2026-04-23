'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

    const holeNumbers = holes.map(h => h.hole_number)
    if (new Set(holeNumbers).size !== holeNumbers.length) { setError('Duplicate basket numbers.'); return }

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
        body: JSON.stringify({
          tournament_id: tournament.id,
          hole_number: h.hole_number,
          sponsor_name: h.sponsor_name.trim() || null,
        }),
      })
    ))

    router.push(`/td/${tournament.id}`)
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/td/dashboard" className="text-gray-400 hover:text-white text-sm">← Back</Link>
        <h1 className="text-2xl font-bold mt-3">New Tournament</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Tournament name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Tartu Open 2025"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-300">CTP Baskets</label>
            <button type="button" onClick={addHole} className="text-sm text-green-400 hover:text-green-300">+ Add basket</button>
          </div>
          <div className="space-y-2">
            {holes.map((h, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-28">
                  <input
                    type="number"
                    min="1"
                    max="18"
                    value={h.hole_number}
                    onChange={e => updateHole(i, 'hole_number', parseInt(e.target.value))}
                    placeholder="Basket #"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-green-500"
                  />
                </div>
                <input
                  type="text"
                  value={h.sponsor_name}
                  onChange={e => updateHole(i, 'sponsor_name', e.target.value)}
                  placeholder="Sponsor name (optional)"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
                <button
                  type="button"
                  onClick={() => removeHole(i)}
                  className="text-gray-600 hover:text-red-400 text-lg leading-none px-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-semibold transition-colors"
        >
          {saving ? 'Creating...' : 'Create tournament'}
        </button>
      </form>
    </div>
  )
}
