// Identification de carte via Gemini (Google), modele multimodal avec un
// palier gratuit genereux (voir README). Sert uniquement cote serveur.

export type IdentifiedCard = {
  name: string
  series: string
  rarity: string
  number: string
  edition: string
  language: string
  confidence: number
}

const FALLBACK: IdentifiedCard = {
  name: "Dracaufeu ex",
  series: "Evolutions Prismatiques",
  rarity: "Ultra Rare",
  number: "203/197",
  edition: "Inconnue",
  language: "FR",
  confidence: 40
}

function extractJson(text: string): unknown | null {
  const cleaned = text.replace(/```json|```/g, "").trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0])
    } catch {
      return null
    }
  }
}

export async function identifyCard(imageBase64: string): Promise<IdentifiedCard> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return FALLBACK
  }

  const base64Data = imageBase64.includes(",")
    ? imageBase64.split(",")[1]
    : imageBase64

  const prompt = `Tu regardes la photo d'une carte a collectionner Pokemon,
prise avec un appareil photo de bonne qualite (suppose que les details
sont nets et lisibles). Identifie-la en suivant ce raisonnement, dans
l'ordre :

1. LOGO DE SERIE : regarde attentivement le petit symbole/logo de serie
   (set), situe en bas de la carte (bas droite sur les anciennes cartes,
   bas centre/gauche sur les cartes plus recentes). C'est une icone
   distinctive (etoile, goutte, flamme, lettre, silhouette...) propre a
   chaque set (ex: Jungle, Fossile, Team Rocket, Neo Genesis, Base Set,
   Evolutions Prismatiques...). Utilise ce logo comme signal PRINCIPAL pour
   determiner la serie exacte - regarde-le avec la plus grande attention,
   c'est l'element le plus specifique visuellement.
2. NOM DU POKEMON : lis le nom en haut de la carte.
3. NUMERO DE CARTE : une fois la serie identifiee via le logo, lis le
   numero imprime en bas de la carte au format "XX/YY" (ex: "58/62",
   "6/64"). Ce numero te permet de confirmer/preciser exactement quelle
   carte de cette serie il s'agit (chaque serie a un nombre total de
   cartes different, ce qui aide a confirmer ton identification du logo).
4. EDITION : cherche un tampon ou texte "1st Edition" / "1ere Edition"
   (souvent un petit cercle noir a gauche du dessin sur les cartes
   anciennes). S'il est absent, l'edition est "Unlimited" ou "Non
   specifiee".
5. RARETE : note le symbole de rarete si visible (cercle = commune,
   losange = peu commune, etoile = rare).

Reponds UNIQUEMENT avec un objet JSON (rien d'autre, pas de Markdown), au
format exact suivant :
{"name": "nom du Pokemon", "series": "nom precis du set identifie via le logo", "number": "XX/YY exactement comme imprime sur la carte, sinon chaine vide", "rarity": "rarete si visible, sinon estimation", "edition": "1ere Edition, Unlimited, ou Non specifiee", "language": "code langue a 2 lettres (FR, EN, JP...)", "confidence": nombre entre 0 et 100}
Lis le logo et le numero avec la plus grande precision possible - ce sont
tes deux sources d'information les plus fiables. N'invente jamais une
valeur que tu ne vois pas clairement - laisse le champ concerne vide dans
ce cas plutot que de deviner au hasard.`

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: "image/jpeg", data: base64Data } }
              ]
            }
          ],
          generationConfig: { temperature: 0.2 }
        })
      }
    )

    if (!res.ok) {
      console.error("Gemini API error:", res.status, await res.text())
      return FALLBACK
    }

    const data = await res.json()
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) return FALLBACK

    const parsed = extractJson(text) as Partial<IdentifiedCard> | null
    if (!parsed || !parsed.name) return FALLBACK

    return {
      name:
@'
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
