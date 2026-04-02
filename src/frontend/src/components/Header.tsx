import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Settings, ShoppingCart, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { LANG_FLAGS, LANG_LABELS, type Lang } from "../data/translations";

export default function Header() {
  const { totalItems } = useCart();
  const { isAdmin, customer, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const navLinks = [
    { to: "/", label: t("home") },
    { to: "/products", label: t("products") },
    { to: "/my-orders", label: t("my_orders") },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🌿</span>
          <div className="hidden sm:block">
            <div className="font-display text-primary font-bold text-lg leading-tight">
              {t("shop_name")}
            </div>
            <div className="text-xs text-muted-foreground hidden md:block">
              {t("tagline")}
            </div>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === link.to
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 text-xs">
                <span>{LANG_FLAGS[lang]}</span>
                <span className="hidden sm:inline">{LANG_LABELS[lang]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
                <DropdownMenuItem
                  key={l}
                  onClick={() => setLang(l)}
                  className={lang === l ? "bg-muted font-semibold" : ""}
                >
                  {LANG_FLAGS[l]} {LANG_LABELS[l]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Cart */}
          <Link to="/cart" className="relative">
            <Button variant="outline" size="sm" className="gap-1">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Auth */}
          {isAdmin ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("admin")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/admin">Admin Panel</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" /> {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : customer ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-20 truncate">
                    {customer.name}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/my-orders">{t("my_orders")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" /> {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/admin">
              <Button variant="outline" size="sm" className="gap-1">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{t("login")}</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden border-t border-border flex">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex-1 text-center text-xs py-2 ${
              pathname === link.to
                ? "text-primary font-semibold border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
