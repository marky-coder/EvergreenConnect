// client/src/components/Fade.tsx
import React, { useEffect, useRef } from "react";
import "./Fade.css";

type Direction = "up" | "down" | "left" | "right" | "none";

interface FadeProps {
  children: React.ReactNode;
  className?: string;
  /** direction of travel before fade */
  direction?: Direction;
  /** milliseconds */
  duration?: number;
  /** milliseconds base delay (per-element will add index*staggerGap) */
  delay?: number;
  /** px distance to travel (CSS var --fade-distance) */
  distance?: number;
  /** if true animate only once */
  once?: boolean;
  /** IntersectionObserver threshold (0..1) */
  threshold?: number;
  /** IntersectionObserver rootMargin */
  rootMargin?: string;
  /** index for staggered children (0,1,2...) - used to compute delay */
  index?: number;
  /** gap between staggered children in ms */
  staggerGap?: number;
  /** show immediately (useful for SSR debugging) */
  visible?: boolean;
}

/**
 * Fade component:
 * - Adds .fade and directional class (fade-up / fade-left / ...)
 * - Sets CSS variables: --fade-duration, --fade-delay, --fade-distance
 * - Uses IntersectionObserver to toggle 'show' class.
 * - Respects prefers-reduced-motion.
 */
export default function Fade({
  children,
  className = "",
  direction = "up",
  duration = 600,
  delay = 0,
  distance = 12,
  once = true,
  threshold = 0.2,
  rootMargin = "0px",
  index = 0,
  staggerGap = 80,
  visible = false,
}: FadeProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Ensure base class
    if (!el.classList.contains("fade")) el.classList.add("fade");

    // Add directional class (fade-up / fade-left / ...)
    const dirClass = direction && direction !== "none" ? `fade-${direction}` : "";
    if (dirClass && !el.classList.contains(dirClass)) el.classList.add(dirClass);

    // Add any extra classes passed via className
    if (className) {
      className.split(" ").forEach((c) => c && el.classList.add(c));
    }

    // Compute delay taking index/staggerGap into account
    const computedDelay = delay + (index ?? 0) * (staggerGap ?? 80);
    el.style.setProperty("--fade-duration", `${duration}ms`);
    el.style.setProperty("--fade-delay", `${computedDelay}ms`);
    el.style.setProperty("--fade-distance", `${distance}px`);

    // Respect reduced motion -> show immediately
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced || visible) {
      // If reduced motion or visible override, show immediately and don't observe
      el.classList.add("show");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("show");
            if (once && observer) observer.unobserve(el);
          } else {
            if (!once) el.classList.remove("show");
          }
        });
      },
      {
        threshold,
        rootMargin,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} aria-hidden={false}>
      {children}
    </div>
  );
}
