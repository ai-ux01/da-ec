export const brand = {
  name: "AMRYTUM",
  tagline: "From Farm to Ghee. No shortcuts.",
  subtext:
    "Small batch A2 desi cow ghee made using the bilona method.",
  cta: "Join the first batch",
};

export const processSteps = [
  { number: 1, title: "Ethical farms", description: "Sourced only from verified farms where cows are pasture-raised and treated with care." },
  { number: 2, title: "Fresh milk", description: "Milk is collected within hours and transported under controlled conditions." },
  { number: 3, title: "Curd setting", description: "Natural curd culture is added; no commercial starters. Overnight setting." },
  { number: 4, title: "Hand churning", description: "Traditional wooden bilona. Hand-churned to separate butter from buttermilk." },
  { number: 5, title: "Slow heating", description: "Butter is heated on low flame for hours until pure ghee separates. No rush." },
  { number: 6, title: "Lab testing", description: "Every batch is tested for purity, A2 beta-casein, and contaminants. Results published." },
  { number: 7, title: "Glass jar packing", description: "Packed in amber glass jars. No plastic. Shipped with care." },
];

export const labReports = [
  { batchId: "AMR-2024-001", date: "2024-01-15", pdfUrl: "#", summary: "Purity 99.2%, A2 confirmed" },
  { batchId: "AMR-2024-002", date: "2024-02-01", pdfUrl: "#", summary: "Purity 99.4%, A2 confirmed" },
  { batchId: "AMR-2024-003", date: "2024-02-15", pdfUrl: "#", summary: "Purity 99.1%, A2 confirmed" },
];

export const founder = {
  name: "Founder Name",
  title: "Founder, AMRYTUM",
  story: `I grew up around ghee—real ghee, made the way it was meant to be. When I couldn't find that quality in the market, I decided to make it myself.

AMRYTUM exists because we believe food should be transparent. You deserve to know where your ghee comes from, how it's made, and what's in it. No marketing tricks. No hidden ingredients. Just one thing, done right.

We work with a small network of ethical farms, use only A2 desi cow milk, and follow the bilona method from start to finish. Every batch is lab-tested and every report is public. That's the only way we know how to do it.`,
  philosophy: [
    "Radical transparency. Publish what we test.",
    "No shortcuts. Time and method matter.",
    "Respect the animal, the farmer, and the land.",
    "One product, done exceptionally well.",
  ],
  imagePlaceholder: true,
};

export type ProductSize = {
  id: string;
  label: string;
  price: number;
  inr: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  sizes: ProductSize[];
  defaultSizeId: string;
};

export const products: Product[] = [
  {
    id: "a2-ghee",
    name: "A2 Desi Cow Ghee",
    description: "Small batch, bilona method. Lab-tested. Glass jar.",
    sizes: [
      { id: "250ml", label: "250 ml", price: 899, inr: "₹899" },
      { id: "500ml", label: "500 ml", price: 1699, inr: "₹1,699" },
      { id: "1L", label: "1 L", price: 3199, inr: "₹3,199" },
    ],
    defaultSizeId: "500ml",
  },
  {
    id: "wild-honey",
    name: "Wild Forest Honey",
    description: "Single-origin, raw, unfiltered. From ethical beekeepers.",
    sizes: [
      { id: "250g", label: "250 g", price: 749, inr: "₹749" },
      { id: "500g", label: "500 g", price: 1399, inr: "₹1,399" },
    ],
    defaultSizeId: "500g",
  },
  {
    id: "cold-pressed-oil",
    name: "Cold-Pressed Mustard Oil",
    description: "Wood-pressed, single estate. No refining.",
    sizes: [
      { id: "500ml", label: "500 ml", price: 599, inr: "₹599" },
      { id: "1L", label: "1 L", price: 1099, inr: "₹1,099" },
    ],
    defaultSizeId: "500ml",
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
