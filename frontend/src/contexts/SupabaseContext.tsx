// src/contexts/SupabaseContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { useLoadEnv } from "../hooks/useLoadEnv"

const SupabaseContext = createContext<SupabaseClient | null>(null)

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const env = useLoadEnv()
  const clientRef = useRef<SupabaseClient | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (env?.SUPABASE_URL && env?.SUPABASE_ANON_KEY && !clientRef.current) {
      clientRef.current = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
        auth: {
          storageKey: "supabase.auth.nagai", // Unique storage key avoids conflict
        },
      })
      setReady(true)
    }
  }, [env])

  if (!ready || !clientRef.current) return 

  return (
    <SupabaseContext.Provider value={clientRef.current}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const client = useContext(SupabaseContext)
  if (!client) throw new Error("Supabase client not available yet.")
  return client
}
