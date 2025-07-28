"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidateTag } from "next/cache"
import { getCacheTag } from "./cookies"

const API_BASE = "https://kenyaeastklad.dukasasa.co.ke"

function getSessionHeaders() {
  const cookieStore = cookies()
  const bagistoSession = cookieStore.get("bagistosession")?.value
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Cookie: `bagistosession=${bagistoSession || ""}`,
  }
}

export async function retrieveCustomer() {
  try {
    const res = await fetch(`${API_BASE}/api/customer/me`, {
      method: "GET",
      headers: getSessionHeaders(),
      cache: "no-store",
    })

    if (!res.ok) return null
    const json = await res.json()
    return json.data
  } catch {
    return null
  }
}

export async function updateCustomer(body: any) {
  const res = await fetch(`${API_BASE}/api/customer/update`, {
    method: "PUT",
    headers: getSessionHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error("Failed to update customer")

  const tag = await getCacheTag("customers")
  revalidateTag(tag)

  return await res.json()
}

export async function signup(prevState: any, formData: FormData) {
  const payload = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    password_confirmation: formData.get("password"),
  }

  try {
    const res = await fetch("/api/proxy/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || "Registration failed")
    return null
  } catch (err: any) {
    return err.message || "Unexpected error"
  }
}

export async function login(_: any, formData: FormData) {
  const payload = {
    email: formData.get("email"),
    password: formData.get("password"),
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/proxy/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    try {
      const err = await res.json()
      return err?.message || err?.error || "Login failed"
    } catch {
      return "Login failed"
    }
  }

  redirect("/ke")
}

export async function signout(countryCode: string) {
  await fetch(`${API_BASE}/api/customer/logout`, {
    method: "GET",
    headers: getSessionHeaders(),
  })

  const tag1 = await getCacheTag("customers")
  const tag2 = await getCacheTag("carts")
  revalidateTag(tag1)
  revalidateTag(tag2)

  cookies().delete("bagistosession")

  redirect(`/${countryCode}/account`)
}

/**
 * Transfer a guest cart to authenticated customer (Bagisto may not support cart transfer).
 * If using a proxy or custom endpoint, adjust accordingly.
 */
export async function transferCart() {
  const cookieStore = cookies()
  const cartId = cookieStore.get("cartId")?.value
  if (!cartId) return

  try {
    await fetch(`${API_BASE}/api/cart/transfer`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify({ cart_id: cartId }),
    })

    revalidateTag(await getCacheTag("carts"))
  } catch {
    // ignore errors
  }
}

export async function addCustomerAddress(
  currentState: Record<string, unknown>,
  formData: FormData
) {
  const address = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    company_name: formData.get("company"),
    address1: formData.get("address_1"),
    address2: formData.get("address_2"),
    city: formData.get("city"),
    state: formData.get("province"),
    country: formData.get("country_code"),
    postcode: formData.get("postal_code"),
    phone: formData.get("phone"),
    default_address: true,
  }

  try {
    const res = await fetch(`${API_BASE}/api/customer/addresses`, {
      method: "POST",
      headers: getSessionHeaders(),
      body: JSON.stringify(address),
    })

    if (!res.ok) throw new Error("Failed to create address")

    revalidateTag(await getCacheTag("customers"))

    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteCustomerAddress(addressId: string) {
  try {
    const res = await fetch(`${API_BASE}/api/customer/addresses/${addressId}`, {
      method: "DELETE",
      headers: getSessionHeaders(),
    })

    if (!res.ok) throw new Error("Failed to delete address")

    revalidateTag(await getCacheTag("customers"))

    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateCustomerAddress(
  currentState: Record<string, unknown>,
  formData: FormData
) {
  const addressId = (currentState.addressId as string) ||
    (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    company_name: formData.get("company"),
    address1: formData.get("address_1"),
    address2: formData.get("address_2"),
    city: formData.get("city"),
    state: formData.get("province"),
    country: formData.get("country_code"),
    postcode: formData.get("postal_code"),
    phone: formData.get("phone"),
  }

  try {
    const res = await fetch(`${API_BASE}/api/customer/addresses/${addressId}`, {
      method: "PUT",
      headers: getSessionHeaders(),
      body: JSON.stringify(address),
    })

    if (!res.ok) throw new Error("Failed to update address")

    revalidateTag(await getCacheTag("customers"))

    return { success: true, error: null }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
