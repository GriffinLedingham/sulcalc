"use strict";

const tsRecommended = require("@typescript-eslint/eslint-plugin/dist/configs/recommended");
const tsPrettier = require("eslint-config-prettier/@typescript-eslint");

module.exports = {
  root: true,
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2019,
    sourceType: "script"
  },
  env: {
    es6: true,
    node: true
  },
  plugins: ["promise", "vue"],
  extends: [
    "eslint:recommended",
    "plugin:vue/recommended",
    "plugin:promise/recommended",
    "prettier/vue",
    "prettier"
  ],
  rules: {
    "promise/no-callback-in-promise": "error",
    "promise/no-nesting": "error",
    "promise/no-promise-in-callback": "error",
    "promise/no-return-in-finally": "error",
    "promise/prefer-await-to-callbacks": "error",
    "promise/prefer-await-to-then": "error",
    "promise/valid-params": "error",

    "accessor-pairs": "error",
    "class-methods-use-this": "error",
    "default-case": "error",
    eqeqeq: ["error", "always", { null: "ignore" }],
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],
    "line-comment-position": "error",
    "max-depth": ["error", 3],
    "no-alert": "error",
    "no-async-promise-executor": "error",
    "no-await-in-loop": "error",
    "no-buffer-constructor": "error",
    "no-else-return": "error",
    "no-eval": "error",
    "no-extend-native": "error",
    "no-extra-bind": "error",
    "no-extra-label": "error",
    "no-global-assign": "error",
    "no-implicit-coercion": "error",
    "no-implicit-globals": "error",
    "no-implied-eval": "error",
    "no-label-var": "error",
    "no-lonely-if": "error",
    "no-misleading-character-class": "error",
    "no-mixed-requires": "error",
    "no-multi-str": "error",
    "no-negated-condition": "error",
    "no-new": "error",
    "no-new-func": "error",
    "no-new-require": "error",
    "no-new-object": "error",
    "no-new-wrappers": "error",
    "no-octal-escape": "error",
    "no-path-concat": "error",
    "no-proto": "error",
    "no-prototype-builtins": "error",
    "no-return-assign": ["error", "always"],
    "no-return-await": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-shadow-restricted-names": "error",
    "no-sync": "error",
    "no-template-curly-in-string": "error",
    "no-throw-literal": "error",
    "no-unmodified-loop-condition": "error",
    "no-unneeded-ternary": "error",
    "no-unsafe-negation": "error",
    "no-unused-expressions": "error",
    "no-useless-call": "error",
    "no-useless-catch": "error",
    "no-useless-concat": "error",
    "no-useless-rename": "error",
    "no-useless-return": "error",
    "no-var": "error",
    "no-void": "error",
    "no-warning-comments": "error",
    "no-with": "error",
    "object-shorthand": "error",
    "operator-assignment": "error",
    "prefer-arrow-callback": "error",
    "prefer-const": "error",
    "prefer-numeric-literals": "error",
    "prefer-object-spread": "error",
    "prefer-promise-reject-errors": "error",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "prefer-template": "error",
    radix: "error",
    "require-atomic-updates": "error",
    "require-await": "error",
    "sort-imports": ["error", { ignoreDeclarationSort: true }],
    strict: "error",
    "symbol-description": "error"
  },
  overrides: [
    {
      // typescript
      files: "**/*.ts",
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: "."
      },
      plugins: ["@typescript-eslint"],
      rules: {
        ...tsRecommended.rules,
        ...tsPrettier.rules,
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/member-ordering": [
          "error",
          {
            default: [
              "field",
              "constructor",
              "instance-method",
              "static-method"
            ]
          }
        ],
        "@typescript-eslint/no-extraneous-class": "error",
        "@typescript-eslint/no-for-in-array": "error",
        "@typescript-eslint/no-this-alias": [
          "error",
          {
            allowDestructuring: true,
            allowedNames: ["self"]
          }
        ],
        "@typescript-eslint/no-unnecessary-qualifier": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
        "@typescript-eslint/no-use-before-define": ["error", "nofunc"],
        "@typescript-eslint/no-useless-constructor": "error",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/unified-signatures": "error"
      }
    },
    {
      // module parsing goal
      files: "{app,scripts,src}/**/*",
      parserOptions: { sourceType: "module" }
    },
    {
      // jest unit tests
      files: "**/*.test.*",
      env: { jest: true }
    },
    {
      // browser globals
      files: "app/**/*",
      env: { browser: true }
    },
    {
      // console access
      files: "scripts/**/*",
      rules: { "no-console": "off" }
    },
    {
      // not node.js, but needs access to process
      files: "{app,src}/**/*",
      env: { node: false },
      globals: { process: false }
    }
  ]
};
