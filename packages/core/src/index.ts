/**
 * Logic shared by the customer and vendor apps.
 * The folders here are ../../frontend/src/lib, copied unchanged (step 2) apart from `@/lib/...` imports made relative.
 * Import them by path: `@wedwizz/core/api/api-client`, `@wedwizz/core/geo/geo`, ...
 * Step 3 adds the mobile adapters (secure-store session, MMKV storage, expo-location, AppState).
 */

/** The account role an app signs in as. Each app always uses one role (see apps/<app>/src/config/app.ts). */
export type AppRole = "USER" | "VENDOR";
