'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Tournament = { id: string; name: string; date: string; active: boolean }
type Hole = { id: string; hole_number: number; sponsor_name: string | null; active: boolean }

export default function ManageTournament({ params }: { params: Promise<{ id: string }> }) {
  const [tournamentId, setTournamentId] = useState('')
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [holes, setHoles] = useState<Hole[]>([])
  const [loading, setLoading] = useState(true)
  const [newHole, setNewHole] = useState({ hole_number: '', sponsor_name: '' })
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setTournamentId(id)
      loadData(id)
    })
  }, [params])

  async function loadData(id: string) {
    const res = await fetch(`/api/tournaments/${id}`)
    if (res.ok) {
      const data = await res.json()
      setTournament(data)
      setHoles((data.ctp_holes ?? []).sort((a: Hole, b: Hole) => a.hole_number - b.hole_number))
    }
    setLoading(false)
  }

  async function toggleTournamentActive() {
    if (!tournament) return
    const res = await fetch(`/api/tournaments/${tournamentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !tournament.active }),
    })
    if (res.ok) setTournament({ ...tournament, active: !tournament.active })
  }

  async function toggleHole(hole: Hole) {
    setSaving(hole.id)
    const res = await fetch(`/api/holes/${hole.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !hole.active }),
    })
    if (res.ok) setHoles(holes.map(h => h.id === hole.id ? { ...h, active: !h.active } : h))
    setSaving(null)
  }

  async function updateSponsor(hole: Hole, sponsor: string) {
    setSaving(hole.id)
    const res = await fetch(`/api/holes/${hole.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sponsor_name: sponsor.trim() || null }),
    })
    if (res.ok) setHoles(holes.map(h => h.id === hole.id ? { ...h, sponsor_name: sponsor.trim() || null } : h))
    setSaving(null)
  }

  async function deleteHole(id: string) {
    await fetch(`/api/holes/${id}`, { method: 'DELETE' })
    setHoles(holes.filter(h => h.id !== id))
  }

  async function addHole(e: React.FormEvent) {
    e.preventDefault()
    const num = parseInt(newHole.hole_number)
    if (isNaN(num) || num < 1) return
    setAdding(true)

    const res = await fetch('/api/holes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tournament_id: tournamentId,
        hole_number: num,
        sponsor_name: newHole.sponsor_name.trim() || null,
      }),
    })

    if (res.ok) {
      const hole = await res.json()
      setHoles([...holes, hole].sort((a, b) => a.hole_number - b.hole_number))
      setNewHole({ hole_number: '', sponsor_name: '' })
    }
    setAdding(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>
  if (!tournament) return <div className="flex items-center justify-center min-h-screen text-gray-400">Tournament not found.</div>

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/t/${tournamentId}` : ''

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/td/dashboard" className="text-gray-400 hover:text-white text-sm">← Back</Link>
        <div className="flex items-start justify-between mt-3">
          <div>
            <h1 className="text-2xl font-bold">{tournament.name}</h1>
            <p className="text-gray-400 text-sm mt-1">{new Date(tournament.date).toLocaleDateString('et-EE')}</p>
          </div>
          <button
            onClick={toggleTournamentActive}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tournament.active
                ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60 border border-red-800'
                : 'bg-green-900/40 text-green-400 hover:bg-green-900/60 border border-green-800'
            }`}
          >
            {tournament.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
        {shareUrl && (
          <div className="mt-4 flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5">
            <span className="text-gray-400 text-sm flex-1 truncate">{shareUrl}</span>
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="text-xs text-green-400 hover:text-green-300 font-medium shrink-0"
            >
              Copy link
            </button>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">CTP Baskets</h2>
        <div className="space-y-2">
          {holes.map(hole => (
            <HoleRow
              key={hole.id}
              hole={hole}
              saving={saving === hole.id}
              onToggle={() => toggleHole(hole)}
              onSponsorSave={(s) => updateSponsor(hole, s)}
              onDelete={() => deleteHole(hole.id)}
            />
          ))}
        </div>
      </div>

      <form onSubmit={addHole} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-300 mb-3">Add basket</p>
        <div className="flex gap-3">
          <input
            type="number"
            min="1"
            max="18"
            value={newHole.hole_number}
            onChange={e => setNewHole({ ...newHole, hole_number: e.target.value })}
            placeholder="Basket #"
            className="w-28 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500"
          />
          <input
            type="text"
            value={newHole.sponsor_name}
            onChange={e => setNewHole({ ...newHole, sponsor_name: e.target.value })}
            placeholder="Sponsor (optional)"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 rounded-lg text-sm font-semibold transition-colors"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  )
}

function HoleRow({ hole, saving, onToggle, onSponsorSave, onDelete }: {
  hole: Hole
  saving: boolean
  onToggle: () => void
  onSponsorSave: (s: string) => void
  onDelete: () => void
}) {
  const [editingSponsor, setEditingSponsor] = useState(false)
  const [sponsor, setSponsor] = useState(hole.sponsor_name ?? '')

  return (
    <div className={`bg-gray-900 border rounded-xl p-4 flex items-center gap-4 ${hole.active ? 'border-gray-800' : 'border-gray-800 opacity-50'}`}>
      <div className="w-16 text-center">
        <span className="font-bold text-lg">#{hole.hole_number}</span>
      </div>
      <div className="flex-1">
        {editingSponsor ? (
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              value={sponsor}
              onChange={e => setSponsor(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-green-500"
            />
            <button
              onClick={() => { onSponsorSave(sponsor); setEditingSponsor(false) }}
              disabled={saving}
              className="text-xs text-green-400 hover:text-green-300 font-medium"
            >
              Save
            </button>
            <button onClick={() => setEditingSponsor(false)} className="text-xs text-gray-500 hover:text-gray-300">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditingSponsor(true)} className="text-sm text-left text-gray-300 hover:text-white">
            {hole.sponsor_name ? (
              <span className="text-yellow-400">{hole.sponsor_name}</span>
            ) : (
              <span className="text-gray-600 italic">No sponsor</span>
            )}{' '}
            <span className="text-gray-600 text-xs">(edit)</span>
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          disabled={saving}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
            hole.active
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          {hole.active ? 'Active' : 'Inactive'}
        </button>
        <button onClick={onDelete} className="text-gray-600 hover:text-red-400 text-lg leading-none px-1">×</button>
      </div>
    </div>
  )
}
