import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

// Next.js loads .env.local over .env; mirror that priority so this check
// reports what the app will actually see.
dotenv.config({ path: path.join(process.cwd(), ".env.local"), quiet: true });
dotenv.config({ path: path.join(process.cwd(), ".env"), quiet: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) {
  console.error("FAIL: NEXT_PUBLIC_SUPABASE_URL not set");
  process.exit(1);
}
if (!key) {
  console.error("FAIL: NEXT_PUBLIC_SUPABASE_ANON_KEY not set");
  process.exit(1);
}

if (!url.startsWith("https://")) {
  console.error("FAIL: URL does not start with https://");
  process.exit(1);
}
if (!key.startsWith("sb_publishable_") && !key.startsWith("eyJ")) {
  console.error("FAIL: key format unexpected");
  process.exit(1);
}
const localEnv = path.join(process.cwd(), ".env.local");
if (fs.existsSync(localEnv) && /^(SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SECRET_KEY)\s*=/m.test(fs.readFileSync(localEnv, "utf8"))) {
  console.error("FAIL: a service-role/secret key is in .env.local - remove it");
  process.exit(1);
}

console.log("PASS: env present and well-formed (publishable key only)");
