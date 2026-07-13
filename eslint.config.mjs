import { defineConfig, globalIgnores } from "eslint/config";
import babelParser from "@babel/eslint-parser";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";

// eslint-config-next@16.2.10 bundles eslint-plugin-react@7.37.5 (ESLint ≤9 only)
// and typescript-eslint@8.x (TypeScript <6.1 only), both incompatible with the
// current ESLint 10 + TypeScript 7 versions. This config replaces it with
// individually-managed packages that support both:
//   • @babel/eslint-parser – parses TypeScript/TSX without the TypeScript compiler API
//   • eslint-plugin-react-hooks – ESLint 10 compatible
//   • @next/eslint-plugin-next – ESLint 10 compatible, no TypeScript dependency
const eslintConfig = defineConfig([
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: [
            "@babel/preset-typescript",
          ],
          plugins: ["@babel/plugin-syntax-jsx"],
        },
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
