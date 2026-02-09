"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

// 🔁 IMPORTANT: adjust this import to your actual path where the actions file is located
import {
  addToCart,
  updateLineItem,
  deleteLineItem,
  getOrSetCart,
  getLineItemForVariant,
} from "@lib/data/cart"
export default function CartQtyControls({
                                          countryCode,
                                          variantId,
                                        }: {
  countryCode: string
  variantId: string
}) {
  const router = useRouter()
  const [qty, setQty] = useState(0)
  const [lineId, setLineId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const minusDisabled = qty <= 0 || isPending

  async function sync() {
    // Ensure cart exists (sets cookie) then read qty for this variant
    await getOrSetCart(countryCode)
    const res = await getLineItemForVariant(variantId)
    setQty(res.quantity)
    setLineId(res.lineId)
  }

  useEffect(() => {
    startTransition(() => {
      sync().catch(() => {})
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, variantId])

  function inc() {
    startTransition(async () => {
      // If already exists, just update; else add
      if (lineId) {
        await updateLineItem({ lineId, quantity: qty + 1 })
      } else {
        await addToCart({ variantId, quantity: 1, countryCode })
      }

      await sync()
      router.refresh() // ✅ updates header/cart page server components
    })
  }

  function dec() {
    if (qty <= 0 || !lineId) return

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

  return (
    <div className="mt-3 flex items-center gap-2">
      <button
        type="button"
        onClick={dec}
        disabled={minusDisabled}
        className={`h-10 w-10 rounded-lg border text-lg leading-none ${
          minusDisabled ? "opacity-40 cursor-not-allowed" : "hover:bg-neutral-50"
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
