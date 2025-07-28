"use client"

import { useEffect, useState } from "react"

type Product = {
  price: number
  currency?: string
  variants?: Variant[]
}

type Variant = {
  id: number
  title: string
  price: number
  inStock: boolean
}

type ProductPriceProps = {
  product: Product
  variant?: Variant
}

export default function ProductPrice({ product, variant }: ProductPriceProps) {
  const [displayPrice, setDisplayPrice] = useState(product.price)
  const currency = product.currency || "KES"

  useEffect(() => {
    if (variant) {
      setDisplayPrice(variant.price)
    } else {
      setDisplayPrice(product.price)
    }
  }, [variant, product.price])

  return (
    <div className="text-xl font-semibold text-gray-900">
      {new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
      }).format(displayPrice)}
    </div>
  )
}