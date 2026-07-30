"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  color?: "pink" | "blue" | "yellow" | "mint" | "purple" | "orange";
  size?: "md" | "lg" | "xl";
}

const colorClasses = {
  pink: "bg-[#ff6b9d] hover:bg-[#ff4d8a] shadow-[#ffb3cc]",
  blue: "bg-[#6bcbff] hover:bg-[#4db8ff] shadow-[#b3e5ff]",
  yellow: "bg-[#ffd93d] hover:bg-[#ffcc00] shadow-[#fff0a3] text-[#2d1b4e]",
  mint: "bg-[#6bffb8] hover:bg-[#4dffaa] shadow-[#b3ffd9]",
  purple: "bg-[#b388ff] hover:bg-[#9c6bff] shadow-[#d9c4ff]",
  orange: "bg-[#ffab40] hover:bg-[#ff9800] shadow-[#ffd699]",
};

const sizeClasses = {
  md: "px-6 py-4 text-lg",
  lg: "px-8 py-5 text-xl",
  xl: "px-10 py-6 text-2xl",
};

export default function BigButton({
  children,
  color = "pink",
  size = "lg",
  className = "",
  disabled,
  ...props
}: BigButtonProps) {
  return (
    <button
      className={`
        ${colorClasses[color]} ${sizeClasses[size]}
        text-white font-extrabold rounded-3xl
        shadow-lg active:scale-95 transition-all
        flex items-center justify-center gap-3
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
