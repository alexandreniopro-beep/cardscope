export type StrategyInput = {
  name: string
  currentPrice: number
  purchasePrice?: number
  trend7d: number
  trend30d: number
  volatility: number
  rarity: string
  conditionScore: number
}

export type StrategyResult = {
  action: "HOLD" | "SELL" | "GRADE" | "BUY_MORE"
  confidence: number
  reasoning: string
  priceTarget6m: number
}
