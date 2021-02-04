module.exports = {
  env: {
    node: true,
    es6: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 6,
  },
  plugins: ["@typescript-eslint", "no-autofix"],
  rules: {
      "prefer-const": "off",
      "no-autofix/prefer-const": "error"
  },
};
