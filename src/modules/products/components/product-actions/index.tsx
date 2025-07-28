"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { isEqual } from "lodash"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import Image from "next/image"

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}


function stripHtmlTags(html: string): string {
  if (!html) return ""
  return html.replace(/<[^>]*>/g, "").trim()
}

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

export default function ProductActions({ product }: ProductActionsProps) {
  //const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState<"add" | "buy" | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [activeImage, setActiveImage] = useState(product.images?.[0]?.large_image_url || product.images?.[0]?.url || "")

  const countryCode = useParams().countryCode as string
  const router = useRouter()

  //const [defaultVariant, setDefaultVariant] = useState<HttpTypes.StoreProductVariant | null>(null)

  //const [options, setOptions] = useState<Record<string, string>>({})
  //console.log(product.variants);

  // Find and set default variant on mount
  //console.log(product.variants);
  // Default variant selector
  const defaultVariant = useMemo(() => {
    if (!product?.variants?.length) return undefined

    const match = product.variants.find((variant) => {
      return variant.title?.toLowerCase().includes("medium")
    })

    return match ?? product.variants[0]
  }, [product])

  //console.log("✅ default variant match: ", defaultVariant)


  const [options, setOptions] = useState<Record<string, string>>(() => {
    if (!product?.variants?.length) return {}

    const match = product.variants.find((variant) => {
      const title = variant.title?.trim().toLowerCase()
      const sku = variant.sku?.trim()
      return (
        title === "medium"
      )
    })
    console.log("✅ match: ", match)

    return match?.options ? optionsAsKeymap(match.options) : {}
  })

  // Compute selected variant from current options
  const selectedVariant = useMemo(() => {
    return (
      product.variants?.find(
        (v) => isEqual(optionsAsKeymap(v.options), options)
      ) ?? defaultVariant
    )
  }, [product, options, defaultVariant])

  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => isEqual(optionsAsKeymap(v.options), options))
  }, [product.variants, options])

  const inStock = selectedVariant ? selectedVariant.inStock : product.inStock

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")
  console.log("✅ variant", selectedVariant);

  const handleAddToCart = async (redirectToCheckout = false) => {
    if (!selectedVariant?.id) {
      toast.error("Please select a valid variant.")
      return
    }

    setIsAdding(redirectToCheckout ? "buy" : "add")

    try {
      // 🔧 Construct payload
      const payload: any = {
        product_id: product.id,
        quantity,
      }

      // ✅ Configurable product handling
      if (product.options?.length && selectedVariant) {
        payload.selected_configurable_option = selectedVariant.id
        payload.super_attribute = {}

        for (const opt of product.options) {
          const selected = options[opt.id]
          if (selected) {
            payload.super_attribute[opt.id] = selected
          }
        }
      }
      console.log("✅ Passed to payload section:",payload);

      const res = await fetch(`/api/proxy/cart/add/${product.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })

      const response = await res.json()

      if (!res.ok) {
        toast.error(response?.message || "Failed to add to cart.")
        console.error("Cart error:", response)
      } else {
        toast.success(`${product.title} added to cart`)
        if (redirectToCheckout) {
          router.push("/ke/checkout")
        }
      }
    } catch (err: any) {
      toast.error("Something went wrong. Try again.")
      console.error(err)
    } finally {
      setIsAdding(null)
    }
  }

  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount))
  }
  console.log("Default variant:", selectedVariant)

  //setSelectedVariant = getVariantFromOptions(product, options) ?? defaultVariant

  console.log("In stock?", inStock);
  return (
    <>
      <div className="flex flex-col gap-y-4" ref={actionsRef}>
        {product.short_description && (
          <p className="text-sm text-gray-700 leading-relaxed border-b pb-2">
            {stripHtmlTags(product.short_description).substring(0, 140)}...
          </p>
        )}

        {product.options?.map((attr) => (
          <div key={attr.id} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 mb-1">{attr.name}</label>
            <div className="flex flex-wrap gap-2">
              {attr.values?.map((opt: any) => (
                <button
                  key={opt.id}
                  className={`px-3 py-1 rounded border text-sm ${
                    options[attr.id] === opt.id ? "bg-gray-800 text-white" : "bg-white text-gray-800"
                  }`}
                  onClick={() => setOptionValue(attr.id.toString(), opt.id)}
                  disabled={isAdding !== null}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        <Divider />

        <ProductPrice product={product} variant={selectedVariant} />

        <p className={`text-sm font-medium ${inStock ? "text-green-600" : "text-red-600"}`}>
          {inStock ? "In stock" : "Out of stock"}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Quantity:</span>
          <div className="flex items-center border rounded-md overflow-hidden">
            <button
              className="px-3 py-1 text-lg font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
            >
              −
            </button>
            <input
              type="number"
              value={quantity}
              min={1}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
              className="w-12 text-center text-sm border-l border-r"
            />
            <button
              className="px-3 py-1 text-lg font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => handleQuantityChange(1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button
            onClick={() => handleAddToCart(false)}
            disabled={!inStock}
            variant="outline"
            className="w-full h-10"
            isLoading={isAdding === "add"}
          >
            {!selectedVariant && !options
              ? "Select variant"
              : !inStock
              ? "Out of stock"
              : "Add to cart"}
          </Button>

          <Button
            onClick={() => handleAddToCart(true)}
            disabled={!inStock}
            variant="primary"
            className="w-full h-10"
            isLoading={isAdding === "buy"}
          >
            Buy Now
          </Button>
        </div>

        <div className="mt-6">
          <a
            href="https://intasend.com/security"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://intasend-prod-static.s3.amazonaws.com/img/trust-badges/intasend-trust-badge-with-mpesa-hr-dark.png"
              width="300"
              alt="IntaSend Secure Payments"
              className="mx-auto"
            />
          </a>
          <a
            href="https://intasend.com/security"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-xs mt-2 text-gray-500 hover:underline text-center"
          >
            Secured by IntaSend Payments
          </a>
        </div>

        <div className="mt-4 text-sm text-gray-700">
          <h3 className="text-md font-semibold mb-2">Customer Reviews</h3>
          {product.reviews && (
            <p className="text-sm text-yellow-600 font-medium mb-2">
              ★★★★★ Rated {product.reviews.average_rating} based on {product.reviews.total} reviews
            </p>
          )}
          <a href="#reviews" className="text-blue-600 hover:underline text-sm mt-1 block">Read all reviews</a>
        </div>

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={() => handleAddToCart(false)}
          isAdding={isAdding !== null}
          show={!inView}
          optionsDisabled={isAdding !== null}
        />
      </div>
    </>
  )
}