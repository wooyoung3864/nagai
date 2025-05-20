// src/hooks/useSessionHandler.ts
import { useSupabase } from "../contexts/SupabaseContext";
import { useRef, useState } from "react";

type SessionType   = "FOCUS" | "BREAK";
type SessionStatus = "PAUSED" | "STOPPED" | "COMPLETED" | "RUNNING";

export interface SessionHandler {
  /** POST /sessions  – creates a new session if none exists */
  startSessionOnServer: (type: SessionType) => Promise<boolean>;
  /** PATCH /sessions/:id/update */
  updateSessionStatus : (status: SessionStatus, focusSecs?: number) => Promise<void>;
  /** shareable refs to let Timer keep its existing logic */
  sessionIdRef        : React.MutableRefObject<number | null>;
  setSessionId        : React.Dispatch<React.SetStateAction<number | null>>;
}

export function useSessionHandler(): SessionHandler {
  const supabase = useSupabase();
  const base     = import.meta.env.VITE_API_URL as string; // should already include https://

  /* expose these so Timer’s existing state lines stay intact */
  const [_, setSessionId]   = useState<number | null>(null);
  const sessionIdRef                = useRef<number | null>(null);

  /* -------------------- helpers -------------------- */
  const tokenHeader = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("No access token");
    return { "Content-Type": "application/json" };
  };

  /* -------------------- API calls ------------------ */
  const startSessionOnServer = async (type: SessionType): Promise<boolean> => {
    /* duplicate-session guard */
    if (sessionIdRef.current !== null) {
      console.warn("Session already exists, skipping POST.");
      return true;
    }

    try {
      const res = await fetch(`${base}/sessions/`, {
        method : "POST",
        headers: await tokenHeader(),
        body   : JSON.stringify({ type }),
      });
      if (!res.ok) {
        console.error("Failed to start session");
        return false;
      }
      const { id } = await res.json();
      setSessionId(id);
      sessionIdRef.current = id;
      return true;
    } catch (err) {
      console.error("Error starting session:", err);
      return false;
    }
  };

  const updateSessionStatus = async (
    status    : SessionStatus,
    focusSecs?: number,
  ) => {
    if (sessionIdRef.current === null) return;

    const url = new URL(
      `/sessions/${sessionIdRef.current}/update`,
      base,
    );
    url.searchParams.set("status", status);
    if (focusSecs !== undefined) {
      url.searchParams.set("focus_secs", focusSecs.toString());
    }

    try {
      const res = await fetch(url.toString(), {
        method : "PATCH",
        headers: await tokenHeader(),
        body   : JSON.stringify({}),   // token already in header via cookie/JWT
      });
      if (!res.ok) {
        console.error(`Failed to update session to ${status}`);
      }
    } catch (err) {
      console.error(`Error updating session to ${status}:`, err);
    }
  };

  return { startSessionOnServer, updateSessionStatus, sessionIdRef, setSessionId };
}
