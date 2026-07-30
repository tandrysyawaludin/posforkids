"use client";

import { useState } from "react";
import BigButton from "@/components/BigButton";

export default function CustomerOrderLink({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/order/${username}`
      : `/order/${username}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-[#6bcbff]/20 to-[#6bffb8]/20 rounded-3xl p-5 border-4 border-[#6bcbff]">
      <h2 className="text-xl font-extrabold text-[#2d1b4e] mb-2">
        📱 Customer Order Link
      </h2>
      <p className="text-gray-600 font-semibold text-sm mb-3">
        Share this link — customers order themselves, you get notified!
      </p>
      <p className="bg-white rounded-xl p-3 text-sm font-mono break-all mb-3 text-[#2d1b4e]">
        {url}
      </p>
      <BigButton color="blue" className="w-full" onClick={copy}>
        {copied ? "✅ Copied!" : "📋 Copy Link"}
      </BigButton>
    </div>
  );
}
