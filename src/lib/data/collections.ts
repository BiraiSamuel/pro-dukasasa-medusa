"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next,
        cache: "force-cache",
      }
    )
    .then(({ collection }) => collection)
}

export const listCollections = async (
  _queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const collections: HttpTypes.StoreCollection[] = [
    {
      id: "col-1",
      handle: "summer-sale",
      title: "Summer Sale",
    },
    {
      id: "col-2",
      handle: "new-arrivals",
      title: "New Arrivals",
    },
    {
      id: "col-3",
      handle: "best-sellers",
      title: "Best Sellers",
    },
    {
      id: "col-4",
      handle: "clearance",
      title: "Clearance",
    },
    {
      id: "col-5",
      handle: "eco-products",
      title: "Eco Products",
    },
    {
      id: "col-6",
      handle: "gift-ideas",
      title: "Gift Ideas",
    },
  ]

  return {
    collections,
    count: collections.length,
  }
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection> => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: { handle, fields: "*products" },
      next,
      cache: "force-cache",
    })
    .then(({ collections }) => collections[0])
}

export async function getFeaturedProducts(): Promise<any[]> {
  try {
    const res = await fetch(
      `https://kenyaeastklad.dukasasa.co.ke/api/products?limit=8&page=1`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      }
    )

    if (!res.ok) throw new Error("Failed to fetch featured products")

    const json = await res.json()
    return json.data || []
  } catch (error) {
    console.error("❌ Error fetching featured products:", error)
    return []
  }
}

export async function getNewProducts(): Promise<any[]> {
  try {
    const res = await fetch(
      `https://kenyaeastklad.dukasasa.co.ke/api/products?new=1&limit=8&page=1`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
      }
    )

    if (!res.ok) throw new Error("Failed to fetch new products")

    const json = await res.json()
    return json.data || []
  } catch (error) {
    console.error("❌ Error fetching new products:", error)
    return []
  }
}

export async function getSalesOffers() {
  const [featured, newArrivals] = await Promise.all([
    getFeaturedProducts(),
    getNewProducts(),
  ])

  return { featured, newArrivals }
}