"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Camera } from "lucide-react";
import BigButton from "@/components/BigButton";
import CameraCapture from "@/components/CameraCapture";
import ItemImage from "@/components/ItemImage";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import type { Item } from "@/lib/types";

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadItems = async () => {
    const res = await apiFetch("/api/items");
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const resetForm = () => {
    setName("");
    setCode("");
    setPrice("");
    setImageUrl(null);
    setImageFile(null);
    setEditingItem(null);
    setShowForm(false);
    setError("");
  };

  const openEdit = (item: Item) => {
    setEditingItem(item);
    setName(item.name);
    setCode(item.code);
    setPrice(item.price.toString());
    setImageUrl(item.image_url);
    setImageFile(null);
    setShowForm(true);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "items");
    const res = await apiFetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.url;
  };

  const handleCapture = (file: File) => {
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setShowCamera(false);
  };

  const handleSave = async () => {
    if (!name || !code || !price) {
      setError("Please fill in name, code, and price!");
      return;
    }

    setSaving(true);
    setError("");

    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      if (editingItem) {
        const res = await apiFetch(`/api/items/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            code,
            price,
            image_url: finalImageUrl,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
      } else {
        const res = await apiFetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            code,
            price,
            image_url: finalImageUrl,
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
      }

      resetForm();
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item? 🗑️")) return;
    await apiFetch(`/api/items/${id}`, { method: "DELETE" });
    await loadItems();
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl animate-wiggle">📦</div>
        <p className="text-xl font-bold mt-4">Loading items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-bounce-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-[#2d1b4e]">📦 My Items</h1>
        {!showForm && (
          <BigButton color="mint" size="md" onClick={() => setShowForm(true)}>
            <Plus size={24} />
            Add
          </BigButton>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl p-6 shadow-lg space-y-4">
          <h2 className="text-xl font-extrabold">
            {editingItem ? "✏️ Edit Item" : "➕ New Item"}
          </h2>

          {error && (
            <p className="text-red-500 font-bold text-center">{error}</p>
          )}

          <div
            onClick={() => setShowCamera(true)}
            className="w-full h-40 bg-gray-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer border-4 border-dashed border-[#ffb3cc] hover:border-[#ff6b9d] transition-colors overflow-hidden"
          >
            {imageUrl ? (
              <ItemImage
                src={imageUrl}
                alt="Item preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Camera size={40} className="text-[#ff6b9d] mb-2" />
                <span className="font-bold text-gray-500">📸 Take Photo</span>
              </>
            )}
          </div>

          <input
            type="text"
            placeholder="Item name (e.g. Pizza 🍕)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-4 text-lg rounded-2xl border-4 border-[#ffb3cc] outline-none focus:border-[#ff6b9d]"
          />

          <input
            type="text"
            placeholder="Code for scanning (e.g. PIZZA1)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full p-4 text-lg rounded-2xl border-4 border-[#b3e5ff] outline-none focus:border-[#6bcbff] font-mono"
          />

          <input
            type="number"
            placeholder="Price (e.g. 5.99)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            step="0.01"
            min="0"
            className="w-full p-4 text-lg rounded-2xl border-4 border-[#b3ffd9] outline-none focus:border-[#6bffb8]"
          />

          <div className="flex gap-3">
            <BigButton
              color="yellow"
              className="flex-1"
              onClick={resetForm}
            >
              Cancel
            </BigButton>
            <BigButton
              color="pink"
              className="flex-1"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "⏳ Saving..." : "💾 Save"}
            </BigButton>
          </div>
        </div>
      )}

      {items.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-white/80 rounded-3xl">
          <div className="text-6xl mb-4">🍕</div>
          <p className="text-xl font-bold text-gray-600">
            No items yet! Add your first menu item.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-4 shadow-md flex gap-4 items-center"
            >
              <ItemImage
                src={item.image_url}
                alt={item.name}
                className="w-20 h-20 rounded-2xl object-cover"
              />
              <div className="flex-1">
                <h3 className="text-xl font-extrabold">{item.name}</h3>
                <p className="text-gray-500 font-mono font-bold">
                  Code: {item.code}
                </p>
                <p className="text-[#ff6b9d] font-extrabold text-lg">
                  {formatPrice(item.price)}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => openEdit(item)}
                  className="p-3 bg-[#b3e5ff] rounded-2xl hover:bg-[#6bcbff] transition-colors"
                >
                  <Pencil size={20} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-3 bg-red-100 rounded-2xl hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={20} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCamera && (
        <CameraCapture
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
          label="Item Photo"
        />
      )}
    </div>
  );
}
