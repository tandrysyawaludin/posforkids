export interface User {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  name: string;
  code: string;
  price: number;
  image_url: string | null;
  created_at: string;
}

export interface CartItem {
  item: Item;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  table_number: number | null;
  payment_method: "cash" | "credit";
  total: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string | null;
  item_name: string;
  quantity: number;
  price: number;
}

export type PaymentMethod = "cash" | "credit";
