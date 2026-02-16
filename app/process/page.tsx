"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { processSteps } from "@/lib/mockData";

export default function ProcessPage() {
  const reduceMotion = useReducedMotion();
  return (
    <div className="pt-16 sm:pt-20">
      <Section className="py-16 sm:py-24">
        <SectionHeading
          title="Our Process"
          subtitle="From farm to jar. Each step is non-negotiable."
        />
        <div className="relative">
          <div className="absolute left-[11px] sm:left-4 top-0 bottom-0 w-px bg-earth-200/60" />
          <ul className="space-y-12 sm:space-y-16">
            {processSteps.map((step, i) => (
              <motion.li
                key={step.number}
                initial={reduceMotion ? undefined : { opacity: 0, x: -20 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: reduceMotion ? 0 : i * 0.05 }}
                className="relative pl-10 sm:pl-14"
              >
                <span className="absolute left-0 top-0.5 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full border-2 border-earth-400 bg-cream-50 text-xs font-medium text-earth-600 sm:text-sm">
                  {step.number}
                </span>
                <h3 className="font-serif text-display-md text-earth-600">
                  {step.title}
                </h3>
                <p className="mt-2 text-earth-400 leading-relaxed max-w-xl">
                  {step.description}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </Section>
    </div>
  );
}
