// client/src/components/Reveal.tsx
import React, { useRef, useEffect, useState } from "react";
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
  /** IntersectionObserver threshold (0..1) */
  amount?: number;
  /** debug logs to console */
  debug?: boolean;
}

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
  amount = 0.2,
  debug = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  // Respect prefers-reduced-motion: if user prefers reduced, we skip animation and always show final state.
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReducedMotion) {
      if (debug) console.debug("Reveal debug: prefers-reduced-motion -> show immediately");
      setInView(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (debug)
              console.debug(
                "Reveal debug: element entered view ->",
                el,
                "intersectionRatio:",
                entry.intersectionRatio
              );
            setInView(true);
            if (once && observer) {
              observer.unobserve(el);
            }
          } else {
            if (debug)
              console.debug(
                "Reveal debug: element left view ->",
                el,
                "intersectionRatio:",
                entry.intersectionRatio
              );
            if (!once) {
              setInView(false);
            }
          }
        });
      },
      {
        threshold: amount,
      }
    );

    observer.observe(el);

    return () => {
      try {
        observer.disconnect();
      } catch {
        /* noop */
      }
    };
  }, [once, amount, debug, prefersReducedMotion]);

  const start = { opacity: 0, ...offsetFor(direction) };
  const end = { opacity: 1, x: 0, y: 0 };

  // If reduced motion, show final state immediately
  const animateTarget = prefersReducedMotion ? end : inView ? end : start;

  return (
    <motion.div
      ref={ref}
      initial={start}
      animate={animateTarget}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      data-reveal
      style={{ willChange: "transform, opacity" }}
    >
      {children}
    </motion.div>
  );
}
