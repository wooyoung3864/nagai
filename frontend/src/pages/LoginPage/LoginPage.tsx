// src/pages/LoginPage/LoginPage.tsx
import React, { useEffect, useState } from "react";
import logo from "../../assets/imgs/nagai_logo.png";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "../../App.css";
import "./LoginPage.css";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "../../auth/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // redirect as soon as we have a session
  useEffect(() => {
    if (session) {
      const isNew = (session.user.user_metadata as any)?.is_new;
      navigate(isNew ? "/terms" : "/main");
    }
  }, [session, navigate]);

  return (
    <motion.div
      className="login-container"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="login-flex-col">
        <div className="login-logo">
          <img src={logo} alt="nagAI logo" />
        </div>

        <Auth
          supabaseClient={supabase}
          providers={["google"]}
          socialLayout="horizontal"
          appearance={{ theme: ThemeSupa }}
          localization={{
            variables: {
              sign_in: { button_label: "Continue with Google" },
            },
          }}
        />

        {session === null && (
          <div className="login-fail-message">
            <h3>Failed to authenticate with Google.</h3>
            <h3>Please try again.</h3>
          </div>
        )}
      </div>
    </motion.div>
  );
}
