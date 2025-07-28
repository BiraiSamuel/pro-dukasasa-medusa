"use server"

import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { sortProducts } from "@lib/util/sort-products"

const BAGISTO_API_URL = "https://kenyaeastklad.dukasasa.co.ke/api"

export const listProducts = async ({
  queryParams = {},
  pageParam = 1,
}: {
  queryParams?: Record<string, any>
  pageParam?: number
}) => {
  const baseUrl = "https://kenyaeastklad.dukasasa.co.ke/api/products"
  const limit = queryParams.limit || 6
  const page = pageParam || 1

  // Convert queryParams to URL query string
  const params = new URLSearchParams({
    ...Object.entries(queryParams)
      .filter(([_, v]) => v !== undefined && v !== null)
      .reduce((acc, [key, val]) => {
        acc[key] = String(val)
        return acc
      }, {} as Record<string, string>),
    page: String(page),
    limit: String(limit),
  })

  try {
    const res = await fetch(`${baseUrl}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      cache: "force-cache",
    })

    if (!res.ok) throw new Error("Failed to fetch Bagisto products")

    const json = await res.json()

    return {
      response: {
        products: json.data || [],
        count: json.meta?.pagination?.total || 0,
      },
      nextPage:
        json.meta?.pagination?.current_page < json.meta?.pagination?.total_pages
          ? page + 1
          : null,
    }
  } catch (err) {
    console.error("Error loading products from Bagisto:", err)
    return {
      response: {
        products: [],
        count: 0,
      },
      nextPage: null,
    }
  }
}

export const listProductsWithSort = async ({
  page = 1,
  queryParams,
  sortBy = "created_at",
}: {
  page?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  sortBy?: SortOptions
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> => {
  const limit = queryParams?.limit || 12

  const {
    response: { products, count },
  } = await listProducts({
    pageParam: 1,
    queryParams: {
      ...queryParams,
      limit: 100, // pre-fetch for sorting
    },
  })

  const sortedProducts = sortProducts(products, sortBy)

  const offset = (page - 1) * limit
  const paginatedProducts = sortedProducts.slice(offset, offset + limit)

  const nextPage = count > offset + limit ? page + 1 : null

  return {
    response: {
      products: paginatedProducts,
      count,
    },
    nextPage,
    queryParams,
  }
}

// src/lib/data/products.ts
export async function getProductBySlug(slug: string, retries = 2): Promise<any> {
  const url = `https://kenyaeastklad.dukasasa.co.ke/api/products/slug/${slug}`

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 20000)

    try {
      console.log(`🔎 Attempt ${attempt} - Fetching product from:`, url)

      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "BagistoClient/1.2",
        },
        cache: "no-store",
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!res.ok) {
        console.error(`❌ Failed with status ${res.status}`)
        return null
      }

      const json = await res.json()
      return json?.data || null
    } catch (error: any) {
      clearTimeout(timeout)

      if (error.name === "AbortError") {
        console.warn(`⏱️ Timeout on attempt ${attempt} — Retrying...`)
      } else {
        console.error(`❌ Fetch error on attempt ${attempt}:`, error)
      }

      if (attempt === retries + 1) {
        console.error("🛑 Final retry failed.")
        return null
      }

      await new Promise((res) => setTimeout(res, 500 * attempt))
    }
  }
}
