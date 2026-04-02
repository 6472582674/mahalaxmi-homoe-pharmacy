import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import type { Order } from "../data/orders";

export default function OrderConfirmationPage() {
  const { t } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mlp_last_order");
      if (stored) {
        setOrder(JSON.parse(stored));
      }
    } catch {}
  }, []);

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No order found.</p>
        <Link to="/" className="text-primary text-sm mt-2 inline-block">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 text-center">
      <CheckCircle2 className="h-16 w-16 text-secondary mx-auto mb-4" />
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">
        {t("order_placed")}
      </h1>
      <p className="text-muted-foreground mb-6">
        Thank you, {order.customerName}! Your order has been received and will
        be confirmed shortly.
      </p>

      <div className="bg-card border border-border rounded-xl p-5 text-left mb-6">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-muted-foreground">{t("order_id")}</span>
          <span className="font-mono font-bold text-primary">{order.id}</span>
        </div>
        <div className="space-y-1 text-sm">
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between">
              <span className="text-muted-foreground">
                {item.productName} &times; {item.quantity}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
          <span>{t("total")}</span>
          <span className="text-primary">₹{order.total}</span>
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          <p>
            UPI Ref: <span className="font-mono">{order.upiTxnRef}</span>
          </p>
          <p className="mt-1">
            Status:{" "}
            <span className="text-amber-600 font-medium capitalize">
              {order.status}
            </span>
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link to="/my-orders" className="flex-1">
          <Button variant="outline" className="w-full">
            {t("view_orders")}
          </Button>
        </Link>
        <Link to="/products" className="flex-1">
          <Button className="w-full">{t("continue_shopping")}</Button>
        </Link>
      </div>
    </div>
  );
}
