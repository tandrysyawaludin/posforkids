"use client";

import { forwardRef } from "react";
import { formatPrice } from "@/lib/utils";
import type { CartItem } from "@/lib/types";

interface ReceiptProps {
  items: CartItem[];
  total: number;
  tableNumber: number | null;
  paymentMethod: "cash" | "credit";
  shopName: string;
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ items, total, tableNumber, paymentMethod, shopName }, ref) => {
    const now = new Date();

    return (
      <div
        ref={ref}
        className="bg-white p-8 w-[400px] font-mono text-sm"
        style={{ fontFamily: "monospace" }}
      >
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🛒</div>
          <h1 className="text-xl font-bold">{shopName}</h1>
          <p className="text-gray-500 text-xs">
            {now.toLocaleDateString()} {now.toLocaleTimeString()}
          </p>
          {tableNumber && (
            <p className="text-lg font-bold mt-2">🪑 Table {tableNumber}</p>
          )}
        </div>

        <div className="border-t-2 border-dashed border-gray-300 my-3" />

        {items.map((ci) => (
          <div key={ci.item.id} className="flex justify-between py-1">
            <span>
              {ci.item.name} x{ci.quantity}
            </span>
            <span>{formatPrice(ci.item.price * ci.quantity)}</span>
          </div>
        ))}

        <div className="border-t-2 border-dashed border-gray-300 my-3" />

        <div className="flex justify-between text-lg font-bold">
          <span>TOTAL</span>
          <span>{formatPrice(total)}</span>
        </div>

        <p className="text-center mt-3 text-gray-600">
          Paid with {paymentMethod === "cash" ? "💵 Cash" : "💳 Credit"}
        </p>

        <div className="text-center mt-4 text-2xl">⭐ Thank you! ⭐</div>
      </div>
    );
  }
);

Receipt.displayName = "Receipt";
export default Receipt;
