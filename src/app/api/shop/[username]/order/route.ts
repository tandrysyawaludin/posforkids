import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const { table_number, customer_name, items } = await request.json();

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const { data: shop, error: shopError } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.toLowerCase().trim())
      .single();

    if (shopError || !shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const itemIds = items.map((i: { item_id: string }) => i.item_id);
    const { data: dbItems, error: itemsError } = await supabase
      .from("items")
      .select("id, name, price")
      .eq("user_id", shop.id)
      .in("id", itemIds);

    if (itemsError || !dbItems?.length) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    const priceMap = new Map(
      dbItems.map((i) => [i.id, { name: i.name, price: Number(i.price) }])
    );

    let total = 0;
    const lineItems: {
      item_id: string;
      item_name: string;
      quantity: number;
      price: number;
    }[] = [];

    for (const line of items) {
      const dbItem = priceMap.get(line.item_id);
      if (!dbItem) continue;
      const qty = Math.max(1, parseInt(line.quantity, 10) || 1);
      total += dbItem.price * qty;
      lineItems.push({
        item_id: line.item_id,
        item_name: dbItem.name,
        quantity: qty,
        price: dbItem.price,
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: "No valid items" }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabase
      .from("self_orders")
      .insert({
        shop_user_id: shop.id,
        table_number: table_number || null,
        customer_name: customer_name?.trim() || null,
        status: "pending",
        total,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    const orderItems = lineItems.map((li) => ({
      self_order_id: order.id,
      ...li,
    }));

    const { error: lineError } = await supabase
      .from("self_order_items")
      .insert(orderItems);

    if (lineError) {
      return NextResponse.json({ error: lineError.message }, { status: 500 });
    }

    return NextResponse.json({ order: { id: order.id, total } });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Order failed" },
      { status: 500 }
    );
  }
}
