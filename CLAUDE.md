# WedWizz mobile

React Native (Expo) apps for the WedWizz wedding marketplace. Full plan: [docs/MOBILE_PLAN.md](docs/MOBILE_PLAN.md) — read it before starting a step.

## Layout
- `apps/customer` — customer app (signs in as role `USER`). Built first.
- `apps/vendor` — vendor app (signs in as role `VENDOR`).
- `packages/core` (`@wedwizz/core`) — logic shared by both apps: API client, auth, chat, geo, share, query keys, API types. Imported by path (`@wedwizz/core/api/api-client`). React Native adapters live in `native/` (secure-store session, kv-store/memory storage, expo-location) and `chat/app-chat-updates.ts`; the rest stays plain TS so it runs in Vitest.
- `packages/ui` (`@wedwizz/ui`) — design tokens (`tokens.ts`), fonts (`useAppFonts`) and shared components, styled with StyleSheet + tokens (no NativeWind). New looks go here. Preview them on `src/app/dev/ui-preview.tsx` (dev builds).
- `design/customer`, `design/vendor` — design screenshots (reference only, never imported).
- Admin stays on the web (`../frontend`). The backend is `../backend`.

## Rules
1. **Business logic is copied from the web, not rewritten.** Source of truth: `../frontend/src`. Copy `lib/*` into `packages/core`, and `features/<user|vendor>/{api,hooks,lib,store,types,data}` into the matching app. Only change what React Native needs (storage, navigation, location, uploads, env), and keep those changes behind small adapters.
2. **Design screenshots give the style; the web page gives the content.** Sections, data, order, validation, messages, timers and behaviour come from the matching web page. Colours, type, spacing, component look and the bottom tabs come from the screenshot. Sample content in a screenshot (made-up numbers, fields the API doesn't have) is not built; list it instead.
3. **Each screen is two parts:** `<Name>View` (props only, styled from the design) and `<Name>Screen` (hooks and navigation, copied from the web page).
4. **Screens use only `@wedwizz/ui` components and tokens.** If a new look is needed, add a component there.
5. **Every screen handles the states the web page handles:** loading, empty, error with retry, signed-out guest, missing photo/price/rating.
6. Copy the web's tests with the logic and keep them passing (`npm test`).
7. Don't commit unless asked. Ask before touching the dev database or starting Docker.
8. Finish each task with: changed files, what matches the web, conflicts found, and what to check on a phone.
