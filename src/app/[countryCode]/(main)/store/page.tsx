import FacetSidebar from "../../../../modules/plp/components/facet-sidebar"
import ProductGrid from "../../../../modules/plp/components/product-grid"
import { sdk } from "@lib/config"

export default async function StorePage({
                                          params,
                                        }: {
  params: { countryCode: string }
}) {
  // "Shop all" products
  const { products, count } = await sdk.store.product.list({
    limit: 24,
    offset: 0,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="hidden lg:block">
          <FacetSidebar facets={[]} />
        </aside>

        <main>
          <div className="mb-4 text-sm text-neutral-700">{count} products</div>
          <ProductGrid products={products} />
        </main>
      </div>
    </div>
  )
}
