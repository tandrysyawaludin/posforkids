"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Order } from "@/lib/types";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/orders").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl animate-wiggle">📜</div>
        <p className="text-xl font-bold mt-4">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-bounce-in">
      <div className="text-center">
        <div className="text-6xl mb-2">📜</div>
        <h1 className="text-3xl font-black text-[#2d1b4e]">Sales History</h1>
        <p className="text-gray-600 font-semibold mt-2">
          {orders.length} sale{orders.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/80 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-xl font-bold text-gray-600">
            No sales yet! Go sell something!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-4 shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500 font-bold">
                    {formatDate(order.created_at)}
                  </p>
                  {order.table_number && (
                    <p className="text-lg font-extrabold text-[#2d1b4e]">
                      🪑 Table {order.table_number}
                      {order.table_status === "eating" && (
                        <span className="ml-2 text-sm bg-[#ff6b9d] text-white px-2 py-0.5 rounded-full">
                          Eating
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[#ff6b9d]">
                    {formatPrice(order.total)}
                  </p>
                  <p className="text-sm font-bold text-gray-500">
                    {order.payment_method === "cash" ? "💵 Cash" : "💳 Credit"}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-3 space-y-1">
                {order.order_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between font-semibold text-sm"
                  >
                    <span>
                      {item.item_name} x{item.quantity}
                    </span>
                    <span className="text-[#2d1b4e]">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
