import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import type { Product } from "../data/products";
import { useProductImage } from "../hooks/useProductImage";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { t } = useLanguage();
  const { imageUrl } = useProductImage(product);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      emoji: product.imageEmoji,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group">
      <Link to="/products/$id" params={{ id: product.id }}>
        <div className="bg-muted h-44 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-6xl">{product.imageEmoji}</span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link to="/products/$id" params={{ id: product.id }}>
            <h3 className="font-semibold text-foreground text-sm leading-snug hover:text-primary transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <Badge variant="secondary" className="text-xs shrink-0">
            {product.category}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">
              ₹{product.price}
            </span>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="ml-2 text-xs text-destructive">
                Only {product.stock} left!
              </span>
            )}
          </div>
          {product.stock === 0 ? (
            <Button size="sm" disabled className="text-xs">
              {t("out_of_stock")}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="gap-1 text-xs"
              data-ocid="product.add_to_cart.button"
            >
              <ShoppingCart className="h-3 w-3" />
              {t("add_to_cart")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
