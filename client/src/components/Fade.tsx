// client/src/components/Fade.tsx
import React, { useEffect, useRef } from "react";
import "./Fade.css";

type Direction = "up" | "down" | "left" | "right" | "none";

interface FadeProps {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  duration?: number;
  delay?: number;
  distance?: number;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  index?: number;
  staggerGap?: number;
  visible?: boolean;
}

/**
 * Debug Fade component.
 * - Adds console debug logs so we can inspect observer behavior.
 * - Adds data-fade-id attribute to identify instances.
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
  // small stable id to identify instance logs
  const instanceIdRef = useRef<string | null>(null);
  if (!instanceIdRef.current) {
    instanceIdRef.current = Math.random().toString(36).slice(2, 8);
  }
  const id = instanceIdRef.current;

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      console.debug(`[Fade debug ${id}] no element reference (ref.current null)`);
      return;
    }

    // ensure classes
    if (!el.classList.contains("fade")) el.classList.add("fade");
    const dirClass = direction && direction !== "none" ? `fade-${direction}` : "";
    if (dirClass && !el.classList.contains(dirClass)) el.classList.add(dirClass);
    if (className) className.split(" ").forEach((c) => c && el.classList.add(c));

    // compute delay & set css vars
    const computedDelay = delay + (index ?? 0) * (staggerGap ?? 80);
    el.style.setProperty("--fade-duration", `${duration}ms`);
    el.style.setProperty("--fade-delay", `${computedDelay}ms`);
    el.style.setProperty("--fade-distance", `${distance}px`);

    // attach debug dataset
    el.setAttribute("data-fade-id", id);
    el.setAttribute("data-fade-debug", "true");

    // check prefers-reduced-motion
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    console.debug(
      `[Fade debug ${id}] mounted`,
      {
        direction,
        duration,
        delay,
        distance,
        computedDelay,
        once,
        threshold,
        rootMargin,
        index,
        staggerGap,
        visible,
        prefersReduced,
      }
    );

    if (prefersReduced) {
      console.debug(`[Fade debug ${id}] user prefers reduced motion -> showing immediately`);
      el.classList.add("show");
      return;
    }

    if (visible) {
      console.debug(`[Fade debug ${id}] visible=true -> showing immediately`);
      el.classList.add("show");
      return;
    }

    // If IntersectionObserver isn't supported, show immediately as a fallback
    if (typeof IntersectionObserver === "undefined") {
      console.debug(`[Fade debug ${id}] IntersectionObserver not supported -> showing immediately`);
      el.classList.add("show");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          console.debug(
            `[Fade debug ${id}] observer callback`,
            { isIntersecting: entry.isIntersecting, ratio: entry.intersectionRatio }
          );
          if (entry.isIntersecting) {
            if (!el.classList.contains("show")) {
              el.classList.add("show");
              console.debug(`[Fade debug ${id}] added .show (enter)`);
            }
            if (once) {
              try {
                observer.unobserve(entry.target);
                console.debug(`[Fade debug ${id}] unobserved (once=true)`);
              } catch (err) {
                /* ignore */
              }
            }
          } else {
            if (!once) {
              if (el.classList.contains("show")) {
                el.classList.remove("show");
                console.debug(`[Fade debug ${id}] removed .show (leave)`);
              }
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(el);
    console.debug(`[Fade debug ${id}] observer.observe called`);

    return () => {
      try {
        observer.disconnect();
        console.debug(`[Fade debug ${id}] observer.disconnect on cleanup`);
      } catch (err) {
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
