'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
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
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    params.then(({ id }) => { setTournamentId(id); loadData(id) })
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
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !tournament.active }),
    })
    if (res.ok) setTournament({ ...tournament, active: !tournament.active })
  }

  async function toggleHole(hole: Hole) {
    setSaving(hole.id)
    const res = await fetch(`/api/holes/${hole.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !hole.active }),
    })
    if (res.ok) setHoles(holes.map(h => h.id === hole.id ? { ...h, active: !h.active } : h))
    setSaving(null)
  }

  async function updateSponsor(hole: Hole, sponsor: string) {
    setSaving(hole.id)
    const res = await fetch(`/api/holes/${hole.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tournament_id: tournamentId, hole_number: num, sponsor_name: newHole.sponsor_name.trim() || null }),
    })
    if (res.ok) {
      const hole = await res.json()
      setHoles([...holes, hole].sort((a, b) => a.hole_number - b.hole_number))
      setNewHole({ hole_number: '', sponsor_name: '' })
    }
    setAdding(false)
  }

  function copyLink() {
    const url = `${window.location.origin}/t/${tournamentId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading...</div>
  if (!tournament) return <div className="flex items-center justify-center min-h-screen text-gray-500">Not found.</div>

  const inputStyle = { background: '#191919', border: '1px solid #2a2a2a' }
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/t/${tournamentId}` : ''

  return (
    <div className="min-h-screen" style={{ background: '#0f0f0f' }}>
      <header className="border-b px-6 py-4 flex items-center gap-4" style={{ borderColor: '#2a2a2a' }}>
        <Image src="/easy4-logo-white.png" alt="Easy4" width={80} height={30} className="object-contain" />
        <div className="w-px h-6 bg-gray-700" />
        <Link href="/td/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">← Tournaments</Link>
      </header>

      <main className="p-6 max-w-3xl mx-auto">
        <div className="flex items-start justify-between mt-2 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{tournament.name}</h1>
            <Link href={`/td/${tournamentId}/entries`}
              className="text-xs font-medium mt-1 inline-block transition-colors hover:opacity-80"
              style={{ color: '#F5A423' }}>
              View all entries →
            </Link>
            <p className="text-gray-500 text-sm mt-1">{new Date(tournament.date).toLocaleDateString('et-EE')}</p>
          </div>
          <button onClick={toggleTournamentActive}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={tournament.active
              ? { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }
              : { background: 'rgba(245,164,35,0.1)', color: '#F5A423', border: '1px solid rgba(245,164,35,0.3)' }}>
            {tournament.active ? 'Deactivate' : 'Activate'}
          </button>
        </div>

        {/* Share link */}
        {shareUrl && (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-8" style={{ background: '#191919', border: '1px solid #2a2a2a' }}>
            <span className="text-gray-500 text-sm flex-1 truncate">{shareUrl}</span>
            <button onClick={copyLink}
              className="text-xs font-semibold shrink-0 transition-colors"
              style={{ color: copied ? '#4ade80' : '#F5A423' }}>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        )}

        {/* Holes */}
        <p className="text-xs text-gray-600 uppercase tracking-widest mb-3 font-medium">CTP Baskets</p>
        <div className="space-y-2 mb-6">
          {holes.map(hole => (
            <HoleRow key={hole.id} hole={hole} saving={saving === hole.id}
              onToggle={() => toggleHole(hole)}
              onSponsorSave={s => updateSponsor(hole, s)}
              onDelete={() => deleteHole(hole.id)} />
          ))}
        </div>

        {/* Add hole form */}
        <form onSubmit={addHole} className="rounded-2xl p-4 border" style={{ background: '#191919', borderColor: '#2a2a2a' }}>
          <p className="text-sm font-medium text-gray-400 mb-3">Add basket</p>
          <div className="flex gap-3">
            <input type="number" min="1" max="99" value={newHole.hole_number}
              onChange={e => setNewHole({ ...newHole, hole_number: e.target.value })}
              placeholder="#"
              className="w-20 rounded-xl px-3 py-2 text-white text-sm outline-none text-center"
              style={inputStyle} />
            <input type="text" value={newHole.sponsor_name}
              onChange={e => setNewHole({ ...newHole, sponsor_name: e.target.value })}
              placeholder="Sponsor (optional)"
              className="flex-1 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 outline-none"
              style={inputStyle} />
            <button type="submit" disabled={adding}
              className="px-5 py-2 rounded-xl text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: '#F5A423' }}>
              Add
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

function HoleRow({ hole, saving, onToggle, onSponsorSave, onDelete }: {
  hole: Hole; saving: boolean
  onToggle: () => void; onSponsorSave: (s: string) => void; onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [sponsor, setSponsor] = useState(hole.sponsor_name ?? '')

  return (
    <div className="rounded-2xl px-4 py-3 border flex items-center gap-4 transition-opacity"
      style={{ background: '#191919', borderColor: '#2a2a2a', opacity: hole.active ? 1 : 0.5 }}>
      <span className="text-xl font-black w-10 text-center" style={{ color: '#F5A423' }}>
        {hole.hole_number}
      </span>
      <div className="flex-1">
        {editing ? (
          <div className="flex gap-2">
            <input autoFocus type="text" value={sponsor} onChange={e => setSponsor(e.target.value)}
              className="flex-1 rounded-lg px-2 py-1 text-sm text-white outline-none"
              style={{ background: '#111', border: '1px solid #3a3a3a' }} />
            <button onClick={() => { onSponsorSave(sponsor); setEditing(false) }}
              disabled={saving} className="text-xs font-semibold" style={{ color: '#F5A423' }}>Save</button>
            <button onClick={() => setEditing(false)} className="text-xs text-gray-600 hover:text-gray-400">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-sm text-left">
            {hole.sponsor_name
              ? <span style={{ color: '#F5A423' }}>{hole.sponsor_name}</span>
              : <span className="text-gray-600 italic">No sponsor</span>}
            <span className="text-gray-700 text-xs ml-2">(edit)</span>
          </button>
        )}
      </div>
      <button onClick={onToggle} disabled={saving}
        className="text-xs px-3 py-1.5 rounded-full font-semibold transition-colors"
        style={hole.active
          ? { background: 'rgba(245,164,35,0.15)', color: '#F5A423' }
          : { background: '#2a2a2a', color: '#6b7280' }}>
        {hole.active ? 'Active' : 'Inactive'}
      </button>
      <button onClick={onDelete} className="text-gray-700 hover:text-red-400 text-xl leading-none transition-colors">×</button>
    </div>
  )
}
