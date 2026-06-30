import { getRealPrice } from "./pricing/realPrice"

export type ScanResult = {
  name: string
  series: string
  rarity: string
  number?: string
  language: string

  conditionScore: number
  conditionLabel: "Mint" | "Near Mint" | "Excellent" | "Played"

  psaProbability: {
    psa10: number
    psa9: number
    psa8: number
  }

  estimatedPrice: number
  confidence: number
}

// 🧠 MOCK reconnaissance d'image (à remplacer par un vrai modèle de
// vision plus tard — voir TensorFlow.js dans le README). Le prix, lui,
// est déjà réel (scraping + cache via lib/pricing/realPrice.ts).
export async function analyzeCard(_imageBase64: string): Promise<ScanResult> {
  await new Promise((r) => setTimeout(r, 600))

  const name = "Dracaufeu ex"
  const price = await getRealPrice(name)

  return {
    name,
    series: "Évolutions Prismatiques",
    rarity: "Ultra Rare",
    number: "203/197",
    language: "FR",

    conditionScore: 92,
    conditionLabel: "Near Mint",

    psaProbability: {
      psa10: 62,
      psa9: 91,
      psa8: 98
    },

    estimatedPrice: price,
    confidence: 88
  }
}
