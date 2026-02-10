import Link from "next/link"
import AddToCartButton from "./add-to-cart-button"

function formatMoney(amount?: number) {
  if (typeof amount !== "number") return ""
  return `£${(amount / 100).toFixed(2)}`
}

function toTitleCase(s?: string) {
  if (!s) return ""
  return s
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
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

/**
 * Correct Medusa v2 stock logic:
 * - If manage_inventory === false => in stock
 * - If allow_backorder === true => in stock
 * - If manage_inventory === true and inventory_quantity is a number => qty > 0
 * - If inventory fields are missing/undefined => assume in stock (avoid false OOS)
 */
function isVariantInStock(v: any): boolean {
  if (!v) return true // don’t block button if variant info is incomplete

  const mi = v.manage_inventory
  const ab = v.allow_backorder
  const iq = v.inventory_quantity

  // If all inventory-related values are truly unknown, assume in stock
  if (mi === undefined && ab === undefined && iq === undefined) return true

  if (mi === false) return true
  if (ab === true) return true

  // If manage_inventory not explicitly true, don't block
  if (mi !== true) return true

  // manage_inventory === true, rely on inventory_quantity if present
  if (typeof iq === "number") return iq > 0

  // still unknown -> assume in stock
  return true
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

        return (
          <div
            key={p.id}
            className="group rounded-xl border bg-white p-3 hover:shadow-sm hover:border-neutral-300 transition"
          >
            {/* Image with zoom-out on hover */}
            <Link href={`/products/${p.handle}`} className="block">
              <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={p.title ?? "Product"}
                    className="h-full w-full object-cover transition-transform duration-300 scale-105 group-hover:scale-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-neutral-500">
                    No image
                  </div>
                )}
              </div>
            </Link>

            {/* Centered title (Title Case) */}
            <div className="mt-3 text-center">
              <Link href={`/products/${p.handle}`} className="block">
                <div className="text-sm font-medium text-neutral-900 line-clamp-2">
                  {toTitleCase(p.title)}
                </div>
              </Link>

              <div className="mt-1 text-sm font-semibold text-neutral-900">
                {formatMoney(amount)}
              </div>
            </div>

            {/* Add to cart button row */}
            {variantId ? (
              <div className="mt-3">
                <AddToCartButton
                  variantId={variantId}
                  countryCode={countryCode}
                  inStock={inStock}
                />
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
