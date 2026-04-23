import Image from 'next/image'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Tournament } from '@/lib/supabase'

export const revalidate = 30

export default async function Home() {
  const { data: tournaments } = await supabaseAdmin
    .from('tournaments')
    .select('*')
    .eq('active', true)
    .eq('archived', false)
    .order('date', { ascending: false })

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0f0f0f' }}>
      <header className="border-b px-6 py-4 flex items-center justify-center" style={{ borderColor: '#2a2a2a' }}>
        <Image src="/easy4-logo-white.png" alt="Easy4" width={100} height={38} className="object-contain" />
      </header>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <div className="text-center mb-10 mt-6">
          <h1 className="text-3xl font-black tracking-tight" style={{ color: '#F5A423' }}>CTP Challenge</h1>
          <p className="text-gray-500 mt-2">Closest to the Pin — select your tournament</p>
        </div>

        {!tournaments?.length ? (
          <div className="text-center py-20">
            <p className="text-gray-600">No active tournaments at the moment.</p>
            <p className="text-gray-700 text-sm mt-2">Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tournaments.map((t: Tournament) => (
              <Link key={t.id} href={`/t/${t.id}`}
                className="flex items-center justify-between rounded-2xl px-6 py-5 border transition-all hover:border-[#F5A423] group"
                style={{ background: '#191919', borderColor: '#2a2a2a' }}>
                <div>
                  <p className="font-bold text-lg group-hover:text-[#F5A423] transition-colors">{t.name}</p>
                  <p className="text-gray-500 text-sm mt-0.5">{new Date(t.date).toLocaleDateString('et-EE')}</p>
                </div>
                <span className="text-gray-600 group-hover:text-[#F5A423] text-xl transition-colors">→</span>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center pb-8">
        <Link href="/td" className="text-gray-700 hover:text-gray-500 text-xs transition-colors">
          Tournament Director Login
        </Link>
      </footer>
    </div>
  )
}
