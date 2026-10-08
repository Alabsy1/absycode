"use client";
import { Suspense, lazy, useEffect, useState } from "react";

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

export default function Wireframe({ variant = "sphere", className = "" }: { variant?: "sphere" | "cube"; className?: string }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
    const lowMem = mem !== undefined && mem < 4;
    const saveData = (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (!reduced && !lowMem && !saveData) setEnabled(true);
  }, []);
  if (!enabled) return <WireframeFallback className={className} />;
  return (
    <Suspense fallback={<WireframeFallback className={className} />}>
      <LazyCanvas variant={variant} className={className} />
    </Suspense>
  );
}
