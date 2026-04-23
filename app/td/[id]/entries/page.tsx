'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Submission = {
  id: string
  player_name: string
  gender: 'M' | 'F'
  distance_m: number
  created_at: string
  ctp_holes: { hole_number: number; sponsor_name: string | null }
}

export default function EntriesPage({ params }: { params: Promise<{ id: string }> }) {
  const [tournamentId, setTournamentId] = useState('')
  const [tournamentName, setTournamentName] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [filter, setFilter] = useState<'all' | 'M' | 'F'>('all')
  const [search, setSearch] = useState('')

  const loadData = useCallback(async (id: string) => {
    const [tRes, sRes] = await Promise.all([
      fetch(`/api/tournaments/${id}`),
      fetch(`/api/submissions?tournament_id=${id}`),
    ])
    if (tRes.ok) setTournamentName((await tRes.json()).name)
    if (sRes.ok) setSubmissions(await sRes.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    params.then(({ id }) => { setTournamentId(id); loadData(id) })
  }, [params, loadData])

  async function handleDelete(id: string) {
    setDeleting(id)
    setConfirmId(null)
    setDeleteError('')

    const res = await fetch(`/api/submissions/${id}`, { method: 'DELETE' })

    if (res.ok) {
      setSubmissions(prev => prev.filter(s => s.id !== id))
    } else {
      const body = await res.json().catch(() => ({}))
      setDeleteError(body.error ?? `Delete failed (${res.status})`)
    }
    setDeleting(null)
  }

  const filtered = submissions.filter(s => {
    if (filter !== 'all' && s.gender !== filter) return false
    if (search && !s.player_name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const grouped = filtered.reduce<Record<number, Submission[]>>((acc, s) => {
    const num = s.ctp_holes.hole_number
    if (!acc[num]) acc[num] = []
    acc[num].push(s)
    return acc
  }, {})

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading...</div>

  return (
    <div className="min-h-screen" style={{ background: '#0f0f0f' }}>
      <header className="border-b px-6 py-4 flex items-center gap-4" style={{ borderColor: '#2a2a2a' }}>
        <Image src="/easy4-logo-white.png" alt="Easy4" width={80} height={30} className="object-contain" />
        <div className="w-px h-6 bg-gray-700" />
        <Link href={`/td/${tournamentId}`} className="text-gray-400 hover:text-white text-sm transition-colors">
          ← {tournamentName}
        </Link>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 mt-2">
          <h1 className="text-2xl font-bold">All Entries</h1>
          <span className="text-gray-500 text-sm">{submissions.length} total</span>
        </div>

        {deleteError && (
          <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            {deleteError}
          </div>
        )}

        <div className="flex gap-3 mb-6 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 outline-none flex-1 min-w-48"
            style={{ background: '#191919', border: '1px solid #2a2a2a' }}
          />
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #2a2a2a' }}>
            {(['all', 'M', 'F'] as const).map(g => (
              <button key={g} onClick={() => setFilter(g)}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={filter === g
                  ? { background: '#F5A423', color: '#000' }
                  : { background: '#191919', color: '#9ca3af' }}>
                {g === 'all' ? 'All' : g === 'M' ? 'Men' : 'Women'}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-600 text-center py-20">No entries found.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([holeNum, subs]) => (
                <div key={holeNum}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-black" style={{ color: '#F5A423' }}>Basket {holeNum}</span>
                    {subs[0]?.ctp_holes.sponsor_name && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'rgba(245,164,35,0.15)', color: '#F5A423' }}>
                        {subs[0].ctp_holes.sponsor_name}
                      </span>
                    )}
                    <span className="text-gray-600 text-sm">{subs.length} {subs.length === 1 ? 'entry' : 'entries'}</span>
                  </div>

                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #2a2a2a' }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: '#191919', borderBottom: '1px solid #2a2a2a' }}>
                          <th className="text-left px-4 py-3 text-gray-500 font-medium">Name</th>
                          <th className="text-left px-4 py-3 text-gray-500 font-medium">Category</th>
                          <th className="text-right px-4 py-3 text-gray-500 font-medium">Distance</th>
                          <th className="text-right px-4 py-3 text-gray-500 font-medium">Submitted</th>
                          <th className="px-4 py-3 w-28" />
                        </tr>
                      </thead>
                      <tbody>
                        {subs
                          .sort((a, b) => a.distance_m - b.distance_m)
                          .map((s, i) => (
                            <tr key={s.id} style={{
                              background: i === 0 ? 'rgba(245,164,35,0.05)' : '#111',
                              borderTop: i > 0 ? '1px solid #1f1f1f' : undefined
                            }}>
                              <td className="px-4 py-3 font-medium">
                                <span className="flex items-center gap-2">
                                  {i === 0 && <span className="text-xs font-bold" style={{ color: '#F5A423' }}>★</span>}
                                  {s.player_name}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-400">{s.gender === 'M' ? 'Men' : 'Women'}</td>
                              <td className="px-4 py-3 text-right font-bold" style={{ color: i === 0 ? '#F5A423' : '#f0f0f0' }}>
                                {Number(s.distance_m).toFixed(2)} m
                              </td>
                              <td className="px-4 py-3 text-right text-gray-600 text-xs">
                                {new Date(s.created_at).toLocaleString('et-EE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {confirmId === s.id ? (
                                  <span className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => handleDelete(s.id)}
                                      disabled={deleting === s.id}
                                      className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors"
                                      style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
                                    >
                                      {deleting === s.id ? '...' : 'Confirm'}
                                    </button>
                                    <button
                                      onClick={() => setConfirmId(null)}
                                      className="text-xs px-2 py-1 rounded-lg text-gray-500 hover:text-gray-300"
                                    >
                                      Cancel
                                    </button>
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => { setConfirmId(s.id); setDeleteError('') }}
                                    disabled={deleting === s.id}
                                    className="text-xs px-2.5 py-1 rounded-lg transition-colors disabled:opacity-40"
                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                                  >
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  )
}
