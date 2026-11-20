// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// expo-sqlite (kv-store, used for app storage) runs SQLite as WebAssembly on web: bundle .wasm files as assets.
config.resolver.assetExts.push("wasm");

// Its synchronous API on web needs SharedArrayBuffer, which browsers only allow on cross-origin-isolated pages.
// Dev server only; a hosted web build would need the same two headers from its server.
config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  middleware(req, res, next);
};

module.exports = config;
