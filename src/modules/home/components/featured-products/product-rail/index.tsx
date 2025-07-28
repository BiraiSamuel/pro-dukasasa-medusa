import { listProducts } from "@lib/data/products"
import { getFeaturedProducts } from "@lib/data/collections"
import { Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"

export default async function ProductRail({
  title = "Featured Products",
}) {
  const products = await getFeaturedProducts();
  if (!products || products.length === 0) {
    console.log("empty here");
    return null
  }
  //console.log("✅  ProductRail is being rendered");
  //console.log(products);

  return (
    <div className="content-container py-12 small:py-24">
      <div className="flex justify-between mb-8">
        <Text className="txt-xlarge">{title}</Text>
          <InteractiveLink href='/store'>
            View all
          </InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 small:grid-cols-3 gap-x-6 gap-y-24 small:gap-y-36">
        {products.map((product: any) => (
          <li key={product.id}>
            <ProductPreview product={product} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}