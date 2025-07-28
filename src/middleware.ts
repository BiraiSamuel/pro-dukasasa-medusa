import { NextRequest, NextResponse } from "next/server"

const DEFAULT_REGION = "ke"

const countryToRegionMap: Record<string, string> = {
  us: "North America",
  ke: "East Africa",
  ng: "West Africa",
  gb: "Europe",
  in: "South Asia",
  ca: "North America",
  de: "Europe",
  fr: "Europe",
  // Extend as needed
}

async function getCountryCodeFromIP(): Promise<string | null> {
  try {
    const res = await fetch("https://ipapi.co/json")
    const data = await res.json()
    console.log("✅ Ip Fetch:", data.countryCode);
    return data.country_code?.toLowerCase() || null
  } catch (e) {
    console.error("IP lookup failed:", e)
    return null
  }
}

async function determineCountryCode(request: NextRequest): Promise<string> {
  // Force to KE for Kenyan domain
  /**if (request.nextUrl.hostname.includes("dukasasa.co.ke")) {
    return "ke"
  }**/

  const urlCountry = request.nextUrl.pathname.split("/")[1]?.toLowerCase()
  if (urlCountry && countryToRegionMap[urlCountry]) return urlCountry

  const cookieCountry = request.cookies.get("_region")?.value
  if (cookieCountry && countryToRegionMap[cookieCountry]) return cookieCountry

  // Try IP header
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0] || undefined
  const ipCountry = await getCountryCodeFromIP(ip)
  if (ipCountry && countryToRegionMap[ipCountry]) return ipCountry

  return DEFAULT_REGION
}


export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip static assets, API routes, or checkout
  const isAsset = pathname.includes(".") || pathname.startsWith("/images") || pathname.startsWith("/assets")
  const isApi = pathname.startsWith("/api")
  const isCheckout = pathname.startsWith("/checkout")

  if (isAsset || isApi || isCheckout) return NextResponse.next()

  const cacheIdCookie = request.cookies.get("_region_cache_id")
  const regionCookie = request.cookies.get("_region")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const countryCode = await determineCountryCode(request)

  const urlHasCountryCode = pathname.split("/")[1]?.toLowerCase() === countryCode

  let response = NextResponse.next()

  if (urlHasCountryCode) {
    if (!regionCookie || !cacheIdCookie) {
      response = NextResponse.next()
      response.cookies.set("_region", countryCode, { maxAge: 60 * 60 * 24 })
      response.cookies.set("_region_cache_id", cacheId, { maxAge: 60 * 60 * 24 })
    }
    return response
  }

  // Redirect to localized path
  const redirectPath = pathname === "/" ? "" : pathname
  const query = request.nextUrl.search || ""
  const redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${query}`

  response = NextResponse.redirect(redirectUrl, 307)
  response.cookies.set("_region", countryCode, { maxAge: 60 * 60 * 24 })
  response.cookies.set("_region_cache_id", cacheId, { maxAge: 60 * 60 * 24 })

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp|api).*)",
  ],
}