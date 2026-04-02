import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { PackageOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { type Order, getOrders } from "../data/orders";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-300",
  confirmed: "bg-blue-100 text-blue-700 border-blue-300",
  shipped: "bg-purple-100 text-purple-700 border-purple-300",
  delivered: "bg-green-100 text-green-700 border-green-300",
  cancelled: "bg-red-100 text-red-700 border-red-300",
};

export default function MyOrdersPage() {
  const { t } = useLanguage();
  const { customer, customerLogin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (customer) {
      const allOrders = getOrders();
      setOrders(allOrders.filter((o) => o.customerPhone === customer.phone));
    }
  }, [customer]);

  const handleLogin = () => {
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter your name and phone number.");
      return;
    }
    customerLogin(name, phone);
    const allOrders = getOrders();
    setOrders(allOrders.filter((o) => o.customerPhone === phone));
  };

  if (!customer) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <PackageOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          {t("my_orders")}
        </h2>
        <p className="text-muted-foreground mb-6">
          Enter your name and phone number to view your orders.
        </p>
        <div className="bg-card border border-border rounded-xl p-5 text-left space-y-3">
          <div>
            <Label>{t("customer_name")}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-1"
            />
          </div>
          <div>
            <Label>{t("phone")}</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91..."
              type="tel"
              className="mt-1"
            />
          </div>
          <Button className="w-full" onClick={handleLogin}>
            {t("login")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">
        {t("my_orders")}
      </h1>
      <p className="text-muted-foreground mb-6">
        {t("welcome")}, {customer.name}!
      </p>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <PackageOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">You have no orders yet.</p>
          <Link to="/products">
            <Button className="mt-4">{t("continue_shopping")}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-sm font-bold text-primary">
                    {order.id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full border ${
                    STATUS_COLORS[order.status]
                  }`}
                >
                  {order.status.toUpperCase()}
                </span>
              </div>
              <div className="space-y-1 text-sm mb-3">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex justify-between">
                    <span className="text-muted-foreground">
                      {item.productName} &times; {item.quantity}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold border-t border-border pt-2">
                <span>{t("total")}</span>
                <span className="text-primary">₹{order.total}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
