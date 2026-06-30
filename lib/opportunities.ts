import type { CloudCard } from "./getCollectionCloud"

export type Opportunity = CloudCard & { marketPrice: number; delta: number }

// Côté client uniquement : interroge /api/price pour chaque carte et
// retourne celles dont le marché actuel dépasse le prix enregistré.
export async function getOpportunities(cards: CloudCard[]): Promise<Opportunity[]> {
  const withMarket = await Promise.all(
    cards.map(async (c) => {
      try {
        const res = await fetch(`/api/price?name=${encodeURIComponent(c.name)}`)
        const data = res.ok ? await res.json() : { price: c.price }
        return { ...c, marketPrice: data.price as number }
      } catch {
        return { ...c, marketPrice: c.price }
      }
    })
  )

  return withMarket
    .filter((c) => c.marketPrice > (c.price || 0))
    .map((c) => ({ ...c, delta: c.marketPrice - (c.price || 0) }))
    .sort((a, b) => b.delta - a.delta)
}
