// src/hooks/useSessionHandler.ts
import { useSupabase } from "../contexts/SupabaseContext";
import { useRef, useState } from "react";

type SessionType = "FOCUS" | "BREAK";
type SessionStatus = "PAUSED" | "STOPPED" | "COMPLETED" | "RUNNING";

export interface SessionHandler {
  startSessionOnServer: (type: SessionType) => Promise<boolean>;
  updateSessionStatus: (status: SessionStatus, focusSecs?: number) => Promise<void>;
  getTodayTotalFocus: () => Promise<number>;
  sessionIdRef: React.MutableRefObject<number | null>;
  setSessionId: React.Dispatch<React.SetStateAction<number | null>>;
}

export function useSessionHandler(): SessionHandler {
  const supabase = useSupabase();
  const base = `${import.meta.env.VITE_API_URL as string}`;

  const [, setSessionId] = useState<number | null>(null);
  const sessionIdRef = useRef<number | null>(null);

  const getAccessToken = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("No access token");
    return token;
  };

  //const clearSession = () => {
    //setSessionId(null);
    //sessionIdRef.current = null;
  //};

  /* ---------------- POST /sessions ---------------- */
  const startSessionOnServer = async (type: SessionType): Promise<boolean> => {
    if (sessionIdRef.current) { console.warn("Session already exists."); return true; }

    try {
      const access_token = await getAccessToken();
      const res = await fetch(`https://${base}/sessions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, access_token }),
      });
      if (!res.ok) return false;
      const { id } = await res.json();
      setSessionId(id);
      sessionIdRef.current = id;
      // console.log(sessionIdRef.current);
      return true;
    } catch (err) {
      console.error("Error starting session:", err);
      return false;
    }
  };

  /* ------------- PATCH /sessions/:id/update -------- */
  const updateSessionStatus = async (
    status: SessionStatus,
    focusSecs?: number,
  ) => {
    if (!sessionIdRef.current) {
      console.log('!sessionIdRef;')
      return;
    }

    const url = new URL(`/sessions/${sessionIdRef.current}/update`, `https://${base}`);
    url.searchParams.set("status", status);
    if (focusSecs !== undefined) url.searchParams.set("focus_secs", String(focusSecs));

    const access_token = await getAccessToken();
    const res = await fetch(url.toString(), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token }),
    });

    // Await the response JSON before logging
    const data = await res.json();
    console.log(data);

    // 🟢 Clear sessionId after STOPPED or COMPLETED
    if (status === "STOPPED" || status === "COMPLETED") {
      setSessionId(null);
      sessionIdRef.current = null;
    }
  };

  /** --------- POST /today-total: Get today's total focus seconds --------- */
  const getTodayTotalFocus = async (): Promise<number> => {
    try {
      const access_token = await getAccessToken();
      const res = await fetch(`https://${base}/sessions/today-total`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token }),
      });
      if (!res.ok) {
        return 0;
      }
      const rawResp = await res.json();
      const total = rawResp.total_focus_secs
      return typeof total === "number" ? total : parseInt(total);
    } catch (err) {
      console.error("Error fetching today total focus:", err);
      return 0;
    }
  }

  return {
    startSessionOnServer,
    updateSessionStatus,
    sessionIdRef,
    setSessionId,
    getTodayTotalFocus
  };
}
