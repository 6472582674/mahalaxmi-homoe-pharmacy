import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import { useLanguage } from "../context/LanguageContext";
import { useProducts } from "../hooks/useProducts";

const CATEGORIES = ["All", "Remedies", "Tonics", "Oils", "Skincare"];
const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"];

export default function ProductsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { category?: string };
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState(
    search.category || "All",
  );
  const { products, loading } = useProducts();

  useEffect(() => {
    if (search.category) setActiveCategory(search.category);
    else setActiveCategory("All");
  }, [search.category]);

  const activeProducts = products.filter((p) => p.active);

  const filtered = activeProducts.filter((p) => {
    const matchesCategory =
      activeCategory === "All" || p.category === activeCategory;
    const matchesSearch =
      !searchText ||
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.description.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    if (cat === "All") {
      navigate({ to: "/products" });
    } else {
      navigate({ to: "/products", search: { category: cat } });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            {t("products")}
          </h1>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search")}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9"
              data-ocid="products.search_input"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              data-ocid="products.category.tab"
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border text-foreground hover:border-primary"
              }`}
            >
              {cat === "All" ? t("all_categories") : cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            data-ocid="products.loading_state"
          >
            {SKELETON_KEYS.map((k) => (
              <div
                key={k}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <Skeleton className="h-44 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-8 w-24 mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length === 0 ? (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="products.empty_state"
          >
            <div className="text-4xl mb-3">🔍</div>
            <p>No products found. Try a different search or category.</p>
          </div>
        ) : !loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}
      </div>
      <Footer />
    </div>
  );
}
