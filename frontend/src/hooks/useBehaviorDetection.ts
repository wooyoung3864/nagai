// frontend/src/hooks/useBehaviorDetection.ts
import { useEffect, useRef } from 'react';
import { useGeminiKeys } from './useGeminiKeys';  // gemini keys rotation logic
import { SupabaseClient } from "@supabase/supabase-js";

// const API_KEY = 'AIzaSyCZ9yNobnF2wJap7f9LEvPVr2dCFTb5aCo';     // ⚠️ real key
// const API_KEY = 'AIzaSyAl9TIvPzX4OC7Uixl08cb-UDnQ-kGTSHw';
//const API_KEY = 'AIzaSyA5E2RqP-utLkqvdmjogAnG1g2VHAPyT40';

const GEMINI_CALL_ENABLED = true;                            // flip true in prod

// ── motion-analysis constants ─────────────────────────────────────────────
const BASE_WIDTH = 96;          // up from 64 for better sensitivity
const MOTION_SNAPSHOT_INTERVAL = 2_000;
const IDLE_SNAPSHOT_INTERVAL = 12_000;
const MOTION_SENSITIVITY = 7;    // tuned threshold for pixel diff
const MOTION_DETECTION_THRESHOLD = 2;    // frames
const MOTION_END_THRESHOLD = 3;    // frames

const HIGH_MOTION_THRESHOLD = 10;          // triggers instant Gemini snapshot
const HIGH_MOTION_COOLDOWN_MS = 3000;      // minimum delay between high-motion triggers in ms
// ──────────────────────────────────────────────────────────────────────────

const COMMON_RULES = `
Exactly ONE hand must satisfy ALL of these (A–E):

A. Hand covers ≥ 7 % of the frame area (close to camera)  
B. ≥ 30 % of forearm is visible in the same shot  
C. Hand pixels overlapping the face-hair box ≤ 25 %  
D. No second hand is visible  
E. Orientation checks  
   • IF PALM-UP  : fingernails ≤ 10 % of hand, palm wrinkles clear  
   • IF FIST-OUT : knuckles + curled finger segments visible (fingertips/nails facing lens)

If any rule fails → reply {}.  
Return JSON only.
`.trim()

const BEHAVIOR_RULES = `
If NO hand passes A–E, analyze the user's **focus state** instead.

Distraction cues (set "is_focused": false, add to "observed_behaviors"):
  • phone visible in hand or near face  
  • user looking away from screen (head turned or eyes closed)  
  • talking / mouth noticeably moving  
  • other person visible in frame  
  • user absent (chair empty) or mostly out of frame  
  • sleeping or eyes closed for > 1 s  
  • camera severely out-of-focus or obstructed

Focus cues (set "is_focused": true):
  • eyes open, gaze roughly toward screen  
  • upright posture, minimal motion  
  • no phone, no talking, no extra people

Always return:
  {"focus_score": 0-100, "is_focused": true|false,
   "observed_behaviors": [...], "explanation": ""}
`.trim()

const COMMON = `You are a vision agent.\n${COMMON_RULES}\nReturn JSON only.`

export const prompts: Record<'stopped' | 'running' | 'paused' | 'break', string> = {
  stopped: `
${COMMON}
• If a PALM-UP or FIST-OUT passes rules A–E → {"action":"START"}
• Else → {}
`.trim(),

  running: `
${COMMON}

/* PRIORITY 1 ────────────── */
• If PALM-UP passes rules A–E → {"action":"STOP"}
• Else if FIST-OUT passes A–E → {"action":"PAUSE"}

/* PRIORITY 2 ──────────────
   If NO hand passes A–E, analyse focus instead. */
${BEHAVIOR_RULES}
`.trim(),

  paused: `
${COMMON}
• PALM-UP passes A–E → {"action":"STOP"}
• FIST-OUT passes A–E → {"action":"RESUME"}
• Else → {}
`.trim(),

  break: `
${COMMON}
• PALM-UP or FIST-OUT passes A–E → {"action":"NEXT"}
• Else → {}
`.trim(),
}

interface UseBehaviorDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  externalTimerControlsRef: React.RefObject<{
    start?: () => void;
    pause?: () => void;
    stop?: () => void;
    resume?: () => void;
    nextSession?: () => void;
    distraction?: () => void;
  }>;
  externalTimerStateRef: React.RefObject<{
    isRunning: boolean;
    isPaused: boolean;
    isDuringBreak: boolean;
    isDistractionModalVisible?: boolean;
  }>;
  supabase: SupabaseClient;
  /** push every valid focus_score upward so SessionHandler can average */
  onFocusScore: (score: number) => void;
  sessionIdRef: React.MutableRefObject<number | null>;
}

/*
  Jiwoo Kim
  05/18
  Gemini result
 {
  "action": "STOP",
  "focus_score": 95,
  "is_focused": true,
  "observed_behaviors": [],
  "explanation": "A single hand is visible, palm up, and satisfies all criteria A-E."
}
*/

export function useBehaviorDetection({
  videoRef,
  externalTimerControlsRef,
  externalTimerStateRef,
  supabase,
  // onFocusScore,
  sessionIdRef, 
}: UseBehaviorDetectionProps) {
  // const [cooldownActive] = useState(false);   // reserved, still unused
  const motionCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const previousFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const motionDetectedCountRef = useRef(0);
  const motionEndedCountRef = useRef(0);
  const lastMotionDetectedRef = useRef(false);
  const nextSnapshotAllowedTimeRef = useRef(0);
  const motionBufferRef = useRef<boolean[]>([]);
  const isAnalyzingRef = useRef(false);
  const lastHighMotionTriggerRef = useRef(0);
  const { getKey, rotateKey } = useGeminiKeys();

  const isActiveRef = useRef(false);
  const generationRef = useRef(0);  // 🔑 version counter

  // pause behaviorDetection while DistractionModal is active
  const isModalVisibleRef = useRef(false);
  const shouldSkipRef = useRef(false);
  // const abortControlRef = useRef<AbortController | null>(null);

  /* clean-up on unmount */
  useEffect(() => () => stopBehaviorDetection(), []);

  // ───────────────────────────── control API ────────────────────────────
  function startBehaviorDetection() {
    if (isActiveRef.current) return;
    generationRef.current += 1;
    isActiveRef.current = true;
    resetPerSessionState();
    // console.log('▶️ behavior detection started');
    loop(generationRef.current);
  }

  function stopBehaviorDetection() {
    if (!isActiveRef.current) return;
    isActiveRef.current = false;
    generationRef.current += 1;
    // cancel previous Gemini API calls
    // abortControlRef.current?.abort();

    // console.log('🛑 behavior detection stopped');
  }
  // ──────────────────────────────────────────────────────────────────────────

  function resetPerSessionState() {
    motionDetectedCountRef.current = 0;
    motionEndedCountRef.current = 0;
    lastMotionDetectedRef.current = false;
    previousFrameDataRef.current = null;
    nextSnapshotAllowedTimeRef.current = Date.now();
    motionBufferRef.current = [];
  }

  async function loop(gen: number) {
    if (!isActiveRef.current || gen !== generationRef.current) return;
    await detectMotion(gen);
    if (isActiveRef.current && gen === generationRef.current) {
      setTimeout(() => loop(gen), 250);  // tighter loop for better response
    }
  }

  /**
   * 05/10 (wyjung)
   * Remaining issues:
   * - Motion detection & Gemini API calls are not canceled when the modal is opened
   */

  async function detectMotion(gen: number) {
    shouldSkipRef.current = externalTimerStateRef.current?.isDistractionModalVisible ?? false; // capture before evaluating shouldSkipRef
    // early return to skip behaviorDetection while DistractionModal is active.
    // console.log(`shouldSkipRef.current: ${shouldSkipRef.current}`)
    if (shouldSkipRef.current) {
      // console.log('Behavior detection paused: DistractionModal active.');
      return;
    }

    if (!videoRef.current ||
      !isActiveRef.current ||
      gen !== generationRef.current) return;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const aspectRatio = video.videoWidth / video.videoHeight;
    const w = BASE_WIDTH;
    const h = Math.round(w / aspectRatio);

    const canvas = motionCanvasRef.current ?? document.createElement('canvas');
    motionCanvasRef.current = canvas;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);
    const pixels = ctx.getImageData(0, 0, w, h).data;

    if (previousFrameDataRef.current) {
      let diff = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        diff += Math.abs(pixels[i] - previousFrameDataRef.current[i]);
      }
      const avgDiff = diff / (w * h);
      const now = Date.now();

      // Instant override: High motion triggers snapshot immediately
      if (avgDiff > HIGH_MOTION_THRESHOLD &&
        now - lastHighMotionTriggerRef.current > HIGH_MOTION_COOLDOWN_MS &&
        !isAnalyzingRef.current) {
        console.log('🚨 High motion detected — triggering Gemini API');
        lastHighMotionTriggerRef.current = now;
        isAnalyzingRef.current = true;
        await captureSnapshotAndAnalyze(gen);
        isAnalyzingRef.current = false;
        previousFrameDataRef.current = pixels; // update frame data early to prevent retrigger
        return; // skip rest of logic this cycle
      }

      const isMotion = avgDiff > MOTION_SENSITIVITY;
      motionBufferRef.current.push(isMotion);
      if (motionBufferRef.current.length > 5) motionBufferRef.current.shift();

      const isConsistentMotion = motionBufferRef.current.filter(Boolean).length >= 3;

      if (isConsistentMotion) {
        motionDetectedCountRef.current += 1;
        motionEndedCountRef.current = 0;

        if (motionDetectedCountRef.current >= MOTION_DETECTION_THRESHOLD &&
          !lastMotionDetectedRef.current) {
          lastMotionDetectedRef.current = true;
          console.log('⚡ motion detected');
        }

        if (now >= nextSnapshotAllowedTimeRef.current && !isAnalyzingRef.current) {
          isAnalyzingRef.current = true;
          await captureSnapshotAndAnalyze(gen);
          nextSnapshotAllowedTimeRef.current =
            now + MOTION_SNAPSHOT_INTERVAL + Math.random() * 2_000;
          isAnalyzingRef.current = false;
        }
      } else {
        motionDetectedCountRef.current = 0;
        motionEndedCountRef.current += 1;

        if (motionEndedCountRef.current >= MOTION_END_THRESHOLD &&
          lastMotionDetectedRef.current) {
          lastMotionDetectedRef.current = false;
          console.log('😴 motion ended');
        }

        if (!lastMotionDetectedRef.current &&
          now >= nextSnapshotAllowedTimeRef.current &&
          !isAnalyzingRef.current) {
          isAnalyzingRef.current = true;
          await captureSnapshotAndAnalyze(gen);
          nextSnapshotAllowedTimeRef.current =
            now + IDLE_SNAPSHOT_INTERVAL + Math.random() * 3_000;
          isAnalyzingRef.current = false;
        }
      }

      console.log(`avgDiff: ${avgDiff.toFixed(2)} | motion: ${isMotion}`);
    }

    previousFrameDataRef.current = pixels;
  }

  // ─────────────────── snapshot + Gemini analysis ───────────────────────
  type SnapshotHook = (blob: Blob, parsed: any | null) => void;

  /**
   * full-res frame → geminiBlob (512×512 PNG) for AI
   *                → storageBlob (≤512px WebP) for Supabase (later)
   *
   * onSnapshotReady runs after Gemini finishes.  For now it just logs.
   */
  async function captureSnapshotAndAnalyze(
    gen: number,
    onSnapshotReady: SnapshotHook = (b, _) => // TODO: replace _ with r later
      console.log("📸 storageBlob ready:", b.size, "bytes")
  ) {
    if (
      !isActiveRef.current ||
      gen !== generationRef.current ||
      isModalVisibleRef.current ||
      !videoRef.current
    )
      return;

    /* 1️⃣  draw full-res frame into an off-screen canvas */
    const video = videoRef.current;
    const full = Object.assign(document.createElement("canvas"), {
      width: video.videoWidth,
      height: video.videoHeight,
    });
    full.getContext("2d")!.drawImage(video, 0, 0);

    /* 2️⃣  make the two derivatives in parallel */
    const [geminiBlob, storageBlob] = await Promise.all([
      makeSquarePNG(full, 512),         // lossless for Gemini
      makeAspectWebP(full, 512, 0.7),   // space-saving for storage
    ]);

    const sendDataToBackend = async (gemini_data: any) => {
      const { data } = await supabase.auth.getSession();
      const access_token = data.session?.access_token;
      if (!access_token) {
        console.error("No access token found");
        return;
      }

      // include session_id & access_token in body
      const payload = {
        access_token,
        session_id: sessionIdRef.current,  // make sure you pass sessionIdRef from useSessionHandler
        gemini_data,
      };

      try {
        const res = await fetch(
          `https://${import.meta.env.VITE_API_URL}/distractions/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (!res.ok) {
          console.error("Failed to log distraction", await res.text());
          return;
        }
        const result = await res.json();
        console.log("Distraction logged:", result);
      } catch (err) {
        console.error("Error sending data:", err);
      }
    };

    /* 3️⃣  Send to Gemini (if enabled) */
    let parsed: any | null = null;
    if (GEMINI_CALL_ENABLED) {
      console.log("GEMINI CALL ENABLED GERWEGRTTJYUTREWCRVETBRYNTMUYUK<")
      try {
        const b64 = await blobToBase64(geminiBlob);
        const prompt = selectPrompt();

        const rawResp = await callGeminiAPI(b64.split(",")[1], prompt);
        parsed = rawResp ? parseGeminiResponse(rawResp) : null;

        /* 🎨  Pretty-print */
        console.log(
          "🧠 Gemini result\n",
          parsed
            ? JSON.stringify(parsed, null, 2)
            : "• (empty / no-op response) •"
        );

        console.log("data going to be sent");
        sendDataToBackend(parsed);
        console.log("data sent");

        handleBehaviorResult(parsed);
      } catch (err) {
        console.error("Gemini error", err);
      }
    }

    /* 4️⃣  Notify caller (for future upload); now we just log */
    onSnapshotReady(storageBlob, parsed);
  }

  /* ───────── helper: 512×512 square PNG (letter-box) ───────── */
  function makeSquarePNG(
    src: HTMLCanvasElement,
    size: number
  ): Promise<Blob> {
    const c = Object.assign(document.createElement("canvas"), {
      width: size,
      height: size,
    });
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, size, size);

    const ar = src.width / src.height;
    const dw = ar > 1 ? size : size * ar;
    const dh = ar > 1 ? size / ar : size;
    ctx.drawImage(src, (size - dw) / 2, (size - dh) / 2, dw, dh);

    return new Promise((res) => c.toBlob((b) => res(b!), "image/png"));
  }

  /* ───────── helper: aspect-ratio WebP ≤ maxEdge ──────────── */
  function makeAspectWebP(
    src: HTMLCanvasElement,
    maxEdge: number,
    quality = 0.7
  ): Promise<Blob> {
    const scale = Math.min(maxEdge / src.width, maxEdge / src.height);
    const w = Math.round(src.width * scale);
    const h = Math.round(src.height * scale);

    const c = Object.assign(document.createElement("canvas"), {
      width: w,
      height: h,
    });
    c.getContext("2d")!.drawImage(src, 0, 0, w, h);
    return new Promise((res) => c.toBlob((b) => res(b!), "image/webp", quality));
  }

  // ───────────────────────── Gemini helpers ─────────────────────────────
  function selectPrompt() {
    const { isRunning, isPaused, isDuringBreak } = externalTimerStateRef.current;
    return isDuringBreak ? prompts.break
      : isRunning ? prompts.running
        : isPaused ? prompts.paused
          : prompts.stopped;
  }

  function parseGeminiResponse(raw: string) {
    return JSON.parse(raw.replace(/```json|```/g, '').trim());
  }

  const blobToBase64 = (blob: Blob) =>
    new Promise<string>((res, rej) => {
      const r = new FileReader();
      r.onloadend = () =>
        typeof r.result === 'string' ? res(r.result) : rej('b64 fail');
      r.readAsDataURL(blob);
    });

  async function callGeminiAPI(b64: string, prompt: string) {
    const apiKey = getKey();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const body = {
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inline_data: { mime_type: 'image/png', data: b64 } },
        ],
      }],
    };

    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    // 🌐 log HTTP status
    console.log('🌐 Gemini HTTP status', resp.status);
    if (resp.status === 429) rotateKey();

    if (!resp.ok) throw new Error(`Gemini HTTP ${resp.status}`);
    const json = await resp.json();
    // 📦 log full JSON payload
    console.log('📦 Gemini JSON payload', json);

    return json.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  }

  // ─────────────────────── behavior result handler ──────────────────────
  async function handleBehaviorResult(result: any) {
    shouldSkipRef.current = externalTimerStateRef.current?.isDistractionModalVisible ?? false; // capture before evaluating shouldSkipRef
    // early return to skip behaviorDetection while DistractionModal is active.
    if (shouldSkipRef.current) {
      console.log('Behavior detection paused: DistractionModal active.');
      return;
    }

    if (!result) return;
    // 🎯 log the incoming result and timer state
    console.log('🎯 handleBehaviorResult', { result, timerState: externalTimerStateRef.current });

    if (result.action) {
      const map = {
        START: () => externalTimerControlsRef.current.start?.(),
        STOP: () => externalTimerControlsRef.current.stop?.(),
        PAUSE: () => externalTimerControlsRef.current.pause?.(),
        RESUME: () => externalTimerControlsRef.current.resume?.(),
        NEXT: () => externalTimerControlsRef.current.stop?.(),
      };
      await map[result.action as keyof typeof map]?.();
      return;
    }

    let lastDistractionTime = 0;

    if (!externalTimerStateRef.current.isDuringBreak && result.is_focused === false) {
      const now = Date.now();
      if (now - lastDistractionTime > 5000) {
        lastDistractionTime = now;
        await externalTimerControlsRef.current.distraction?.();
      }
    }
  }

  // ─────────────────────── exposed hook contract ────────────────────────
  return {
    startBehaviorDetection,
    stopBehaviorDetection,
    setModalVisible: (visible: boolean) => {
      isModalVisibleRef.current = visible;
      // console.log('Modal visibility changed:', isModalVisibleRef.current);
    }
  };
}