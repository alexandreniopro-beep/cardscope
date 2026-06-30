export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold">CardScope</h1>
      <p className="text-gray-400">Scanne. Estime. Collectionne. Décide.</p>

      <div className="mt-8 grid gap-4">
        <a href="/scan" className="p-4 bg-gray-900 rounded-xl">
          📷 Scanner une carte
        </a>

        <a href="/collection" className="p-4 bg-gray-900 rounded-xl">
          📚 Ma collection
        </a>

        <a href="/dashboard" className="p-4 bg-gray-900 rounded-xl">
          📊 Dashboard portfolio
        </a>

        <a href="/strategy" className="p-4 bg-gray-900 rounded-xl">
          🧠 IA Stratégie
        </a>

        <a href="/vide-grenier" className="p-4 bg-gray-900 rounded-xl">
          🛒 Mode vide-grenier
        </a>

        <a href="/multi-scan" className="p-4 bg-gray-900 rounded-xl">
          📦 Scan en lot
        </a>
      </div>
    </div>
  )
}
