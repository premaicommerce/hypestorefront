import { Metadata } from "next"

import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import StoreTemplate from "@modules/store/templates"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"

import ProductPreview from "@modules/products/components/product-preview"
export const revalidate = 0
export const dynamic = "force-dynamic"

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function StorePage({ params }: Props) {
  const { countryCode } = await params

  const region = await getRegion(countryCode)

  if (!region) {
    return <div>Region not found</div>
    }

  const { response } = await listProducts({
    regionId: region.id,
  })

  const products = response?.products || []

  return (
    <main className="bg-paper">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-ink">All prints</h1>
            <p className="mt-2 text-sm text-muted">
              Gallery-quality framed photography, ready to hang.
            </p>
          </div>

          <select
            className="w-full sm:w-auto rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-ink"
            defaultValue="latest"
          >
            <option value="latest">Latest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {products.map((product) => (
            <ProductPreview
              key={product.id}
              product={product}
              region={region}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
