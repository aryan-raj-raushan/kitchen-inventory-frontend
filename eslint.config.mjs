import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Async setState via .then() in effects is intentional, not a synchronous side effect.
      "react-hooks/set-state-in-effect": "off",
      // Allow explicit any in low-level lib wrappers (apiResponse, withAuth).
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);

export default eslintConfig;
