"use client"

import { useState } from "react"
import CameraScanner from "@/components/CameraScanner"
import { evaluateGarageDeal, GarageResult } from "@/lib/garageSaleEngine"
import type { ScanResult } from "@/lib/scanner"

export default function VideGrenierPage() {
  const [result, setResult] = useState<GarageResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCapture(image: string) {
    const sellerPriceRaw = prompt("Prix demandé par le vendeur ?")
    if (!sellerPriceRaw) return

    const sellerPrice = Number(sellerPriceRaw)
    if (isNaN(sellerPrice)) return

    setLoading(true)

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image })
      })

      const ai: ScanResult = await res.json()

      const data = evaluateGarageDeal(
        { name: ai.name, marketPrice: ai.estimatedPrice, confidence: ai.confidence },
        sellerPrice
      )

      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  const color =
    result?.decision === "BUY"
      ? "text-green-400"
      : result?.decision === "PASS"
        ? "text-red-400"
        : "text-yellow-400"

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-4">
      <h1 className="text-2xl font-bold">Mode Vide-Grenier</h1>
      <p className="text-gray-400">Scan rapide → décision instantanée</p>

      <CameraScanner onCapture={handleCapture} />

      {loading && <p className="text-blue-400 mt-4">⚡ Analyse marché + IA...</p>}

      {result && !loading && (
        <div className="bg-gray-900 p-4 rounded-xl space-y-2 mt-4">
          <p className="font-bold text-lg">{result.name}</p>
          <p>💰 Valeur estimée : {result.estimatedValue} €</p>
          <p>🏷️ Prix demandé : {result.sellerPrice} €</p>
          <p className="text-green-400">📊 Marge : {result.margin} €</p>
          <p className={`text-xl font-bold ${color}`}>👉 {result.decision}</p>
          <p className="text-gray-400 text-sm">🎯 Confiance : {result.confidence}%</p>
        </div>
      )}
    </div>
  )
}
