// src/pages/LoginPage/LoginPage.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../auth/supabaseClient' // make sure this is your one-and-only copy of supabaseClient
import type { Session } from '@supabase/supabase-js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // 1) load initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // 2) subscribe to changes
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      setSession(newSession)
    })

    // 3) cleanup
    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (session) {
      // 🔑 instead of reading user_metadata, POST to your backend
      fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: session.access_token })
      })
        .then(r => r.json())
        .then(({ is_new }) => {
          navigate(is_new ? '/terms' : '/main')
        })
    }
  }, [session, navigate])

  // if there's no session yet, show the Supabase Auth UI
  if (!session) {
    return (
      <div className="login-container">
        <Auth
          supabaseClient={supabase}
          providers={['google']}
          socialLayout="horizontal"
          appearance={{ theme: ThemeSupa }}
          localization={{
            variables: {
              sign_in: { button_label: 'Continue with Google' }
            }
          }}
        />
      </div>
    )
  }

  return null // we redirect in useEffect
}
