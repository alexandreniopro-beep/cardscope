export type GarageInput = {
  name: string
  marketPrice: number
  confidence: number
}

export type GarageResult = {
  name: string
  estimatedValue: number
  sellerPrice: number
  margin: number
  decision: "BUY" | "PASS" | "WATCH"
  confidence: number
}

export function evaluateGarageDeal(
  input: GarageInput,
  sellerPrice: number
): GarageResult {
  const margin = input.marketPrice - sellerPrice

  let decision: GarageResult["decision"] = "WATCH"

  if (margin > 30 && input.confidence > 80) {
    decision = "BUY"
  } else if (margin < 0) {
    decision = "PASS"
  }

  return {
    name: input.name,
    estimatedValue: input.marketPrice,
    sellerPrice,
    margin: parseFloat(margin.toFixed(2)),
    decision,
    confidence: input.confidence
  }
}
