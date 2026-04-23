import { requireTD } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Tournament } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default async function TDDashboard() {
  await requireTD()

  const { data: all } = await supabaseAdmin
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })

  const active = (all ?? []).filter((t: Tournament & { archived: boolean }) => !t.archived)
  const archived = (all ?? []).filter((t: Tournament & { archived: boolean }) => t.archived)

  return (
    <div className="min-h-screen" style={{ background: '#0f0f0f' }}>
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: '#2a2a2a' }}>
        <div className="flex items-center gap-4">
          <Image src="/easy4-logo-white.png" alt="Easy4" width={80} height={30} className="object-contain" />
          <div className="w-px h-6 bg-gray-700" />
          <span className="text-sm text-gray-400 font-medium">Tournament Director</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/td/new" className="px-4 py-2 rounded-lg font-semibold text-sm text-black transition-opacity hover:opacity-90" style={{ background: '#F5A423' }}>
            + New tournament
          </Link>
          <LogoutButton />
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {!active.length && !archived.length ? (
          <div className="text-center py-24">
            <p className="text-gray-600 mb-4">No tournaments yet.</p>
            <Link href="/td/new" className="px-5 py-2.5 rounded-lg font-semibold text-black text-sm" style={{ background: '#F5A423' }}>
              Create first tournament
            </Link>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section className="mb-10">
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-4 font-medium">Tournaments</p>
                <div className="space-y-3">
                  {active.map((t: Tournament) => <TournamentRow key={t.id} t={t} />)}
                </div>
              </section>
            )}

            {archived.length > 0 && (
              <section>
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-4 font-medium">Archived</p>
                <div className="space-y-3">
                  {archived.map((t: Tournament) => <TournamentRow key={t.id} t={t} archived />)}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function TournamentRow({ t, archived = false }: { t: Tournament; archived?: boolean }) {
  return (
    <div className="rounded-2xl p-5 border flex items-center justify-between"
      style={{ background: archived ? '#141414' : '#191919', borderColor: '#2a2a2a', opacity: archived ? 0.7 : 1 }}>
      <div>
        <div className="flex items-center gap-3">
          <span className="font-semibold">{t.name}</span>
          {!archived && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={t.active
                ? { background: 'rgba(245,164,35,0.15)', color: '#F5A423' }
                : { background: '#2a2a2a', color: '#6b7280' }}>
              {t.active ? 'Active' : 'Inactive'}
            </span>
          )}
          {archived && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: '#2a2a2a', color: '#4b5563' }}>
              Archived
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mt-1">{new Date(t.date).toLocaleDateString('et-EE')}</p>
      </div>
      <div className="flex gap-2">
        <Link href={`/t/${t.id}`} target="_blank"
          className="px-3 py-1.5 text-sm rounded-lg transition-colors text-gray-400 hover:text-white"
          style={{ background: '#111', border: '1px solid #2a2a2a' }}>
          View
        </Link>
        <Link href={`/td/${t.id}`}
          className="px-3 py-1.5 text-sm rounded-lg transition-colors"
          style={{ background: '#2a2a2a', color: '#f0f0f0' }}>
          Manage
        </Link>
      </div>
    </div>
  )
}
