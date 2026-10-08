"use client";

import { useEffect, useLayoutEffect, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Progressive-enhancement entrance animation.
 *
 * The server HTML is always fully visible (no opacity:0, no transform), so the
 * content renders without JavaScript and before hydration. Only after
 * hydration do we optionally play a fade-up, and the hiding styles live inside
 * `@media (prefers-reduced-motion: no-preference)` so they can never apply to
 * a user who asked for reduced motion. A safety timeout always ends on the
 * visible state, so nothing can stay hidden.
 */

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type RevealProps = {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
};

export default function Reveal({ as: Tag = "div", delay = 0, className, children }: RevealProps) {
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useIsoLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setArmed(true);
    const safety = window.setTimeout(() => setShown(true), 1500);
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setShown(true));
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(safety);
    };
  }, []);

  const cls = [className, "reveal", armed && !shown ? "reveal-hidden" : "", shown ? "reveal-shown" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      className={cls}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
