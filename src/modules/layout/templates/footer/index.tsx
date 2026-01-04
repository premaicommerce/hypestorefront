import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="text-lg font-semibold text-ink">BlueFrame Prints</div>
          <p className="mt-3 text-sm text-muted max-w-md">
            Gallery-quality framed photography. Archival paper, solid frames, delivered ready to hang.
          </p>
          <p className="mt-4 text-sm text-muted">
            Support: <a className="text-brand-700 hover:underline" href="mailto:support@blueframeprints.com">support@blueframeprints.com</a>
          </p>
        </div>

        <div>
          <div className="text-sm font-semibold text-ink">Shop</div>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-ink" href="/store">All prints</Link></li>
            <li><Link className="hover:text-ink" href="/collections">Collections</Link></li>
            <li><Link className="hover:text-ink" href="/best-sellers">Best sellers</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold text-ink">Info</div>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link className="hover:text-ink" href="/about">About</Link></li>
            <li><Link className="hover:text-ink" href="/shipping-returns">Shipping & Returns</Link></li>
            <li><Link className="hover:text-ink" href="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-6 text-xs text-muted flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <span>© {new Date().getFullYear()} BlueFrame Prints. All rights reserved.</span>
          <span>Secure checkout • Carefully packaged • Fast dispatch</span>
        </div>
      </div>
    </footer>
  )
}
