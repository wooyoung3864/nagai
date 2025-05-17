import { useEffect, useState } from "react"

type Secrets = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
}

export function useLoadEnv() {
  const [env, setEnv] = useState<Secrets | null>(null)

  useEffect(() => {
    const load = async () => {
      const res = await fetch("http://localhost:8000/admin/secrets/frontend-env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(["supabase.url", "supabase.anon_key"]),
      })
      const data = await res.json()
      setEnv({
        SUPABASE_URL: data.SUPABASE_URL,
        SUPABASE_ANON_KEY: data.SUPABASE_ANON_KEY,
      })
    }
    load()
  }, [])

  return env
}
