import Link from "next/link"
import AddToCartButton from "./add-to-cart-button"

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

/**
 * Medusa v2 inventory:
 * - manage_inventory === false => always purchasable
 * - allow_backorder === true => purchasable even if qty <= 0
 * - inventory_quantity > 0 => purchasable
 * If fields are missing, assume purchasable (avoid false "out of stock" on PLP).
 */
function isVariantInStock(v: any): boolean {
  if (!v) return false

  // If backend didn't include inventory fields, don't block purchase
  const hasInventoryFields =
    "manage_inventory" in v ||
    "allow_backorder" in v ||
    "inventory_quantity" in v

  if (!hasInventoryFields) return true

  if (v.manage_inventory === false) return true
  if (v.allow_backorder === true) return true

  const qty = typeof v.inventory_quantity === "number" ? v.inventory_quantity : 0
  return qty > 0
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
            className="rounded-xl border bg-white p-3 hover:shadow-sm hover:border-neutral-300 transition"
          >
            {/* Image (no black bar) */}
            <Link href={`/products/${p.handle}`} className="block">
              <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={p.title ?? "Product"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-neutral-500">
                    No image
                  </div>
                )}
              </div>
            </Link>

            {/* Name BELOW product image */}
            <div className="mt-3">
              <Link href={`/products/${p.handle}`} className="block">
                <div className="text-sm font-medium text-neutral-900 line-clamp-2">
                  {p.title}
                </div>
              </Link>

              {/* Price below name (optional) */}
              <div className="mt-1 text-sm font-semibold text-neutral-900">
                {formatMoney(amount)}
              </div>
            </div>

            {/* Add to cart button on next line */}
            {variantId ? (
              <AddToCartButton
                variantId={variantId}
                countryCode={countryCode}
                inStock={inStock}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
