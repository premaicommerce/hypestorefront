"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type FacetValue = { value: string; label: string; count?: number }
type Facet = {
  id: string
  title: string
  searchable?: boolean
  values: FacetValue[]
  initialVisibleCount?: number
}

function toggleMulti(sp: URLSearchParams, key: string, val: string) {
  const next = new URLSearchParams(sp)
  const current = next.getAll(key)
  next.delete(key)

  const exists = current.includes(val)
  const updated = exists ? current.filter((x) => x !== val) : [...current, val]
  updated.forEach((x) => next.append(key, x))

  next.delete("page")
  return next
}

export default function FacetSidebar({
                                       facets,
                                       showPrice,
                                     }: {
  facets: Facet[]
  showPrice?: boolean
}) {
  return (
    <div className="rounded-xl border bg-white">
      {showPrice && <PriceBlock />}
      {facets.map((f, idx) => (
        <FacetSection key={f.id} facet={f} defaultOpen={idx < 2} />
      ))}
    </div>
  )
}

function FacetSection({ facet, defaultOpen }: { facet: Facet; defaultOpen: boolean }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [open, setOpen] = useState(defaultOpen)
  const [q, setQ] = useState("")
  const [showAll, setShowAll] = useState(false)

  const selected = searchParams.getAll(facet.id)
  const visibleCount = facet.initialVisibleCount ?? 6

  const filtered = useMemo(() => {
    if (!facet.searchable || !q.trim()) return facet.values
    const qq = q.toLowerCase()
    return facet.values.filter((v) => v.label.toLowerCase().includes(qq))
  }, [facet.values, facet.searchable, q])

  const visible = showAll ? filtered : filtered.slice(0, visibleCount)

  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full px-4 py-4 flex items-center justify-between"
      >
        <div className="font-medium text-sm">{facet.title}</div>
        <span className="text-neutral-500">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <div className="px-4 pb-4">
          {facet.searchable && (
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="w-full mb-3 rounded-lg border px-3 py-2 text-sm"
            />
          )}

          <div className="space-y-2">
            {visible.map((v) => {
              const checked = selected.includes(v.value)
              return (
                <label key={v.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const next = toggleMulti(searchParams, facet.id, v.value)
                      router.push(`${pathname}?${next.toString()}`, { scroll: false })
                    }}
                  />
                  <span className="flex-1">{v.label}</span>
                  {typeof v.count === "number" && (
                    <span className="text-neutral-500 tabular-nums">({v.count})</span>
                  )}
                </label>
              )
            })}
          </div>

          {filtered.length > visibleCount && (
            <button
              type="button"
              onClick={() => setShowAll((s) => !s)}
              className="mt-3 text-sm text-neutral-700 hover:underline"
            >
              {showAll ? "See less" : "+ See All"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function PriceBlock() {
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const min = sp.get("minPrice") ?? ""
  const max = sp.get("maxPrice") ?? ""

  const [minPrice, setMinPrice] = useState(min)
  const [maxPrice, setMaxPrice] = useState(max)

  function apply() {
    const next = new URLSearchParams(sp)

    const mn = minPrice.trim()
    const mx = maxPrice.trim()

    if (mn) next.set("minPrice", mn)
    else next.delete("minPrice")

    if (mx) next.set("maxPrice", mx)
    else next.delete("maxPrice")

    next.delete("page")
    router.push(`${pathname}?${next.toString()}`, { scroll: false })
  }

  function clear() {
    const next = new URLSearchParams(sp)
    next.delete("minPrice")
    next.delete("maxPrice")
    next.delete("page")
    setMinPrice("")
    setMaxPrice("")
    router.push(`${pathname}?${next.toString()}`, { scroll: false })
  }

  return (
    <div className="border-b px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-medium text-sm">Price</div>
        {(min || max) && (
          <button
            type="button"
            onClick={clear}
            className="text-xs text-neutral-600 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          placeholder="Min"
          className="rounded-lg border px-3 py-2 text-sm"
          inputMode="numeric"
        />
        <input
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder="Max"
          className="rounded-lg border px-3 py-2 text-sm"
          inputMode="numeric"
        />
      </div>

      <button
        type="button"
        onClick={apply}
        className="mt-3 w-full rounded-lg bg-neutral-900 text-white py-2 text-sm hover:bg-neutral-800"
      >
        Apply
      </button>
    </div>
  )
}

