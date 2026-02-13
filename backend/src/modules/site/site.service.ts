import { prisma } from "../../lib/prisma.js";

const DEFAULT_SITE = {
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
  },
};

export type SiteContentPayload = typeof DEFAULT_SITE;

export const siteService = {
  async get(): Promise<SiteContentPayload> {
    const row = await prisma.siteContent.findFirst({ orderBy: { updatedAt: "desc" } });
    if (row) {
      return {
        brand: row.brand as SiteContentPayload["brand"],
        processSteps: row.processSteps as SiteContentPayload["processSteps"],
        founder: row.founder as SiteContentPayload["founder"],
      };
    }
    return DEFAULT_SITE;
  },

  async update(data: SiteContentPayload): Promise<SiteContentPayload> {
    const existing = await prisma.siteContent.findFirst();
    const payload = {
      brand: data.brand,
      processSteps: data.processSteps,
      founder: data.founder,
    };
    if (existing) {
      await prisma.siteContent.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      await prisma.siteContent.create({
        data: payload,
      });
    }
    return payload;
  },
};
