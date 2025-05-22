import { useEffect, useState } from "react"

type Secrets = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

export function useLoadEnv() {
  const [env, setEnv] = useState<Secrets | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`https://${import.meta.env.VITE_API_URL}/admin/secrets/frontend-env`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(["supabase.url", "supabase.anon_key"]),
        })

        if (!res.ok) {
          throw new Error("Failed to fetch env from backend")
        }

        const data = await res.json()
        setEnv({
          SUPABASE_URL: data.SUPABASE_URL,
          SUPABASE_ANON_KEY: data.SUPABASE_ANON_KEY,
        })
      } catch (err) {
        console.warn("Falling back to hardcoded env vars:", err)
        
      }
    }

  }, [])

  return env
}
