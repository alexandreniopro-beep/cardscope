import { MarketData, MarketPoint } from "./market"

function randomWalk(base: number, points: number): MarketPoint[] {
  const data: MarketPoint[] = []
  let price = base

  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * 0.08
    price = Math.max(1, price + price * change)

    data.push({
      date: Date.now() - (points - i) * 86400000,
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 50 + 5)
    })
  }

  return data
}

// Historique simulé pour l'affichage du graphique. Le prix "actuel" réel
// (via /api/price) peut être injecté en dernier point par l'appelant.
export function getMockMarket(cardName: string, basePrice?: number): MarketData {
  const base = basePrice ?? 150 + Math.random() * 100

  const history = randomWalk(base, 30)
  const prices = history.map((p) => p.price)

  const current = prices[prices.length - 1]
  const start = prices[0]

  const trend7d =
    ((current - prices[prices.length - 7]) / prices[prices.length - 7]) * 100

  const trend30d = ((current - start) / start) * 100

  const volatility = Math.max(...prices) - Math.min(...prices)

  return {
    cardId: cardName,
    currentPrice: current,
    low24h: Math.min(...prices.slice(-1)),
    high24h: Math.max(...prices.slice(-1)),
    trend7d: parseFloat(trend7d.toFixed(2)),
    trend30d: parseFloat(trend30d.toFixed(2)),
    volatility: parseFloat(volatility.toFixed(2)),
    history
  }
}
