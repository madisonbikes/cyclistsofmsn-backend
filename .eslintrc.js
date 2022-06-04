module.exports = {
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 6,
  },
  plugins: ["@typescript-eslint"],
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
  },
};
