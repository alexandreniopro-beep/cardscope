"use client"

import { useEffect, useState } from "react"
import { getCollectionCloud, CloudCard } from "@/lib/getCollectionCloud"
import { computePortfolio } from "@/lib/portfolio"
import { getTopCards } from "@/lib/topCards"
import { getOpportunities, Opportunity } from "@/lib/opportunities"

export default function Dashboard() {
  const [cards, setCards] = useState<CloudCard[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCollectionCloud().then(async (data) => {
      setCards(data)
      setOpportunities(await getOpportunities(data))
      setLoading(false)
    })
  }, [])

  const portfolio = computePortfolio(cards)
  const top = getTopCards(cards)

  if (loading) {
    return <div className="min-h-screen bg-black text-white p-6">Chargement...</div>
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard CardScope</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 p-4 rounded-xl">
          💰 Valeur totale
          <p className="text-xl font-bold">{portfolio.totalValue.toFixed(2)} €</p>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl">
          📈 ROI
          <p className="text-xl font-bold text-green-400">{portfolio.roi.toFixed(2)} %</p>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl">
          💸 Investi
          <p>{portfolio.invested.toFixed(2)} €</p>
        </div>

        <div className="bg-gray-900 p-4 rounded-xl">
          📊 Profit
          <p className={portfolio.profit >= 0 ? "text-green-400" : "text-red-400"}>
            {portfolio.profit.toFixed(2)} €
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold">🔥 Top cartes</h2>
        <div className="space-y-2 mt-2">
          {top.map((c) => (
            <div key={c.id} className="bg-gray-900 p-3 rounded">
              {c.name} — {c.price} €
            </div>
          ))}
          {top.length === 0 && <p className="text-gray-500 text-sm">Aucune carte.</p>}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-yellow-400">💡 Opportunités</h2>
        <div className="space-y-2 mt-2">
          {opportunities.map((c) => (
            <div key={c.id} className="bg-gray-900 p-3 rounded border border-yellow-600">
              <p>{c.name}</p>
              <p className="text-sm text-green-400">+{c.delta.toFixed(2)} €</p>
            </div>
          ))}
          {opportunities.length === 0 && (
            <p className="text-gray-500 text-sm">Aucune opportunité détectée pour l'instant.</p>
          )}
        </div>
      </div>
    </div>
  )
}
