import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { useLanguage } from "../context/LanguageContext";
import { useProducts } from "../hooks/useProducts";

const CATEGORIES = [
  { name: "Remedies", emoji: "🌼", desc: "Classical homeopathic remedies" },
  { name: "Tonics", emoji: "🌿", desc: "Health & vitality tonics" },
  { name: "Oils", emoji: "🌻", desc: "Natural healing oils" },
  { name: "Skincare", emoji: "🧴", desc: "Gentle skin care products" },
];

const DECORATIVE_POSITIONS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${(i * 17) % 100}%`,
  top: `${(i * 23) % 100}%`,
  rotate: `${(i * 18) % 360}deg`,
}));

const HERO_SKELETON_KEYS = ["h1", "h2", "h3", "h4", "h5", "h6"];

export default function HomePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const featured = products.filter((p) => p.active).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/90 to-secondary/80 text-primary-foreground py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {DECORATIVE_POSITIONS.map((pos) => (
            <span
              key={pos.id}
              className="absolute text-4xl"
              style={{
                left: pos.left,
                top: pos.top,
                transform: `rotate(${pos.rotate})`,
              }}
            >
              🌿
            </span>
          ))}
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-4">🌿</div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 leading-tight">
            {t("shop_name")}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">{t("tagline")}</p>
          <Button
            size="lg"
            variant="secondary"
            className="gap-2 font-semibold"
            onClick={() => navigate({ to: "/products" })}
            data-ocid="home.shop_now.button"
          >
            {t("shop_now")} <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
          {t("category")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to="/products"
              search={{ category: cat.name }}
              className="bg-card border border-border rounded-xl p-5 text-center hover:shadow-md hover:border-primary transition-all group"
              data-ocid="home.category.link"
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                {cat.emoji}
              </div>
              <div className="font-semibold text-foreground">{cat.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {cat.desc}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/40 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {t("featured_products")}
            </h2>
            <Link to="/products">
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                data-ocid="home.view_all.button"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {loading ? (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5"
              data-ocid="home.products.loading_state"
            >
              {HERO_SKELETON_KEYS.map((k) => (
                <div
                  key={k}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  <Skeleton className="h-44 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-8 w-24 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="font-display text-2xl font-bold text-center text-foreground mb-8">
          {t("why_choose_us")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Leaf className="h-8 w-8 text-secondary" />,
              title: "Natural Ingredients",
              desc: "All products made with pure, natural, and carefully sourced homeopathic ingredients.",
            },
            {
              icon: <ShieldCheck className="h-8 w-8 text-primary" />,
              title: "Trusted Quality",
              desc: "Certified homeopathic preparations with over 20 years of trusted service.",
            },
            {
              icon: <Truck className="h-8 w-8 text-accent" />,
              title: "Fast Delivery",
              desc: "Quick delivery across India. Orders dispatched within 24 hours.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-card border border-border rounded-xl p-6 text-center"
            >
              <div className="flex justify-center mb-3">{item.icon}</div>
              <h3 className="font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
