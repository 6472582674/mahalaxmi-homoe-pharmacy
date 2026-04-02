import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";

export default function CartPage() {
  const { t } = useLanguage();
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">
          {t("empty_cart")}
        </h2>
        <p className="text-muted-foreground mb-6">
          Add some products to continue.
        </p>
        <Link to="/products">
          <Button>{t("continue_shopping")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-foreground mb-6">
        {t("your_cart")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
            >
              <span className="text-3xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <Link to="/products/$id" params={{ id: item.productId }}>
                  <p className="font-semibold text-foreground text-sm hover:text-primary truncate">
                    {item.productName}
                  </p>
                </Link>
                <p className="text-primary font-bold">₹{item.price}</p>
              </div>
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity - 1)
                  }
                  className="px-2 py-1 hover:bg-muted"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="px-3 py-1 text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    updateQuantity(item.productId, item.quantity + 1)
                  }
                  className="px-2 py-1 hover:bg-muted"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  ₹{item.price * item.quantity}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-destructive hover:text-destructive/80 mt-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-card border border-border rounded-xl p-5 h-fit">
          <h2 className="font-semibold text-foreground mb-4">
            {t("order_summary")}
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-secondary font-medium">Free</span>
            </div>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between font-bold text-lg mb-5">
            <span>{t("total")}</span>
            <span className="text-primary">₹{totalPrice}</span>
          </div>
          <Button
            className="w-full"
            onClick={() => navigate({ to: "/checkout" })}
          >
            {t("proceed_to_checkout")}
          </Button>
          <Button
            variant="ghost"
            className="w-full mt-2 text-sm"
            onClick={() => navigate({ to: "/products" })}
          >
            {t("continue_shopping")}
          </Button>
        </div>
      </div>
    </div>
  );
}
