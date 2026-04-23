import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8 text-center">
      <Image src="/easy4-logo-white.png" alt="Easy4" width={160} height={60} className="object-contain" />
      <div>
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#F5A423' }}>CTP Challenge</h1>
        <p className="text-gray-400 mt-2 text-lg">Closest to the Pin tracker</p>
      </div>
      <Link
        href="/td"
        className="px-6 py-3 rounded-lg font-semibold transition-colors text-black"
        style={{ background: '#F5A423' }}
      >
        Tournament Director Login
      </Link>
    </div>
  )
}
