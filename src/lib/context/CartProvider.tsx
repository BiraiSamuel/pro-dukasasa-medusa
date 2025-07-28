"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"

type CartContextType = {
  cart: HttpTypes.StoreCart | null
  setCart: (cart: HttpTypes.StoreCart | null) => void
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)

  const refreshCart = async () => {
  const maxRetries = 3
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch("/api/proxy/cart", {
        credentials: "include",
      })
      const data = await res.json()

      if (data?.cart) {
        setCart(data.cart)
        return
      }

      console.warn(`Cart is null, attempt ${attempt + 1}`)
    } catch (err) {
      console.error(`Failed to refresh cart (attempt ${attempt + 1})`, err)
    }

    // Exponential backoff: 300ms, 600ms, 1000ms
    await delay(300 * (attempt + 1))
  }

  // After retries, give up and set null
  console.error("Failed to load cart after retries.")
  setCart(null)
}


  useEffect(() => {
    refreshCart()
  }, [])

  return (
    <CartContext.Provider value={{ cart, setCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}