import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { saveOrder } from "../data/orders";
import { useActor } from "../hooks/useActor";

// Static QR pattern - deterministic so no random re-renders
const QR_DOTS = Array.from({ length: 64 }, (_, i) => {
  const row = Math.floor(i / 8);
  const col = i % 8;
  const filled = (row + col * 3 + i) % 3 !== 0;
  return { id: i, filled };
});

function QRCodePlaceholder({ amount }: { amount: number }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-40 h-40 border-4 border-foreground rounded-lg p-2 relative overflow-hidden"
        style={{ background: "white" }}
      >
        <div className="absolute top-2 left-2 w-8 h-8 border-4 border-foreground rounded-sm" />
        <div className="absolute top-2 right-2 w-8 h-8 border-4 border-foreground rounded-sm" />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-4 border-foreground rounded-sm" />
        <div
          className="absolute inset-6 grid gap-0.5"
          style={{ gridTemplateColumns: "repeat(8, 1fr)" }}
        >
          {QR_DOTS.map((dot) => (
            <div
              key={dot.id}
              className="rounded-sm"
              style={{
                background: dot.filled ? "#1a1a1a" : "transparent",
                width: "100%",
                aspectRatio: "1",
              }}
            />
          ))}
        </div>
      </div>
      <div className="text-center">
        <p className="font-mono text-sm font-bold">mahalaxmi.pharmacy@upi</p>
        <p className="text-xs text-muted-foreground mt-1">Amount: ₹{amount}</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { t } = useLanguage();
  const { items, totalPrice, clearCart } = useCart();
  const { customer, customerLogin } = useAuth();
  const { actor } = useActor();
  const navigate = useNavigate();

  const [name, setName] = useState(customer?.name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [address, setAddress] = useState("");
  const [upiRef, setUpiRef] = useState("");
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    navigate({ to: "/cart" });
    return null;
  }

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error("Please fill all delivery details.");
      return;
    }
    if (!upiRef.trim()) {
      toast.error("Please enter your UPI transaction reference.");
      return;
    }

    setLoading(true);

    if (!customer) {
      customerLogin(name, phone);
    }

    const localOrderId = `MLP${Date.now().toString().slice(-8)}`;
    const localOrder = {
      id: localOrderId,
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      items: items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        price: i.price,
        quantity: i.quantity,
      })),
      total: totalPrice,
      status: "pending" as const,
      upiTxnRef: upiRef,
      createdAt: new Date().toISOString(),
    };

    try {
      if (actor) {
        const backendInput = {
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          upiTxnRef: upiRef,
          total: BigInt(Math.round(totalPrice)),
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            price: BigInt(Math.round(i.price)),
            qty: BigInt(i.quantity),
          })),
        };
        const backendOrderId = await actor.createOrder(backendInput);
        localOrder.id = backendOrderId || localOrderId;
      }
    } catch (_err) {
      console.warn("Backend order creation failed, using local order", _err);
    }

    saveOrder(localOrder);
    clearCart();

    setLoading(false);
    localStorage.setItem("mlp_last_order", JSON.stringify(localOrder));
    navigate({ to: "/order-confirmation" });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-6">
        {t("checkout")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Delivery + Payment */}
        <div className="space-y-6">
          {/* Delivery Details */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-4">
              📍 Delivery Details
            </h2>
            <div className="space-y-3">
              <div>
                <Label>{t("customer_name")}</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1"
                  data-ocid="checkout.name.input"
                />
              </div>
              <div>
                <Label>{t("phone")}</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-1"
                  type="tel"
                  data-ocid="checkout.phone.input"
                />
              </div>
              <div>
                <Label>{t("address")}</Label>
                <Textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full delivery address"
                  className="mt-1"
                  rows={3}
                  data-ocid="checkout.address.textarea"
                />
              </div>
            </div>
          </div>

          {/* UPI Payment */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-semibold text-foreground mb-4">
              💳 {t("upi_payment")}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t("upi_instructions")}
            </p>
            <div className="flex justify-center mb-4">
              <QRCodePlaceholder amount={totalPrice} />
            </div>
            <div>
              <Label>{t("txn_reference")}</Label>
              <Input
                value={upiRef}
                onChange={(e) => setUpiRef(e.target.value)}
                placeholder="e.g. 123456789012"
                className="mt-1"
                data-ocid="checkout.upi_ref.input"
              />
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
            <h2 className="font-semibold text-foreground mb-4">
              {t("order_summary")}
            </h2>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {item.emoji} {item.productName} &times; {item.quantity}
                  </span>
                  <span className="font-medium">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-bold text-lg mb-5">
              <span>{t("total")}</span>
              <span className="text-primary">₹{totalPrice}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={loading}
              data-ocid="checkout.place_order.button"
            >
              {loading ? "Placing Order..." : t("place_order")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
