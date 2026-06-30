import { supabase } from "./supabase"
import { getCollection as getCollectionLocal } from "./storage"

export type CloudCard = {
  id: string
  name: string
  series: string
  rarity: string
  condition: string
  price: number
  image?: string
  buyPrice?: number
  created_at?: string
}

export async function getCollectionCloud(): Promise<CloudCard[]> {
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    // Mode démo / hors-ligne
    return getCollectionLocal().map((c) => ({
      ...c,
      created_at: new Date(c.addedAt).toISOString()
    }))
  }

  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getCollectionCloud error:", error.message)
    return []
  }

  return data ?? []
}
