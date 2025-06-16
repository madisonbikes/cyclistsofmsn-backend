import type { ViteUserConfig } from "vitest/config";

export default {
  test: {
    environment: "node",
    coverage: {
      provider: "istanbul",
      reporter: ["text", "lcov"],
    },
    globals: true,
    setupFiles: [],
    include: ["src/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
} satisfies ViteUserConfig;
