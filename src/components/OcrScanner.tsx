"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Scan, X } from "lucide-react";
import BigButton from "./BigButton";
import { useCamera } from "@/lib/useCamera";
import { recognizeCode } from "@/lib/ocr";
import { normalizeCode } from "@/lib/utils";

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
  const [confirmStep, setConfirmStep] = useState(false);
  const [editableCode, setEditableCode] = useState("");

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
      const { bestText, matchedCode } = await recognizeCode(canvas, codes);

      if (!bestText) {
        setError(
          "Could not read anything. Write the code BIG on white paper! 📄"
        );
        return;
      }

      stopCamera();
      setEditableCode(matchedCode || bestText);
      setConfirmStep(true);
    } catch {
      setError("Scan failed. Please try again.");
    } finally {
      setScanning(false);
    }
  }, [scanning, stopCamera, setError, videoRef, codes]);

  const confirmCode = () => {
    const code = normalizeCode(editableCode);
    if (code.length < 1) {
      setError("Type a code first!");
      return;
    }
    onScan(code);
    onClose();
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  const retryCamera = async () => {
    setConfirmStep(false);
    setEditableCode("");
    setError(null);
    setStarting(true);
    await startCamera();
    setStarting(false);
  };

  if (confirmStep) {
    return (
      <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 w-full max-w-lg animate-bounce-in space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-extrabold text-[#2d1b4e]">
              ✅ Is this right?
            </h2>
            <button onClick={handleClose} className="p-2 rounded-full bg-gray-100">
              <X size={24} />
            </button>
          </div>

          <p className="text-center text-gray-600 font-semibold">
            Fix the code if the camera got it wrong ✏️
          </p>

          <input
            type="text"
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value.toUpperCase())}
            className="w-full p-5 text-3xl rounded-2xl border-4 border-[#6bcbff] outline-none focus:border-[#ff6b9d] font-mono text-center font-black"
            autoFocus
          />

          {codes.length > 0 && (
            <div>
              <p className="text-sm font-bold text-gray-500 mb-2 text-center">
                Or tap your item code:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {codes.map((code) => (
                  <button
                    key={code}
                    onClick={() => setEditableCode(normalizeCode(code))}
                    className="px-4 py-2 bg-[#ffb3cc] rounded-xl font-mono font-extrabold text-[#2d1b4e] hover:bg-[#ff6b9d] hover:text-white transition-colors"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}

          <BigButton color="mint" className="w-full" size="xl" onClick={confirmCode}>
            🛒 Add to Cart!
          </BigButton>

          <button
            onClick={retryCamera}
            className="w-full text-center text-sm font-bold text-gray-500"
          >
            📷 Scan again
          </button>
        </div>
      </div>
    );
  }

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

        <p className="text-center text-gray-600 mb-2 font-semibold">
          Write code BIG on white paper 📄
        </p>
        <p className="text-center text-gray-400 mb-4 text-sm font-semibold">
          (Scanning products doesn&apos;t work well — use paper!)
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
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-2xl bg-black aspect-[4/3] object-cover"
                playsInline
                autoPlay
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[75%] h-[45%] border-4 border-dashed border-[#6bcbff] rounded-2xl bg-white/10" />
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
