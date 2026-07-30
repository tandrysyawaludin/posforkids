import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const supabase = getSupabaseAdmin();

    const { data: shop, error: shopError } = await supabase
      .from("users")
      .select("id, username, display_name")
      .eq("username", username.toLowerCase().trim())
      .single();

    if (shopError || !shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const { data: items, error: itemsError } = await supabase
      .from("items")
      .select("*")
      .eq("user_id", shop.id)
      .order("name");

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({
      shop: {
        username: shop.username,
        display_name: shop.display_name || shop.username,
        items: (items || []).map((i) => ({ ...i, price: Number(i.price) })),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load menu" },
      { status: 500 }
    );
  }
}
