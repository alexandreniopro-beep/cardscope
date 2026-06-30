import { supabase } from "./supabase"
import { addCard as addCardLocal, Card as LocalCard } from "./storage"

export type CardInput = {
  name: string
  series: string
  rarity: string
  condition: string
  price: number
  image?: string
}

// Sauvegarde la carte dans Supabase si l'utilisateur est connecté,
// sinon retombe sur le stockage local (mode démo).
export async function addCardCloud(card: CardInput) {
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    const local: LocalCard = {
      id: crypto.randomUUID(),
      addedAt: Date.now(),
      ...card
    }
    addCardLocal(local)
    return { stored: "local" as const }
  }

  const { error } = await supabase.from("collections").insert({
    user_id: userData.user.id,
    ...card
  })

  if (error) throw error

  return { stored: "cloud" as const }
}
