"use client";

import { useEffect, useState, useCallback } from "react";
import TableCard from "@/components/TableCard";
import { apiFetch } from "@/lib/api";
import type { TableActivity } from "@/lib/types";
import { TABLES } from "@/lib/constants";

export default function TablesPage() {
  const [tables, setTables] = useState<TableActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState<number | null>(null);

  const loadTables = useCallback(async () => {
    const res = await apiFetch("/api/tables");
    if (res.ok) {
      const data = await res.json();
      setTables(data.tables);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTables();
    const interval = setInterval(loadTables, 5000);
    return () => clearInterval(interval);
  }, [loadTables]);

  const clearTable = async (tableNumber: number) => {
    setClearing(tableNumber);
    await apiFetch(`/api/tables/${tableNumber}`, { method: "PUT" });
    await loadTables();
    setClearing(null);
  };

  const occupiedCount = tables.filter((t) => t.occupied).length;

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl animate-wiggle">🪑</div>
        <p className="text-xl font-bold mt-4">Checking tables...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-bounce-in">
      <div className="text-center">
        <div className="text-6xl mb-2">🍽️</div>
        <h1 className="text-3xl font-black text-[#2d1b4e]">Table Activity</h1>
        <p className="text-gray-600 font-semibold mt-2">
          {occupiedCount > 0
            ? `${occupiedCount} table${occupiedCount > 1 ? "s" : ""} eating now!`
            : "All tables are free!"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(tables.length > 0 ? tables : TABLES.map((n) => ({ table_number: n, occupied: false }))).map(
          (table) => (
            <TableCard
              key={table.table_number}
              table={table}
              onClear={clearTable}
              clearing={clearing === table.table_number}
            />
          )
        )}
      </div>
    </div>
  );
}
