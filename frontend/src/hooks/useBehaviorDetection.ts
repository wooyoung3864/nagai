import { useEffect, useRef, useState } from 'react';

const API_KEY = 'AIzaSyCZ9yNobnF2wJap7f9LEvPVr2dCFTb5aCo';     // ⚠️ real key
const GEMINI_CALL_ENABLED = false;                            // flip true in prod

// ── motion-analysis constants ─────────────────────────────────────────────
const BASE_WIDTH  = 64;          // down-sampled width for diffing
const MOTION_SNAPSHOT_INTERVAL = 2_000;
const IDLE_SNAPSHOT_INTERVAL   = 12_000;
const MOTION_DETECTION_THRESHOLD = 2;    // frames
const MOTION_END_THRESHOLD       = 3;    // frames
// ──────────────────────────────────────────────────────────────────────────

const prompts: Record<'stopped'|'running'|'paused'|'break', string> = {
  stopped: 'From webcam snapshot: If fist is raised, return { "action": "START" }. Else do nothing. JSON only.',
  running: 'From webcam snapshot: If palm is raised, return { "action": "STOP" }, if fist is raised, return { "action": "PAUSE" }. Else analyze focus: list focus (facing screen, eyes open, no phone, no talking, still) or distraction (looking away, closed eyes, phone, talking, absent). Score 0–100. Return JSON: { "focus_score": 0–100, "is_focused": true/false, "observed_behaviors": [], "explanation": "" }. JSON only.',
  paused : 'From webcam snapshot: If palm is raised, return { "action": "STOP" }, if fist is raised, return { "action": "RESUME" }. Else do nothing. JSON only.',
  break  : 'From webcam snapshot: If palm is raised, return { "action": "NEXT" }. Else do nothing. JSON only.',
};

interface UseBehaviorDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  externalTimerControlsRef: React.RefObject<any>;
  externalTimerStateRef   : React.RefObject<any>;
}

export function useBehaviorDetection({
  videoRef,
  externalTimerControlsRef,
  externalTimerStateRef,
}: UseBehaviorDetectionProps) {
  const [cooldownActive]           = useState(false);   // reserved, still unused
  const motionCanvasRef            = useRef<HTMLCanvasElement | null>(null);
  const previousFrameDataRef       = useRef<Uint8ClampedArray | null>(null);
  const motionDetectedCountRef     = useRef(0);
  const motionEndedCountRef        = useRef(0);
  const lastMotionDetectedRef      = useRef(false);
  const nextSnapshotAllowedTimeRef = useRef(0);

  const isActiveRef = useRef(false);
  const generationRef = useRef(0);  // 🔑 version counter

  /* clean-up on unmount */
  useEffect(() => () => stopBehaviorDetection(), []);

  // ───────────────────────────── control API ────────────────────────────
  function startBehaviorDetection() {
    if (isActiveRef.current) return;
    generationRef.current += 1;
    isActiveRef.current   = true;
    resetPerSessionState();
    console.log('▶️ behavior detection started');
    loop(generationRef.current);
  }

  function stopBehaviorDetection() {
    if (!isActiveRef.current) return;
    isActiveRef.current = false;
    generationRef.current += 1;
    console.log('🛑 behavior detection stopped');
  }
  // ──────────────────────────────────────────────────────────────────────────

  function resetPerSessionState() {
    motionDetectedCountRef.current       = 0;
    motionEndedCountRef.current          = 0;
    lastMotionDetectedRef.current        = false;
    previousFrameDataRef.current         = null;
    nextSnapshotAllowedTimeRef.current   = Date.now();
  }

  async function loop(gen: number) {
    if (!isActiveRef.current || gen !== generationRef.current) return;
    await detectMotion(gen);
    if (isActiveRef.current && gen === generationRef.current) {
      setTimeout(() => loop(gen), 500);
    }
  }

  async function detectMotion(gen: number) {
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
    canvas.width  = w;
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

      if (avgDiff > 10) {
        motionDetectedCountRef.current += 1;
        motionEndedCountRef.current     = 0;

        if (motionDetectedCountRef.current >= MOTION_DETECTION_THRESHOLD &&
            !lastMotionDetectedRef.current) {
          lastMotionDetectedRef.current = true;
          console.log('⚡ motion detected');
        }

        if (now >= nextSnapshotAllowedTimeRef.current) {
          await captureSnapshotAndAnalyze(gen);
          nextSnapshotAllowedTimeRef.current =
            now + MOTION_SNAPSHOT_INTERVAL + Math.random() * 2_000;
        }
      } else {
        motionDetectedCountRef.current = 0;
        motionEndedCountRef.current   += 1;

        if (motionEndedCountRef.current >= MOTION_END_THRESHOLD &&
            lastMotionDetectedRef.current) {
          lastMotionDetectedRef.current = false;
          console.log('😴 motion ended');
        }

        if (!lastMotionDetectedRef.current &&
            now >= nextSnapshotAllowedTimeRef.current) {
          await captureSnapshotAndAnalyze(gen);
          nextSnapshotAllowedTimeRef.current =
            now + IDLE_SNAPSHOT_INTERVAL + Math.random() * 3_000;
        }
      }
    }

    previousFrameDataRef.current = pixels;
  }

  // ─────────────────── snapshot + Gemini analysis ───────────────────────
  async function captureSnapshotAndAnalyze(gen: number) {
    if (!isActiveRef.current || gen !== generationRef.current) return;
    if (!videoRef.current) return;

    const video = videoRef.current;
    const square = 768;
    const canvas = document.createElement('canvas');
    canvas.width  = square;
    canvas.height = square;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const ar = video.videoWidth / video.videoHeight;
    const drawWidth  = ar > 1 ? square : square * ar;
    const drawHeight = ar > 1 ? square / ar : square;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, square, square);
    ctx.drawImage(
      video,
      (square - drawWidth ) / 2,
      (square - drawHeight) / 2,
      drawWidth,
      drawHeight,
    );

    canvas.toBlob(async (blob) => {
      if (!blob || gen !== generationRef.current || !isActiveRef.current) return;
      if (!GEMINI_CALL_ENABLED) return;

      try {
        const base64  = await blobToBase64(blob);
        if (gen !== generationRef.current) return;

        const prompt = selectPrompt();
        // 📝 log the prompt and timer state
        console.log('📝 Gemini prompt', { prompt, timerState: externalTimerStateRef.current });

        const rawResp = await callGeminiAPI(base64.split(',')[1], prompt);
        // 🔍 log the raw API response
        console.log('🔍 Gemini raw response', { rawResp, gen, timerState: externalTimerStateRef.current });

        if (!rawResp || gen !== generationRef.current) return;
        const parsed = parseGeminiResponse(rawResp);
        // ✅ log the parsed JSON result
        console.log('✅ Parsed Gemini result', { parsed, gen, timerState: externalTimerStateRef.current });

        handleBehaviorResult(parsed);

        // ↩️ log timer state after handling
        console.log('↩️ Timer state after handling', externalTimerStateRef.current);
      } catch (e) {
        console.error('Gemini error', e);
      }
    }, 'image/png');
  }

  // ───────────────────────── Gemini helpers ─────────────────────────────
  function selectPrompt() {
    const { isRunning, isPaused, isDuringBreak } = externalTimerStateRef.current;
    return isDuringBreak ? prompts.break
         : isRunning      ? prompts.running
         : isPaused       ? prompts.paused
         :                  prompts.stopped;
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
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
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
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(body),
    });
    // 🌐 log HTTP status
    console.log('🌐 Gemini HTTP status', resp.status);

    if (!resp.ok) throw new Error(`Gemini HTTP ${resp.status}`);
    const json = await resp.json();
    // 📦 log full JSON payload
    console.log('📦 Gemini JSON payload', json);

    return json.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  }

  // ─────────────────────── behavior result handler ──────────────────────
  function handleBehaviorResult(result: any) {
    if (!result) return;
    // 🎯 log the incoming result and timer state
    console.log('🎯 handleBehaviorResult', { result, timerState: externalTimerStateRef.current });

    if (result.action) {
      const map = {
        START : () => externalTimerControlsRef.current.start?.(),
        STOP  : () => externalTimerControlsRef.current.stop?.(),
        PAUSE : () => externalTimerControlsRef.current.pause?.(),
        RESUME: () => externalTimerControlsRef.current.resume?.(),
        NEXT  : () => externalTimerControlsRef.current.stop?.(),
      };
      map[result.action as keyof typeof map]?.();
      return;
    }

    if (!externalTimerStateRef.current.isDuringBreak && result.is_focused === false) {
      externalTimerControlsRef.current.distraction?.();
    }
  }

  // ─────────────────────── exposed hook contract ────────────────────────
  return { startBehaviorDetection, stopBehaviorDetection };
}
