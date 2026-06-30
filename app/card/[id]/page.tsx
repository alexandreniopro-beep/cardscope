"use client"

import { useEffect, useState } from "react"
import { getMockMarket } from "@/lib/mockMarket"
import type { MarketData } from "@/lib/market"
import PriceChart from "@/components/PriceChart"

export default function CardMarketPage({
  params
}: {
  params: { id: string }
}) {
  const cardName = decodeURIComponent(params.id)
  const [market, setMarket] = useState<MarketData | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      let basePrice: number | undefined

      try {
        const res = await fetch(`/api/price?name=${encodeURIComponent(cardName)}`)
        if (res.ok) {
          const data = await res.json()
          basePrice = data.price
        }
      } catch {
        // on retombe sur le prix simulé si l'API échoue
      }

      if (!cancelled) setMarket(getMockMarket(cardName, basePrice))
    }

    load()
    return () => {
      cancelled = true
    }
  }, [cardName])

  if (!market) return <div className="p-6 text-white bg-black min-h-screen">Chargement...</div>

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-4">
      <h1 className="text-2xl font-bold">{market.cardId}</h1>
      <p className="text-xs text-gray-500">
        Historique simulé à partir du prix de marché actuel — utile pour visualiser une tendance, pas une donnée transactionnelle réelle.
      </p>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-900 p-3 rounded">
          💰 Prix actuel
          <br />
          <b>{market.currentPrice.toFixed(2)} €</b>
        </div>

        <div className="bg-gray-900 p-3 rounded">
          📈 7 jours
          <br />
          <b className={market.trend7d > 0 ? "text-green-400" : "text-red-400"}>
            {market.trend7d}%
          </b>
        </div>

        <div className="bg-gray-900 p-3 rounded">
          📊 30 jours
          <br />
          <b className={market.trend30d > 0 ? "text-green-400" : "text-red-400"}>
            {market.trend30d}%
          </b>
        </div>

        <div className="bg-gray-900 p-3 rounded">
          🌊 Volatilité
          <br />
          <b>{market.volatility.toFixed(2)} €</b>
        </div>
      </div>

      <PriceChart data={market.history} />
    </div>
  )
}
