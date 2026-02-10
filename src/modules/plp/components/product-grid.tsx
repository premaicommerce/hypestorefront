import Link from "next/link"
import AddToCartButton from "./add-to-cart-button"

function formatMoney(amount?: number) {
  if (typeof amount !== "number") return ""
  return `£${(amount / 100).toFixed(2)}`
}

function toTitleCase(s?: string) {
  if (!s) return ""
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
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

function isVariantInStock(v: any): boolean {
  if (!v) return true
  const mi = v.manage_inventory
  const ab = v.allow_backorder
  const iq = v.inventory_quantity

  if (mi === undefined && ab === undefined && iq === undefined) return true
  if (mi === false) return true
  if (ab === true) return true
  if (mi !== true) return true
  if (typeof iq === "number") return iq > 0
  return true
}

function getMaxQty(v: any): number | null {
  if (!v) return null
  // If backorders allowed OR inventory not managed => no max cap from inventory
  if (v.allow_backorder === true) return null
  if (v.manage_inventory === false) return null
  if (v.manage_inventory !== true) return null
  return typeof v.inventory_quantity === "number" ? v.inventory_quantity : null
}

export default function ProductGrid({
                                      products,
                                      countryCode,
                                    }: {
  products: any[]
  countryCode: string
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => {
        const img = getImageUrl(p)
        const amount = getAmountCents(p)

        const variant = p?.variants?.[0]
        const variantId = variant?.id
        const inStock = isVariantInStock(variant)
        const maxQty = getMaxQty(variant)

        return (
          <div
            key={p.id}
            className="rounded-2xl border bg-white p-2 sm:p-3 hover:shadow-sm hover:border-neutral-300 transition"
          >
            <Link href={`/products/${p.handle}`} className="block">
              <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={p.title ?? "Product"}
                    loading="lazy"
                    className="
                    h-full w-full object-cover
                    transition-transform duration-300 ease-out
                    scale-[1.15] hover:scale-[1.05]
                  "
                                />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-neutral-500">
                    No image
                  </div>
                )}
              </div>
            </Link>

            <div className="mt-2 text-center">
              <Link href={`/products/${p.handle}`} className="block">
                <div className="text-sm font-medium text-neutral-900 line-clamp-2">
                  {toTitleCase(p.title)}
                </div>
              </Link>
              <div className="mt-1 text-sm font-semibold text-neutral-900">
                {formatMoney(amount)}
              </div>
            </div>

            {variantId ? (
              <div className="mt-3">
                <AddToCartButton
                  variantId={variantId}
                  countryCode={countryCode}
                  inStock={inStock}
                  maxQty={maxQty}
                />
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
