import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">CTP Challenge</h1>
      <p className="text-gray-400 text-lg">Closest to the Pin disc golf tracker</p>
      <Link
        href="/td"
        className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors"
      >
        Tournament Director Login
      </Link>
    </div>
  )
}
