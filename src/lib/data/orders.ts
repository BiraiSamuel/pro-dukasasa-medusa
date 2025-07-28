"use server"

import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { HttpTypes } from "@medusajs/types"

const BAGISTO_BASE_URL = "https://kenyaeastklad.dukasasa.co.ke"

export const retrieveOrder = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
    Accept: "application/json",
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return fetch(`${BAGISTO_BASE_URL}/api/orders/${id}`, {
    method: "GET",
    headers,
    next,
    cache: "force-cache",
  })
    .then((res) => res.json())
    .then((data) => data?.data ?? null)
    .catch((err) => medusaError(err))
}

export const listOrders = async (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, any>
) => {
  const headers = {
    ...(await getAuthHeaders()),
    Accept: "application/json",
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  const params = new URLSearchParams({
    page: Math.floor(offset / limit + 1).toString(),
    limit: limit.toString(),
    ...filters,
  })

  return fetch(`${BAGISTO_BASE_URL}/api/orders?${params.toString()}`, {
    method: "GET",
    headers,
    next,
    cache: "force-cache",
  })
    .then((res) => res.json())
    .then((data) => data?.data ?? [])
    .catch((err) => medusaError(err))
}

export const createTransferRequest = async (
  state: {
    success: boolean
    error: string | null
    order: HttpTypes.StoreOrder | null
  },
  formData: FormData
): Promise<{
  success: boolean
  error: string | null
  order: HttpTypes.StoreOrder | null
}> => {
  const id = formData.get("order_id") as string

  if (!id) {
    return { success: false, error: "Order ID is required", order: null }
  }

  const headers = await getAuthHeaders()

  return fetch(`${BAGISTO_BASE_URL}/api/orders/${id}/transfer`, {
    method: "POST",
    headers,
  })
    .then((res) => res.json())
    .then((data) => ({ success: true, error: null, order: data?.data ?? null }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const acceptTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return fetch(`${BAGISTO_BASE_URL}/api/orders/${id}/accept-transfer`, {
    method: "POST",
    headers,
    body: JSON.stringify({ token }),
  })
    .then((res) => res.json())
    .then((data) => ({ success: true, error: null, order: data?.data ?? null }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const declineTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return fetch(`${BAGISTO_BASE_URL}/api/orders/${id}/decline-transfer`, {
    method: "POST",
    headers,
    body: JSON.stringify({ token }),
  })
    .then((res) => res.json())
    .then((data) => ({ success: true, error: null, order: data?.data ?? null }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}
