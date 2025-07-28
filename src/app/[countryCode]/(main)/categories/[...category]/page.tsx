import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import listRegions from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: { category: string[]; countryCode: string }
  searchParams: {
    sortBy?: SortOptions
    page?: string
  }
}

export async function generateStaticParams() {
  try {
    const product_categories = await listCategories()
    const regions: StoreRegion[] = await listRegions()

    const countryCodes = regions
      ?.map((r) => r.countries?.map((c) => c.iso_2))
      .flat()
      .filter(Boolean)

    const categoryHandles = product_categories?.map(
      (category: any) => category.handle
    )

    const staticParams = countryCodes
      ?.map((countryCode: string) =>
        categoryHandles.map((handle: string) => {
          if (!countryCode || !handle) return null
          return {
            countryCode,
            category: [handle],
          }
        })
      )
      .flat()
      .filter(Boolean) // remove nulls

    return staticParams
  } catch (err) {
    console.error("Failed to generate static params:", err)
    return []
  }
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  try {
    const productCategory = await getCategoryByHandle(params.category)

    const title = `${productCategory.name} | Medusa Store`
    const description =
      productCategory.description ?? `${productCategory.name} category.`

    return {
      title,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch (error) {
    console.error("generateMetadata error:", error)
    notFound()
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: Props) {
  try {
    const { sortBy, page } = searchParams
    const productCategory = await getCategoryByHandle(params.category)

    if (!productCategory) {
      notFound()
    }

    return (
      <CategoryTemplate
        category={productCategory}
        sortBy={sortBy}
        page={page}
        countryCode={params.countryCode}
      />
    )
  } catch (error) {
    console.error("CategoryPage error:", error)
    notFound()
  }
}
