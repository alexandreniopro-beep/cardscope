export type BatchItem = {
  name: string
  price: number
  confidence: number
}

export type BatchResult = {
  items: BatchItem[]
  totalValue: number
  averageConfidence: number
  lotVerdict: "GREAT DEAL" | "OK" | "BAD DEAL"
  profitPotential: number
}

export function evaluateBatch(items: BatchItem[], sellerTotal: number): BatchResult {
  const totalValue = items.reduce((sum, i) => sum + i.price, 0)

  const averageConfidence =
    items.reduce((sum, i) => sum + i.confidence, 0) / (items.length || 1)

  const profitPotential = totalValue - sellerTotal

  let lotVerdict: BatchResult["lotVerdict"] = "OK"

  if (profitPotential > 100 && averageConfidence > 80) {
    lotVerdict = "GREAT DEAL"
  } else if (profitPotential < 0) {
    lotVerdict = "BAD DEAL"
  }

  return {
    items,
    totalValue: parseFloat(totalValue.toFixed(2)),
    averageConfidence: parseFloat(averageConfidence.toFixed(2)),
    lotVerdict,
    profitPotential: parseFloat(profitPotential.toFixed(2))
  }
}
