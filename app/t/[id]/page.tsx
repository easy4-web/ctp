'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, CtpHole, Leader } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

type HoleWithLeaders = CtpHole & {
  leader_M: Leader | null
  leader_F: Leader | null
}

type Tournament = {
  id: string
  name: string
  date: string
  active: boolean
  ctp_holes: CtpHole[]
}

export default function TournamentDashboard({ params }: { params: Promise<{ id: string }> }) {
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [holes, setHoles] = useState<HoleWithLeaders[]>([])
  const [loading, setLoading] = useState(true)
  const [tournamentId, setTournamentId] = useState<string>('')

  const loadData = useCallback(async (id: string) => {
    const [tRes, lRes] = await Promise.all([
      fetch(`/api/tournaments/${id}`),
      fetch(`/api/leaders/${id}`),
    ])

    if (!tRes.ok) { setLoading(false); return }

    const t: Tournament = await tRes.json()
    const leaders: Leader[] = lRes.ok ? await lRes.json() : []

    const activeHoles = t.ctp_holes
      .filter(h => h.active)
      .sort((a, b) => a.hole_number - b.hole_number)

    setTournament(t)
    setHoles(activeHoles.map(h => ({
      ...h,
      leader_M: leaders.find(l => l.hole_id === h.id && l.gender === 'M') ?? null,
      leader_F: leaders.find(l => l.hole_id === h.id && l.gender === 'F') ?? null,
    })))
    setLoading(false)
  }, [])

  useEffect(() => {
    params.then(({ id }) => {
      setTournamentId(id)
      loadData(id)
    })
  }, [params, loadData])

  useEffect(() => {
    if (!tournamentId) return
    const channel = supabase
      .channel('leaders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaders' }, () => {
        loadData(tournamentId)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [tournamentId, loadData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Tournament not found.</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#0f0f0f' }}>
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#2a2a2a' }}>
        <div className="flex items-center gap-4">
          <Image src="/easy4-logo-white.png" alt="Easy4" width={80} height={30} className="object-contain" />
          <div className="w-px h-6 bg-gray-700" />
          <div>
            <h1 className="font-bold text-lg leading-tight">{tournament.name}</h1>
            <p className="text-gray-500 text-xs">{new Date(tournament.date).toLocaleDateString('et-EE')}</p>
          </div>
        </div>
        <Link
          href={`/t/${tournamentId}/submit`}
          className="px-4 py-2 rounded-lg font-semibold text-sm text-black transition-opacity hover:opacity-90"
          style={{ background: '#F5A423' }}
        >
          Submit throw
        </Link>
      </header>

      {/* Dashboard */}
      <main className="p-6 max-w-5xl mx-auto">
        <p className="text-xs text-gray-600 uppercase tracking-widest mb-6 font-medium">CTP Baskets</p>

        {holes.length === 0 ? (
          <p className="text-gray-600 text-center py-20">No active CTP baskets yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {holes.map(hole => (
              <div key={hole.id} className="rounded-2xl p-5 border" style={{ background: '#191919', borderColor: '#2a2a2a' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black" style={{ color: '#F5A423' }}>{hole.hole_number}</span>
                    <span className="text-gray-500 text-sm font-medium">Basket</span>
                  </div>
                  {hole.sponsor_name && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(245,164,35,0.15)', color: '#F5A423' }}>
                      {hole.sponsor_name}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  <LeaderRow label="Men" leader={hole.leader_M} />
                  <LeaderRow label="Women" leader={hole.leader_F} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function LeaderRow({ label, leader }: { label: string; leader: Leader | null }) {
  return (
    <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: '#111' }}>
      <div>
        <div className="text-xs text-gray-600 mb-0.5 uppercase tracking-wide">{label}</div>
        <div className="font-semibold text-sm">
          {leader
            ? leader.player_name
            : <span className="text-gray-600 font-normal italic">No throws yet</span>}
        </div>
      </div>
      {leader && (
        <div className="text-right">
          <span className="text-2xl font-black" style={{ color: '#F5A423' }}>
            {Number(leader.distance_m).toFixed(2)}
          </span>
          <span className="text-gray-500 text-sm ml-1">m</span>
        </div>
      )}
    </div>
  )
}
