"use client";

import { useEffect, useState, useRef } from "react";
import { Scan, Plus, Minus, Trash2, CreditCard, Banknote } from "lucide-react";
import { toPng } from "html-to-image";
import BigButton from "@/components/BigButton";
import OcrScanner from "@/components/OcrScanner";
import Receipt from "@/components/Receipt";
import { apiFetch } from "@/lib/api";
import { formatPrice, normalizeCode } from "@/lib/utils";
import { TABLES } from "@/lib/constants";
import type { Item, CartItem } from "@/lib/types";

export default function SellPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [notFound, setNotFound] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "credit" | null>(
    null
  );
  const [showReceipt, setShowReceipt] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [shopName, setShopName] = useState("My Shop");
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch("/api/items").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
      }
    });
    apiFetch("/api/auth/me").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setShopName(`${data.user.display_name || data.user.username}'s Shop`);
      }
    });
  }, []);

  const total = cart.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0
  );

  const findAndAdd = (rawCode: string) => {
    const code = normalizeCode(rawCode);
    const item = items.find((i) => normalizeCode(i.code) === code);

    if (!item) {
      setNotFound(`Item "${code}" not found! 😢`);
      setTimeout(() => setNotFound(""), 3000);
      return;
    }

    setNotFound("");
    setCart((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
    setManualCode("");
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) =>
          ci.item.id === itemId
            ? { ...ci, quantity: ci.quantity + delta }
            : ci
        )
        .filter((ci) => ci.quantity > 0)
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const handleCheckout = async (method: "cash" | "credit") => {
    if (cart.length === 0) return;
    setPaymentMethod(method);

    const res = await apiFetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table_number: tableNumber,
        payment_method: method,
        total,
        items: cart.map((ci) => ({
          item_id: ci.item.id,
          item_name: ci.item.name,
          quantity: ci.quantity,
          price: ci.item.price,
        })),
      }),
    });

    if (res.ok) {
      setShowReceipt(true);
      setCompleted(true);
    }
  };

  const shareWhatsApp = async () => {
    if (!receiptRef.current) return;

    try {
      const dataUrl = await toPng(receiptRef.current, { quality: 0.95 });

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], "receipt.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Receipt",
          text: `Receipt from ${shopName} - Total: ${formatPrice(total)}`,
        });
      } else {
        const link = document.createElement("a");
        link.download = "receipt.png";
        link.href = dataUrl;
        link.click();
        alert(
          "Receipt saved! Open WhatsApp and share the image from your downloads. 📱"
        );
      }
    } catch {
      alert("Could not share receipt. Please try again.");
    }
  };

  const newSale = () => {
    setCart([]);
    setTableNumber(null);
    setPaymentMethod(null);
    setShowReceipt(false);
    setCompleted(false);
  };

  return (
    <div className="space-y-6 animate-bounce-in">
      <h1 className="text-3xl font-black text-[#2d1b4e] text-center">
        🛒 Sell Items
      </h1>

      {/* Table selector */}
      <div className="bg-white rounded-3xl p-4 shadow-md">
        <h2 className="text-lg font-extrabold mb-3 text-center">
          🪑 Pick a Table
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {TABLES.map((t) => (
            <button
              key={t}
              onClick={() => setTableNumber(tableNumber === t ? null : t)}
              className={`
                p-4 rounded-2xl text-xl font-extrabold transition-all
                ${tableNumber === t
                  ? "bg-[#ff6b9d] text-white scale-105 shadow-md"
                  : "bg-gray-100 hover:bg-gray-200"
                }
              `}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Scan & manual entry */}
      {!completed && (
        <div className="space-y-3">
          <BigButton
            color="blue"
            className="w-full"
            onClick={() => setShowScanner(true)}
          >
            <Scan size={28} />
            📄 Scan Code from Paper
          </BigButton>

          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.toUpperCase())}
              placeholder="Or type code here..."
              className="flex-1 p-4 text-lg rounded-2xl border-4 border-[#b3e5ff] outline-none focus:border-[#6bcbff] font-mono"
              onKeyDown={(e) => e.key === "Enter" && findAndAdd(manualCode)}
            />
            <BigButton color="purple" size="md" onClick={() => findAndAdd(manualCode)}>
              <Plus size={24} />
            </BigButton>
          </div>

          {notFound && (
            <div className="bg-red-100 text-red-600 p-4 rounded-2xl font-extrabold text-center text-lg animate-bounce-in">
              {notFound}
            </div>
          )}

          {/* Quick add from item list */}
          <div className="grid grid-cols-2 gap-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => findAndAdd(item.code)}
                className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all text-left flex items-center gap-2"
              >
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#ffb3cc] flex items-center justify-center text-xl">
                    🍽️
                  </div>
                )}
                <div>
                  <p className="font-extrabold text-sm">{item.name}</p>
                  <p className="text-[#ff6b9d] font-bold text-sm">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cart */}
      <div className="bg-white rounded-3xl p-4 shadow-lg">
        <h2 className="text-xl font-extrabold mb-3">🛍️ Cart</h2>

        {cart.length === 0 ? (
          <p className="text-center text-gray-500 font-bold py-6">
            Cart is empty. Scan or add items! 📦
          </p>
        ) : (
          <div className="space-y-3">
            {cart.map((ci) => (
              <div
                key={ci.item.id}
                className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3"
              >
                <div className="flex-1">
                  <p className="font-extrabold">{ci.item.name}</p>
                  <p className="text-[#ff6b9d] font-bold">
                    {formatPrice(ci.item.price * ci.quantity)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQty(ci.item.id, -1)}
                    className="p-2 bg-[#ffd93d] rounded-xl"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-xl font-extrabold w-8 text-center">
                    {ci.quantity}
                  </span>
                  <button
                    onClick={() => updateQty(ci.item.id, 1)}
                    className="p-2 bg-[#6bffb8] rounded-xl"
                  >
                    <Plus size={18} />
                  </button>
                  <button
                    onClick={() => removeFromCart(ci.item.id)}
                    className="p-2 bg-red-100 rounded-xl"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}

            <div className="text-center pt-2">
              <p className="text-3xl font-black text-[#2d1b4e]">
                Total: {formatPrice(total)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Payment */}
      {!completed && cart.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <BigButton color="yellow" onClick={() => handleCheckout("cash")}>
            <Banknote size={28} />
            💵 Cash
          </BigButton>
          <BigButton color="purple" onClick={() => handleCheckout("credit")}>
            <CreditCard size={28} />
            💳 Credit
          </BigButton>
        </div>
      )}

      {/* Receipt & WhatsApp */}
      {completed && paymentMethod && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-2">🎉</div>
            <h2 className="text-2xl font-black text-[#2d1b4e]">
              Sale Complete!
            </h2>
          </div>

          <div className="flex justify-center overflow-hidden rounded-2xl shadow-lg">
            <Receipt
              ref={receiptRef}
              items={cart}
              total={total}
              tableNumber={tableNumber}
              paymentMethod={paymentMethod}
              shopName={shopName}
            />
          </div>

          <BigButton color="mint" className="w-full" onClick={shareWhatsApp}>
            📱 Send Receipt via WhatsApp
          </BigButton>

          <BigButton color="pink" className="w-full" onClick={newSale}>
            🛒 New Sale
          </BigButton>
        </div>
      )}

      {showScanner && (
        <OcrScanner
          onScan={findAndAdd}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
