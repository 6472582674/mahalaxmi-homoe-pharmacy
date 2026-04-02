export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "Remedies" | "Tonics" | "Oils" | "Skincare";
  imageEmoji: string;
  imageHash: string;
  stock: number;
  active: boolean;
}

export const INITIAL_PRODUCTS: Product[] = [
  // Remedies
  {
    id: "p1",
    name: "Arnica Montana 30C",
    description:
      "A classic homeopathic remedy for bruises, muscle soreness, and physical trauma. Helps reduce swelling and promotes faster healing naturally.",
    price: 120,
    category: "Remedies",
    imageEmoji: "🌼",
    imageHash: "",
    stock: 50,
    active: true,
  },
  {
    id: "p2",
    name: "Belladonna 200C",
    description:
      "Effective for sudden fever, inflammation, and throbbing headaches. A trusted remedy when symptoms come on suddenly and intensely.",
    price: 150,
    category: "Remedies",
    imageEmoji: "🍒",
    imageHash: "",
    stock: 40,
    active: true,
  },
  {
    id: "p3",
    name: "Nux Vomica 30C",
    description:
      "Ideal for digestive disorders, acidity, nausea, and irritability caused by overindulgence. A must-have for modern lifestyle issues.",
    price: 110,
    category: "Remedies",
    imageEmoji: "🫚",
    imageHash: "",
    stock: 60,
    active: true,
  },
  // Tonics
  {
    id: "p4",
    name: "Alfalfa Tonic",
    description:
      "A powerful general health tonic that improves appetite, builds strength, and boosts overall vitality. Suitable for all ages.",
    price: 280,
    category: "Tonics",
    imageEmoji: "🌿",
    imageHash: "",
    stock: 30,
    active: true,
  },
  {
    id: "p5",
    name: "Calcarea Phos Tonic",
    description:
      "Supports bone health, growth, and development. Recommended for growing children, elderly, and those recovering from fractures.",
    price: 240,
    category: "Tonics",
    imageEmoji: "🦴",
    imageHash: "",
    stock: 25,
    active: true,
  },
  {
    id: "p6",
    name: "Ferrum Phos Tonic",
    description:
      "Natural iron supplement that helps with anaemia, weakness, and low energy. Gently restores vitality without side effects.",
    price: 260,
    category: "Tonics",
    imageEmoji: "💪",
    imageHash: "",
    stock: 35,
    active: true,
  },
  // Oils
  {
    id: "p7",
    name: "Calendula Oil",
    description:
      "Pure Calendula-infused healing oil for skin wounds, rashes, and dry skin. Anti-inflammatory and soothing properties.",
    price: 320,
    category: "Oils",
    imageEmoji: "🌻",
    imageHash: "",
    stock: 20,
    active: true,
  },
  {
    id: "p8",
    name: "Arnica Hair Oil",
    description:
      "Promotes hair growth, reduces hair fall, and strengthens roots. Enriched with Arnica extract for deep nourishment.",
    price: 350,
    category: "Oils",
    imageEmoji: "🌾",
    imageHash: "",
    stock: 28,
    active: true,
  },
  {
    id: "p9",
    name: "Lavender Massage Oil",
    description:
      "Relaxing and calming massage oil for stress relief, muscle tension, and better sleep. Pure lavender essence.",
    price: 380,
    category: "Oils",
    imageEmoji: "💜",
    imageHash: "",
    stock: 22,
    active: true,
  },
  // Skincare
  {
    id: "p10",
    name: "Calendula Cream",
    description:
      "Gentle healing cream for dry skin, minor cuts, and irritation. Suitable for sensitive skin and babies.",
    price: 220,
    category: "Skincare",
    imageEmoji: "🧴",
    imageHash: "",
    stock: 45,
    active: true,
  },
  {
    id: "p11",
    name: "Rose Water Toner",
    description:
      "Natural rose water facial toner that balances pH, hydrates, and refreshes skin. Leaves a soft, dewy finish.",
    price: 180,
    category: "Skincare",
    imageEmoji: "🌹",
    imageHash: "",
    stock: 55,
    active: true,
  },
  {
    id: "p12",
    name: "Neem Face Pack",
    description:
      "Anti-acne face pack with pure neem extract. Controls oil, clears blemishes, and gives a healthy glow.",
    price: 160,
    category: "Skincare",
    imageEmoji: "🍃",
    imageHash: "",
    stock: 38,
    active: true,
  },
];

const STORAGE_KEY = "mlp_products";

export function getProducts(): Product[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}
