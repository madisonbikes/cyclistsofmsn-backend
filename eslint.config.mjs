import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginPromise from "eslint-plugin-promise";
import importPlugin from "eslint-plugin-import";

const projectIgnores = {
  ignores: [
    "node_modules/**",
    "output/**",
    "coverage/**",
    "dist/**",
    "jest.config.js",
    "eslint.config.mjs",
    "ecosystem.config.js",
    "**/.*",
  ],
};

const projectRules = {
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn", // or error
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    eqeqeq: ["warn", "smart"],
    "require-await": ["warn"],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false,
      },
    ],
    "@typescript-eslint/strict-boolean-expressions": "warn",
    "@typescript-eslint/restrict-template-expressions": [
      "error",
      { allowNumber: true },
    ],
  },
};

export default tseslint.config(
  {
    languageOptions: {
      parserOptions: {
        projectService: {},
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  eslintPluginPrettierRecommended,
  eslintConfigPrettier,
  pluginPromise.configs["flat/recommended"],
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  projectIgnores,
  projectRules,
);
