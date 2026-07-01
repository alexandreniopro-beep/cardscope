// Croise le nom identifie par l'IA avec la base de donnees gratuite
// pokemontcg.io pour recuperer des infos officielles (serie, rarete,
// numero, image). Best-effort : en cas d'echec on garde ce que l'IA a dit.

export type CatalogMatch = {
  name: string
  series: string
  rarity: string
  number: string
  imageUrl?: string
  seriesConfirmed: boolean
}

export async function lookupCatalog(
  name: string,
  series?: string,
  number?: string
): Promise<CatalogMatch | null> {
  const [printedNumber, printedTotal] = (number?.split("/") ?? []).map((s) =>
    s?.trim()
  )

  if (series && printedNumber) {
    const combinedMatch = await queryCatalog(
      `name:"${name}" set.name:"${series}" number:${printedNumber}`
    )
    if (combinedMatch) return { ...combinedMatch, seriesConfirmed: true }
  }

  if (printedNumber && printedTotal) {
    const numberMatch = await queryCatalog(
      `name:"${name}" number:${printedNumber} set.printedTotal:${printedTotal}`
    )
    if (numberMatch) return { ...numberMatch, seriesConfirmed: true }
  }

  if (printedNumber && !printedTotal) {
    const looseMatch = await queryCatalog(`name:"${name}" number:${printedNumber}`)
    if (looseMatch) return { ...looseMatch, seriesConfirmed: true }
  }

  if (series) {
    const preciseMatch = await queryCatalog(`name:"${name}" set.name:"${series}"`)
    if (preciseMatch) return { ...preciseMatch, seriesConfirmed: true }
  }

  const fallback = await queryCatalog(`name:"${name}"`)
  return fallback ? { ...fallback, seriesConfirmed: false } : null
}

async function queryCatalog(
  searchQuery: string
): Promise<Omit<CatalogMatch, "seriesConfirmed"> | null> {
  try {
    const query = encodeURIComponent(searchQuery)
    const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=${query}&pageSize=1`)

    if (!res.ok) return null

    const data = await res.json()
    const card = data?.data?.[0]

    if (!card) return null

    return {
      name: card.name,
      series: card.set?.name || "Serie inconnue",
      rarity: card.rarity || "Inconnue",
      number: card.number ? `${card.number}/${card.set?.printedTotal ?? "?"}` : "",
      imageUrl: card.images?.small
    }
  } catch (err) {
    console.error("lookupCatalog failed:", err)
    return null
  }
}
