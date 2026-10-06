import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
export default defineConfig([
  ...nextVitals, ...nextTypescript,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  { rules: { "@typescript-eslint/no-explicit-any": "off", "@next/next/no-img-element": "off",
    // Compiler optimization diagnostics are advisory while React Compiler is not enabled.
    // Hook ordering and dependency rules remain active.
    "react-hooks/set-state-in-effect": "warn",
    "react-hooks/purity": "warn",
    "react-hooks/preserve-manual-memoization": "warn" } },
]);
