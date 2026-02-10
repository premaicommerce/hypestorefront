"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

// ✅ adjust if your cart actions file path differs
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
                                          maxQty, // ✅ inventory cap (null = no cap)
                                        }: {
  variantId: string
  countryCode: string
  inStock: boolean
  maxQty: number | null
}) {
  const router = useRouter()
  const [qty, setQty] = useState(0)
  const [lineId, setLineId] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
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

  const reachedMax = maxQty !== null && qty >= maxQty
  const plusDisabled = isPending || !inStock || reachedMax

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
    if (reachedMax) {
      setMsg(`Max stock reached (${maxQty})`)
      return
    }

    setMsg(null)

    startTransition(async () => {
      try {
        await addToCart({ variantId, quantity: 1, countryCode })
      } catch (e: any) {
        // Medusa inventory protection
        const text = String(e?.message ?? "")
        if (text.toLowerCase().includes("required inventory")) {
          setMsg("Max stock reached")
        } else {
          setMsg("Unable to add right now")
        }
      }
      await sync()
      router.refresh()
    })
  }

  function dec() {
    if (!lineId || qty <= 0) return
    setMsg(null)

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

  // qty = 0 => colorful Add button
  if (qty <= 0) {
    return (
      <div>
        <button
          type="button"
          disabled={plusDisabled}
          onClick={inc}
          className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition
            bg-gradient-to-r from-emerald-500 to-teal-500
            hover:from-emerald-600 hover:to-teal-600
            active:scale-[0.98]
            ${plusDisabled ? "opacity-70 cursor-not-allowed" : "shadow-sm"}
          `}
        >
          🛒 Add to cart
        </button>
        {msg ? <div className="mt-2 text-xs text-rose-600 text-center">{msg}</div> : null}
      </div>
    )
  }

  // qty > 0 => colorful controls
  return (
    <div>
      <div className="w-full flex items-center gap-2">
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

        <button
          type="button"
          onClick={inc}
          disabled={plusDisabled}
          className={`flex-1 h-10 rounded-lg text-sm font-semibold transition
            bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm
            hover:from-emerald-600 hover:to-teal-600 active:scale-[0.98]
            ${plusDisabled ? "opacity-70 cursor-not-allowed" : ""}
          `}
          title={reachedMax ? "Max stock reached" : "Add one more"}
        >
          Added · {qty}
        </button>

        <button
          type="button"
          onClick={inc}
          disabled={plusDisabled}
          className={`h-10 w-10 rounded-lg text-lg font-semibold transition
            ${
            plusDisabled
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:scale-95"
          }
          `}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      {reachedMax ? (
        <div className="mt-2 text-xs text-rose-600 text-center">
          Max stock reached{typeof maxQty === "number" ? ` (${maxQty})` : ""}
        </div>
      ) : msg ? (
        <div className="mt-2 text-xs text-rose-600 text-center">{msg}</div>
      ) : null}
    </div>
  )
}
