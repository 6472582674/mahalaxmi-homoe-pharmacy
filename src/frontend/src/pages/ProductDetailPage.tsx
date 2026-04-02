import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import type { Product } from "../data/products";
import { useActor } from "../hooks/useActor";
import { useProductImage } from "../hooks/useProductImage";

export default function ProductDetailPage() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { t } = useLanguage();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { imageUrl } = useProductImage(product);

  useEffect(() => {
    if (!actor || isFetching || !id) return;

    setLoading(true);
    actor
      .getProduct(id)
      .then((bp) => {
        if (!bp) {
          setProduct(null);
        } else {
          setProduct({
            id: bp.id,
            name: bp.name,
            description: bp.description,
            price: Number(bp.price),
            category: bp.category as Product["category"],
            imageEmoji: bp.imageEmoji,
            imageHash: bp.imageHash,
            stock: Number(bp.stock),
            active: bp.active,
          });
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [actor, isFetching, id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-64 md:h-80 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <div className="text-4xl mb-3">🔍</div>
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/products" className="text-primary text-sm mt-2 inline-block">
          Back to products
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        productId: product.id,
        productName: product.name,
        price: product.price,
        emoji: product.imageEmoji,
      });
    }
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate({ to: "/cart" });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6"
        data-ocid="product.back.link"
      >
        <ArrowLeft className="h-4 w-4" /> {t("back_to_products")}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="bg-muted rounded-2xl flex items-center justify-center h-64 md:h-80 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <span className="text-8xl">{product.imageEmoji}</span>
          )}
        </div>

        {/* Details */}
        <div>
          <Badge variant="secondary" className="mb-3">
            {product.category}
          </Badge>
          <h1 className="font-display text-3xl font-bold text-foreground mb-3">
            {product.name}
          </h1>
          <p className="text-muted-foreground mb-5">{product.description}</p>

          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-bold text-primary">
              ₹{product.price}
            </span>
            {product.stock > 0 ? (
              <Badge
                variant="outline"
                className="text-secondary border-secondary"
              >
                {t("stock")}: {product.stock}
              </Badge>
            ) : (
              <Badge variant="destructive">{t("out_of_stock")}</Badge>
            )}
          </div>

          {product.stock > 0 && (
            <>
              {/* Qty selector */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-sm text-foreground">
                  {t("quantity")}:
                </span>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-1.5 hover:bg-muted"
                    data-ocid="product.qty_minus.button"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="px-4 py-1.5 text-sm font-medium">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="px-3 py-1.5 hover:bg-muted"
                    data-ocid="product.qty_plus.button"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="flex-1 gap-2"
                  data-ocid="product.add_to_cart.button"
                >
                  <ShoppingCart className="h-4 w-4" /> {t("add_to_cart")}
                </Button>
                <Button
                  onClick={handleBuyNow}
                  className="flex-1"
                  data-ocid="product.buy_now.button"
                >
                  {t("buy_now")}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
