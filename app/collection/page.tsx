"use client"

import { useEffect, useState } from "react"
import { getCollectionCloud, CloudCard } from "@/lib/getCollectionCloud"

export default function CollectionPage() {
  const [cards, setCards] = useState<CloudCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCollectionCloud()
      .then(setCards)
      .finally(() => setLoading(false))
  }, [])

  const total = cards.reduce((sum, c) => sum + (c.price || 0), 0)

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold">Ma Collection</h1>

      <p className="text-gray-400 mt-1">
        {cards.length} cartes • Valeur estimée : {total.toFixed(2)} €
      </p>

      {loading && <p className="mt-4 text-gray-500">Chargement...</p>}

      <div className="mt-6 grid gap-3">
        {cards.map((card) => (
          <a
            key={card.id}
            href={`/card/${encodeURIComponent(card.name)}`}
            className="bg-gray-900 p-4 rounded-xl flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{card.name}</p>
              <p className="text-sm text-gray-400">
                {card.series} • {card.rarity}
              </p>
              <p className="text-sm text-green-400">{card.price} €</p>
            </div>
          </a>
        ))}

        {!loading && cards.length === 0 && (
          <p className="text-gray-500">
            Aucune carte pour l'instant —{" "}
            <a href="/scan" className="underline">
              lance un scan
            </a>
            .
          </p>
        )}
      </div>
    </div>
  )
}
