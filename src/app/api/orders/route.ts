import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const user = await requireUser();
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const orders = (data || []).map((order) => ({
      ...order,
      total: Number(order.total),
      order_items: (order.order_items || []).map(
        (item: { price: number }) => ({
          ...item,
          price: Number(item.price),
        })
      ),
    }));

    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const { table_number, payment_method, items, total } = await request.json();

    if (!payment_method || !items?.length || total === undefined) {
      return NextResponse.json(
        { error: "Payment method, items, and total are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    if (table_number) {
      await supabase
        .from("orders")
        .update({ table_status: "done" })
        .eq("user_id", user.id)
        .eq("table_number", table_number)
        .eq("table_status", "eating");
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        table_number: table_number || null,
        table_status: table_number ? "eating" : null,
        payment_method,
        total: parseFloat(total),
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const orderItems = items.map(
      (item: {
        item_id: string;
        item_name: string;
        quantity: number;
        price: number;
      }) => ({
        order_id: order.id,
        item_id: item.item_id,
        item_name: item.item_name,
        quantity: item.quantity,
        price: item.price,
      })
    );

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
