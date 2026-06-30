export type MarketPoint = {
  date: number
  price: number
  volume: number
}

export type MarketData = {
  cardId: string
  currentPrice: number
  low24h: number
  high24h: number
  trend7d: number
  trend30d: number
  volatility: number
  history: MarketPoint[]
}
