import { useEffect, useRef, useState } from 'react';

const API_KEY = "AIzaSyCZ9yNobnF2wJap7f9LEvPVr2dCFTb5aCo"; // actual API key; DO NOT share with others.
const GEMINI_CALL_ENABLED = true; // switch to false during testing/dev to save API calls
const BASE_WIDTH = 64;   // canvas width for motion detection
const BASE_HEIGHT = 48;
const MOTION_SNAPSHOT_INTERVAL = 2000;   // 2s after motion
const IDLE_SNAPSHOT_INTERVAL = 2 *1000;    // 12s when idle
const MOTION_DETECTION_THRESHOLD = 2;  // how many motion frames to confirm motion
const MOTION_END_THRESHOLD = 3;         // how many still frames to confirm no motion

const prompts = {
  stopped:
    'From webcam snapshot: If fist is raised, return { "action": "START" }. Else do nothing. JSON only.',

  running:
    'From webcam snapshot: If palm is raised, return { "action": "STOP" }, if fist is raised, return { "action": "PAUSE" }. Else analyze focus: list focus (facing screen, eyes open, no phone, no talking, still) or distraction (looking away, closed eyes, phone, talking, absent). Score 0–100. Return JSON: { "focus_score": 0–100, "is_focused": true or false, "observed_behaviors": [], "explanation": "" }. JSON only.',

  paused:
    'From webcam snapshot: If palm is raised, return { "action": "STOP" }, if fist is raised, return { "action": "RESUME" }. Else do nothing. DO NOT analyze focus. JSON only.',

  break:
    'From webcam snapshot: If palm is raised, return { "action": "NEXT" }. Else do nothing. DO NOT analyze focus. JSON only.'
};
interface UseBehaviorDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  externalTimerControlsRef: React.RefObject<any>;
  externalTimerStateRef: React.RefObject<any>;
}

export function useBehaviorDetection({
  videoRef,
  externalTimerControlsRef,
  externalTimerStateRef,
}: UseBehaviorDetectionProps) {
  const [cooldownActive, setCooldownActive] = useState(false);
  const motionRef = useRef<HTMLCanvasElement | null>(null);
  const motionDetectedCountRef = useRef(0);
  const motionEndedCountRef = useRef(0);

  const previousFrameData = useRef<Uint8ClampedArray | null>(null);
  const detectionInterval = useRef<number | null>(null);

  useEffect(() => {
    return () => stopBehaviorDetection();
  }, []);

  function startBehaviorDetection() {
    if (detectionInterval.current) return;
    detectionInterval.current = setInterval(detectMotion, 500);
  }

  function stopBehaviorDetection() {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }
  }

  const nextSnapshotAllowedTimeRef = useRef(Date.now());
  const lastMotionDetectedRef = useRef(false);

  async function detectMotion() {
    if (!videoRef.current || cooldownActive) return;

    const video = videoRef.current;
    const videoAspectRatio = video.videoWidth / video.videoHeight || (16 / 9); // fallback
    const canvasWidth = BASE_WIDTH;
    const canvasHeight = Math.round(canvasWidth / videoAspectRatio);

    const canvas = motionRef.current || document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let now = Date.now();

    if (previousFrameData.current) {
      let diff = 0;
      for (let i = 0; i < currentData.length; i += 4) {
        diff += Math.abs(currentData[i] - previousFrameData.current[i]);
      }

      const avgDiff = diff / (canvas.width * canvas.height);

      if (avgDiff > 10) {
        motionDetectedCountRef.current++;
        motionEndedCountRef.current = 0;

        if (motionDetectedCountRef.current >= MOTION_DETECTION_THRESHOLD && !lastMotionDetectedRef.current) {
          console.log('⚡ Motion detected!');
          lastMotionDetectedRef.current = true;
        }

        if (now >= nextSnapshotAllowedTimeRef.current) {
          console.log('📸 Motion snapshot captured!');
          await captureSnapshotAndAnalyze();
          nextSnapshotAllowedTimeRef.current = now + (MOTION_SNAPSHOT_INTERVAL + Math.random() * 2000);
        }
      } else {
        motionDetectedCountRef.current = 0;
        motionEndedCountRef.current++;

        if (motionEndedCountRef.current >= MOTION_END_THRESHOLD && lastMotionDetectedRef.current) {
          console.log('😴 Motion ended.');
          lastMotionDetectedRef.current = false;
        }

        if (!lastMotionDetectedRef.current && now >= nextSnapshotAllowedTimeRef.current) {
          console.log('💤 Idle snapshot captured!');
          await captureSnapshotAndAnalyze();
          nextSnapshotAllowedTimeRef.current = now + (IDLE_SNAPSHOT_INTERVAL + Math.random() * 3000);
        }
      }
    }

    previousFrameData.current = currentData;
    motionRef.current = canvas;
  }

  async function captureSnapshotAndAnalyze() {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasSize = 768;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    const video = videoRef.current;
    const videoAspectRatio = video.videoWidth / video.videoHeight;
    const drawWidth = videoAspectRatio > 1 ? canvasSize : canvasSize * videoAspectRatio;
    const drawHeight = videoAspectRatio > 1 ? canvasSize / videoAspectRatio : canvasSize;
    const offsetX = (canvasSize - drawWidth) / 2;
    const offsetY = (canvasSize - drawHeight) / 2;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      if (GEMINI_CALL_ENABLED) {
        try {
          const base64 = await blobToBase64(blob);
          const prompt = selectPrompt();
          const result = await callGeminiAPI(base64.split(',')[1], prompt);
          if (result) {
            const parsed = parseGeminiResponse(result);
            handleBehaviorResult(parsed);
          }
        } catch (err) {
          console.error('Gemini API or parsing error:', err);
        }
      }
    }, 'image/png');
  }

  function selectPrompt() {
    const { isRunning, isPaused, isDuringBreak } = externalTimerStateRef.current;
    let res = '';
    if (isDuringBreak) res = prompts.break;
    else if (isRunning) res = prompts.running;
    else if (isPaused) res = prompts.paused;
    else res = prompts.stopped;

    console.log(res);
    return res;
  }

  function parseGeminiResponse(raw: string) {
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }

  async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.readAsDataURL(blob);
    });
  }

  async function callGeminiAPI(base64Image: string, prompt: string) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const body = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/png", data: base64Image } }
          ]
        }
      ]
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(`Gemini API returned HTTP ${response.status}`);

    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || null;
  }

  function handleBehaviorResult(result: any) {
    console.log(JSON.stringify(result, null, 2));
    if (result?.action) {
      console.log("🎯 Action detected:", result.action);
      const actions = {
        START: () => externalTimerControlsRef.current.start?.(),
        STOP: () => externalTimerControlsRef.current.stop?.(),
        PAUSE: () => externalTimerControlsRef.current.pause?.(),
        RESUME: () => externalTimerControlsRef.current.resume?.(),
        NEXT: () => externalTimerControlsRef.current.stop?.(),
      };
      const action = result.action as keyof typeof actions;
      console.log(externalTimerStateRef.current);
      actions[action]?.();
    } else if (!externalTimerStateRef.current.isDuringBreak && result?.is_focused === false) {
      externalTimerControlsRef.current.distraction?.();
    }
  }

  return {
    startBehaviorDetection,
    stopBehaviorDetection,
  };
}
