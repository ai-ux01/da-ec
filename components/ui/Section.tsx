"use client";

import { motion } from "framer-motion";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
};

export function Section({
  children,
  className = "",
  noPadding = false,
}: SectionProps) {
  return (
    <section
      className={
        noPadding
          ? className
          : `w-full max-w-6xl mx-auto px-5 sm:px-8 min-w-0 ${className}`
      }
    >
      {children}
    </section>
  );
}

type SectionHeadingProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function SectionHeading({
  title,
  subtitle,
  className = "",
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
      className={`mb-10 sm:mb-14 ${className}`}
    >
      <h2 className="font-serif text-display-md text-earth-600">{title}</h2>
      {subtitle && (
        <p className="mt-3 text-earth-400 text-base sm:text-lg max-w-xl">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
