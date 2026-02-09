"use client"

import { useEffect, useMemo, useState } from "react"

const CART_ID_KEY = "medusa_cart_id_v2"

function getEnv() {
  const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (!backend) throw new Error("NEXT_PUBLIC_MEDUSA_BACKEND_URL missing")
  if (!key) throw new Error("NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY missing")
  return { backend, key }
}

async function storeFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { backend, key } = getEnv()
  const res = await fetch(`${backend}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      "x-publishable-api-key": key,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => "")
    throw new Error(`${res.status} ${res.statusText}: ${txt}`)
  }
  return (await res.json()) as T
}

async function getOrCreateCart(countryCode?: string) {
  const existing = typeof window !== "undefined" ? localStorage.getItem(CART_ID_KEY) : null
  if (existing) return existing

  // Create cart (region is usually inferred in many setups; if your backend requires region_id,
  // we’ll adjust later. For now this matches common Medusa v2 store setups.)
  const body: any = {}
  if (countryCode) body.country_code = countryCode

  const created = await storeFetch<{ cart: { id: string } }>(`/store/carts`, {
    method: "POST",
    body: JSON.stringify(body),
  })

  localStorage.setItem(CART_ID_KEY, created.cart.id)
  return created.cart.id
}

type Cart = {
  cart: {
    id: string
    items: Array<{
      id: string
      quantity: number
      variant_id: string
    }>
  }
}

export default function CartQtyControls({
                                          variantId,
                                          countryCode,
                                        }: {
  variantId: string
  countryCode?: string
}) {
  const [cartId, setCartId] = useState<string | null>(null)
  const [itemId, setItemId] = useState<string | null>(null)
  const [qty, setQty] = useState<number>(0)
  const [busy, setBusy] = useState(false)
  const disabledMinus = qty <= 0 || busy

  // Load cart + qty
  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const id = await getOrCreateCart(countryCode)
        if (!mounted) return
        setCartId(id)

        const data = await storeFetch<Cart>(`/store/carts/${id}`)
        if (!mounted) return

        const found = data.cart.items.find((it) => it.variant_id === variantId)
        setItemId(found?.id ?? null)
        setQty(found?.quantity ?? 0)
      } catch (e) {
        // optional: console.error
      }
    })()

    return () => {
      mounted = false
    }
  }, [variantId, countryCode])

  async function refresh() {
    if (!cartId) return
    const data = await storeFetch<Cart>(`/store/carts/${cartId}`)
    const found = data.cart.items.find((it) => it.variant_id === variantId)
    setItemId(found?.id ?? null)
    setQty(found?.quantity ?? 0)
  }

  async function inc() {
    if (!cartId) return
    setBusy(true)
    try {
      // If item exists, update quantity; else add new line item
      if (itemId) {
        await storeFetch(`/store/carts/${cartId}/line-items/${itemId}`, {
          method: "POST",
          body: JSON.stringify({ quantity: qty + 1 }),
        })
      } else {
        await storeFetch(`/store/carts/${cartId}/line-items`, {
          method: "POST",
          body: JSON.stringify({ variant_id: variantId, quantity: 1 }),
        })
      }
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  async function dec() {
    if (!cartId || qty <= 0) return
    setBusy(true)
    try {
      if (!itemId) return

      const nextQty = qty - 1
      if (nextQty <= 0) {
        // remove item
        await storeFetch(`/store/carts/${cartId}/line-items/${itemId}`, {
          method: "DELETE",
        })
      } else {
        await storeFetch(`/store/carts/${cartId}/line-items/${itemId}`, {
          method: "POST",
          body: JSON.stringify({ quantity: nextQty }),
        })
      }
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        type="button"
        onClick={dec}
        disabled={disabledMinus}
        className={`h-10 w-10 rounded-lg border text-lg leading-none ${
          disabledMinus ? "opacity-40 cursor-not-allowed" : "hover:bg-neutral-50"
        }`}
        aria-label="Decrease quantity"
      >
        −
      </button>

      <div className="h-10 min-w-12 rounded-lg border flex items-center justify-center text-sm font-medium tabular-nums">
        {qty}
      </div>

      <button
        type="button"
        onClick={inc}
        disabled={busy}
        className={`h-10 w-10 rounded-lg border text-lg leading-none ${
          busy ? "opacity-60 cursor-wait" : "hover:bg-neutral-50"
        }`}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
