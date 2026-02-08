"use client"

import React, { useEffect, useMemo, useState } from "react"

const MEDUSA_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

// ----------------------------
// Types (minimal)
// ----------------------------
type ProductCategory = {
  id: string
  name: string
  handle: string
  parent_category_id?: string | null
}

type ProductImage = { url: string }
type ProductVariant = {
  id: string
  title: string
  prices?: { amount: number; currency_code: string }[]
}
type Product = {
  id: string
  title: string
  handle?: string
  description?: string | null
  thumbnail?: string | null
  images?: ProductImage[]
  categories?: { id: string; name: string; handle: string }[]
  tags?: { id: string; value: string }[]
  variants?: ProductVariant[]
}

// ----------------------------
// Helpers
// ----------------------------
function buildUrl(path: string, params?: Record<string, any>) {
  const url = new URL(path, MEDUSA_BACKEND_URL)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return
      if (Array.isArray(v)) {
        // send repeated keys: colors=blue&colors=black
        v.forEach((item) => url.searchParams.append(k, String(item)))
      } else {
        url.searchParams.set(k, String(v))
      }
    })
  }
  return url.toString()
}

async function medusaGet<T>(path: string, params?: Record<string, any>): Promise<T> {
  const res = await fetch(buildUrl(path, params), {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => "")
    throw new Error(`Medusa GET ${path} failed: ${res.status} ${msg}`)
  }
  return res.json()
}

// Price formatting (fallback)
function formatMoney(amountCents?: number, currency = "usd") {
  if (amountCents == null) return ""
  const amount = amountCents / 100
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount)
}

// Pick a price from variants (very basic)
function getFirstVariantPrice(product: Product) {
  const v = product.variants?.[0]
  const p = v?.prices?.[0]
  if (!p) return null
  return { amount: p.amount, currency: p.currency_code }
}

// ----------------------------
// Page
// ----------------------------
export default function ExplorePage() {
  // Filters (dynamic content comes from backend; filter options can be static UI)
  const [categoryId, setCategoryId] = useState<string | null>(null)

  const [priceMin, setPriceMin] = useState<number>(120)
  const [priceMax, setPriceMax] = useState<number>(2000)

  // Example filter values; adapt to YOUR product options/tags convention
  const [colors, setColors] = useState<string[]>([])
  const [materials, setMaterials] = useState<string[]>([])

  // Data
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Loading / errors
  const [loadingCats, setLoadingCats] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingSelected, setLoadingSelected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load categories (dynamic)
  useEffect(() => {
    let alive = true
    setLoadingCats(true)
    setError(null)

    medusaGet<{ product_categories: ProductCategory[] }>("/store/product-categories", {
      limit: 200,
    })
      .then((data) => {
        if (!alive) return
        setCategories(data.product_categories || [])
        // default: select first category if none chosen
        if (!categoryId && data.product_categories?.length) {
          setCategoryId(data.product_categories[0].id)
        }
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoadingCats(false))

    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Build product query (dynamic)
  const productQuery = useMemo(() => {
    // IMPORTANT:
    // Medusa store product filtering differs by version and setup.
    // - category_id is commonly supported in Store API.
    // - price filtering often uses variants/prices and can require custom endpoints.
    // If your backend doesn’t support these params out-of-the-box, keep the UI,
    // but adjust to your backend filter contract or create a custom route.
    const q: Record<string, any> = {
      limit: 24,
      // category filter
      category_id: categoryId || undefined,
      // Example: you might implement these as custom filters server-side:
      min_price: priceMin,
      max_price: priceMax,
      colors,
      materials,
    }
    return q
  }, [categoryId, priceMin, priceMax, colors, materials])

  // Load products list (dynamic)
  useEffect(() => {
    let alive = true
    setLoadingProducts(true)
    setError(null)

    medusaGet<{ products: Product[] }>("/store/products", productQuery)
      .then((data) => {
        if (!alive) return
        const list = data.products || []
        setProducts(list)
        // default select first product
        if (!selectedId && list.length) setSelectedId(list[0].id)
        // if selected no longer exists, reset
        if (selectedId && !list.some((p) => p.id === selectedId)) {
          setSelectedId(list[0]?.id ?? null)
        }
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoadingProducts(false))

    return () => {
      alive = false
    }
  }, [productQuery, selectedId])

  // Load selected product (dynamic)
  useEffect(() => {
    let alive = true
    if (!selectedId) {
      setSelectedProduct(null)
      return
    }

    setLoadingSelected(true)
    setError(null)

    medusaGet<{ product: Product }>(`/store/products/${selectedId}`)
      .then((data) => alive && setSelectedProduct(data.product))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoadingSelected(false))

    return () => {
      alive = false
    }
  }, [selectedId])

  // UI helpers
  const colorSwatches = [
    { id: "gray", cls: "bg-neutral-300" },
    { id: "black", cls: "bg-neutral-900" },
    { id: "blue", cls: "bg-blue-500" },
    { id: "green", cls: "bg-green-500" },
    { id: "yellow", cls: "bg-yellow-400" },
    { id: "red", cls: "bg-red-500" },
  ]

  const materialOptions = ["Metal", "Wood", "Glass", "Stone", "Acrylic"]

  function toggleInList(value: string, list: string[], setList: (v: string[]) => void) {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_360px]">
        {/* LEFT: categories + filters */}
        <aside className="hidden lg:block">
          <div className="rounded-2xl border border-neutral-200 p-4">
            <div className="text-sm font-semibold">Categories</div>

            <div className="mt-3 space-y-1">
              {loadingCats ? (
                <div className="text-sm text-neutral-500">Loading categories…</div>
              ) : (
                categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategoryId(c.id)}
                    className={[
                      "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm",
                      categoryId === c.id
                        ? "bg-neutral-100 font-medium"
                        : "hover:bg-neutral-50",
                    ].join(" ")}
                  >
                    <span className="h-2 w-2 rounded-sm border border-neutral-300" />
                    <span className="truncate">{c.name}</span>
                  </button>
                ))
              )}
            </div>

            <hr className="my-4 border-neutral-200" />

            <div className="text-sm font-semibold">Filter by</div>

            {/* Price */}
            <div className="mt-3">
              <div className="text-xs font-medium text-neutral-600">Price</div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Min: ${priceMin}</span>
                  <span>Max: ${priceMax}</span>
                </div>

                {/* simple sliders */}
                <input
                  type="range"
                  min={0}
                  max={5000}
                  value={priceMin}
                  onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
                  className="w-full"
                />
                <input
                  type="range"
                  min={0}
                  max={5000}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Color */}
            <div className="mt-5">
              <div className="text-xs font-medium text-neutral-600">Color</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {colorSwatches.map((s) => {
                  const active = colors.includes(s.id)
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleInList(s.id, colors, setColors)}
                      className={[
                        "h-6 w-6 rounded-full border",
                        s.cls,
                        active ? "ring-2 ring-violet-300" : "border-neutral-200",
                      ].join(" ")}
                      aria-label={`color ${s.id}`}
                      title={s.id}
                    />
                  )
                })}
              </div>
            </div>

            {/* Material */}
            <div className="mt-5">
              <div className="text-xs font-medium text-neutral-600">Material</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {materialOptions.map((m) => {
                  const id = m.toLowerCase()
                  const active = materials.includes(id)
                  return (
                    <button
                      key={id}
                      onClick={() => toggleInList(id, materials, setMaterials)}
                      className={[
                        "rounded-lg border px-3 py-1 text-xs",
                        active
                          ? "border-violet-300 bg-violet-50 text-violet-700"
                          : "border-neutral-200 hover:bg-neutral-50",
                      ].join(" ")}
                    >
                      {m}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* MIDDLE: product grid */}
        <main>
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loadingProducts ? (
            <div className="text-sm text-neutral-500">Loading products…</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => {
                const selected = p.id === selectedId
                const price = getFirstVariantPrice(p)
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    className={[
                      "w-full rounded-2xl border p-3 text-left transition",
                      selected
                        ? "border-violet-500 ring-2 ring-violet-200"
                        : "border-neutral-200 hover:border-neutral-300",
                    ].join(" ")}
                  >
                    <div className="text-sm font-medium">{p.title}</div>
                    <div className="mt-1 text-sm text-violet-600">
                      {price ? formatMoney(price.amount, price.currency) : ""}
                    </div>

                    <div className="mt-3 aspect-square w-full overflow-hidden rounded-xl bg-neutral-50">
                      {p.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="h-full w-full object-contain"
                        />
                      ) : null}
                    </div>

                    {/* Dummy rating UI (replace with your reviews integration if you have one) */}
                    <div className="mt-3 text-xs text-neutral-500">★★★★★ (—)</div>
                  </button>
                )
              })}
            </div>
          )}
        </main>

        {/* RIGHT: selected product panel */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-2xl border border-neutral-200 p-4">
            {!selectedId ? (
              <div className="text-sm text-neutral-500">Select a product</div>
            ) : loadingSelected ? (
              <div className="text-sm text-neutral-500">Loading product…</div>
            ) : !selectedProduct ? (
              <div className="text-sm text-neutral-500">Product not found</div>
            ) : (
              <SelectedPanel product={selectedProduct} />
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

// ----------------------------
// Right panel component (in same TSX file)
// ----------------------------
function SelectedPanel({ product }: { product: Product }) {
  const [activeImg, setActiveImg] = useState<string | null>(product.thumbnail || null)
  useEffect(() => {
    setActiveImg(product.thumbnail || product.images?.[0]?.url || null)
  }, [product.id, product.thumbnail, product.images])

  const price = getFirstVariantPrice(product)
  const images = useMemo(() => {
    const urls = [
      ...(product.thumbnail ? [product.thumbnail] : []),
      ...(product.images?.map((i) => i.url) || []),
    ]
    // unique
    return Array.from(new Set(urls)).filter(Boolean)
  }, [product.thumbnail, product.images])

  return (
    <div>
      {/* hero image */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-50">
        {activeImg ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={activeImg} alt={product.title} className="h-full w-full object-contain" />
        ) : null}
      </div>

      {/* thumbs */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-auto pb-1">
          {images.slice(0, 6).map((url) => {
            const active = url === activeImg
            return (
              <button
                key={url}
                onClick={() => setActiveImg(url)}
                className={[
                  "h-14 w-14 flex-none overflow-hidden rounded-xl border bg-neutral-50",
                  active ? "border-violet-400 ring-2 ring-violet-200" : "border-neutral-200",
                ].join(" ")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-contain" />
              </button>
            )
          })}
        </div>
      )}

      {/* title + price */}
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{product.title}</div>
          <div className="mt-1 text-xs text-neutral-500">★★★★★ (—) · See all reviews</div>
        </div>
        <div className="text-lg font-semibold">
          {price ? formatMoney(price.amount, price.currency) : ""}
        </div>
      </div>

      {/* “chips” like screenshot */}
      <div className="mt-3 flex flex-wrap gap-2">
        {(product.categories || []).slice(0, 3).map((c) => (
          <span
            key={c.id}
            className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700"
          >
            {c.name}
          </span>
        ))}
        {(product.tags || []).slice(0, 2).map((t) => (
          <span
            key={t.id}
            className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-700"
          >
            {t.value}
          </span>
        ))}
      </div>

      {/* description */}
      {product.description ? (
        <p className="mt-3 text-sm leading-6 text-neutral-700">{product.description}</p>
      ) : (
        <p className="mt-3 text-sm leading-6 text-neutral-500">
          No description provided.
        </p>
      )}

      <hr className="my-4 border-neutral-200" />

      {/* “spec bars” like screenshot (static UI placeholders) */}
      <SpecBars />
    </div>
  )
}

function SpecBars() {
  const rows = [
    { label: "Function", fill: 0.55 },
    { label: "Aesthetic", fill: 0.72 },
    { label: "Durability", fill: 0.63 },
    { label: "Space", fill: 0.48 },
  ]

  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="text-xs font-medium text-neutral-600">{r.label}</div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div className="h-full bg-neutral-300" style={{ width: `${r.fill * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
