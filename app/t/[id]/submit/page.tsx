'use client'

import { useEffect, useState } from 'react'
import { CtpHole } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('ctp_device_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('ctp_device_id', id)
  }
  return id
}

type Tournament = { id: string; name: string; date: string }

export default function SubmitPage({ params }: { params: Promise<{ id: string }> }) {
  const [tournamentId, setTournamentId] = useState('')
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [holes, setHoles] = useState<CtpHole[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [holeId, setHoleId] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [gender, setGender] = useState<'M' | 'F' | ''>('')
  const [distance, setDistance] = useState('')

  const selectedHole = holes.find(h => h.id === holeId)
  const categoryMode = selectedHole?.category_mode ?? 'gendered'
  // gendered = player picks M/W; others are auto-assigned
  const needsGenderPick = !holeId || categoryMode === 'gendered'
  const effectiveGender =
    categoryMode === 'gendered'  ? gender :
    categoryMode === 'open'      ? 'O' :
    categoryMode === 'men_only'  ? 'M' : 'F'

  useEffect(() => {
    params.then(async ({ id }) => {
      setTournamentId(id)
      const res = await fetch(`/api/tournaments/${id}`)
      if (res.ok) {
        const data = await res.json()
        setTournament(data)
        setHoles((data.ctp_holes ?? []).filter((h: CtpHole) => h.active).sort((a: CtpHole, b: CtpHole) => a.hole_number - b.hole_number))
      }
      setLoading(false)
    })
  }, [params])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const dist = parseFloat(distance.replace(',', '.'))
    if (!holeId || !playerName.trim() || (needsGenderPick && categoryMode === 'gendered' && !gender) || isNaN(dist) || dist <= 0) {
      setError('Please fill in all fields correctly.')
      return
    }
    setSubmitting(true)
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tournament_id: tournamentId,
        hole_id: holeId,
        player_name: playerName.trim(),
        gender: effectiveGender,
        distance_m: dist,
        device_id: getDeviceId(),
      }),
    })
    if (res.ok) {
      setSuccess(true)
      setDistance('')
      setHoleId('')
      setGender('')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong.')
    }
    setSubmitting(false)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading...</div>
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f0f0f' }}>
      <header className="border-b px-6 py-4 flex items-center gap-4" style={{ borderColor: '#2a2a2a' }}>
        <Image src="/easy4-logo-white.png" alt="Easy4" width={80} height={30} className="object-contain" />
        <div className="w-px h-6 bg-gray-700" />
        <Link href={`/t/${tournamentId}`} className="text-gray-400 hover:text-white text-sm transition-colors">
          ← {tournament?.name ?? 'Back'}
        </Link>
      </header>

      <main className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mt-2 mb-1">Submit your throw</h1>
        <p className="text-gray-500 text-sm mb-8">Enter the distance from the basket.</p>

        {success && (
          <div className="mb-6 rounded-xl p-4 border text-sm" style={{ background: 'rgba(245,164,35,0.1)', borderColor: 'rgba(245,164,35,0.3)', color: '#F5A423' }}>
            Throw recorded!{' '}
            <Link href={`/t/${tournamentId}`} className="underline font-semibold">View dashboard</Link>
            {' '}or submit another below.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Your name</label>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="First and last name"
              className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all"
              style={{ background: '#191919', border: '1px solid #2a2a2a' }}
              onFocus={e => e.target.style.borderColor = '#F5A423'}
              onBlur={e => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Basket</label>
            <select
              value={holeId}
              onChange={e => { setHoleId(e.target.value); setGender('') }}
              className="w-full rounded-xl px-4 py-3 text-white outline-none"
              style={{ background: '#191919', border: '1px solid #2a2a2a' }}
            >
              <option value="">Select basket...</option>
              {holes.map(h => (
                <option key={h.id} value={h.id}>
                  Basket {h.hole_number}{h.sponsor_name ? ` — ${h.sponsor_name}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Category — only shown for gendered baskets */}
          {holeId && categoryMode === 'gendered' && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
              <div className="grid grid-cols-2 gap-3">
                {(['M', 'F'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className="py-3 rounded-xl font-semibold transition-all text-sm"
                    style={gender === g
                      ? { background: '#F5A423', color: '#000', border: '1px solid #F5A423' }
                      : { background: '#191919', color: '#9ca3af', border: '1px solid #2a2a2a' }
                    }
                  >
                    {g === 'M' ? 'Men' : 'Women'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subtle hint for single-category baskets */}
          {holeId && categoryMode !== 'gendered' && (
            <div className="rounded-xl px-4 py-2.5 text-sm" style={{ background: '#191919', border: '1px solid #2a2a2a', color: '#6b7280' }}>
              {categoryMode === 'open'      && 'Open category — no gender selection needed'}
              {categoryMode === 'men_only'  && 'Men only basket'}
              {categoryMode === 'women_only' && 'Women only basket'}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Distance (meters)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={distance}
              onChange={e => setDistance(e.target.value)}
              placeholder="e.g. 3.45"
              className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none transition-all"
              style={{ background: '#191919', border: '1px solid #2a2a2a' }}
              onFocus={e => e.target.style.borderColor = '#F5A423'}
              onBlur={e => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: '#F5A423' }}
          >
            {submitting ? 'Submitting...' : 'Submit throw'}
          </button>
        </form>
      </main>
    </div>
  )
}
