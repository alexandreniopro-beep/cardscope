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

  const prompt = `Tu regardes la photo d'une carte a collectionner Pokemon.
Identifie-la precisement en suivant ces etapes d'observation, dans l'ordre
de fiabilite (du plus fiable au moins fiable) :

1. NUMERO DE CARTE (le plus fiable) : cherche le petit numero imprime en
   bas de la carte, au format "XX/YY" (ex: "58/62", "6/64", "203/197"). Il
   peut etre en bas a gauche OU en bas a droite selon l'epoque de la carte.
   Lis-le avec precision, chiffre par chiffre : c'est l'element le plus
   fiable pour identifier exactement l'edition.
2. NOM DU POKEMON : lis le nom en haut de la carte.
3. SYMBOLE DE SERIE (indicatif seulement, peu fiable sur photo) : une
   petite icone en bas de carte peut indiquer le set (etoile, goutte,
   flamme...), mais ne base pas ta reponse principale dessus si le numero
   de carte est lisible - le numero prime toujours sur ton interpretation
   du symbole.
4. EDITION : cherche un tampon ou texte "1st Edition" / "1ere Edition"
   (souvent un petit cercle noir a gauche du dessin sur les cartes
   anciennes). S'il est absent, l'edition est "Unlimited" ou "Non
   specifiee".
5. RARETE : note le symbole de rarete si visible (cercle = commune,
   losange = peu commune, etoile = rare).

Reponds UNIQUEMENT avec un objet JSON (rien d'autre, pas de Markdown), au
format exact suivant :
{"name": "nom du Pokemon", "series": "ta meilleure estimation du set (a partir du symbole/style), a titre indicatif seulement", "number": "XX/YY exactement comme imprime sur la carte, sinon chaine vide", "rarity": "rarete si visible, sinon estimation", "edition": "1ere Edition, Unlimited, ou Non specifiee", "language": "code langue a 2 lettres (FR, EN, JP...)", "confidence": nombre entre 0 et 100}
Priorite absolue : le champ "number" doit etre lu avec une precision
maximale, meme si tu es moins sur du "series". N'invente jamais un numero
si tu ne le vois pas clairement - laisse-le vide dans ce cas.`

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
      name: parsed.name,
      series: parsed.series || "Serie inconnue",
      rarity: parsed.rarity || "Inconnue",
      number: parsed.number || "",
      edition: parsed.edition || "Non specifiee",
      language: parsed.language || "FR",
      confidence:
        typeof parsed.confidence === "number"
          ? Math.max(0, Math.min(100, parsed.confidence))
          : 60
    }
  } catch (err) {
    console.error("identifyCard failed:", err)
    return FALLBACK
  }
}
