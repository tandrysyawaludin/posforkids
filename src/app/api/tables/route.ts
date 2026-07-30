import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { TABLES } from "@/lib/constants";
import { getOccupiedTableNumbers } from "@/lib/tables";
import type { TableActivity } from "@/lib/types";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = getSupabaseAdmin();

    const occupied = await getOccupiedTableNumbers(supabase, user.id);

    const { data: eatingOrders } = await supabase
      .from("orders")
      .select("id, table_number, total, created_at")
      .eq("user_id", user.id)
      .eq("table_status", "eating")
      .not("table_number", "is", null);

    const { data: pendingSelf } = await supabase
      .from("self_orders")
      .select("id, table_number, total, created_at, customer_name")
      .eq("shop_user_id", user.id)
      .eq("status", "pending")
      .not("table_number", "is", null);

    const detailMap = new Map<number, TableActivity>();

    for (const o of eatingOrders || []) {
      detailMap.set(o.table_number, {
        table_number: o.table_number,
        occupied: true,
        order_id: o.id,
        total: Number(o.total),
        started_at: o.created_at,
        source: "cashier",
      });
    }

    for (const o of pendingSelf || []) {
      if (!detailMap.has(o.table_number)) {
        detailMap.set(o.table_number, {
          table_number: o.table_number,
          occupied: true,
          order_id: o.id,
          total: Number(o.total),
          started_at: o.created_at,
          source: "customer",
          customer_name: o.customer_name,
        });
      }
    }

    const tables: TableActivity[] = TABLES.map((num) => {
      const detail = detailMap.get(num);
      return (
        detail || {
          table_number: num,
          occupied: occupied.has(num),
        }
      );
    });

    return NextResponse.json({ tables });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
