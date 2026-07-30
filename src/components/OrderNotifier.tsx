"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";
import type { SelfOrder } from "@/lib/selfOrderTypes";

function playDing() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // ignore
  }
}

export default function OrderNotifier() {
  const [pending, setPending] = useState<SelfOrder[]>([]);
  const [alert, setAlert] = useState<SelfOrder | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());

  const poll = useCallback(async () => {
    const res = await apiFetch("/api/self-orders?status=pending");
    if (!res.ok) return;
    const data = await res.json();
    const orders: SelfOrder[] = data.orders || [];
    setPending(orders);

    for (const order of orders) {
      if (!knownIdsRef.current.has(order.id)) {
        knownIdsRef.current.add(order.id);
        setAlert(order);
        playDing();
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("New order! 🛎️", {
            body: `Table ${order.table_number || "?"} — ${order.customer_name || "Customer"}`,
          });
        }
        break;
      }
    }
  }, []);

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [poll]);

  if (!alert) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-bounce-in">
      <div className="bg-[#ff6b9d] text-white rounded-3xl p-5 shadow-2xl max-w-lg mx-auto border-4 border-white">
        <div className="flex items-start gap-3">
          <span className="text-4xl animate-wiggle">🛎️</span>
          <div className="flex-1">
            <p className="text-xl font-black">New Order!</p>
            <p className="font-bold mt-1">
              {alert.customer_name || "Customer"}
              {alert.table_number ? ` · Table ${alert.table_number}` : ""}
            </p>
            <p className="text-sm opacity-90 mt-1">
              {alert.self_order_items?.map((i) => `${i.item_name} x${i.quantity}`).join(", ")}
            </p>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-white/80 font-bold text-xl px-2"
          >
            ✕
          </button>
        </div>
        <a
          href="/incoming"
          className="mt-3 block text-center bg-white text-[#ff6b9d] font-extrabold py-3 rounded-2xl"
        >
          View Orders →
        </a>
      </div>
    </div>
  );
}
