import { StrategyInput, StrategyResult } from "./types"

export function analyzeStrategy(input: StrategyInput): StrategyResult {
  let score = 0
  const reasons: string[] = []

  if (input.trend7d > 5) {
    score += 2
    reasons.push("Tendance court terme positive")
  }

  if (input.trend30d > 10) {
    score += 3
    reasons.push("Forte croissance mensuelle")
  }

  if (input.volatility > 20) {
    score -= 2
    reasons.push("Marché instable")
  }

  if (input.rarity.includes("Ultra")) {
    score += 2
    reasons.push("Carte rare")
  }

  if (input.conditionScore > 90) {
    score += 2
    reasons.push("Excellent état (grade potentiel)")
  }

  if (input.purchasePrice) {
    const gain = input.currentPrice - input.purchasePrice

    if (gain > 0) {
      score += 2
      reasons.push("Déjà en profit")
    } else {
      score -= 1
      reasons.push("Position en perte")
    }
  }

  let action: StrategyResult["action"] = "HOLD"

  if (score <= 0) action = "BUY_MORE"
  if (score <= 2) action = "HOLD"
  if (score >= 6) action = "SELL"
  if (score >= 8) action = "GRADE"

  const priceTarget6m =
    input.currentPrice * (1 + input.trend30d / 100 + 0.15)

  return {
    action,
    confidence: Math.min(95, Math.max(20, 50 + score * 5)),
    reasoning: reasons.length > 0 ? reasons.join(", ") : "Pas de signal fort détecté",
    priceTarget6m: parseFloat(priceTarget6m.toFixed(2))
  }
}
