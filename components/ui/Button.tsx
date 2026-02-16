"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

const variants = {
  primary:
    "bg-earth-600 text-cream-50 hover:bg-earth-500 border border-earth-600 rounded-button",
  secondary:
    "bg-gold-200/40 text-earth-600 hover:bg-gold-200/60 border border-gold-300 rounded-button",
  outline:
    "bg-transparent text-earth-600 border border-earth-400 hover:border-earth-600 hover:bg-earth-200/10 rounded-button",
  ghost:
    "bg-transparent text-earth-600 border border-transparent hover:bg-earth-200/10 rounded-button",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) {
  const reduceMotion = useReducedMotion();
  const motionProps = reduceMotion ? {} : { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } };

  const base =
    "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-offset-2 focus:ring-offset-cream-50 disabled:opacity-50 disabled:cursor-not-allowed";

  const combined = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href}>
        <motion.span className={combined} {...motionProps}>
          {children}
        </motion.span>
      </Link>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combined}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}
