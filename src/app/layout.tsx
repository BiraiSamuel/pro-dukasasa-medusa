import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { Toaster } from "sonner"
import { CartProvider } from "@lib/context/CartProvider" // update the path

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <CartProvider>
        <Toaster richColors position="top-center" /> {/* or bottom-right */}
        <main className="relative">{props.children}</main>
        </CartProvider>
      </body>
    </html>
  )
}
