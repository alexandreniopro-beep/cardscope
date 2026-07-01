import { getRealPrice } from "./pricing/realPrice"
import { identifyCard } from "./ai/identifyCard"
import { lookupCatalog } from "./pokemonCatalog"

export type ScanResult = {
  name: string
  series: string
  rarity: string
  number?: string
  edition: string
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

  debug: {
    aiSeries: string
    aiNumber: string
    aiEdition: string
    catalogConfirmed: boolean
  }
}

const CONDITION_ESTIMATE = {
  conditionScore: 88,
  conditionLabel: "Near Mint" as const,
  psaProbability: { psa10: 55, psa9: 85, psa8: 96 }
}

export async function analyzeCard(imageBase64: string): Promise<ScanResult> {
  const identified = await identifyCard(imageBase64)

  const catalogMatch = await lookupCatalog(identified.name, identified.series, identified.number)

  const name = catalogMatch?.name || identified.name
  const series = catalogMatch?.seriesConfirmed ? catalogMatch.series : identified.series
  const rarity = catalogMatch?.seriesConfirmed ? catalogMatch.rarity : identified.rarity
  const number = catalogMatch?.seriesConfirmed ? catalogMatch.number : identified.number

  const price = await getRealPrice(name)

  return {
    name,
    series,
    rarity,
    number,
    edition: identified.edition,
    language: identified.language,

    ...CONDITION_ESTIMATE,

    estimatedPrice: price,
    confidence: identified.confidence,

    debug: {
      aiSeries: identified.series,
      aiNumber: identified.number,
      aiEdition: identified.edition,
      catalogConfirmed: catalogMatch?.seriesConfirmed ?? false
    }
  }
}
