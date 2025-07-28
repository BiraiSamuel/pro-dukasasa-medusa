// ✅ Required for dynamic params like /[countryCode]/products/[handle]
export const dynamic = "force-dynamic"
export const revalidate = 3600

import { Metadata } from "next"
import { notFound } from "next/navigation"
import ProductTemplate from "@modules/products/templates"
import { getProductBySlug } from "@lib/data/products"
import AddToCartButtons from "@modules/layout/components/cart/add-to-cart-buttons" // adjust path accordingly

type Props = {
  params: { countryCode: string; handle: string }
}

// ✅ Generate Static Paths using slugs (Bagisto-style)
export async function generateStaticParams() {
  try {
    const res = await fetch("https://kenyaeastklad.dukasasa.co.ke/api/products?limit=10&page=1", {
      headers: { Accept: "application/json" },
      cache: "force-cache",
    })

    if (!res.ok) {
      throw new Error("Failed to fetch products")
    }

    const data = await res.json()

    return data.data.map((product: any) => ({
      handle: product.url_key,
    }))
  } catch (error) {
    console.error("⚠️ generateStaticParams error:", error)
    return [] // prevent build failure
  }
}

// ✅ SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.handle)

  if (!product) notFound()

  const title = `${product.name} | Kenya East Klad`
  const description = product.short_description || product.description || "Discover premium products from Kenya East Klad."
  const image = product.base_image?.large_image_url || product.base_image?.original_image_url || ""

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}

// ✅ Page Component
export default async function ProductPage({ params }: Props) {
  const { handle, countryCode } = params
  const product = await getProductBySlug(handle)
  //console.log(product);

  if (!product) notFound();

  //console.log("✅ Passed to product page:",product.super_attributes[0].options);

  const normalizedProduct = {
      id: product.id,
      title: product.name,
      description: product.description || "",
      short_description: product.short_description || "",
      thumbnail: product.base_image?.original_image_url,
      
      variants: product.variants?.map((v: any) => ({
        id: v.id,
        title: v.name,
        sku: v.sku,
        price: parseFloat(v.price || "0"),
        inStock: v.in_stock,
        image: v.base_image?.medium_image_url,
        attribute_values: v.attribute_values || {}, // Needed for matching swatches
      })) || [],

      options: product.super_attributes?.map((attr: any) => ({
        id: attr.id,
        name: attr.name,
        code: attr.code,
        values: attr.options?.map((o: any) => ({
          id: o.id,
          label: o.label,
          swatch: o.swatch_value || null,
        })) || [],
      })) || [],

      inStock: product.in_stock,
      price: parseFloat(product.variants?.[0]?.price || product.price || "0"),
      currency: "KES",

      images: [
        ...(product.images || []).map((img: any) => ({
          url: img.large_image_url || img.original_image_url || img.medium_image_url,
          alt: product.name,
        })),
        {
          url: product.base_image?.large_image_url ||
              product.base_image?.original_image_url ||
              product.base_image?.medium_image_url,
          alt: product.name,
        },
      ],
   }

  //console.log("THUMBNAIL:", normalizedProduct.thumbnail)

  return (
    <ProductTemplate
      product={normalizedProduct}
      region={{ currency_code: "KES", name: "Kenya" }}
      countryCode={countryCode}
    />
  )
}