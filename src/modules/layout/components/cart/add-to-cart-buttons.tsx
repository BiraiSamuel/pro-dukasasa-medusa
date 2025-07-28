"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

type Props = {
  productId: number
  variantId?: number
  quantity?: number
}

export default function AddToCartButtons({ productId, variantId, quantity = 1 }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<"add" | "buy" | null>(null)

  const handleAddToCart = async (redirect = false) => {
    try {
      setLoading(redirect ? "buy" : "add")
      const res = await fetch("/api/proxy/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          quantity,
          ...(variantId && { variant_id: variantId }),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || "Failed to add to cart")

      if (redirect) {
        router.push("/checkout")
      }
    } catch (error) {
      alert((error as Error).message)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="mt-4 flex gap-3">
      <Button
        onClick={() => handleAddToCart(false)}
        disabled={loading !== null}
        variant="outline"
      >
        {loading === "add" ? <Loader2 className="animate-spin h-4 w-4" /> : "Add to Cart"}
      </Button>
      <Button
        onClick={() => handleAddToCart(true)}
        disabled={loading !== null}
      >
        {loading === "buy" ? <Loader2 className="animate-spin h-4 w-4" /> : "Buy Now"}
      </Button>
    </div>
  )
}