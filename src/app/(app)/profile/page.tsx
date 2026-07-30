"use client";

import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import BigButton from "@/components/BigButton";
import CameraCapture from "@/components/CameraCapture";
import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch("/api/auth/me").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setDisplayName(data.user.display_name || data.user.username);
        setAvatarPreview(data.user.avatar_url);
      }
    });
  }, []);

  const handleCapture = (file: File) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setShowCamera(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    const formData = new FormData();
    formData.append("display_name", displayName);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const res = await apiFetch("/api/profile", {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      setUser(data.user);
      setAvatarFile(null);
      setMessage("Profile saved! 🎉");
    } else {
      setMessage(data.error || "Save failed");
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl animate-wiggle">😊</div>
        <p className="text-xl font-bold mt-4">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-bounce-in">
      <h1 className="text-3xl font-black text-[#2d1b4e] text-center">
        😊 My Profile
      </h1>

      <div className="bg-white rounded-3xl p-6 shadow-lg flex flex-col items-center space-y-4">
        <button
          onClick={() => setShowCamera(true)}
          className="relative group"
        >
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-[#ff6b9d] object-cover"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-[#ffb3cc] flex items-center justify-center text-6xl border-4 border-[#ff6b9d]">
              😊
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={32} className="text-white" />
          </div>
        </button>

        <p className="text-gray-500 font-bold">Tap photo to change 📸</p>

        <div className="w-full">
          <label className="block text-lg font-bold mb-2 text-[#2d1b4e]">
            ✏️ Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-4 text-xl rounded-2xl border-4 border-[#ffb3cc] outline-none focus:border-[#ff6b9d]"
          />
        </div>

        <div className="w-full">
          <label className="block text-lg font-bold mb-2 text-[#2d1b4e]">
            👤 Username
          </label>
          <p className="p-4 text-xl rounded-2xl bg-gray-100 font-bold text-gray-600">
            {user.username}
          </p>
        </div>

        {message && (
          <p
            className={`font-bold text-center ${message.includes("saved") ? "text-green-600" : "text-red-500"}`}
          >
            {message}
          </p>
        )}

        <BigButton
          color="pink"
          className="w-full"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "⏳ Saving..." : "💾 Save Profile"}
        </BigButton>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
          label="Profile Photo"
        />
      )}
    </div>
  );
}
