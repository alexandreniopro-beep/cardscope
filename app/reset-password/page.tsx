"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function updatePassword() {
    if (password.length < 6) {
      setStatus("Le mot de passe doit faire au moins 6 caracteres.")
      return
    }

    setLoading(true)
    setStatus(null)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setStatus(error.message)
      return
    }

    setStatus("Mot de passe mis a jour. Redirection...")
    setTimeout(() => router.push("/collection"), 1500)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold">Nouveau mot de passe</h1>
      <p className="text-gray-400 mt-1 text-sm">
        Choisis un nouveau mot de passe pour ton compte CardScope.
      </p>

      <input
        className="mt-4 p-2 w-full bg-gray-800 rounded"
        placeholder="Nouveau mot de passe (6 caracteres min.)"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={updatePassword}
        disabled={loading}
        className="mt-4 bg-blue-600 disabled:bg-gray-700 px-4 py-2 rounded"
      >
        Mettre a jour le mot de passe
      </button>

      {status && <p className="mt-3 text-sm text-gray-400">{status}</p>}
    </div>
  )
}
