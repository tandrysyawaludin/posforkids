"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Scan, X } from "lucide-react";
import BigButton from "./BigButton";
import { useCamera } from "@/lib/useCamera";

interface OcrScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function OcrScanner({ onScan, onClose }: OcrScannerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { videoRef, active, error, startCamera, stopCamera, setError } =
    useCamera();
  const [scanning, setScanning] = useState(false);
  const [starting, setStarting] = useState(false);

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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setScanning(false);
      return;
    }
    ctx.drawImage(video, 0, 0);

    try {
      const Tesseract = (await import("tesseract.js")).default;
      const { data } = await Tesseract.recognize(canvas, "eng", {
        logger: () => {},
      });

      const text = data.text
        .replace(/[^A-Za-z0-9]/g, "")
        .toUpperCase()
        .trim();

      if (text.length > 0) {
        stopCamera();
        onScan(text);
        onClose();
      } else {
        setError("Could not read any code. Try writing bigger on the paper!");
      }
    } catch {
      setError("Scan failed. Please try again.");
    } finally {
      setScanning(false);
    }
  }, [scanning, stopCamera, onScan, onClose, setError, videoRef]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const retryCamera = async () => {
    setStarting(true);
    await startCamera();
    setStarting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg animate-bounce-in">
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
          Point camera at the code written on paper 📄
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-2xl font-bold text-center mb-4 text-sm">
            {error}
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
            <video
              ref={videoRef}
              className="w-full rounded-2xl bg-black aspect-[4/3] object-cover"
              playsInline
              autoPlay
              muted
            />
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
