"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Scan, X, Check } from "lucide-react";
import BigButton from "./BigButton";
import { useCamera } from "@/lib/useCamera";
import { recognizeCode } from "@/lib/ocr";
import { matchItemCode } from "@/lib/matchCode";

interface OcrScannerProps {
  codes: string[];
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function OcrScanner({ codes, onScan, onClose }: OcrScannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { videoRef, active, error, startCamera, stopCamera, setError } =
    useCamera();
  const [scanning, setScanning] = useState(false);
  const [starting, setStarting] = useState(false);
  const [detected, setDetected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string | null>(null);

  useEffect(() => {
    setStarting(true);
    startCamera().finally(() => setStarting(false));
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scanCode = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || scanning) return;

    if (video.videoWidth === 0) {
      setError("Camera not ready yet. Wait a second and try again!");
      return;
    }

    setScanning(true);
    setError(null);
    setDetected(null);
    setMatched(null);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setScanning(false);
      return;
    }
    ctx.drawImage(video, 0, 0);

    try {
      const text = await recognizeCode(canvas);

      if (text.length === 0) {
        setError("Could not read any code. Write BIGGER letters on the paper!");
        return;
      }

      const match = matchItemCode(text, codes);
      setDetected(text);
      setMatched(match);

      if (match) {
        stopCamera();
        onScan(match);
        onClose();
      } else {
        setError(`Read "${text}" but no item matches. Check your code or add manually!`);
      }
    } catch {
      setError("Scan failed. Please try again.");
    } finally {
      setScanning(false);
    }
  }, [scanning, stopCamera, onScan, onClose, setError, videoRef, codes]);

  const confirmManual = () => {
    if (detected) {
      stopCamera();
      onScan(detected);
      onClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const retryCamera = async () => {
    setDetected(null);
    setMatched(null);
    setError(null);
    setStarting(true);
    await startCamera();
    setStarting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg animate-bounce-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-extrabold text-[#2d1b4e] flex items-center gap-2">
            <Scan size={32} className="text-[#6bcbff]" />
            Scan Code
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full bg-gray-100">
            <X size={24} />
          </button>
        </div>

        <p className="text-center text-gray-600 mb-4 font-semibold">
          Put the code in the box and hold steady 📄
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-2xl font-bold text-center mb-4 text-sm">
            {error}
          </div>
        )}

        {detected && !matched && (
          <div className="bg-yellow-100 text-[#2d1b4e] p-4 rounded-2xl font-bold text-center mb-4">
            I read: <span className="font-mono text-xl">{detected}</span>
            <button
              onClick={confirmManual}
              className="mt-2 flex items-center justify-center gap-2 w-full text-[#ff6b9d] font-extrabold"
            >
              <Check size={20} /> Use this code anyway
            </button>
          </div>
        )}

        {!active && !starting ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="text-8xl animate-wiggle">📷</div>
            <BigButton onClick={retryCamera} color="blue">
              <Scan size={28} />
              Turn On Camera
            </BigButton>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-2xl bg-black aspect-[4/3] object-cover"
                playsInline
                autoPlay
                muted
              />
              {/* Guide box for where to put the code */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[70%] h-[40%] border-4 border-dashed border-[#6bcbff] rounded-2xl bg-white/10" />
              </div>
            </div>
            {starting && (
              <p className="text-center font-bold text-gray-500">
                Opening camera...
              </p>
            )}
            <BigButton
              onClick={scanCode}
              color="purple"
              className="w-full"
              disabled={scanning || starting}
            >
              {scanning ? "⏳ Reading..." : "🔍 Scan Now!"}
            </BigButton>
            <button
              onClick={retryCamera}
              className="w-full text-center text-sm font-bold text-gray-500"
            >
              Camera not working? Tap to retry
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
