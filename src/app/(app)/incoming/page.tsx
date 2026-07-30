"use client";

import { useEffect, useState, useCallback } from "react";
import BigButton from "@/components/BigButton";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { SelfOrder } from "@/lib/selfOrderTypes";

export default function IncomingOrdersPage() {
  const [orders, setOrders] = useState<SelfOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await apiFetch("/api/self-orders?status=pending");
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [load]);

  const markDone = async (id: string) => {
    await apiFetch(`/api/self-orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    await load();
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl animate-wiggle">🛎️</div>
        <p className="text-xl font-bold mt-4">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-bounce-in">
      <div className="text-center">
        <div className="text-6xl mb-2">🛎️</div>
        <h1 className="text-3xl font-black text-[#2d1b4e]">Customer Orders</h1>
        <p className="text-gray-600 font-semibold mt-2">
          {orders.length === 0
            ? "Waiting for orders..."
            : `${orders.length} order${orders.length > 1 ? "s" : ""} waiting!`}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/80 rounded-3xl p-8 text-center">
          <p className="text-lg font-bold text-gray-500">
            Share your order link with customers! 🔗
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-5 shadow-lg border-4 border-[#ff6b9d]"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-xl font-black text-[#2d1b4e]">
                    {order.customer_name || "Customer"} 🧑
                  </p>
                  {order.table_number && (
                    <p className="font-bold text-[#6bcbff]">
                      🪑 Table {order.table_number}
                    </p>
                  )}
                  <p className="text-sm text-gray-400 font-semibold mt-1">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <p className="text-2xl font-black text-[#ff6b9d]">
                  {formatPrice(order.total)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-3 mb-4 space-y-1">
                {order.self_order_items?.map((li) => (
                  <div key={li.id} className="flex justify-between font-semibold">
                    <span>
                      {li.item_name} x{li.quantity}
                    </span>
                    <span>{formatPrice(li.price * li.quantity)}</span>
                  </div>
                ))}
              </div>

              <BigButton
                color="mint"
                className="w-full"
                onClick={() => markDone(order.id)}
              >
                ✅ Done — Served!
              </BigButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
