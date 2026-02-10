// src/modules/plp/components/add-to-cart-button.tsx
"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

// ✅ Change this import to the real path of your cart actions file if needed
import {
  addToCart,
  getOrSetCart,
  retrieveCart,
  updateLineItem,
  deleteLineItem,
} from "@lib/data/cart"

export default function AddToCartButton({
                                          variantId,
                                          countryCode,
                                          inStock,
                                        }: {
  variantId: string
  countryCode: string
  inStock: boolean
}) {
  const router = useRouter()
  const [qty, setQty] = useState(0)
  const [lineId, setLineId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function sync() {
    await getOrSetCart(countryCode)
    const cart = await retrieveCart(undefined, "id,*items")
    const item = cart?.items?.find((i: any) => i.variant_id === variantId)
    setQty(item?.quantity ?? 0)
    setLineId(item?.id ?? null)
  }

  useEffect(() => {
    startTransition(async () => {
      await sync()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantId, countryCode])

  if (!inStock) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-lg border px-4 py-2 text-sm text-neutral-400 cursor-not-allowed"
      >
        Out of stock
      </button>
    )
  }

  function inc() {
    startTransition(async () => {
      await addToCart({ variantId, quantity: 1, countryCode })
      await sync()
      router.refresh()
    })
  }

  function dec() {
    if (!lineId || qty <= 0) return

    startTransition(async () => {
      const nextQty = qty - 1
      if (nextQty <= 0) {
        await deleteLineItem(lineId)
      } else {
        await updateLineItem({ lineId, quantity: nextQty })
      }
      await sync()
      router.refresh()
    })
  }

  // qty = 0 => show colorful Add button
  if (qty <= 0) {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={inc}
        className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition
          bg-gradient-to-r from-emerald-500 to-teal-500
          hover:from-emerald-600 hover:to-teal-600
          active:scale-[0.98]
          ${isPending ? "opacity-70 cursor-wait" : "shadow-sm"}
        `}
      >
        🛒 Add to cart
      </button>
    )
  }

  // qty > 0 => show colorful controls: [-] Added(qty) [+]
  return (
    <div className="w-full flex items-center gap-2">
      {/* Minus */}
      <button
        type="button"
        onClick={dec}
        disabled={isPending || qty <= 0}
        className={`h-10 w-10 rounded-lg text-lg font-semibold transition
          ${
          isPending || qty <= 0
            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
            : "bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95"
        }
        `}
        aria-label="Decrease quantity"
      >
        −
      </button>

      {/* Center status (click = add more) */}
      <button
        type="button"
        onClick={inc}
        disabled={isPending}
        className={`flex-1 h-10 rounded-lg text-sm font-semibold transition
          bg-gradient-to-r from-emerald-500 to-teal-500
          text-white shadow-sm
          hover:from-emerald-600 hover:to-teal-600
          active:scale-[0.98]
          ${isPending ? "opacity-70 cursor-wait" : ""}
        `}
      >
        Added · {qty}
      </button>

      {/* Plus */}
      <button
        type="button"
        onClick={inc}
        disabled={isPending}
        className={`h-10 w-10 rounded-lg text-lg font-semibold transition
          ${
          isPending
            ? "bg-neutral-100 text-neutral-400 cursor-wait"
            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:scale-95"
        }
        `}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
