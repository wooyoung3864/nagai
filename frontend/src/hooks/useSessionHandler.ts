// src/hooks/useSessionHandler.ts
import { useSupabase } from "../contexts/SupabaseContext";
import { useRef, useState } from "react";

type SessionType   = "FOCUS" | "BREAK";
type SessionStatus = "PAUSED" | "STOPPED" | "COMPLETED" | "RUNNING";

export interface SessionHandler {
  startSessionOnServer: (type: SessionType) => Promise<boolean>;
  updateSessionStatus : (status: SessionStatus, focusSecs?: number) => Promise<void>;
  trackFocusScore     : (score: number) => void;                 // <-- NEW
  flushAvgToSession   : (status?: SessionStatus) => Promise<void>; // <-- NEW
  sessionIdRef        : React.MutableRefObject<number | null>;
  setSessionId        : React.Dispatch<React.SetStateAction<number | null>>;
}

export function useSessionHandler(): SessionHandler {
  const supabase = useSupabase();
  const base     = `${import.meta.env.VITE_API_URL as string}`;  

  const [, setSessionId] = useState<number | null>(null);
  const sessionIdRef     = useRef<number | null>(null);

  /* focus-score accumulators */
  const scoreSumRef = useRef(0);
  const scoreCntRef = useRef(0);

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("No access token");
    return token;
  };

  /* ---------------- POST /sessions ---------------- */
  const startSessionOnServer = async (type: SessionType): Promise<boolean> => {
    if (sessionIdRef.current) { console.warn("Session already exists."); return true; }

    try {
      const access_token = await getAccessToken();
      const res = await fetch(`https://${base}/sessions/`, {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ type, access_token }),
      });
      if (!res.ok) return false;
      const { id } = await res.json();
      setSessionId(id);
      sessionIdRef.current = id;
      // console.log(sessionIdRef.current);
      /* reset score accumulators for the new session */
      scoreSumRef.current = scoreCntRef.current = 0;
      return true;
    } catch (err) {
      console.error("Error starting session:", err);
      return false;
    }
  };

  /* ------------- PATCH /sessions/:id/update -------- */
  const updateSessionStatus = async (
    status    : SessionStatus,
    focusSecs?: number,
  ) => {
    if (!sessionIdRef.current) return;

    const url = new URL(`/sessions/${sessionIdRef.current}/update`, `https://${base}`);
    url.searchParams.set("status", status);
    if (focusSecs !== undefined) url.searchParams.set("focus_secs", String(focusSecs));

    const access_token = await getAccessToken();
    await fetch(url.toString(), {
      method : "PATCH",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ access_token }),
    });
  };

  /* ---------------- focus-score logic -------------- */
  const trackFocusScore = (score: number) => {
    if (!sessionIdRef.current) return;            // ignore if no active session
    scoreSumRef.current += score;
    scoreCntRef.current += 1;
  };

  const flushAvgToSession = async (status: SessionStatus = "RUNNING") => {
    if (!sessionIdRef.current || scoreCntRef.current === 0) return;

    const avg = scoreSumRef.current / scoreCntRef.current;
    
    if (status === "STOPPED" || status === "COMPLETED") {
      scoreSumRef.current = scoreCntRef.current = 0; // reset after flush
    }

    const url = new URL(`/sessions/${sessionIdRef.current}/update`, base);
    url.searchParams.set("status", status);
    url.searchParams.set("avg_score", avg.toFixed(2));

    const access_token = await getAccessToken();
    await fetch(url.toString(), {
      method : "PATCH",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ access_token }),
    });
  };

  return {
    startSessionOnServer,
    updateSessionStatus,
    trackFocusScore,
    flushAvgToSession,
    sessionIdRef,
    setSessionId,
  };
}
