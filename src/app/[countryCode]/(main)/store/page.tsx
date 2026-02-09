import FacetSidebar from "../../../../modules/plp/components/facet-sidebar"
import ProductGrid from "../../../../modules/plp/components/product-grid"
import { sdk } from "@lib/config"

export default async function StorePage({
                                          params,
                                          searchParams,
                                        }: {
  params: { countryCode: string }
  searchParams: Record<string, string | string[] | undefined>
}) {
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) : undefined
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined

  const { products: rawProducts } = await sdk.store.product.list({
    limit: 200, // MVP
    offset: 0,
  })

  // MVP price filter (amount in cents)
  const filtered = rawProducts.filter((p: any) => {
    const amount =
      p.variants?.[0]?.calculated_price?.calculated_amount ??
      p.variants?.[0]?.prices?.[0]?.amount

    if (typeof amount !== "number") return true
    if (minPrice !== undefined && amount < minPrice * 100) return false
    if (maxPrice !== undefined && amount > maxPrice * 100) return false
    return true
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="hidden lg:block">
          <FacetSidebar facets={[]} showPrice />
        </aside>

        <main>
          <div className="mb-4 text-sm text-neutral-700">{filtered.length} products</div>
          <ProductGrid products={filtered} />
        </main>
      </div>
    </div>
  )
}
