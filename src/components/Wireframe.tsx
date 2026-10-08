"use client";
import { Suspense, lazy, useEffect, useState } from "react";
import ErrorBoundary from "./ErrorBoundary";

const LazyCanvas = lazy(() => import("./WireframeCanvas"));

export function WireframeFallback({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      width="400"
      height="400"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="#382216"
      strokeOpacity="0.35"
      strokeWidth="1"
    >
      <circle cx="200" cy="200" r="120" />
      <circle cx="200" cy="200" r="80" />
      <ellipse cx="200" cy="200" rx="120" ry="45" />
      <ellipse cx="200" cy="200" rx="120" ry="45" transform="rotate(60 200 200)" />
      <ellipse cx="200" cy="200" rx="120" ry="45" transform="rotate(120 200 200)" />
      <circle cx="200" cy="80" r="3" fill="#382216" />
      <circle cx="304" cy="260" r="3" fill="#382216" />
      <circle cx="96" cy="260" r="3" fill="#382216" />
    </svg>
  );
}

function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

export default function Wireframe({ variant = "sphere", className = "" }: { variant?: "sphere" | "cube"; className?: string }) {
  const [attempt3d, setAttempt3d] = useState(false);

  useEffect(() => {
    // Attempt WebGL unless the visitor explicitly asked for reduced motion.
    // The SVG below is only a fallback: no WebGL, or a canvas that throws.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!canUseWebGL()) return;
    setAttempt3d(true);
  }, []);

  if (!attempt3d) return <WireframeFallback className={className} />;

  return (
    <ErrorBoundary name="hero-3d" fallback={<WireframeFallback className={className} />}>
      <Suspense fallback={<WireframeFallback className={className} />}>
        <LazyCanvas variant={variant} className={className} />
      </Suspense>
    </ErrorBoundary>
  );
}
