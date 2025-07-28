"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Image from "next/image"
import { useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(images?.[0])

  if (!selectedImage) return null

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Main Image */}
      <Container className="relative aspect-[4/5] w-full max-w-lg overflow-hidden bg-ui-bg-subtle rounded-lg">
        <Image
          src={selectedImage.url}
          alt="Selected product image"
          fill
          priority
          className="object-cover"
        />
      </Container>

      {/* Thumbnails */}
      <div className="flex gap-2 flex-wrap justify-center">
        {images.map((img, index) => (
          <button
            key={img.id ?? `thumb-${index}`}
            onClick={() => setSelectedImage(img)}
            className={`relative w-20 h-20 border-2 rounded-md overflow-hidden ${
              selectedImage.url === img.url ? "border-blue-600" : "border-transparent"
            }`}
          >
            <Image
              src={img.url}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export default ImageGallery