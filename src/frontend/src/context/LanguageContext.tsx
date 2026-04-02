import type React from "react";
import { createContext, useContext, useState } from "react";
import { type Lang, T } from "../data/translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem("mlp_lang") as Lang) || "en";
  });

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("mlp_lang", l);
  };

  const t = (key: string): string => {
    return T[key]?.[lang] || T[key]?.en || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
