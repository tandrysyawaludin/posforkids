"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { User as UserType } from "@/lib/types";

const navItems = [
  { href: "/dashboard", label: "Home", emoji: "🏠" },
  { href: "/incoming", label: "Orders", emoji: "🛎️" },
  { href: "/sell", label: "Sell", emoji: "🛒" },
  { href: "/tables", label: "Tables", emoji: "🪑" },
  { href: "/items", label: "Items", emoji: "📦" },
  { href: "/history", label: "History", emoji: "📜" },
];

export default function Navbar({ user }: { user: UserType }) {
  const pathname = usePathname();

  const logout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-lg rounded-3xl mx-4 mt-4 p-3">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt="Avatar"
              className="w-12 h-12 rounded-full border-4 border-[#ff6b9d] object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#ffb3cc] flex items-center justify-center text-2xl">
              😊
            </div>
          )}
          <span className="font-extrabold text-lg text-[#2d1b4e]">
            Hi, {user.display_name || user.username}! 👋
          </span>
        </div>
        <button
          onClick={logout}
          className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors"
          title="Logout"
        >
          <LogOut size={24} className="text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {navItems.map((item) => {
          const isActive = pathname.includes(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 p-2 rounded-2xl transition-all
                ${isActive
                  ? "bg-[#ff6b9d] text-white scale-105 shadow-md"
                  : "bg-gray-50 hover:bg-gray-100 text-[#2d1b4e]"
                }
              `}
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="text-xs font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
