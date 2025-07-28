"use client"

import { useEffect, useState } from "react"

const countryToRegionMap: Record<string, string> = {
  us: "North America",
  ke: "East Africa",
  ng: "West Africa",
  gb: "Europe",
  in: "South Asia",
  // Add more mappings
}

export default function getRegion() {
  const [countryCode, setCountryCode] = useState<string | null>(null)
  const [region, setRegion] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIPInfo = async () => {
      try {
        const res = await fetch("https://ipapi.co/json")
        const data = await res.json()
        const code = data.country_code?.toLowerCase()
        setCountryCode(code)
        setRegion(countryToRegionMap[code] ?? "Unknown Region")
      } catch (error) {
        console.error("Failed to fetch IP info", error)
        setRegion("Unknown")
      } finally {
        setLoading(false)
      }
    }

    fetchIPInfo()
  }, [])

  if (loading) return <p>Detecting your region...</p>

  return (
    <div>
      <p>Country: {countryCode?.toUpperCase()}</p>
      <p>Region: {region}</p>
    </div>
  )
}