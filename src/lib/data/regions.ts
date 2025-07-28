// lib/data/regions.ts

export interface Region {
  id: string
  name: string
  countries: string[]
}

export default async function listRegions(): Promise<Region[]> {
  return [
    { id: "ke", name: "Kenya", countries: ["ke"] },
    { id: "us", name: "United States", countries: ["us"] },
    { id: "ng", name: "Nigeria", countries: ["ng"] },
    { id: "gb", name: "United Kingdom", countries: ["gb"] },
    { id: "in", name: "India", countries: ["in"] },
  ]
}