// src/modules/layout/templates/footer.tsx

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t bg-neutral-50">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-12 md:grid-cols-3">

          {/* Brand */}
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              Dev Prints
            </h2>

            <p className="mt-4 text-base leading-relaxed text-neutral-600">
              Gallery-quality framed photography. Archival paper, solid frames,
              delivered ready to hang.
            </p>

            <p className="mt-6 text-sm text-neutral-500">
              Support:
              <a
                href="mailto:support@test.com"
                className="ml-2 font-medium text-neutral-900 hover:underline"
              >
                support@test.com
              </a>
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Shop
            </h3>
            <ul className="mt-4 space-y-3 text-base text-neutral-600">
              <li>
                <Link href="/store" className="hover:text-neutral-900">
                  All Prints
                </Link>
              </li>
              <li>
                <Link href="/collections/best-sellers" className="hover:text-neutral-900">
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Info
            </h3>
            <ul className="mt-4 space-y-3 text-base text-neutral-600">
              <li>
                <Link href="/about" className="hover:text-neutral-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-neutral-900">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-neutral-900">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-14 border-t pt-6 text-sm text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Dev Prints. All rights reserved.</p>
          <p>Secure checkout · Carefully packaged · Fast dispatch</p>
        </div>
      </div>
    </footer>
  )
}