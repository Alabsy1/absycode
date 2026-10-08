/** @type {import('next').NextConfig} */

// Mirror of the frameable project domains in src/config/site.ts (projects[].url).
// next.config.mjs is ESM and cannot import the TS config — keep them in sync.
const FRAMEABLE_PROJECT_DOMAINS = [
  "https://mannaitours.com",
  "https://anubiskite.com",
  "https://same-n-sterk.nl",
  "https://wavora-psi.vercel.app",
  "https://absy-3d-portfolio.vercel.app",
];

const isDev = process.env.NODE_ENV !== "production";

const baseCsp = [
  "default-src 'self'",
  // Next 14's dev runtime (react-refresh) evaluates strings, and its inline
  // scripts/styles ship no nonce support. Production never uses eval, so
  // 'unsafe-eval' is granted in development only — without it `next dev`
  // throws before React mounts and the page is left un-hydrated.
  isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co",
  `frame-src ${FRAMEABLE_PROJECT_DOMAINS.join(" ")}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Content-Security-Policy", value: baseCsp },
  { key: "X-Frame-Options", value: "DENY" },
];

const noStoreHeaders = [
  ...securityHeaders,
  { key: "Cache-Control", value: "no-store, max-age=0" },
  { key: "Vary", value: "Cookie" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**", port: "" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: noStoreHeaders },
      { source: "/login", headers: noStoreHeaders },
      { source: "/api/:path*", headers: noStoreHeaders },
    ];
  },
};
export default nextConfig;