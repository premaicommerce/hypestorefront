import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <main className="bg-paper">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20 grid gap-12 md:grid-cols-2 items-center">
        <div>
          <p className="text-sm text-brand-700 font-medium">
            Framed Photography
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-ink leading-tight">
            Gallery-quality framed photos for your space
          </h1>

          <p className="mt-5 text-muted max-w-md">
            Museum-grade prints, solid frames, delivered ready to hang.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              href="/store"
              className="rounded-xl bg-brand-500 px-6 py-3 text-white font-medium hover:bg-brand-600 transition"
            >
              Shop prints
            </Link>

            <Link
              href="/about"
              className="rounded-xl border border-gray-200 px-6 py-3 font-medium text-ink hover:bg-gray-50 transition"
            >
              Our process
            </Link>
          </div>

          <ul className="mt-8 space-y-2 text-sm text-muted">
            <li>• Archival paper & long-lasting inks</li>
            <li>• Solid wood frames (Black, Oak, White)</li>
            <li>• Ships in 3–5 business days</li>
          </ul>
        </div>

        <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-soft bg-gray-100 relative">
          <Image
            src="/images/Ganesha3.jpg"
            alt="Gallery-quality framed photo in a modern living room"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="text-2xl font-semibold text-ink">
          Shop by collection
        </h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {["Landscapes", "City", "Minimal", "Abstract"].map((c) => (
            <Link
              key={c}
              href={`/collections/${c.toLowerCase()}`}
              className="rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-soft transition"
            >
              <div className="font-medium text-ink">{c}</div>
              <div className="mt-2 text-sm text-muted">
                Explore prints
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
