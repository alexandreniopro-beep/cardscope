"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function signIn() {
    if (!email || !password) return
    setLoading(true)
    setStatus(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    setLoading(false)

    if (error) {
      setStatus(error.message)
      return
    }

    router.push("/collection")
  }

  async function signUp() {
    if (!email || !password) return
    setLoading(true)
    setStatus(null)

    const { error } = await supabase.auth.signUp({ email, password })

    setLoading(false)
    setStatus(error ? error.message : "Compte cree. Tu peux maintenant te connecter.")
  }

  async function forgotPassword() {
    if (!email) {
      setStatus("Renseigne ton email ci-dessus, puis clique a nouveau sur ce lien.")
      return
    }

    setLoading(true)
    setStatus(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    setLoading(false)
    setStatus(
      error
        ? error.message
        : "Un email de reinitialisation a ete envoye. Verifie ta boite mail."
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold">Connexion CardScope</h1>
      <p className="text-gray-400 mt-1 text-sm">
        Connecte-toi pour synchroniser ta collection dans le cloud.
      </p>

      <input
        className="mt-4 p-2 w-full bg-gray-800 rounded"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="mt-3 p-2 w-full bg-gray-800 rounded"
        placeholder="Mot de passe (6 caracteres min.)"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex gap-3 mt-4">
        <button
          onClick={signIn}
          disabled={loading}
          className="bg-blue-600 disabled:bg-gray-700 px-4 py-2 rounded"
        >
          Se connecter
        </button>

        <button
          onClick={signUp}
          disabled={loading}
          className="bg-gray-700 disabled:bg-gray-800 px-4 py-2 rounded"
        >
          Creer un compte
        </button>
      </div>

      <button
        onClick={forgotPassword}
        disabled={loading}
        className="mt-4 text-sm text-blue-400 underline block"
      >
        Mot de passe oublie ?
      </button>

      {status && <p className="mt-3 text-sm text-gray-400">{status}</p>}
    </div>
  )
}
