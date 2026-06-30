import type { CloudCard } from "./getCollectionCloud"

export function getTopCards(cards: CloudCard[], limit = 5) {
  return [...cards].sort((a, b) => (b.price || 0) - (a.price || 0)).slice(0, limit)
}
