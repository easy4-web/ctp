'use client'

import { useEffect, useState } from 'react'
import { supabase, CtpHole, Leader } from '@/lib/supabase'
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

  useEffect(() => {
    params.then(({ id }) => {
      setTournamentId(id)
      loadData(id)
    })
  }, [params])

  async function loadData(id: string) {
    const [tRes, lRes] = await Promise.all([
      supabase.from('tournaments').select('*, ctp_holes(*)').eq('id', id).single(),
      supabase.from('leaders').select('*').in(
        'hole_id',
        (await supabase.from('ctp_holes').select('id').eq('tournament_id', id)).data?.map(h => h.id) ?? []
      ),
    ])

    if (tRes.error || !tRes.data) { setLoading(false); return }

    const t = tRes.data as Tournament
    const leaders: Leader[] = lRes.data ?? []
    const activeHoles = t.ctp_holes.filter(h => h.active).sort((a, b) => a.hole_number - b.hole_number)

    setTournament(t)
    setHoles(activeHoles.map(h => ({
      ...h,
      leader_M: leaders.find(l => l.hole_id === h.id && l.gender === 'M') ?? null,
      leader_F: leaders.find(l => l.hole_id === h.id && l.gender === 'F') ?? null,
    })))
    setLoading(false)
  }

  useEffect(() => {
    if (!tournamentId) return

    const channel = supabase
      .channel('leaders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leaders' }, () => {
        loadData(tournamentId)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tournamentId])

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-400">Loading...</div>
  if (!tournament) return <div className="flex items-center justify-center min-h-screen text-gray-400">Tournament not found.</div>

  return (
    <div className="min-h-screen p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <p className="text-gray-400 mt-1">{new Date(tournament.date).toLocaleDateString('et-EE')}</p>
        </div>
        <Link
          href={`/t/${tournamentId}/submit`}
          className="px-5 py-2.5 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors text-sm"
        >
          Submit throw
        </Link>
      </div>

      {holes.length === 0 ? (
        <p className="text-gray-500 text-center py-20">No active CTP baskets yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {holes.map(hole => (
            <div key={hole.id} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold">Basket {hole.hole_number}</span>
                {hole.sponsor_name && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-medium">
                    {hole.sponsor_name}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                <LeaderRow label="Men" leader={hole.leader_M} />
                <LeaderRow label="Women" leader={hole.leader_F} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LeaderRow({ label, leader }: { label: string; leader: Leader | null }) {
  return (
    <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
      <div>
        <div className="text-xs text-gray-400 mb-0.5">{label}</div>
        <div className="font-semibold text-sm">
          {leader ? leader.player_name : <span className="text-gray-500 font-normal">No throws yet</span>}
        </div>
      </div>
      {leader && (
        <div className="text-right">
          <span className="text-2xl font-bold text-green-400">{Number(leader.distance_m).toFixed(2)}</span>
          <span className="text-gray-400 text-sm ml-1">m</span>
        </div>
      )}
    </div>
  )
}
