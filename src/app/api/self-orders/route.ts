import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("self_orders")
      .select("*, self_order_items(*)")
      .eq("shop_user_id", user.id)
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const orders = (data || []).map((o) => ({
      ...o,
      total: Number(o.total),
      self_order_items: (o.self_order_items || []).map(
        (li: { price: number }) => ({
          ...li,
          price: Number(li.price),
        })
      ),
    }));

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
