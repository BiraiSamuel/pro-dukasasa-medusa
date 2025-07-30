import { Github } from "@medusajs/icons"
import { Button, Heading } from "@medusajs/ui"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <span>
          <Heading
            level="h1"
            className="text-3xl leading-10 text-ui-fg-base font-normal"
          >
            Discover Style with Kenya East Klad
          </Heading>
          <Heading
            level="h2"
            className="text-2xl leading-9 text-ui-fg-subtle font-normal"
          >
            Premium fashion for the modern Kenyan wardrobe
          </Heading>
        </span>
        <a
          href="/ke/store"
        >
          <Button variant="secondary">
            Shop Now
          </Button>
        </a>
      </div>
    </div>
  )
}

export default Hero
