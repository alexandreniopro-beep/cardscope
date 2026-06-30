import type { CloudCard } from "./getCollectionCloud"

export type Portfolio = {
  totalValue: number
  invested: number
  profit: number
  roi: number
}

export function computePortfolio(cards: CloudCard[]): Portfolio {
  const totalValue = cards.reduce((sum, c) => sum + (c.price || 0), 0)

  const invested = cards.reduce((sum, c) => sum + (c.buyPrice ?? c.price ?? 0), 0)

  const profit = totalValue - invested
  const roi = invested > 0 ? (profit / invested) * 100 : 0

  return { totalValue, invested, profit, roi }
}
