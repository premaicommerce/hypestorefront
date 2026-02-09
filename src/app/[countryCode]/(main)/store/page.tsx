// src/app/[countryCode]/(main)/store/page.tsx

export const dynamic = "force-dynamic"

import FacetSidebar from "../../../../modules/plp/components/facet-sidebar"
import ProductGrid from "../../../../modules/plp/components/product-grid"
import { sdk } from "@lib/config"

function getFirstNumber(v: string | string[] | undefined) {
  const s = Array.isArray(v) ? v[0] : v
  if (!s) return undefined
  const n = Number(s)
  return Number.isFinite(n) ? n : undefined
}

function getAmountCents(p: any): number | undefined {
  const amount =
    p?.variants?.[0]?.calculated_price?.calculated_amount ??
    p?.variants?.[0]?.prices?.[0]?.amount
  return typeof amount === "number" ? amount : undefined
}

export default async function StorePage({
                                          params,
                                          searchParams,
                                        }: {
  params: { countryCode: string }
  searchParams: Record<string, string | string[] | undefined>
}) {
  const minPrice = getFirstNumber(searchParams.minPrice)
  const maxPrice = getFirstNumber(searchParams.maxPrice)
  const sort = (searchParams.sort as string) ?? "relevance"

  // MVP: fetch more and filter in-memory (fine for small catalogs)
  const { products: rawProducts } = await sdk.store.product.list({
    limit: 200,
    offset: 0,
  })

  const filtered = (rawProducts ?? []).filter((p: any) => {
    const amount = getAmountCents(p)
    if (amount === undefined) return true

    if (minPrice !== undefined && amount < minPrice * 100) return false
    if (maxPrice !== undefined && amount > maxPrice * 100) return false
    return true
  })

  const sorted = [...filtered].sort((a: any, b: any) => {
    const ap = getAmountCents(a) ?? 0
    const bp = getAmountCents(b) ?? 0

    if (sort === "price_asc") return ap - bp
    if (sort === "price_desc") return bp - ap
    if (sort === "newest") {
      const at = new Date(a?.created_at ?? 0).getTime()
      const bt = new Date(b?.created_at ?? 0).getTime()
      return bt - at
    }
    return 0 // relevance (keep original order)
  })

  // Preserve existing query params when submitting other forms (price/sort)
  const minPriceRaw = Array.isArray(searchParams.minPrice)
    ? searchParams.minPrice[0]
    : searchParams.minPrice
  const maxPriceRaw = Array.isArray(searchParams.maxPrice)
    ? searchParams.maxPrice[0]
    : searchParams.maxPrice

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            {/* Price facet only for now */}
            <FacetSidebar facets={[]} showPrice />
          </div>
        </aside>

        <main>
          {/* Header row: results + sort (SERVER-SAFE: no onChange handlers) */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-neutral-700">
              <span className="font-medium">{sorted.length}</span> products
            </div>

            <form method="GET" className="flex items-center gap-2">
              <select
                name="sort"
                defaultValue={sort}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="newest">Newest</option>
              </select>

              {/* Preserve price filters */}
              {minPriceRaw && (
                <input type="hidden" name="minPrice" value={String(minPriceRaw)} />
              )}
              {maxPriceRaw && (
                <input type="hidden" name="maxPrice" value={String(maxPriceRaw)} />
              )}

              <button
                type="submit"
                className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-800"
              >
                Apply
              </button>
            </form>
          </div>

          <ProductGrid products={sorted} />
        </main>
      </div>
    </div>
  )
}
