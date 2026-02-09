import { useInfiniteQuery } from "@tanstack/react-query"
import { sdk } from "../lib/config" // Your Medusa SDK instance

export const useProductsInfinite = () => {
  return useInfiniteQuery({
    queryKey: ["products"],
    queryFn: async ({ pageParam = 0 }) => {
      const { products, count } = await sdk.store.product.list({
        limit: 12,
        offset: pageParam,
      })
      return { products, count, nextOffset: pageParam + 12 }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.nextOffset < lastPage.count ? lastPage.nextOffset : undefined
    },
  })
}