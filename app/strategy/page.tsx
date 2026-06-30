"use client"

import { useEffect, useState } from "react"
import { getCollectionCloud, CloudCard } from "@/lib/getCollectionCloud"
import { analyzeStrategy } from "@/lib/strategy/engine"
import { StrategyResult } from "@/lib/strategy/types"
import { getMockMarket } from "@/lib/mockMarket"

type Row = { card: CloudCard; analysis: StrategyResult }

const ACTION_COLOR: Record<StrategyResult["action"], string> = {
  SELL: "text-red-400",
  GRADE: "text-purple-400",
  BUY_MORE: "text-green-400",
  HOLD: "text-yellow-400"
}

const ACTION_LABEL: Record<StrategyResult["action"], string> = {
  SELL: "Vendre",
  GRADE: "Faire grader",
  BUY_MORE: "Renforcer la position",
  HOLD: "Conserver"
}

export default function StrategyPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCollectionCloud().then((cards) => {
      const computed = cards.map((c) => {
        // Le trend/volatilité réels viennent du graphique de marché simulé
        // (lib/mockMarket.ts) en attendant un historique de ventes réel.
        const market = getMockMarket(c.name, c.price)

        const analysis = analyzeStrategy({
          name: c.name,
          currentPrice: c.price,
          purchasePrice: c.buyPrice,
          trend7d: market.trend7d,
          trend30d: market.trend30d,
          volatility: market.volatility,
          rarity: c.rarity || "Rare",
          conditionScore: 90
        })

        return { card: c, analysis }
      })

      setRows(computed)
      setLoading(false)
    })
  }, [])

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-4">
      <h1 className="text-2xl font-bold">IA Stratégie</h1>
      <p className="text-gray-400 text-sm">
        Recommandation par carte, basée sur la tendance de marché, la rareté et l'état.
      </p>

      {loading && <p className="text-gray-500">Chargement...</p>}

      {!loading && rows.length === 0 && (
        <p className="text-gray-500">
          Aucune carte à analyser —{" "}
          <a href="/scan" className="underline">
            scanne une carte
          </a>{" "}
          d'abord.
        </p>
      )}

      <div className="space-y-3">
        {rows.map(({ card, analysis }) => (
          <div key={card.id} className="bg-gray-900 p-4 rounded-xl space-y-1">
            <div className="flex justify-between items-center">
              <p className="font-semibold">{card.name}</p>
              <span className={`font-bold ${ACTION_COLOR[analysis.action]}`}>
                {ACTION_LABEL[analysis.action]}
              </span>
            </div>

            <p className="text-sm text-gray-400">{card.series} • {card.rarity}</p>
            <p className="text-sm text-gray-300">{analysis.reasoning}</p>

            <div className="flex justify-between text-sm mt-2">
              <span>🎯 Confiance : {analysis.confidence}%</span>
              <span>📈 Objectif 6 mois : {analysis.priceTarget6m} €</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
