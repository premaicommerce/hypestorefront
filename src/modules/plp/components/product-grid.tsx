import Link from "next/link"
import AddToBucketButton from "./add-to-bucket-button"

function formatMoney(amount?: number) {
  if (typeof amount !== "number") return ""
  return `£${(amount / 100).toFixed(2)}`
}

function getImageUrl(p: any): string | null {
  const url = p?.thumbnail || p?.images?.[0]?.url || null
  return typeof url === "string" && url.length ? url : null
}

function getAmountCents(p: any): number | undefined {
  const amount =
    p?.variants?.[0]?.calculated_price?.calculated_amount ??
    p?.variants?.[0]?.prices?.[0]?.amount
  return typeof amount === "number" ? amount : undefined
}

export default function ProductGrid({ products }: { products: any[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => {
        const img = getImageUrl(p)
        const amount = getAmountCents(p)

        return (
          <div
            key={p.id}
            className="group rounded-xl border bg-white p-3 hover:shadow-sm hover:border-neutral-300 transition"
          >
            <Link href={`/products/${p.handle}`} className="block">
              <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={p.title ?? "Product"}
                    className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-neutral-500">
                    No image
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-neutral-900 line-clamp-2">
                    {p.title}
                  </div>
                </div>

                <div className="text-sm font-semibold text-neutral-900 whitespace-nowrap">
                  {formatMoney(amount)}
                </div>
              </div>
            </Link>

            {/* Add button */}
            <div className="mt-3">
              <AddToBucketButton productId={p.id} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
