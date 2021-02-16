// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defaults: tsjPreset } = require("ts-jest/presets");

module.exports = {
  preset: "@shelf/jest-mongodb",
  transform: tsjPreset.transform,
  watchPathIgnorePatterns: ["globalConfig"],
  setupFiles: ["<rootDir>/src/test/test_setup.ts"]
};