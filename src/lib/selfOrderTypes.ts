export interface SelfOrderItem {
  id: string;
  self_order_id: string;
  item_id: string | null;
  item_name: string;
  quantity: number;
  price: number;
}

export type SelfOrderStatus = "pending" | "done";

export interface SelfOrder {
  id: string;
  shop_user_id: string;
  table_number: number | null;
  customer_name: string | null;
  status: SelfOrderStatus;
  total: number;
  created_at: string;
  self_order_items?: SelfOrderItem[];
}

export interface ShopPublic {
  username: string;
  display_name: string;
  items: import("./types").Item[];
}
