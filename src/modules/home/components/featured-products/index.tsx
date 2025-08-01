import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"

export default async function FeaturedProducts({
  collections,
  region,
}: {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
}) {
  //console.log("here");
  return collections.map((collection) => (
    <li key={collection.id}>
      <ProductRail title="Top Products" />
    </li>
  ))
}
