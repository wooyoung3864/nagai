// src/pages/LoginPage/LoginPage.tsx
import  { useEffect, useState } from 'react'
import logo from '../../assets/imgs/nagai_logo.png'
import { useNavigate } from 'react-router-dom'
import { useSupabase } from '../../contexts/SupabaseContext'
import { motion } from 'framer-motion'
import type { Session } from '@supabase/supabase-js'
import { useUser } from '../../contexts/UserContext';

export default function LoginPage() {
  const supabase = useSupabase();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const { setName } = useUser();
  const [loginError, setLoginError] = useState<string | null>(null);

  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data } = supabase.auth.onAuthStateChange((_, newSession) => setSession(newSession))
    return () => {
      data.subscription.unsubscribe()
    }
  }, [supabase])

  useEffect(() => {
    if (!session) return;
    setLoginError(null); // reset error on new session
    fetch(`https://${import.meta.env.VITE_API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ access_token: session.access_token })
    })
      .then(async r => {
        if (!r.ok) {
          setLoginError("Failed to authenticate with Google. Please try again.");
          return;
        }
        const data = await r.json();
        if (data.access_token) localStorage.setItem('token', data.access_token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.user.full_name) {
            setName(data.user.full_name);
            localStorage.setItem('userName', data.user.full_name);
          }
        } 
        // smart redirect
        if (!data.user.has_agreed_terms) {
          navigate('/terms');
        } else if (!data.user.has_set_name) {
          navigate('/create-account');
        } else {
          navigate('/main');
        }
      })
      .catch(() => {
        setLoginError("Network error during authentication. Please try again.");
      });
  }, [session, navigate, setName]);

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
        {!session && (
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: 500,
              borderRadius: "6px",
              backgroundColor: "#fff",
              color: "#3c4043",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              border: "1px solid #dadce0",
              cursor: "pointer"
            }}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              style={{ width: "20px", height: "20px" }}
            />
            Continue with Google
          </button>
        )}
        {loginError && (
          <div className='login-fail-message'>
            <h3>{loginError}</h3>
          </div>
        )}
      </div>
    </motion.div>
  );
}
