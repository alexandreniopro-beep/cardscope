"use client"

import { useState } from "react"
import CameraScanner from "@/components/CameraScanner"
import { evaluateBatch, BatchItem, BatchResult } from "@/lib/batchScanner"
import type { ScanResult } from "@/lib/scanner"

export default function MultiScanPage() {
  const [images, setImages] = useState<string[]>([])
  const [result, setResult] = useState<BatchResult | null>(null)
  const [loading, setLoading] = useState(false)

  function addImage(img: string) {
    setImages((prev) => [...prev, img])
  }

  async function runBatch() {
    if (images.length === 0) return

    const sellerTotalRaw = prompt("Prix total demandé pour le lot ?")
    if (!sellerTotalRaw) return

    const sellerTotal = Number(sellerTotalRaw)
    if (isNaN(sellerTotal)) return

    setLoading(true)

    try {
      const items: BatchItem[] = []

      for (const img of images) {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: img })
        })

        const ai: ScanResult = await res.json()
        items.push({ name: ai.name, price: ai.estimatedPrice, confidence: ai.confidence })
      }

      setResult(evaluateBatch(items, sellerTotal))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-4">
      <h1 className="text-2xl font-bold">Scan Lot</h1>
      <p className="text-gray-400">Ajoute plusieurs cartes puis analyse le lot</p>

      <CameraScanner onCapture={addImage} />

      <button
        onClick={runBatch}
        disabled={images.length === 0 || loading}
        className="w-full bg-green-600 disabled:bg-gray-700 py-3 rounded-xl"
      >
        {loading ? "Analyse en cours..." : `📊 Analyser le lot (${images.length})`}
      </button>

      {result && (
        <div className="bg-gray-900 p-4 rounded-xl space-y-2">
          <p className="text-lg font-bold">Verdict : {result.lotVerdict}</p>
          <p>💰 Valeur totale : {result.totalValue} €</p>
          <p>🏷️ Profit potentiel : {result.profitPotential} €</p>
          <p>🎯 Confiance moyenne : {result.averageConfidence}%</p>

          <hr className="border-gray-700" />

          <p className="font-semibold">Détail :</p>
          {result.items.map((item, i) => (
            <div key={i} className="text-sm text-gray-300">
              {item.name} — {item.price} €
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={img} alt={`Capture ${i + 1}`} className="rounded" />
          ))}
        </div>
      )}
    </div>
  )
}
