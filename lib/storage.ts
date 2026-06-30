// Stockage local (IndexedDB-like via localStorage).
// Utilisé uniquement en mode démo / hors-ligne, quand Supabase n'est pas
// configuré. Le flux principal de l'app utilise lib/collectionCloud.ts.

export type Card = {
  id: string
  name: string
  series: string
  rarity: string
  condition: string
  price: number
  image?: string
  addedAt: number
}

const KEY = "cardscope_collection"

export function getCollection(): Card[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(KEY)
  return data ? JSON.parse(data) : []
}

export function addCard(card: Card) {
  const collection = getCollection()
  collection.push(card)
  localStorage.setItem(KEY, JSON.stringify(collection))
}

export function removeCard(id: string) {
  const collection = getCollection().filter((c) => c.id !== id)
  localStorage.setItem(KEY, JSON.stringify(collection))
}

export function clearCollection() {
  localStorage.removeItem(KEY)
}
