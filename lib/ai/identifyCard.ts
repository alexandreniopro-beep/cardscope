// Identification de carte via Gemini (Google), modele multimodal avec un
// palier gratuit genereux (voir README). Sert uniquement cote serveur.

export type IdentifiedCard = {
  name: string
  series: string
  rarity: string
  number: string
  edition: string
  finish: string
  language: string
  confidence: number
}

const FALLBACK: IdentifiedCard = {
  name: "Dracaufeu ex",
  series: "Evolutions Prismatiques",
  rarity: "Ultra Rare",
  number: "203/197",
  edition: "Inconnue",
  finish: "Inconnue",
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
6. FINITION (holo/reverse/normale) : regarde si la carte a un effet
   holographique/brillant. Trois cas possibles :
   - "Normale" : aucun effet brillant visible, surface mate.
   - "Holo" : l'effet brillant/holographique couvre uniquement
     l'illustration du Pokemon (le dessin central), le reste de la carte
     (cadre, texte, fond) est mat.
   - "Reverse Holo" : c'est l'inverse - l'effet brillant couvre tout le
     FOND de la carte (cadre, zone de texte) SAUF l'illustration du
     Pokemon elle-meme qui reste mate.
   Attention : cet effet depend beaucoup de l'angle et de l'eclairage au
   moment de la photo - il peut etre peu visible ou absent sur une photo a
   plat sans reflet, meme si la carte est bien holo/reverse en realite. Si
   tu ne vois clairement aucun reflet holographique, ne suppose pas
   "Normale" avec une confiance elevee - indique plutot "Inconnue" et une
   confiance basse pour ce champ specifique si l'image ne permet pas de
   trancher.

Reponds UNIQUEMENT avec un objet JSON (rien d'autre, pas de Markdown), au
format exact suivant :
{"name": "nom du Pokemon", "series": "nom precis du set identifie via le logo", "number": "XX/YY exactement comme imprime sur la carte, sinon chaine vide", "rarity": "rarete si visible, sinon estimation", "edition": "1ere Edition, Unlimited, ou Non specifiee", "finish": "Normale, Holo, Reverse Holo, ou Inconnue", "language": "code langue a 2 lettres (FR, EN, JP...)", "confidence": nombre entre 0 et 100}
Lis le logo et le numero avec la plus grande precision possible - ce sont
tes deux sources d'information les plus fiables. N'invente jamais une
valeur que tu ne vois pas clairement - laisse le champ concerne vide (ou
"Inconnue" pour finish/edition) dans ce cas plutot que de deviner au
hasard.`

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
      finish: parsed.finish || "Inconnue",
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
