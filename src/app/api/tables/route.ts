import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { TABLES } from "@/lib/constants";
import type { TableActivity } from "@/lib/types";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = getSupabaseAdmin();

    const { data: activeOrders, error } = await supabase
      .from("orders")
      .select("id, table_number, total, created_at")
      .eq("user_id", user.id)
      .eq("table_status", "eating")
      .not("table_number", "is", null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const occupiedMap = new Map(
      (activeOrders || []).map((o) => [o.table_number, o])
    );

    const tables: TableActivity[] = TABLES.map((num) => {
      const order = occupiedMap.get(num);
      return {
        table_number: num,
        occupied: Boolean(order),
        order_id: order?.id,
        total: order?.total ? Number(order.total) : undefined,
        started_at: order?.created_at,
      };
    });

    return NextResponse.json({ tables });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
