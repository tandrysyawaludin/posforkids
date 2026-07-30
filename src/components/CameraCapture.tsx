"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, X, RotateCcw } from "lucide-react";
import BigButton from "./BigButton";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  label?: string;
}

export default function CameraCapture({
  onCapture,
  onClose,
  label = "Take Photo",
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
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

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setPreview(url);
        stopCamera();
      },
      "image/jpeg",
      0.85
    );
  }, [stopCamera]);

  const retake = () => {
    setPreview(null);
    startCamera();
  };

  const confirm = () => {
    if (!preview) return;
    fetch(preview)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        onCapture(file);
        onClose();
      });
  };

  const handleClose = () => {
    stopCamera();
    if (preview) URL.revokeObjectURL(preview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg animate-bounce-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-extrabold text-[#2d1b4e] flex items-center gap-2">
            <Camera size={32} className="text-[#ff6b9d]" />
            {label}
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full bg-gray-100">
            <X size={24} />
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-center mb-4 font-bold">{error}</p>
        )}

        {!active && !preview && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="text-8xl">📸</div>
            <BigButton onClick={startCamera} color="blue">
              <Camera size={28} />
              Open Camera
            </BigButton>
          </div>
        )}

        {active && !preview && (
          <div className="space-y-4">
            <video
              ref={videoRef}
              className="w-full rounded-2xl bg-black aspect-[4/3] object-cover"
              playsInline
              muted
            />
            <BigButton onClick={capture} color="pink" className="w-full">
              📷 Snap!
            </BigButton>
          </div>
        )}

        {preview && (
          <div className="space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              className="w-full rounded-2xl aspect-[4/3] object-cover"
            />
            <div className="flex gap-3">
              <BigButton onClick={retake} color="yellow" className="flex-1">
                <RotateCcw size={24} />
                Retake
              </BigButton>
              <BigButton onClick={confirm} color="mint" className="flex-1">
                ✅ Use Photo
              </BigButton>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
