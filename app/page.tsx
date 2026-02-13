"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { brand } from "@/lib/mockData";

export default function HomePage() {
  return (
    <div className="pt-16 sm:pt-20">
      <Section className="py-20 sm:py-28 lg:py-36">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <h1 className="font-serif text-display-xl text-earth-600 text-balance">
            {brand.tagline}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-earth-400 max-w-xl leading-relaxed">
            {brand.subtext}
          </p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-10"
          >
            <Button href="/buy" variant="primary" size="lg">
              {brand.cta}
            </Button>
          </motion.div>
        </motion.div>
      </Section>

      <section className="border-t border-earth-200/40 bg-cream-100/30">
        <Section className="py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="grid sm:grid-cols-3 gap-10 sm:gap-12"
          >
            <div>
              <span className="text-3xl font-serif text-gold-400 font-semibold">
                01
              </span>
              <h3 className="mt-2 font-serif text-lg text-earth-600">
                Ethical sourcing
              </h3>
              <p className="mt-2 text-sm text-earth-400 leading-relaxed">
                Only A2 desi cow milk from verified, pasture-based farms.
              </p>
            </div>
            <div>
              <span className="text-3xl font-serif text-gold-400 font-semibold">
                02
              </span>
              <h3 className="mt-2 font-serif text-lg text-earth-600">
                Bilona method
              </h3>
              <p className="mt-2 text-sm text-earth-400 leading-relaxed">
                Hand-churned the traditional way. No industrial shortcuts.
              </p>
            </div>
            <div>
              <span className="text-3xl font-serif text-gold-400 font-semibold">
                03
              </span>
              <h3 className="mt-2 font-serif text-lg text-earth-600">
                Lab-verified
              </h3>
              <p className="mt-2 text-sm text-earth-400 leading-relaxed">
                Every batch tested. Reports published. Nothing to hide.
              </p>
            </div>
          </motion.div>
        </Section>
      </section>

      <Section className="py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <p className="font-serif text-display-md text-earth-600">
            One product. One standard. No compromise.
          </p>
          <p className="mt-4 text-earth-400">
            <Button href="/process" variant="outline" size="md">
              See our process
            </Button>
          </p>
        </motion.div>
      </Section>
    </div>
  );
}
