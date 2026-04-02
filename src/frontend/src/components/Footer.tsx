import { Leaf } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-foreground text-background mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="h-5 w-5 text-accent" />
            <span className="font-display font-bold text-lg text-accent">
              {t("shop_name")}
            </span>
          </div>
          <p className="text-sm text-background/70">{t("tagline")}</p>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-accent">Contact Us</h3>
          <div className="space-y-1 text-sm text-background/80">
            <p>📍 123 Pharmacy Street, Mumbai, MH 400001</p>
            <p>📞 +91 98765 43210</p>
            <p>📧 info@mahalaxmipharmacy.in</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-3 text-accent">Quick Links</h3>
          <div className="space-y-1 text-sm text-background/80">
            <p>Home &bull; Products &bull; About</p>
            <p>My Orders &bull; Admin Panel</p>
          </div>
        </div>
      </div>
      <div className="border-t border-background/20 text-center py-4 text-sm text-background/60">
        Made with ❤️ for natural healing &bull; &copy; 2024 Mahalaxmi Homoe
        Pharmacy
      </div>
    </footer>
  );
}
