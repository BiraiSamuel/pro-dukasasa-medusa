import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

// ✅ Fetch categories from Bagisto's API endpoint
export const listCategories = async (): Promise<HttpTypes.StoreProductCategory[]> => {
  const next = {
    ...(await getCacheOptions("categories")),
  }

  const res = await fetch(`https://kenyaeastklad.dukasasa.co.ke/api/categories`, {
    headers: { Accept: "application/json" },
    cache: "force-cache",
    ...next,
  })

  if (!res.ok) {
    console.error(`Failed to fetch categories: ${res.status}`)
    return []
  }

  const json = await res.json()

  // Map raw category data to StoreProductCategory format
  const categories: HttpTypes.StoreProductCategory[] = (json.data || []).map((c: any) => ({
    id: String(c.id),
    name: c.name,
    handle: c.slug || c.handle || c.name.toLowerCase().replace(/\s+/g, "-"),
    parent_category: c.parent_id
      ? { id: String(c.parent_id), name: "", handle: "" }
      : null,
    category_children: (c.children_data || []).map((child: any) => ({
      id: String(child.id),
      name: child.name,
      handle: child.slug || child.handle,
      parent_category: c.parent_id
        ? { id: String(c.id), name: c.name, handle: c.slug }
        : { id: String(c.id), name: c.name, handle: c.slug },
    })),
    // Include products if Bagisto returns them:
    products: c.products || [],
  }))

  return categories
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  const next = {
    ...(await getCacheOptions("categories")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
