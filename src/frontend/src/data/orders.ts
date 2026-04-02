export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  upiTxnRef: string;
  createdAt: string;
}

const STORAGE_KEY = "mlp_orders";

export function getOrders(): Order[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: Order): void {
  const orders = getOrders();
  orders.unshift(order);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function updateOrderStatus(
  orderId: string,
  status: Order["status"],
): void {
  const orders = getOrders();
  const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function generateOrderId(): string {
  return `MLP${Date.now().toString().slice(-8)}`;
}
