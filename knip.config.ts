export default {
  entry: [
    "index.{js,ts}",
    "src/index.{js,ts}",
    "ecosystem.config.js",
    // for now, set this as an entry point but eventually move to shared project in monorepo
    "src/routes/contract/types.ts",
  ],
  project: ["**/*.{js,ts}", "!**/__mocks__/**"],
  ignoreExportsUsedInFile: true,
};
