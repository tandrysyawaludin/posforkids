import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { TABLES } from "@/lib/constants";
import { getOccupiedTableNumbers } from "@/lib/tables";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const supabase = getSupabaseAdmin();

    const { data: shop, error } = await supabase
      .from("users")
      .select("id")
      .eq("username", username.toLowerCase().trim())
      .single();

    if (error || !shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const occupied = await getOccupiedTableNumbers(supabase, shop.id);

    const tables = TABLES.map((num) => ({
      table_number: num,
      occupied: occupied.has(num),
    }));

    return NextResponse.json({ tables });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
