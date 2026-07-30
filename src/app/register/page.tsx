"use client";

import { useState } from "react";
import Link from "next/link";
import BigButton from "@/components/BigButton";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await apiFetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }

    window.location.href = "/vercel-agent/dashboard";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8 animate-bounce-in">
        <div className="text-8xl mb-4">✨</div>
        <h1 className="text-4xl font-black text-[#2d1b4e]">Join the Fun!</h1>
        <p className="text-lg text-gray-600 mt-2 font-semibold">
          Create your shop account 🏪
        </p>
      </div>

      <form
        onSubmit={handleRegister}
        className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md space-y-5"
      >
        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-2xl font-bold text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-lg font-bold mb-2 text-[#2d1b4e]">
            👤 Pick a Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-4 text-xl rounded-2xl border-4 border-[#ffb3cc] focus:border-[#ff6b9d] outline-none"
            placeholder="At least 3 letters"
            minLength={3}
            required
          />
        </div>

        <div>
          <label className="block text-lg font-bold mb-2 text-[#2d1b4e]">
            🔒 Pick a Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 text-xl rounded-2xl border-4 border-[#b3e5ff] focus:border-[#6bcbff] outline-none"
            placeholder="At least 4 characters"
            minLength={4}
            required
          />
        </div>

        <BigButton type="submit" color="mint" className="w-full" disabled={loading}>
          {loading ? "⏳ Creating..." : "🎉 Create My Shop!"}
        </BigButton>

        <p className="text-center text-gray-600 font-semibold">
          Already have one?{" "}
          <Link
            href="/login"
            className="text-[#ff6b9d] font-extrabold hover:underline"
          >
            Login 🚀
          </Link>
        </p>
      </form>
    </div>
  );
}
