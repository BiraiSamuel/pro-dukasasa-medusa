"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  currencyCode: string
}

const Item = ({ item, currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product.url_key}`}
          className="flex w-24"
        >
          <Thumbnail
            thumbnail={item.product.base_image.small_image_url}
            images={item.product.images}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.name}
        </Text>
        <LineItemOptions variant={item.child} data-testid="product-variant" />
      </Table.Cell>

      <Table.Cell>
        <div className="flex gap-2 items-center w-28">
          <DeleteButton id={item.id} data-testid="product-delete-button" />
          <CartItemSelect
            value={item.quantity}
            onChange={(value) => changeQuantity(parseInt(value.target.value))}
            className="w-14 h-10 p-4"
            data-testid="product-select-button"
          >
            {Array.from(
              { length: Math.min(maxQuantity, 10) },
              (_, i) => (
                <option value={i + 1} key={i}>
                  {i + 1}
                </option>
              )
            )}
          </CartItemSelect>
          {updating && <Spinner />}
        </div>
        <ErrorMessage error={error} data-testid="product-error-message" />
      </Table.Cell>

      <Table.Cell className="hidden small:table-cell">
        <LineItemUnitPrice
          item={item}
          style="tight"
          currencyCode={currencyCode}
        />
      </Table.Cell>

      <Table.Cell className="!pr-0">
        <span className="flex flex-col items-end h-full justify-center">
          <span className="flex gap-x-1">
            <Text className="text-ui-fg-muted">{item.quantity}x </Text>
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </span>
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
