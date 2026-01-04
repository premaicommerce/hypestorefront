import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { listProducts } from "@lib/data/products"
import ProductPreview from "@modules/products/components/product-preview"
type Props = {
  params: { countryCode: string }
}

export default async function StorePage({ params }: Props) {
  const { response } = await listProducts({
    countryCode: params.countryCode,
  })

  const products = response?.products || []

  return (
    <main className="bg-paper">
      <section className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-ink">
              All prints
            </h1>
            <p className="mt-2 text-sm text-muted">
              Gallery-quality framed photography, ready to hang.
            </p>
          </div>

          {/* Sort (UI only for now) */}
          <select
            className="w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-300"
            defaultValue="latest"
          >
            <option value="latest">Latest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>

        {/* Product grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {products.map((product) => (
            <ProductPreview
              key={product.id}
              product={product}
             />
          ))}
        </div>
      </section>
    </main>
  )
}