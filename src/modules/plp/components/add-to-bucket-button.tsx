"use client"

import { useEffect, useState } from "react"

const KEY = "plp_bucket_v1"

type Bucket = Record<string, number>

function readBucket(): Bucket {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Bucket) : {}
  } catch {
    return {}
  }
}

function writeBucket(bucket: Bucket) {
  window.localStorage.setItem(KEY, JSON.stringify(bucket))
  // notify other components/tabs
  window.dispatchEvent(new Event("bucket:update"))
}

export default function AddToBucketButton({
                                            productId,
                                            className = "",
                                          }: {
  productId: string
  className?: string
}) {
  const [qty, setQty] = useState(0)

  useEffect(() => {
    const sync = () => {
      const bucket = readBucket()
      setQty(bucket[productId] ?? 0)
    }

    sync()

    window.addEventListener("storage", sync)
    window.addEventListener("bucket:update", sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener("bucket:update", sync)
    }
  }, [productId])

  function addOne() {
    const bucket = readBucket()
    bucket[productId] = (bucket[productId] ?? 0) + 1
    writeBucket(bucket)
    setQty(bucket[productId])
  }

  return (
    <button
      type="button"
      onClick={addOne}
      className={
        "relative w-full rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-800 transition " +
        className
      }
    >

    </button>
  )
}
