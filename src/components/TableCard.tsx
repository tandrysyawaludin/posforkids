"use client";

import BigButton from "./BigButton";
import { formatPrice } from "@/lib/utils";
import type { TableActivity } from "@/lib/types";

const FOOD_EMOJIS = ["🍕", "🍔", "🍜", "🍰", "🌮", "🍦"];

interface TableCardProps {
  table: TableActivity;
  onClear?: (tableNumber: number) => void;
  clearing?: boolean;
}

export default function TableCard({ table, onClear, clearing }: TableCardProps) {
  const foodEmoji = FOOD_EMOJIS[(table.table_number - 1) % FOOD_EMOJIS.length];

  if (!table.occupied) {
    return (
      <div className="bg-white rounded-3xl p-4 shadow-md text-center border-4 border-dashed border-gray-200">
        <div className="text-4xl mb-2">🪑</div>
        <p className="text-2xl font-black text-[#2d1b4e]">Table {table.table_number}</p>
        <p className="text-gray-400 font-bold mt-1">Empty ✨</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#fff0f5] to-[#ffe8f0] rounded-3xl p-4 shadow-lg border-4 border-[#ff6b9d] text-center relative overflow-hidden">
      <div className="absolute top-2 right-2 bg-[#ff6b9d] text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
        Eating!
      </div>

      <p className="text-xl font-black text-[#2d1b4e] mb-2">Table {table.table_number}</p>

      <div className="flex items-end justify-center gap-2 h-24 mb-2">
        <div className="text-5xl animate-eating-person">🧒</div>
        <div className="text-4xl animate-eating-food mb-2">{foodEmoji}</div>
      </div>

      <div className="flex justify-center gap-1 mb-2">
        <span className="text-lg animate-munch-delay-1">😋</span>
        <span className="text-lg animate-munch-delay-2">🍴</span>
        <span className="text-lg animate-munch-delay-3">✨</span>
      </div>

      {table.total !== undefined && (
        <p className="text-[#ff6b9d] font-extrabold text-lg mb-3">
          Order: {formatPrice(table.total)}
        </p>
      )}

      {onClear && (
        <BigButton
          color="mint"
          size="md"
          className="w-full"
          onClick={() => onClear(table.table_number)}
          disabled={clearing}
        >
          {clearing ? "⏳..." : "✅ Done Eating!"}
        </BigButton>
      )}
    </div>
  );
}
