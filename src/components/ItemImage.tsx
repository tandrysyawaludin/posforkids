"use client";

import { useState } from "react";
import { resolveImageUrl, type StorageBucket } from "@/lib/imageUrl";

interface ItemImageProps {
  src: string | null;
  alt: string;
  bucket?: StorageBucket;
  className?: string;
  fallbackEmoji?: string;
}

export default function ItemImage({
  src,
  alt,
  bucket = "items",
  className = "",
  fallbackEmoji = "🍽️",
}: ItemImageProps) {
  const [broken, setBroken] = useState(false);
  const resolved = resolveImageUrl(src, bucket);

  if (!resolved || broken) {
    return (
      <div
        className={`flex items-center justify-center bg-[#ffb3cc] ${className}`}
      >
        <span className="text-3xl">{fallbackEmoji}</span>
      </div>
    );
  }

  if (resolved.startsWith("blob:") || resolved.startsWith("data:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt={alt}
        className={className}
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      onError={() => setBroken(true)}
      referrerPolicy="no-referrer"
    />
  );
}
