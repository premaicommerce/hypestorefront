"use client"

import { useMemo, useState } from "react"

type Img = { url?: string | null } | string

function normalizeImages(images: Img[] | undefined | null): string[] {
  if (!images?.length) return []
  return images
    .map((i) => (typeof i === "string" ? i : i?.url))
    .filter((u): u is string => typeof u === "string" && u.length > 0)
}

export default function ProductImageCarousel({
                                               images,
                                               title,
                                             }: {
  images: Img[] | undefined | null
  title?: string
}) {
  const urls = useMemo(() => normalizeImages(images), [images])
  const [idx, setIdx] = useState(0)

  const hasMany = urls.length > 1
  const current = urls[idx] ?? urls[0]

  function prev() {
    if (!hasMany) return
    setIdx((i) => (i - 1 + urls.length) % urls.length)
  }

  function next() {
    if (!hasMany) return
    setIdx((i) => (i + 1) % urls.length)
  }

  if (!current) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-neutral-100 flex items-center justify-center text-sm text-neutral-500">
        No image
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Main image */}
      <div className="relative overflow-hidden rounded-2xl border bg-neutral-50">
        <div className="aspect-square w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current}
            alt={title ?? "Product image"}
            className="h-full w-full object-contain p-4"
            loading="eager"
          />
        </div>

        {/* Prev/Next */}
        {hasMany && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 border shadow-sm hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 border shadow-sm hover:bg-white"
            >
              ›
            </button>

            {/* Counter */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 border px-3 py-1 text-xs text-neutral-700">
              {idx + 1} / {urls.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMany && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {urls.map((u, i) => (
            <button
              key={u + i}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border bg-white ${
                i === idx ? "ring-2 ring-emerald-500" : "hover:border-neutral-300"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
