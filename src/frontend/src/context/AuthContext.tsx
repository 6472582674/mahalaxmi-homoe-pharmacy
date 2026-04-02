import type React from "react";
import { createContext, useContext, useState } from "react";

interface Customer {
  name: string;
  phone: string;
}

interface AuthContextType {
  isAdmin: boolean;
  customer: Customer | null;
  adminLogin: (username: string, password: string) => boolean;
  customerLogin: (name: string, phone: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  customer: null,
  adminLogin: () => false,
  customerLogin: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem("mlp_admin") === "true";
  });
  const [customer, setCustomer] = useState<Customer | null>(() => {
    try {
      const stored = localStorage.getItem("mlp_customer");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const adminLogin = (username: string, password: string): boolean => {
    if (username === "admin" && password === "admin123") {
      setIsAdmin(true);
      localStorage.setItem("mlp_admin", "true");
      return true;
    }
    return false;
  };

  const customerLogin = (name: string, phone: string) => {
    const c = { name, phone };
    setCustomer(c);
    localStorage.setItem("mlp_customer", JSON.stringify(c));
  };

  const logout = () => {
    setIsAdmin(false);
    setCustomer(null);
    localStorage.removeItem("mlp_admin");
    localStorage.removeItem("mlp_customer");
  };

  return (
    <AuthContext.Provider
      value={{ isAdmin, customer, adminLogin, customerLogin, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
