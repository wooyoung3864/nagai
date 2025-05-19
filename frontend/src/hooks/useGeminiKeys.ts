import { useEffect, useRef, useState } from "react";

export function useGeminiKeys() {
  const [keys, setKeys] = useState<string[]>([]);
  const currentIndex = useRef(0);
  // TODO: debug
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`https://${import.meta.env.VITE_API_URL}/admin/secrets/frontend-env`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([
            "gemini.api_key_1",
            "gemini.api_key_2",
            "gemini.api_key_3",
            "gemini.api_key_4",
            "gemini.api_key_5",
            "gemini.api_key_6",
          ]),
        });
        const data = await res.json();
        console.log(data)
        setKeys([
          data.GEMINI_API_KEY_1,
          data.GEMINI_API_KEY_2,
          data.GEMINI_API_KEY_3,
          data.GEMINI_API_KEY_4,
          data.GEMINI_API_KEY_5,
          data.GEMINI_API_KEY_6,
        ]);
      } catch (err) {
        console.error("Failed to load Gemini keys", err);
      }
    };
    load();
  }, []);

  const getKey = () => keys[currentIndex.current] || null;

  const rotateKey = () => {
    currentIndex.current = (currentIndex.current + 1) % keys.length;
    console.warn("Gemini key rotated");
  };

  return { getKey, rotateKey };
}
