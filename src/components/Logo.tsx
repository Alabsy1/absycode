export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  // Redrawn "A" mark: same spirit as the reference (A + curved circuit line + nodes).
  // Uses currentColor only — never sky blue.
  return (
    <svg
      viewBox="0 0 48 48"
      width="32"
      height="32"
      fill="none"
      className={`${className} shrink-0`}
      role="img"
      aria-label="AbsyCode logo"
      stroke="currentColor"
    >
      <path d="M24 6 L8 40" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M24 6 L40 40" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M15 29 H33" strokeWidth="3" strokeLinecap="round" />
      <path d="M24 6 C 30 12, 36 14, 42 12" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
      <circle cx="42" cy="12" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="8" cy="40" r="2.6" fill="currentColor" stroke="none" />
      <circle cx="40" cy="40" r="2.6" fill="currentColor" stroke="none" />
      <path d="M40 40 C 34 36, 30 34, 27 30" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
      <circle cx="27" cy="30" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}
