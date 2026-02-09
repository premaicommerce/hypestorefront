// src/app/[countryCode]/(main)/categories/[handle]/page.tsx

import FacetSidebar from "../../../../../modules/plp/components/facet-sidebar"
import ProductGrid from "../../../../../modules/plp/components/product-grid"
import { sdk } from "@lib/config"

const BACKEND = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

async function storeFetch<T>(url: string): Promise<T> {
  if (!BACKEND) {
    throw new Error("NEXT_PUBLIC_MEDUSA_BACKEND_URL is missing")
  }

  const res = await fetch(url, {
    headers: PUBLISHABLE_KEY ? { "x-publishable-api-key": PUBLISHABLE_KEY } : {},
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Store API request failed (${res.status}): ${text}`)
  }

  return (await res.json()) as T
}

export default async function CategoryPage({
                                             params,
                                           }: {
  params: { countryCode: string; handle: string }
}) {
  // We prefer SDK, but SDK must be configured with publishable key.
  // If not, we fall back to direct fetch with the header.
  let category:
    | { id: string; name?: string; handle?: string }
    | undefined

  try {
    const { product_categories } = await sdk.store.category.list({
      handle: params.handle,
    })
    category = product_categories?.[0]
  } catch (e) {
    // fallback to fetch
    if (!BACKEND) throw e
    const data = await storeFetch<{ product_categories: any[] }>(
      `${BACKEND}/store/product-categories?handle=${encodeURIComponent(
        params.handle
      )}`
    )
    category = data.product_categories?.[0]
  }

  if (!category) return <div className="p-6">Not found</div>

  // Products
  let products: any[] = []
  let count = 0

  try {
    const res = await sdk.store.product.list({
      category_id: [category.id],
      limit: 24,
      offset: 0,
    })
    products = res.products ?? []
    count = res.count ?? products.length
  } catch (e) {
    if (!BACKEND) throw e
    const data = await storeFetch<{ products: any[]; count: number }>(
      `${BACKEND}/store/products?category_id[]=${encodeURIComponent(
        category.id
      )}&limit=24&offset=0`
    )
    products = data.products ?? []
    count = data.count ?? products.length
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="hidden lg:block">
          <FacetSidebar facets={[]} />
        </aside>

        <main>
          <div className="mb-4 text-sm text-neutral-700">
            {count} products
          </div>

          <ProductGrid products={products} />
        </main>
      </div>
    </div>
  )
}
