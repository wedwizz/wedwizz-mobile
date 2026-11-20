import { defineConfig } from "vitest/config";

// Unit tests copied from the web's src/lib (../../frontend).
export default defineConfig({
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    // api-client refuses to load without an API URL. Nothing is sent to it: tests that make requests use a fake adapter.
    env: { EXPO_PUBLIC_API_BASE_URL: "http://localhost:3000/api/v1" },
  },
});
