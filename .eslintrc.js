module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:promise/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 6,
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint", "promise"],
  reportUnusedDisableDirectives: true,
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn", // or error
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    eqeqeq: ["warn", "smart"],
    "func-style": ["warn"],
    "require-await": ["error"],
    "@typescript-eslint/no-floating-promises": "error",
    "import/no-default-export": 2,
  },
};
