import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
   {
      files: ["**/*.{js,mjs,cjs}"],
      languageOptions: {
         globals: globals.node,ZS
      },
      rules: {
         quotes: ["error", "double", { avoidEscape: true }],
         indent: ["error", 3],
         semi: ["error", "always"],
         "no-multi-spaces": ["error"],
      },
   },
]);
