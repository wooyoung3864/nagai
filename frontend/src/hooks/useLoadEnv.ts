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
        const res = await fetch("http://localhost:8000/admin/secrets/frontend-env", {
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
        setEnv({
          SUPABASE_URL: "https://wphzfbfgsyqpzixgkltu.supabase.co/",
          SUPABASE_ANON_KEY:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwaHpmYmZnc3lxcHppeGdrbHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMjIwOTQsImV4cCI6MjA2MTU5ODA5NH0.fnz0wju8X95U56pknwL81k2uwsF4Vpja7nuRqEerOJA",
        })
      }
    }

    load()
  }, [])

  return env
}
