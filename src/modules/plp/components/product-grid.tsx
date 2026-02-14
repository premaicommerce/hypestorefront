// src/modules/plp/components/product-grid.tsx

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

/**
 * Safer stock logic for PLP:
 * - If inventory fields are missing/undefined -> treat as in stock (avoid false OOS)
 * - If manage_inventory === false -> in stock
 * - If allow_backorder === true -> in stock
 * - If manage_inventory === true and inventory_quantity is number -> qty > 0
 */
function isVariantInStock(v: any): boolean {
  if (!v) return true

  const mi = v.manage_inventory
  const ab = v.allow_backorder
  const iq = v.inventory_quantity

  const allUnknown = mi === undefined && ab === undefined && iq === undefined
  if (allUnknown) return true

  if (mi === false) return true
  if (ab === true) return true

  if (mi !== true) return true

  if (typeof iq === "number") return iq > 0

  return true
}

/**
 * Max purchasable qty (inventory cap):
 * - backorders allowed OR inventory not managed -> no cap (null)
 * - managed inventory -> inventory_quantity if present
 */
function getMaxQty(v: any): number | null {
  if (!v) return null
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
            className="group overflow-hidden rounded-2xl border bg-white hover:shadow-sm hover:border-neutral-300 transition"
          >
            <Link href={`/products/${p.handle}`} className="block">
              <div className="bg-[#f5f5f3] p-3">
                <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-white flex items-center justify-center">
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img}
                      alt={p.title ?? "Product"}
                      loading="lazy"
                      className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-neutral-500">
                      No image
                    </div>
                  )}
                </div>
              </div>
            </Link>

            <div className="p-5 text-center">
              <Link href={`/products/${p.handle}`} className="block">
                <div className="text-lg font-semibold text-neutral-900 line-clamp-2">
                  {toTitleCase(p.title)}
                </div>
              </Link>

              <div className="text-lg font-semibold text-neutral-900 line-clamp-2">
                {formatMoney(amount)}
              </div>

              {variantId ? (
                <div className="mt-4">
                  <AddToCartButton
                    variantId={variantId}
                    countryCode={countryCode}
                    inStock={inStock}
                    maxQty={maxQty}
                  />
                </div>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
