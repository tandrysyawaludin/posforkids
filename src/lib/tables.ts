import type { SupabaseClient } from "@supabase/supabase-js";

export async function getOccupiedTableNumbers(
  supabase: SupabaseClient,
  shopUserId: string
): Promise<Set<number>> {
  const occupied = new Set<number>();

  const { data: eatingOrders } = await supabase
    .from("orders")
    .select("table_number")
    .eq("user_id", shopUserId)
    .eq("table_status", "eating")
    .not("table_number", "is", null);

  for (const row of eatingOrders || []) {
    if (row.table_number != null) occupied.add(row.table_number);
  }

  const { data: pendingSelfOrders } = await supabase
    .from("self_orders")
    .select("table_number")
    .eq("shop_user_id", shopUserId)
    .eq("status", "pending")
    .not("table_number", "is", null);

  for (const row of pendingSelfOrders || []) {
    if (row.table_number != null) occupied.add(row.table_number);
  }

  return occupied;
}

export async function getTableAvailabilityError(
  supabase: SupabaseClient,
  shopUserId: string,
  tableNumber: number | null | undefined
): Promise<string | null> {
  if (!tableNumber) return null;

  const occupied = await getOccupiedTableNumbers(supabase, shopUserId);
  if (occupied.has(tableNumber)) {
    return `Table ${tableNumber} is not available! 🪑`;
  }
  return null;
}
