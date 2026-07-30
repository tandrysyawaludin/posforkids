"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BigButton from "@/components/BigButton";
import ItemImage from "@/components/ItemImage";
import { formatPrice } from "@/lib/utils";
import { TABLES } from "@/lib/constants";
import type { Item } from "@/lib/types";
import type { CartItem } from "@/lib/types";

export default function CustomerOrderPage() {
  const params = useParams();
  const username = params.username as string;

  const [shopName, setShopName] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const [occupiedTables, setOccupiedTables] = useState<number[]>([]);

  useEffect(() => {
    fetch(`/api/shop/${username}/menu`)
      .then((r) => r.json())
      .then((data) => {
        if (data.shop) {
          setShopName(data.shop.display_name);
          setItems(data.shop.items);
        } else {
          setError("Shop not found");
        }
        setLoading(false);
      });
    const loadTables = () =>
      fetch(`/api/shop/${username}/tables`)
        .then((r) => r.json())
        .then((data) => {
          if (data.tables) {
            setOccupiedTables(
              data.tables.filter((t: { occupied: boolean }) => t.occupied).map((t: { table_number: number }) => t.table_number)
            );
          }
        });
    loadTables();
    const interval = setInterval(loadTables, 5000);
    return () => clearInterval(interval);
  }, [username]);

  const total = cart.reduce((s, c) => s + c.item.price * c.quantity, 0);

  const addToCart = (item: Item) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.item.id === item.id);
      if (ex) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      setError("Add something to your order!");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/shop/${username}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table_number: tableNumber,
        customer_name: customerName,
        items: cart.map((c) => ({
          item_id: c.item.id,
          quantity: c.quantity,
        })),
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Order failed");
      return;
    }

    setDone(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-wiggle">🍽️</div>
          <p className="text-xl font-bold mt-4">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error && !shopName) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-xl font-bold text-red-500">{error}</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-md animate-bounce-in">
          <div className="text-8xl mb-4">🎉</div>
          <h1 className="text-3xl font-black text-[#2d1b4e]">Order Sent!</h1>
          <p className="text-gray-600 font-semibold mt-3">
            Sit tight — the cashier will bring your food soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-32 max-w-lg mx-auto">
      <div className="text-center py-6">
        <div className="text-6xl mb-2">🍽️</div>
        <h1 className="text-3xl font-black text-[#2d1b4e]">{shopName}</h1>
        <p className="text-gray-600 font-semibold">Order yourself!</p>
      </div>

      <div className="bg-white rounded-3xl p-4 shadow-md mb-4 space-y-3">
        <label className="block font-bold text-[#2d1b4e]">👋 Your name (optional)</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="e.g. Mom"
          className="w-full p-4 text-lg rounded-2xl border-4 border-[#ffb3cc] outline-none"
        />
        <label className="block font-bold text-[#2d1b4e]">🪑 Pick your table</label>
        <div className="grid grid-cols-4 gap-2">
          {TABLES.map((t) => {
            const occupied = occupiedTables.includes(t);
            return (
              <button
                key={t}
                type="button"
                disabled={occupied}
                onClick={() => !occupied && setTableNumber(tableNumber === t ? null : t)}
                className={`p-3 rounded-xl font-extrabold text-lg ${
                  occupied
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : tableNumber === t
                      ? "bg-[#ff6b9d] text-white"
                      : "bg-gray-100"
                }`}
              >
                {t}
                {occupied && <span className="block text-xs">🚫</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 mb-4">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => addToCart(item)}
            className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3 text-left w-full"
          >
            <ItemImage
              src={item.image_url}
              alt={item.name}
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-lg truncate">{item.name}</p>
              <p className="text-[#ff6b9d] font-bold">{formatPrice(item.price)}</p>
            </div>
            <span className="text-2xl">➕</span>
          </button>
        ))}
      </div>

      {error && (
        <p className="text-red-500 font-bold text-center mb-4">{error}</p>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 border-t shadow-lg">
          <div className="max-w-lg mx-auto space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-600">
                {cart.reduce((s, c) => s + c.quantity, 0)} items
              </span>
              <span className="text-2xl font-black text-[#ff6b9d]">
                {formatPrice(total)}
              </span>
            </div>
            <BigButton
              color="pink"
              className="w-full"
              size="xl"
              onClick={submitOrder}
              disabled={submitting}
            >
              {submitting ? "⏳ Sending..." : "🛎️ Send Order!"}
            </BigButton>
          </div>
        </div>
      )}
    </div>
  );
}
