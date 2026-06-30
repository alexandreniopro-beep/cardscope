// Suivi interne des ventes réalisées via CardScope (avantage propriétaire :
// données de transactions réelles, contrairement au scraping eBay externe).
// Stocké en local pour la V0 — à migrer vers Supabase quand le volume
// justifie une vraie table.

export type InternalSale = {
  cardName: string
  price: number
  condition: string
  date: number
}

const KEY = "internal_sales"

function readAll(): InternalSale[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem(KEY) || "[]")
}

export function addInternalSale(sale: InternalSale) {
  const data = readAll()
  data.push(sale)
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getInternalSales(cardName: string) {
  return readAll().filter((s) => s.cardName === cardName)
}

export function getInternalAverage(cardName: string) {
  const sales = getInternalSales(cardName)
  if (!sales.length) return 0
  return sales.reduce((a, b) => a + b.price, 0) / sales.length
}
