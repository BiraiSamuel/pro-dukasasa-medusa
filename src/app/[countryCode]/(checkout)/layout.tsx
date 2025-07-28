"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import MedusaCTA from "@modules/layout/components/medusa-cta"
import Spinner from "@modules/common/icons/spinner"
import clsx from "clsx"
import { toast } from "react-hot-toast"

export default function CheckoutLayout() {
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [shippingLocation, setShippingLocation] = useState("")

  // Payment method is fixed, pre-selected
  const paymentMethod = "mpesa"

  const pickupLocations = [
    "Garden Estate/Thome/Marurui - Jumia JBN Roasters",
    "Adams Arcade - Jumia Adams Arcade",
    "CBD - Kimathi Street Eagle House",
    "Buruburu - Kloss Buruburu Station",
    "Fedha - Cossim Fedha Station",
    "Kahawa Sukari - Kloss Kahawa Sukari Station",
    "Kilimani - EBEE Kilimani Station",
    "Langata - Kloss Langata Station",
    "Kasarani - Cossim Kasarani Station",
    "Utawala - Kloss Utawala Pickup Station",
    "Karen - The Hub Karen Station",
    "Komarock - Lakeland Komarock Station",
  ]

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("/api/proxy/cart", { credentials: "include" })
        const data = await res.json()
        if (data.success && data.cart?.data) {
          const cartData = data.cart.data
          const items = cartData.items.map((item: any) => ({
            id: item.id,
            name: item.name || item.product?.name || "Unnamed Product",
            qty: item.quantity || 1,
            price: item.total || "0.00",
          }))
          setCart({ items, subtotal: cartData.base_sub_total || "0.00", raw: cartData })
        } else {
          throw new Error("Cart not found.")
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load cart.")
      } finally {
        setLoading(false)
      }
    }
    fetchCart()
  }, [])

  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isPhoneValid = (phone: string) => /^[0-9]{10,15}$/.test(phone)

  const makePurchase = async () => {
    if (loading || processing) return

    if (![firstName, lastName, email, phone, shippingLocation].every(Boolean)) {
      toast.error("Please fill in all required fields.")
      return
    }

    if (!isEmailValid(email)) return toast.error("Invalid email")
    if (!isPhoneValid(phone)) return toast.error("Invalid phone number")

    try {
      setProcessing(true)

      const address = {
        first_name: firstName,
        last_name: lastName,
        email,
        address1: { 0: `${shippingLocation}---Nairobi` },
        city: "Nairobi",
        country: "Kenya",
        state: "ke",
        postcode: "00100",
        phone,
        use_for_shipping: "true",
      }

      await Promise.all([
        fetch("/api/proxy/cart/save-address", {
          method: "POST",
          body: JSON.stringify({
            billing: address,
            shipping: { address1: address.address1 },
          }),
        }),
        fetch("/api/proxy/cart/save-shipping", {
          method: "POST",
          body: JSON.stringify({ shipping_method: "flatrate_flatrate" }),
        }),
        fetch("/api/proxy/cart/save-payment", {
          method: "POST",
          body: JSON.stringify({ payment: { method: "intasendcardmobilemoney" } }),
        }),
      ])

      const orderRes = await fetch("/api/proxy/cart/checkout", {
        method: "POST",
      })

      const orderJson = await orderRes.json()
      const orderId = orderJson.data?.id || cart?.raw?.id
      const rawAmount = orderJson.data?.grand_total || cart?.raw?.grand_total
      const amount = parseFloat(rawAmount).toFixed(2)

      if (!orderId || !amount) throw new Error("Invalid order")

      const checkoutRes = await fetch("/api/intasend/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          phone,
          amount,
          orderId,
        }),
      })

      const checkoutJson = await checkoutRes.json()

      toast.success("STK push sent. Check your phone.")
      if (orderJson.redirect_url) {
        window.location.href = orderJson.redirect_url
      }
    } catch (error: any) {
      toast.error("Checkout failed: " + error.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="w-full bg-white relative small:min-h-screen">
      <div className="h-16 bg-white border-b sticky top-0 z-50">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink href="/cart" className="text-small-semi text-ui-fg-base flex items-center gap-x-2 uppercase flex-1 basis-0">
            <ChevronDown className="rotate-90" size={16} />
            <span className="hidden small:block">Back to cart</span>
            <span className="block small:hidden">Back</span>
          </LocalizedClientLink>
          <LocalizedClientLink href="/" className="text-lg font-bold uppercase">
            Kenya East Klad
          </LocalizedClientLink>
          <div className="flex-1 basis-0 flex justify-end">
            {loading ? <Spinner className="w-4 h-4 animate-spin" /> : cart && (
              <span className="text-sm text-gray-700">
                {cart.items.length} items – Ksh {cart.subtotal}
              </span>
            )}
          </div>
        </nav>
      </div>

      <div className="p-6 content-container">
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner className="w-6 h-6 animate-spin" />
          </div>
        ) : cart?.items?.length ? (
          <>
            {/* Order Summary */}
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <ul className="divide-y divide-gray-200 mb-6">
              {cart.items.map((item: any) => (
                <li key={item.id} className="py-3 flex justify-between">
                  <span>{item.name} × {item.qty}</span>
                  <span className="font-medium">Ksh {item.price}</span>
                </li>
              ))}
            </ul>

            {/* Contact Details */}
            <div className="space-y-3 mb-6">
              <h3 className="text-lg font-semibold">Contact Details</h3>
              <div className="flex gap-4">
                <input type="text" placeholder="First Name" className="w-1/2 border px-3 py-2 rounded text-sm" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                <input type="text" placeholder="Last Name" className="w-1/2 border px-3 py-2 rounded text-sm" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <input type="email" placeholder="Email" className="w-full border px-3 py-2 rounded text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input type="tel" placeholder="Phone" className="w-full border px-3 py-2 rounded text-sm" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            {/* Shipping */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Shipping Location</h3>
              <select className="w-full border px-3 py-2 rounded text-sm" value={shippingLocation} onChange={(e) => setShippingLocation(e.target.value)}>
                <option value="">Select Pickup Location</option>
                {pickupLocations.map((loc, i) => (
                  <option key={i} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Payment */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Payment Method</h3>
              <select className="w-full border px-3 py-2 rounded text-sm bg-gray-100 cursor-not-allowed" disabled value={paymentMethod}>
                <option value="mpesa">Intasend Card (Visa | Mastercard) Mobile Money M-PESA</option>
              </select>
            </div>

            {/* Submit */}
            <button
              onClick={makePurchase}
              disabled={processing}
              className={clsx(
                "w-full py-3 rounded text-sm font-semibold",
                processing ? "bg-gray-400 text-white cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"
              )}
            >
              {processing ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="w-4 h-4 animate-spin text-white" />
                  Processing...
                </div>
              ) : (
                "Proceed to Checkout"
              )}
            </button>
          </>
        ) : (
          <p className="text-center text-gray-500">Your cart is empty.</p>
        )}
      </div>

      <div className="py-6 w-full flex justify-center border-t mt-6 bg-gray-50">
        <MedusaCTA />
      </div>
    </div>
  )
}
