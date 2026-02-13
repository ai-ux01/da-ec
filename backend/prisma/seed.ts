import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultSite = {
  brand: {
    name: "AMRYTUM",
    tagline: "From Farm to Ghee. No shortcuts.",
    subtext: "Small batch A2 desi cow ghee made using the bilona method.",
    cta: "Join the first batch",
  },
  processSteps: [
    { number: 1, title: "Ethical farms", description: "Sourced only from verified farms where cows are pasture-raised and treated with care." },
    { number: 2, title: "Fresh milk", description: "Milk is collected within hours and transported under controlled conditions." },
    { number: 3, title: "Curd setting", description: "Natural curd culture is added; no commercial starters. Overnight setting." },
    { number: 4, title: "Hand churning", description: "Traditional wooden bilona. Hand-churned to separate butter from buttermilk." },
    { number: 5, title: "Slow heating", description: "Butter is heated on low flame for hours until pure ghee separates. No rush." },
    { number: 6, title: "Lab testing", description: "Every batch is tested for purity, A2 beta-casein, and contaminants. Results published." },
    { number: 7, title: "Glass jar packing", description: "Packed in amber glass jars. No plastic. Shipped with care." },
  ],
  founder: {
    name: "Founder Name",
    title: "Founder, AMRYTUM",
    story: "I grew up around ghee—real ghee, made the way it was meant to be. When I couldn't find that quality in the market, I decided to make it myself.\n\nAMRYTUM exists because we believe food should be transparent. You deserve to know where your ghee comes from, how it's made, and what's in it. No marketing tricks. No hidden ingredients. Just one thing, done right.\n\nWe work with a small network of ethical farms, use only A2 desi cow milk, and follow the bilona method from start to finish. Every batch is lab-tested and every report is public. That's the only way we know how to do it.",
    philosophy: [
      "Radical transparency. Publish what we test.",
      "No shortcuts. Time and method matter.",
      "Respect the animal, the farmer, and the land.",
      "One product, done exceptionally well.",
    ],
    imagePlaceholder: true,
  },
};

const defaultProducts = [
  { productId: "a2-ghee", name: "A2 Desi Cow Ghee", description: "Small batch, bilona method. Lab-tested. Glass jar.", sizes: [{ id: "250ml", label: "250 ml", price: 899, inr: "₹899" }, { id: "500ml", label: "500 ml", price: 1699, inr: "₹1,699" }, { id: "1L", label: "1 L", price: 3199, inr: "₹3,199" }], defaultSizeId: "500ml", sortOrder: 0 },
  { productId: "wild-honey", name: "Wild Forest Honey", description: "Single-origin, raw, unfiltered. From ethical beekeepers.", sizes: [{ id: "250g", label: "250 g", price: 749, inr: "₹749" }, { id: "500g", label: "500 g", price: 1399, inr: "₹1,399" }], defaultSizeId: "500g", sortOrder: 1 },
  { productId: "cold-pressed-oil", name: "Cold-Pressed Mustard Oil", description: "Wood-pressed, single estate. No refining.", sizes: [{ id: "500ml", label: "500 ml", price: 599, inr: "₹599" }, { id: "1L", label: "1 L", price: 1099, inr: "₹1,099" }], defaultSizeId: "500ml", sortOrder: 2 },
];

async function main() {
  let farm = await prisma.farm.findFirst();
  if (!farm) {
    farm = await prisma.farm.create({
      data: { name: "Seed Farm", location: "Sample location", notes: "For local dev" },
    });
    console.log("Created seed farm.");
  }

  let batch = await prisma.batch.findUnique({ where: { batchId: "AMR-001" } });
  if (!batch) {
    batch = await prisma.batch.create({
      data: {
        batchId: "AMR-001",
        farmId: farm.id,
        date: new Date(),
        cowsCount: 4,
        milkLiters: 80,
        gheeOutputLiters: 12,
        processingNotes: "Seed batch for local dev",
        status: "APPROVED",
      },
    });
    console.log("Created seed batch AMR-001 (APPROVED).");
  }

  const sizes = ["SIZE_250ML", "SIZE_500ML", "SIZE_1L"] as const;
  const jarsPerSize = 5;
  for (const size of sizes) {
    const available = await prisma.jar.count({
      where: { batchId: batch!.id, size, status: "AVAILABLE" },
    });
    const toCreate = Math.max(0, jarsPerSize - available);
    if (toCreate > 0) {
      const data = Array.from({ length: toCreate }, (_, i) => ({
        jarId: `seed-${size.toLowerCase()}-${Date.now()}-${i}-${batch!.id}`,
        batchId: batch!.id,
        size,
      }));
      await prisma.jar.createMany({ data });
      console.log(`Added ${toCreate} jar(s) for AMR-001 / ${size}.`);
    }
  }

  const siteCount = await prisma.siteContent.count();
  if (siteCount === 0) {
    await prisma.siteContent.create({
      data: defaultSite,
    });
    console.log("Created default site content.");
  }

  const productCount = await prisma.catalogProduct.count();
  if (productCount === 0) {
    for (const p of defaultProducts) {
      await prisma.catalogProduct.create({ data: p });
    }
    console.log("Created default catalog products.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
