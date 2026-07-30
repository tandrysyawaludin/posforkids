"use client";

import { useRef, useState, useCallback } from "react";
import { Scan, X } from "lucide-react";
import BigButton from "./BigButton";

interface OcrScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function OcrScanner({ onScan, onClose }: OcrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch {
      setError("Cannot access camera. Please allow camera permission.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  const scanCode = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || scanning) return;

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
  }, [scanning, stopCamera, onScan, onClose]);

  const handleClose = () => {
    stopCamera();
    onClose();
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
          <p className="text-red-500 text-center mb-4 font-bold">{error}</p>
        )}

        {!active ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="text-8xl animate-wiggle">🔍</div>
            <BigButton onClick={startCamera} color="blue">
              <Scan size={28} />
              Start Scanner
            </BigButton>
          </div>
        ) : (
          <div className="space-y-4">
            <video
              ref={videoRef}
              className="w-full rounded-2xl bg-black aspect-[4/3] object-cover"
              playsInline
              muted
            />
            <BigButton
              onClick={scanCode}
              color="purple"
              className="w-full"
              disabled={scanning}
            >
              {scanning ? "⏳ Reading..." : "🔍 Scan Now!"}
            </BigButton>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
