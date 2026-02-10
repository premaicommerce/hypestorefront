import Link from "next/link"

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <span className="text-lg font-semibold text-ink">
            Dev
          </span>
          <span className="text-lg font-semibold text-brand-600">
            Prints
          </span>
        </Link>

        {/* Main menu */}
        <nav className="flex items-center gap-8 text-sm font-medium text-muted">
          <Link
            href="/"
            className="hover:text-ink transition"
          >
            Home
          </Link>

          <Link
            href="/store"
            className="hover:text-ink transition"
          >
            Shop
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-ink hover:bg-gray-50 transition"
          >
            Cart
          </Link>
        </div>
      </div>
    </header>
  )
}
