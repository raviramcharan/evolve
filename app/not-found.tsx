import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
      <p className="font-display text-7xl font-bold text-accent mb-3">404</p>
      <h1 className="font-display text-2xl font-semibold text-text mb-2">Page not found</h1>
      <p className="text-muted text-sm mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link
        href="/dashboard"
        className="bg-accent text-black font-semibold rounded-xl px-5 py-3 transition-opacity hover:opacity-90"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
