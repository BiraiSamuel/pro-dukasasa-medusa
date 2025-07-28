import { retrieveCart } from "@lib/data/cart"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:8007"

async function fetchCartWithRetries(session: string, retries = 3, delayMs = 500): Promise<any> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(`${baseUrl}/api/proxy/cart`, {
      headers: {
        Accept: "application/json",
        Cookie: `bagisto_session=${session}`,
      },
      cache: "no-store", // always get fresh data
    })

    if (res.ok) {
      try {
        const data = await res.json()
        if (data?.cart?.data) {
          return data.cart.data
        }
      } catch (e) {
        // JSON parse error or empty body
      }
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  return null
}

export default async function Cart() {
  const cookieStore = cookies()
  const session = cookieStore.get("bagisto_session")?.value

  const cartData = await fetchCartWithRetries(session || "", 4, 700)

  if (!cartData) {
    return notFound()
  }

  const customer: HttpTypes.StoreCustomer = {
    id: "dummy-id",
    email: "demo@example.com",
    first_name: "Demo",
    last_name: "User",
    phone: "",
    has_account: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return <CartTemplate cart={cartData} customer={customer} />
}