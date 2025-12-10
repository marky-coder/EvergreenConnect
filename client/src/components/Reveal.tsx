// client/src/components/Reveal.tsx
import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

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

/** starting offset depending on direction */
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
  const ref = useRef<HTMLDivElement | null>(null);
  // useInView returns true if the element is in view (IntersectionObserver)
  const inView = useInView(ref, { once, amount: 0.2 });

  const start = { opacity: 0, ...offsetFor(direction) };
  const end = { opacity: 1, x: 0, y: 0 };

  return (
    <motion.div
      ref={ref}
      initial={start}
      animate={inView ? end : start}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
