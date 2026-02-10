"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

// ✅ change this import to the real path of your cart actions file
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

  // qty = 0 => show simple Add button
  if (qty <= 0) {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={inc}
        className={`w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition ${
          isPending ? "opacity-60 cursor-wait" : ""
        }`}
      >
        Add to cart
      </button>
    )
  }

  // qty > 0 => show controls: [-] Added(qty) [+]
  return (
    <div className="w-full flex items-center gap-2">
      <button
        type="button"
        onClick={dec}
        disabled={isPending || qty <= 0}
        className={`h-10 w-10 rounded-lg border text-lg leading-none ${
          isPending || qty <= 0
            ? "opacity-40 cursor-not-allowed"
            : "hover:bg-neutral-50"
        }`}
        aria-label="Decrease quantity"
      >
        −
      </button>

      <button
        type="button"
        onClick={inc}
        disabled={isPending}
        className={`flex-1 h-10 rounded-lg border text-sm font-medium ${
          isPending ? "opacity-60 cursor-wait" : "hover:bg-neutral-50"
        }`}
      >
        Added ({qty})
      </button>

      <button
        type="button"
        onClick={inc}
        disabled={isPending}
        className={`h-10 w-10 rounded-lg border text-lg leading-none ${
          isPending ? "opacity-60 cursor-wait" : "hover:bg-neutral-50"
        }`}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
