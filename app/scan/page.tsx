"use client"

import { useState } from "react"
import CameraScanner from "@/components/CameraScanner"
import { addCardCloud } from "@/lib/collectionCloud"
import type { ScanResult } from "@/lib/scanner"

export default function ScanPage() {
  const [result, setResult] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState<"local" | "cloud" | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleCapture(image: string) {
    setLoading(true)
    setError(null)
    setSaved(null)

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image })
      })

      if (!res.ok) throw new Error("Echec de l'analyse")

      const data: ScanResult = await res.json()
      setResult(data)

      const { stored } = await addCardCloud({
        name: data.name,
        series: data.series,
        rarity: data.rarity,
        condition: data.conditionLabel,
        price: data.estimatedPrice
      })

      setSaved(stored)
    } catch (err) {
      console.error(err)
      setError("Une erreur est survenue pendant le scan.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold">Scan IA</h1>
      <p className="text-gray-400 mb-4">Analyse automatique de la carte</p>

      <CameraScanner onCapture={handleCapture} />

      {loading && <p className="mt-4 text-blue-400">Analyse en cours...</p>}
      {error && <p className="mt-4 text-red-400">{error}</p>}

      {result && !loading && (
        <div className="mt-6 bg-gray-900 p-4 rounded-xl space-y-2">
          <p className="text-lg font-bold">{result.name}</p>
          <p>Serie : {result.series}</p>
          <p>Numero : {result.number || "non lu"}</p>
          <p>Edition : {result.edition}</p>
          <p>Rarete : {result.rarity}</p>
          <p>Langue : {result.language}</p>

          <hr className="border-gray-700 my-2" />

          <p>Etat : {result.conditionLabel} ({result.conditionScore}/100)</p>
          <p>PSA 10 : {result.psaProbability.psa10}%</p>
          <p>PSA 9 : {result.psaProbability.psa9}%</p>
          <p>PSA 8 : {result.psaProbability.psa8}%</p>

          <hr className="border-gray-700 my-2" />

          <p className="text-green-400 text-lg">
            Valeur estimee : {result.estimatedPrice} EUR
          </p>
          <p className="text-gray-400 text-sm">Confiance IA : {result.confidence}%</p>

          <details className="text-xs text-gray-500 mt-2">
            <summary className="cursor-pointer">Debug (lecture brute de l'IA)</summary>
            <p>Serie lue par l'IA : {result.debug.aiSeries}</p>
            <p>Numero lu par l'IA : {result.debug.aiNumber || "non lu"}</p>
            <p>Edition lue par l'IA : {result.debug.aiEdition}</p>
            <p>Confirme par la base pokemontcg.io : {result.debug.catalogConfirmed ? "oui" : "non"}</p>
          </details>

          {saved && (
            <p className="text-xs text-gray-500 mt-2">
              Ajoutee a la collection ({saved === "cloud" ? "compte connecte" : "stockage local"})
            </p>
          )}
        </div>
      )}
    </div>
  )
}
