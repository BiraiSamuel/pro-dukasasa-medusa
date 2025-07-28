import { Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"

export default function ProductPreview({
  product,
  isFeatured,
}: {
  product: any // Bagisto product shape
  isFeatured?: boolean
}) {
  const thumbnail = product.images?.[0]?.url || "/placeholder.png"
  const price = product.price || "0.00"
  const title = product.name
  const slug = product.url_key
  //console.log(product);

  return (
    <LocalizedClientLink href={`/products/${slug}`} className="group">
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex txt-compact-medium mt-4 justify-between">
          <Text className="text-ui-fg-subtle" data-testid="product-title">
            {title}
          </Text>
          <div className="flex items-center gap-x-2">
            <Text className="text-ui-fg-base font-medium">KSh {price}</Text>
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}