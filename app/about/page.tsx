"use client";

import { motion } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { founder } from "@/lib/mockData";

export default function AboutPage() {
  return (
    <div className="pt-16 sm:pt-20">
      <Section className="py-16 sm:py-24">
        <SectionHeading
          title="About the Founder"
          subtitle="The person behind AMRYTUM."
        />
        <div className="grid sm:grid-cols-5 gap-10 sm:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="sm:col-span-2"
          >
            <div className="aspect-[3/4] bg-earth-200/20 rounded-lg flex items-center justify-center text-earth-300 text-sm">
              {founder.imagePlaceholder ? (
                <span>Photo placeholder</span>
              ) : (
                "Image"
              )}
            </div>
            <p className="mt-4 font-serif text-lg text-earth-600">
              {founder.name}
            </p>
            <p className="text-sm text-earth-400">{founder.title}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="sm:col-span-3 space-y-8"
          >
            <div className="prose prose-earth max-w-none">
              <p className="text-earth-400 leading-relaxed whitespace-pre-line">
                {founder.story}
              </p>
            </div>
            <div>
              <h3 className="font-serif text-lg text-earth-600 mb-4">
                Philosophy
              </h3>
              <ul className="space-y-3">
                {founder.philosophy.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    className="flex items-start gap-3 text-earth-400"
                  >
                    <span className="text-gold-400 mt-0.5">—</span>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
