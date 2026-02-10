"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

// ✅ CHANGE THIS IMPORT PATH to where your cart actions file actually is
import { addToCart, getOrSetCart, retrieveCart } from "@lib/data/cart"

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
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      await getOrSetCart(countryCode)
      const cart = await retrieveCart(undefined, "id,*items")
      const item = cart?.items?.find((i: any) => i.variant_id === variantId)
      setQty(item?.quantity ?? 0)
    })
  }, [variantId, countryCode])

  // ✅ Only gate by inStock prop
  if (!inStock) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-lg border px-4 py-2 text-sm text-neutral-400 cursor-not-allowed"
        data-plp="oos"
      >
        Out of stock
      </button>
    )
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await addToCart({ variantId, quantity: 1, countryCode })
          router.refresh()
        })
      }
      className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition
        ${qty > 0 ? "bg-neutral-100 text-neutral-900 border" : "bg-neutral-900 text-white hover:bg-neutral-800"}
        ${isPending ? "opacity-60 cursor-wait" : ""}
      `}
      data-plp="add"
    >
      {qty > 0 ? `Added (${qty})` : "Add to cart"}
    </button>
  )
}
