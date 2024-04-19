import jsdoc from "eslint-plugin-jsdoc";
import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ['dist/'],
  },
  js.configs.recommended,
  jsdoc.configs["flat/recommended"],
  {
    plugins: {
      jsdoc: jsdoc,
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "jsdoc/require-param-description": 0,
      "jsdoc/require-returns-description": 0,
    },
  },
];
