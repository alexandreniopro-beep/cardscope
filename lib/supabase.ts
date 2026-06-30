import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// In dev without Supabase configured, throws a clear error instead of a
// confusing runtime crash deep inside a query.
if (!url || !key) {
  console.warn(
    "[CardScope] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquantes. " +
      "Copie .env.local.example vers .env.local et renseigne tes clés Supabase."
  )
}

// createClient throws if the URL isn't well-formed (e.g. an empty string),
// which would crash the build/prerender even on pages that never actually
// hit Supabase. A syntactically valid placeholder keeps the client
// constructible; real calls will simply fail until real keys are set.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-anon-key"
)
