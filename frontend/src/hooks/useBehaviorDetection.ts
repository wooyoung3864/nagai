/**
 * useBehaviorDetection
 * 
 * Hook to detect user behaviors from webcam snapshots using Gemini 1.5 Flash.
 * 
 * Behaviors Detected:
 * - Palm raise → STOP
 * - Fist raise while running → PAUSE
 * - Fist raise while paused → RESUME
 * - Palm raise during break → GOTO NEXT SESSION
 * - Otherwise, predict focus behaviors and focus_score (only while running)
 * 
 * Features:
 * - Motion detection (simple pixel difference)
 * - Snapshot webcam frame after motion detected
 * - Resize to 512x512 with aspect ratio preserved (black bars)
 * - Base64 encode snapshot
 * - Send image + dynamic prompt (running/paused/stopped/break) to Gemini
 * - Parse { "action" } or { "focus_score" }
 * - Act accordingly
 * 
 * Usage:
 * Call `startBehaviorDetection()` when camera feed starts,
 * and `stopBehaviorDetection()` when camera feed stops.
 */

import { useEffect, useRef, useState } from 'react';

const API_KEY = "AIzaSyCZ9yNobnF2wJap7f9LEvPVr2dCFTb5aCo"; // actual key; DO NOT share with anyone else.

const prompts = {
  stopped:
    'From webcam snapshot: If fist is raised, return { "action": "RESUME" }. Else do nothing. JSON only.',

  running:
    'From webcam snapshot: If palm is raised, return { "action": "STOP" }, if fist is raised, return { "action": "PAUSE" }. Else analyze focus: list focus (facing screen, eyes open, no phone, no talking, still) or distraction (looking away, closed eyes, phone, talking, absent). Score 0–100. Return JSON: { "focus_score": 0–100, "focus_state": "Focused" or "Not Focused", "observed_behaviors": [], "explanation": "" }. JSON only.',

  paused:
    'From webcam snapshot: If palm is raised, return { "action": "STOP" }, if fist is raised, return { "action": "RESUME" }. Else do nothing. JSON only.',

  break:
    'From webcam snapshot: If palm is raised, return { "action": "GOTO NEXT SESSION" }. Else do nothing. JSON only.'
};

// ⬇️ Temporary fixed prompt for testing
const TESTING_PROMPT =
  prompts.running;

interface UseBehaviorDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isTimerRunning: boolean;
  isTimerPaused: boolean;
  isDuringBreak: boolean;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onNextSession: () => void;
  onDistraction: () => void;
}

export function useBehaviorDetection({
  videoRef,
  isTimerRunning,
  isTimerPaused,
  isDuringBreak,
  onStop,
  onPause,
  onResume,
  onNextSession,
  onDistraction,
}: UseBehaviorDetectionProps) {
  const motionRef = useRef<HTMLCanvasElement | null>(null);
  const motionDetectionActive = useRef(false);
  const previousFrameData = useRef<Uint8ClampedArray | null>(null);
  const detectionInterval = useRef<number | null>(null);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [lastCapturedImage, setLastCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopBehaviorDetection();
    };
  }, []);

  function startBehaviorDetection() {
    if (motionDetectionActive.current) return;
    motionDetectionActive.current = true;
    // detectionInterval.current = setInterval(detectMotion, 500);
    detectionInterval.current = window.setInterval(captureSnapshotAndAnalyze, 15000); // Every 5s
  }

  function stopBehaviorDetection() {
    motionDetectionActive.current = false;
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
    }
  }

  async function detectMotion() {
    if (!videoRef.current || cooldownActive) return;

    const canvas = motionRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const video = videoRef.current;
    canvas.width = 64;
    canvas.height = 48;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    if (previousFrameData.current) {
      let diff = 0;
      for (let i = 0; i < currentData.length; i += 4) {
        diff += Math.abs(currentData[i] - previousFrameData.current[i]);
      }

      const avgDiff = diff / (canvas.width * canvas.height);
      if (avgDiff > 20) {
        await captureSnapshotAndAnalyze();
      }
    }

    previousFrameData.current = currentData;
    motionRef.current = canvas;
  }

  function blobToBase64(blob: Blob): Promise<string> {
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

    let drawWidth: number, drawHeight: number;

    if (videoAspectRatio > 1) {
      drawWidth = canvasSize;
      drawHeight = canvasSize / videoAspectRatio;
    } else {
      drawHeight = canvasSize;
      drawWidth = canvasSize * videoAspectRatio;
    }

    const offsetX = (canvasSize - drawWidth) / 2;
    const offsetY = (canvasSize - drawHeight) / 2;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        setLastCapturedImage(blobUrl);

        const a = document.createElement('a');
        //a.href = blobUrl;
        //a.download = `snapshot-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.png`;
        //document.body.appendChild(a);
        //a.click();
        //document.body.removeChild(a);

        const base64Image = await blobToBase64(blob);
        const promptToSend = TESTING_PROMPT;
        const result = await callGeminiAPI(base64Image.split(',')[1], promptToSend);
        if (result) {
          console.log("🎯 Gemini Test Response:", result);
        }
      }
    }, 'image/png');
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

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        return result.candidates[0].content.parts[0].text;
      }
      return null;
    } catch (err) {
      console.error('Gemini API error:', err);
      return null;
    }
  }

  return {
    startBehaviorDetection,
    stopBehaviorDetection,
    lastCapturedImage
  };
}
