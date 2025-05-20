import { useEffect, useRef, useState } from 'react'

/* ------------------------------------------------------------------ */
/*  Hook: useGeminiKeys                                               */
/* ------------------------------------------------------------------ */
export function useGeminiKeys() {
  const [keys, setKeys]   = useState<string[]>([]);
  const [loaded, setOk]   = useState(false);     // readiness flag
  const idxRef            = useRef(0);

  /* keep the latest state in refs so late-fired callbacks never read
     a stale closure ------------------------------------------------- */
  const keysRef   = useRef<string[]>([]);
  const loadedRef = useRef(false);

  useEffect(() => { keysRef.current = keys;   }, [keys]);
  useEffect(() => { loadedRef.current = loaded; }, [loaded]);

  /* 1️⃣  Load keys once on mount ------------------------------------ */
  useEffect(() => {
    (async () => {
      try {
        const url = `https://${import.meta.env.VITE_API_URL}/admin/secrets/frontend-env`;
        const wanted = Array.from({ length: 6 }, (_, i) => `gemini.api_key_${i + 1}`);

        const res  = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(wanted),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();           // whatever shape comes back
        // console.log(json)
        const vals = Object.values(json).filter(Boolean) as string[];

        if (!vals.length) throw new Error('No keys in response');
        //console.log(vals)
        setKeys(vals);
        setOk(true);
      } catch (err) {
        console.error('[Gemini] Failed to load keys → fallback to null', err);
        setOk(true);                             // still mark as “loaded” to avoid spinner loops
      }
    })();
  }, []);

  /* 🔍  Log once the keys array has been populated ------------------ */
  useEffect(() => {
    if (keys.length) {
      //console.log('[Gemini] keys now in state', keys);
    }
  }, [keys]);

  /* 2️⃣  Public helpers --------------------------------------------- */
  const getKey = () =>
    loadedRef.current && keysRef.current.length
      ? keysRef.current[idxRef.current % keysRef.current.length]
      : null;

  const rotateKey = () => {
    if (!keysRef.current.length) return;         // nothing to rotate yet
    idxRef.current = (idxRef.current + 1) % keysRef.current.length;
    console.warn('[Gemini] API key rotated');
  };

  return { getKey, rotateKey, loaded };
}
