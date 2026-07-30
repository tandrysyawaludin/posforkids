"use client";

import { useState } from "react";
import Link from "next/link";
import BigButton from "@/components/BigButton";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    window.location.href = "/vercel-agent/dashboard";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8 animate-bounce-in">
        <div className="text-8xl mb-4">🛒</div>
        <h1 className="text-4xl font-black text-[#2d1b4e]">POS for Kids</h1>
        <p className="text-lg text-gray-600 mt-2 font-semibold">
          Your fun shop adventure! 🎉
        </p>
      </div>

      <form
        onSubmit={handleLogin}
        className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md space-y-5"
      >
        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-2xl font-bold text-center">
            {error}
          </div>
        )}

        <div>
          <label className="block text-lg font-bold mb-2 text-[#2d1b4e]">
            👤 Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-4 text-xl rounded-2xl border-4 border-[#ffb3cc] focus:border-[#ff6b9d] outline-none"
            placeholder="Your name"
            required
          />
        </div>

        <div>
          <label className="block text-lg font-bold mb-2 text-[#2d1b4e]">
            🔒 Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 text-xl rounded-2xl border-4 border-[#b3e5ff] focus:border-[#6bcbff] outline-none"
            placeholder="Your secret"
            required
          />
        </div>

        <BigButton type="submit" color="pink" className="w-full" disabled={loading}>
          {loading ? "⏳ Logging in..." : "🚀 Let's Go!"}
        </BigButton>

        <p className="text-center text-gray-600 font-semibold">
          New here?{" "}
          <Link
            href="/register"
            className="text-[#ff6b9d] font-extrabold hover:underline"
          >
            Create Account ✨
          </Link>
        </p>
      </form>
    </div>
  );
}
