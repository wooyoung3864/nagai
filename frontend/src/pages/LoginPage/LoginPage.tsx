// src/pages/LoginPage/LoginPage.tsx
import React, { useEffect, useState } from 'react'
import logo from "../../assets/imgs/nagai_logo.png"
import { useNavigate } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../auth/supabaseClient'
import { motion } from 'framer-motion'
import type { Session } from '@supabase/supabase-js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
      setSession(newSession)
    })
    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) return
    fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ access_token: session.access_token })
    })
      .then(async r => {
        if (!r.ok) {
          navigate('/login-fail')
          return
        }
        const data = await r.json()
        console.log(data)
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))
        navigate(data.is_new ? '/terms' : '/main')
      })
  }, [session, navigate])

  if (!session) {
    return (
      <motion.div
        className="login-container"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
      >
        <div className="login-flex-col">
          <div className="login-logo">
            <img src={logo} alt="nagAI logo" />
          </div>
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
      </motion.div>
    )
  }

  return null
}
