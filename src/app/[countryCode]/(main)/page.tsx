import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections, getSalesOffers } from "@lib/data/collections"
import getRegion from "@lib/data/regions"

export const metadata: Metadata = {
  title: "Dukasasa Next.js Starter Template",
  description:
    "A performant frontend ecommerce starter template with Next.js 15 and Lightning Fast DukaSasa.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { featured,newArrivals } = await getSalesOffers();

  //console.log(featured, newArrivals);

  if (!featured || !region) {
    return null
  }

  return (
    <>
      <Hero />
      <div className="py-12">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={featured} region={region} />
        </ul>
      </div>
    </>
  )
}
