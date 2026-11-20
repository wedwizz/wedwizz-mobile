import path from "node:path";
import { defineConfig } from "vitest/config";

// Unit tests copied from the web (../frontend). `@/` is the app's src, as in tsconfig.json.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    // api-client refuses to load without an API URL. Nothing is sent to it: tests that make requests use a fake adapter.
    env: { EXPO_PUBLIC_API_BASE_URL: "http://localhost:3000/api/v1" },
    // Native modules (secure store, kv-store, location, AppState) replaced by in-memory fakes.
    setupFiles: ["src/test/native-mocks.ts"],
  },
});
