type CacheEntry = { value: unknown; ts: number }

const cache = new Map<string, CacheEntry>()
const TTL = 1000 * 60 * 60 * 6 // 6h

export function getCache<T = unknown>(key: string): T | null {
  const item = cache.get(key)
  if (!item) return null

  if (Date.now() - item.ts > TTL) {
    cache.delete(key)
    return null
  }

  return item.value as T
}

export function setCache(key: string, value: unknown) {
  cache.set(key, { value, ts: Date.now() })
}
