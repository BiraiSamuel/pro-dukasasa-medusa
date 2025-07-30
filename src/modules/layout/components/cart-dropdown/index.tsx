"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { Button } from "@medusajs/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"
import { useCartStore } from "@store/cartStore"
import toast from "react-hot-toast";

const CartDropdown = () => {
  const pathname = usePathname()

  const quantity = useCartStore((state) => state.quantity)
  const fetchCart = useCartStore((state) => state.fetchCart)

  const [cartData, setCartData] = useState<any>(null)
  const itemRef = useRef<number>(quantity || 0)
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timeout>()
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const timedOpen = () => {
    open()
    const timer = setTimeout(close, 5000)
    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) clearTimeout(activeTimer)
    open()
  }

  const loadCart = async () => {
    try {
      const res = await fetch("/api/proxy/cart", { cache: "no-store" })
      const json = await res.json()
      setCartData(json.cart?.data || null)
      console.log("cart data", json.cart.data.items)

      const items = json.cart?.data?.items || []
      //console.log(items);
      const total = items.reduce((sum: number, item: any) => sum + item.quantity, 0)
      useCartStore.getState().setQuantity(total)
    } catch (error) {
      setCartData(null)
      useCartStore.getState().setQuantity(0)
    }
  }

  useEffect(() => {
    loadCart()
  }, [])

  useEffect(() => {
    return () => {
      if (activeTimer) clearTimeout(activeTimer)
    }
  }, [activeTimer])

  useEffect(() => {
    if (itemRef.current !== quantity && !pathname.includes("/cart")) {
      timedOpen()
      itemRef.current = quantity
    }
  }, [quantity, pathname])

  const handleDelete = async (id: string) => {
    //console.log(id);
    try {
      const res = await fetch("/api/proxy/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: id }),
      });
      const result = await res.json();
      console.log(result);
      if (!result.success) throw new Error();
      toast.success("Item removed");
      await useCartStore.getState().fetchCart(); // ✅ refresh UI
      fetchCart();
    } catch {
      toast.error("Failed to remove item");
    }

    await loadCart()
  }

  const items = cartData?.items || []
  const subtotal = cartData?.base_grand_total || 0
  const currencyCode = cartData?.base_currency_code || "kes"

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <Popover className="relative h-full">
        <PopoverButton className="h-full">
          <LocalizedClientLink
            className="hover:text-ui-fg-base"
            href="/cart"
            data-testid="nav-cart-link"
          >{`Cart (${quantity})`}</LocalizedClientLink>
        </PopoverButton>

        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="hidden small:block absolute top-[calc(100%+1px)] right-0 bg-white border-x border-b border-gray-200 w-[420px] text-ui-fg-base"
            data-testid="nav-cart-dropdown"
          >
            <div className="p-4 flex items-center justify-center">
              <h3 className="text-large-semi">Cart</h3>
            </div>

            {items.length ? (
              <>
                <div className="overflow-y-scroll max-h-[402px] px-4 grid grid-cols-1 gap-y-8 no-scrollbar p-px">
                  {items
                    .sort((a, b) =>
                      (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                    )
                    .map((item) => (
                      <div
                        className="grid grid-cols-[122px_1fr] gap-x-4"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          className="w-24"
                        >
                          <Thumbnail
                            thumbnail={item.product.base_image.small_image_url}
                            images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>

                        <div className="flex flex-col justify-between flex-1">
                          <div className="flex flex-col flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex flex-col overflow-ellipsis whitespace-nowrap mr-4 w-[180px]">
                                <h3 className="text-base-regular overflow-hidden text-ellipsis">
                                  <LocalizedClientLink
                                    href={`/products/${item.product_handle}`}
                                    data-testid="product-link"
                                  >
                                    {item.product.name}
                                  </LocalizedClientLink>
                                </h3>
                                <LineItemOptions
                                  variant={item.product.type}
                                  data-testid="cart-item-variant"
                                />
                                <span
                                  data-testid="cart-item-quantity"
                                  data-value={item.quantity}
                                >
                                  Quantity: {item.quantity}
                                </span>
                              </div>
                              <div className="flex justify-end">
                                <LineItemPrice
                                  item={item}
                                  style="tight"
                                  currencyCode={currencyCode}
                                />
                              </div>
                            </div>
                          </div>

                          <DeleteButton
                            id={item.id}
                            className="mt-1"
                            data-testid="cart-item-remove-button"
                            onClick={() => handleDelete(item.id)}
                          >
                            Remove
                          </DeleteButton>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="p-4 flex flex-col gap-y-4 text-small-regular">
                  <div className="flex items-center justify-between">
                    <span className="text-ui-fg-base font-semibold">
                      Subtotal <span className="font-normal">(inc. taxes)</span>
                    </span>
                    <span
                      className="text-large-semi"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: currencyCode,
                      })}
                    </span>
                  </div>
                  <LocalizedClientLink href="/cart" passHref>
                    <Button className="w-full" size="large" data-testid="go-to-cart-button">
                      Go to cart
                    </Button>
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div className="flex py-16 flex-col gap-y-4 items-center justify-center">
                <div className="bg-gray-900 text-small-regular flex items-center justify-center w-6 h-6 rounded-full text-white">
                  <span>0</span>
                </div>
                <span>Your shopping bag is empty.</span>
                <LocalizedClientLink href="/store">
                  <>
                    <span className="sr-only">Go to all products page</span>
                    <Button onClick={close}>Explore products</Button>
                  </>
                </LocalizedClientLink>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
