import Link from "next/link"

export default function ProductGrid({ products }: { products: any[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <Link
          key={p.id}
          href={`/products/${p.handle}`}
          className="rounded-xl border bg-white p-3 hover:shadow-sm transition"
        >
          <div className="aspect-square rounded-lg bg-neutral-100 mb-3" />
          <div className="text-sm font-medium line-clamp-2">{p.title}</div>
          <div className="text-sm text-neutral-700 mt-1">
            {/* map price here */}
          </div>
        </Link>
      ))}
    </div>
  )
}
