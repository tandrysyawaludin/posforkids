import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    const user = await requireUser();
    const { number } = await params;
    const tableNumber = parseInt(number, 10);

    if (isNaN(tableNumber)) {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("orders")
      .update({ table_status: "done" })
      .eq("user_id", user.id)
      .eq("table_number", tableNumber)
      .eq("table_status", "eating");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
