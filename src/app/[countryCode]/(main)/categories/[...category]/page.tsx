// src/app/[countryCode]/(main)/categories/[handle]/page.tsx
import FacetSidebar from "../../../../../modules/plp/components/facet-sidebar"
import ProductGrid from "../../../../../modules/plp/components/product-grid"
import { sdk } from "@lib/config"

export default async function CategoryPage({
                                             params,
                                           }: {
  params: { countryCode: string; handle: string }
}) {
  // 1) category by handle
  const { product_categories } = await sdk.store.category.list({
    handle: params.handle,
  })

  const category = product_categories?.[0]
  if (!category) return <div>Not found</div>

  // 2) products by category
  const { products, count } = await sdk.store.product.list({
    category_id: [category.id],
    limit: 24,
    offset: 0,
    // region_id / countryCode handling depends on your starter
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
