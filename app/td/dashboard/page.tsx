import { requireTD } from '@/lib/session'
import { supabaseAdmin, Tournament } from '@/lib/supabase'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'

export default async function TDDashboard() {
  await requireTD()

  const { data: tournaments } = await supabaseAdmin
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Tournaments</h1>
        <div className="flex gap-3">
          <Link
            href="/td/new"
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold text-sm transition-colors"
          >
            New tournament
          </Link>
          <LogoutButton />
        </div>
      </div>

      {!tournaments?.length ? (
        <p className="text-gray-500 text-center py-20">No tournaments yet. Create one to get started.</p>
      ) : (
        <div className="space-y-3">
          {tournaments.map((t: Tournament) => (
            <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{t.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                    {t.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">{new Date(t.date).toLocaleDateString('et-EE')}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/t/${t.id}`}
                  target="_blank"
                  className="px-3 py-1.5 text-sm border border-gray-700 hover:border-gray-500 rounded-lg transition-colors"
                >
                  View
                </Link>
                <Link
                  href={`/td/${t.id}`}
                  className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Manage
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
