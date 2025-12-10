// client/src/components/Reveal.tsx
import React from "react";
import { motion } from "framer-motion";

type Direction = "up" | "down" | "left" | "right";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** seconds */
  delay?: number;
  /** seconds */
  duration?: number;
  direction?: Direction;
  /** Animate only once when scrolled into view */
  once?: boolean;
}

/** small helper: starting offset depending on direction */
const offsetFor = (direction: Direction) => {
  switch (direction) {
    case "up":
      return { y: 40, x: 0 };
    case "down":
      return { y: -40, x: 0 };
    case "left":
      return { x: 40, y: 0 };
    case "right":
      return { x: -40, y: 0 };
    default:
      return { y: 40, x: 0 };
  }
};

export default function Reveal({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  direction = "up",
  once = true,
}: RevealProps) {
  const start = { opacity: 0, ...offsetFor(direction) };

  return (
    <motion.div
      initial={start}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      viewport={{ once, amount: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
