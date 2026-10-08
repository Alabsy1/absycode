import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Mirror tsconfig's "@/*": the app code imports through that alias, so the
  // unit tests need the same resolution (Vite does not read tsconfig paths).
  resolve: {
    alias: { "@": path.resolve(process.cwd(), "src") },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
