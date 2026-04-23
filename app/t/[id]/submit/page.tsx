'use client'

import { useEffect, useState } from 'react'
import { supabase, CtpHole } from '@/lib/supabase'
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

  useEffect(() => {
    params.then(({ id }) => {
      setTournamentId(id)
      supabase.from('tournaments').select('id,name,date').eq('id', id).single().then(({ data }) => {
        setTournament(data)
      })
      supabase.from('ctp_holes').select('*').eq('tournament_id', id).eq('active', true)
        .order('hole_number').then(({ data }) => {
          setHoles(data ?? [])
          setLoading(false)
        })
    })
  }, [params])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const dist = parseFloat(distance)
    if (!holeId || !playerName.trim() || !gender || isNaN(dist) || dist <= 0) {
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
        gender,
        distance_m: dist,
        device_id: getDeviceId(),
      }),
    })

    if (res.ok) {
      setSuccess(true)
      setDistance('')
      setHoleId('')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong.')
    }
    setSubmitting(false)
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>

  return (
    <div className="min-h-screen p-6 max-w-md mx-auto">
      <div className="mb-8">
        <Link href={`/t/${tournamentId}`} className="text-gray-400 hover:text-white text-sm">← Back to dashboard</Link>
        <h1 className="text-2xl font-bold mt-3">{tournament?.name}</h1>
        <p className="text-gray-400 text-sm mt-1">Submit your closest throw</p>
      </div>

      {success && (
        <div className="mb-6 bg-green-900/40 border border-green-700 rounded-lg p-4 text-green-300">
          Throw recorded! Submit another or{' '}
          <Link href={`/t/${tournamentId}`} className="underline">view the dashboard</Link>.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Your name</label>
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="First and last name"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
          <div className="grid grid-cols-2 gap-3">
            {(['M', 'F'] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`py-3 rounded-lg font-semibold border transition-colors ${
                  gender === g
                    ? 'bg-green-600 border-green-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'
                }`}
              >
                {g === 'M' ? 'Men' : 'Women'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Basket</label>
          <select
            value={holeId}
            onChange={e => setHoleId(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500"
          >
            <option value="">Select basket...</option>
            {holes.map(h => (
              <option key={h.id} value={h.id}>
                Basket {h.hole_number}{h.sponsor_name ? ` — ${h.sponsor_name}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Distance (meters)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={distance}
            onChange={e => setDistance(e.target.value)}
            placeholder="e.g. 3.45"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-semibold transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit throw'}
        </button>
      </form>
    </div>
  )
}
