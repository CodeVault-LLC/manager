// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
// @ts-ignore
import importPlugin from "eslint-plugin-import";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginTailwindCSS from "eslint-plugin-tailwindcss";
import reacthooks from "eslint-plugin-react-hooks";
import eslintReact from "eslint-plugin-react";

import platformPlugins from "./libs/eslint/platform/index.mjs";

export default tseslint.config(
  {
    // Everything in this config object targets our TypeScript files (Components, Directives, Pipes etc)
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      //...tseslint.configs.stylistic,
      importPlugin.flatConfigs.recommended,
      importPlugin.flatConfigs.typescript,

      eslintConfigPrettier, // Disables rules that conflict with Prettier
    ],
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    plugins: {
      "@codevault/platform": platformPlugins,
      "react-hooks": reacthooks,
      react: eslintReact,
    },

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: "./",
        sourceType: "module",
        ecmaVersion: "latest",
        ecmaFeatures: {
          jsx: true,
        },
      },
      // This is the default, but we are being explicit here
      globals: {
        module: "readonly",
        process: "readonly",
        require: "readonly",
      },
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts"],
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
    rules: {
      "@codevault/platform/required-using": "error",
      "@codevault/platform/no-enums": "error",
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        { accessibility: "no-public" },
      ],
      "@typescript-eslint/no-explicit-any": "off", // TODO: This should be re-enabled
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: false },
      ],
      "@typescript-eslint/no-this-alias": ["error", { allowedNames: ["self"] }],
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowTernary: true },
      ],
      "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],

      curly: "off",
      "no-console": "error",

      "import/order": "off",

      "import/namespace": ["off"], // This doesn't resolve namespace imports correctly, but TS will throw for this anyway
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: ["libs/**/*"],
              from: ["apps/**/*"],
              message: "Libs should not import app-specific code.",
            },
            {
              // avoid specific frameworks or large dependencies in common
              target: "./libs/common/**/*",
              from: [
                // Node
                "./libs/node/**/*",

                //Generator
                "./libs/tools/generator/components/**/*",
                "./libs/tools/generator/core/**/*",
                "./libs/tools/generator/extensions/**/*",

                // Import/export
                "./libs/importer/**/*",
                "./libs/tools/export/vault-export/vault-export-core/**/*",
              ],
            },
            {
              // avoid import of unexported state objects
              target: [
                "!(libs)/**/*",
                "libs/!(common)/**/*",
                "libs/common/!(src)/**/*",
                "libs/common/src/!(platform)/**/*",
                "libs/common/src/platform/!(state)/**/*",
              ],
              from: ["./libs/common/src/platform/state/**/*"],
              // allow module index import
              except: ["**/state/index.ts"],
            },
          ],
        },
      ],
      "import/no-unresolved": "off", // TODO: Look into turning off once each package is an actual package.,
    },
  },
  {
    // Everything in this config object targets our HTML files (external templates,
    // and inline templates as long as we have the `processor` set on our TypeScript config above)
    files: ["**/*.html"],
    extends: [
      // Apply the recommended Angular template rules
      // ...angular.configs.templateRecommended,
      // Apply the Angular template rules which focus on accessibility of our apps
      // ...angular.configs.templateAccessibility,
    ],
    plugins: {
      tailwindcss: eslintPluginTailwindCSS,
    },
    rules: {
      "tailwindcss/no-custom-classname": [
        "error",
        {
          // uses negative lookahead to whitelist any class that doesn't start with "tw-"
          // in other words: classnames that start with tw- must be valid TailwindCSS classes
          whitelist: ["(?!(tw)\\-).*"],
        },
      ],
      "tailwindcss/enforces-negative-arbitrary-values": "error",
      "tailwindcss/enforces-shorthand": "error",
      "tailwindcss/no-contradicting-classname": "error",
    },
  },

  // Global quirks
  {
    files: ["apps/browser/src/**/*.ts", "libs/**/*.ts"],
    ignores: [
      "apps/browser/src/autofill/{deprecated/content,content,notification}/**/*.ts",
      "apps/browser/src/**/background/**/*.ts", // It's okay to have long lived listeners in the background
      "apps/browser/src/platform/background.ts",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          message:
            "Using addListener in the browser popup produces a memory leak in Safari, use `BrowserApi.addListener` instead",
          // This selector covers events like chrome.storage.onChange & chrome.runtime.onMessage
          selector:
            "CallExpression > [object.object.object.name='chrome'][property.name='addListener']",
        },
        {
          message:
            "Using addListener in the browser popup produces a memory leak in Safari, use `BrowserApi.addListener` instead",
          // This selector covers events like chrome.storage.local.onChange
          selector:
            "CallExpression > [object.object.object.object.name='chrome'][property.name='addListener']",
        },
      ],
    },
  },
  {
    files: ["**/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports(),
    },
  },

  // App overrides. Be considerate if you override these.
  {
    files: ["apps/**/*.ts"],
    rules: {
      // Catches static imports
      "no-restricted-imports": buildNoRestrictedImports([
        "bitwarden_license/**",
        "@bitwarden/bit-common/*",
        "@bitwarden/bit-web/*",
      ]),
    },
  },

  /// Bandaids for keeping existing circular dependencies from getting worse and new ones from being created
  /// Will be removed after Nx is implemented and existing circular dependencies are removed.
  {
    files: ["libs/common/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // Common is at the base level - should not import from other libs except shared
        "@bitwarden/admin-console",
        "@bitwarden/angular",
        "@bitwarden/auth",
        "@bitwarden/billing",
        "@bitwarden/components",
        "@bitwarden/importer",
        "@bitwarden/key-management",
        "@bitwarden/key-management-ui",
        "@bitwarden/node",
        "@bitwarden/platform",
        "@bitwarden/tools",
        "@bitwarden/ui",
        "@bitwarden/vault",
      ]),
    },
  },
  {
    files: ["libs/shared/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // Shared shouldnt have deps
        "@bitwarden/admin-console",
        "@bitwarden/angular",
        "@bitwarden/auth",
        "@bitwarden/billing",
        "@bitwarden/common",
        "@bitwarden/components",
        "@bitwarden/importer",
        "@bitwarden/key-management",
        "@bitwarden/key-management-ui",
        "@bitwarden/node",
        "@bitwarden/platform",
        "@bitwarden/tools",
        "@bitwarden/ui",
        "@bitwarden/vault",
      ]),
    },
  },
  {
    files: ["libs/auth/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // Auth can only depend on common, shared, angular, node, platform, eslint
        "@bitwarden/admin-console",
        "@bitwarden/billing",
        "@bitwarden/components",
        "@bitwarden/importer",
        "@bitwarden/key-management-ui",
        "@bitwarden/tools",
        "@bitwarden/ui",
        "@bitwarden/vault",
      ]),
    },
  },
  {
    files: ["libs/key-management/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // Key management can depend on common, node, angular, components, eslint, platform, ui
        "@bitwarden/auth",
        "@bitwarden/admin-console",
        "@bitwarden/billing",
        "@bitwarden/importer",
        "@bitwarden/key-management-ui",
        "@bitwarden/tools",
        "@bitwarden/vault",
      ]),
    },
  },
  {
    files: ["libs/billing/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // Billing can depend on auth, common, angular, components, eslint, node, platform, ui
        "@bitwarden/admin-console",
        "@bitwarden/importer",
        "@bitwarden/key-management-ui",
        "@bitwarden/tools",
        "@bitwarden/vault",
      ]),
    },
  },
  {
    files: ["libs/components/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // Components can depend on common, shared
        "@bitwarden/admin-console",
        "@bitwarden/auth",
        "@bitwarden/billing",
        "@bitwarden/eslint",
        "@bitwarden/importer",
        "@bitwarden/key-management-ui",
        "@bitwarden/node",
        "@bitwarden/tools",
        "@bitwarden/vault",
      ]),
    },
  },
  {
    files: ["libs/ui/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // UI can depend on common, shared, auth
        "@bitwarden/admin-console",
        "@bitwarden/billing",
        "@bitwarden/importer",
        "@bitwarden/key-management-ui",
        "@bitwarden/node",
        "@bitwarden/platform",
        "@bitwarden/tools",
        "@bitwarden/vault",
      ]),
    },
  },
  {
    files: ["libs/key-management-ui/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // Key-management-ui can depend on key-management, common, angular, shared, auth, components, ui, eslint
        "@bitwarden/admin-console",
        "@bitwarden/billing",
        "@bitwarden/importer",
        "@bitwarden/node",
        "@bitwarden/platform",
        "@bitwarden/tools",
        "@bitwarden/vault",
      ]),
    },
  },
  {
    files: ["libs/angular/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // Angular can depend on common, shared, components, ui
        "@bitwarden/admin-console",
        "@bitwarden/auth",
        "@bitwarden/billing",
        "@bitwarden/importer",
        "@bitwarden/key-management-ui",
        "@bitwarden/node",
        "@bitwarden/platform",
        "@bitwarden/tools",
        "@bitwarden/vault",
      ]),
    },
  },
  {
    files: ["libs/vault/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // Vault can depend on most libs
        "@bitwarden/admin-console",
        "@bitwarden/importer",
        "@bitwarden/tools",
      ]),
    },
  },
  {
    files: ["libs/admin-console/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // Admin console can depend on all libs
      ]),
    },
  },
  {
    files: ["libs/tools/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // Tools can depend on most libs
        "@bitwarden/admin-console",
      ]),
    },
  },
  {
    files: ["libs/platform/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // Platform cant depend on most libs
        "@bitwarden/admin-console",
        "@bitwarden/auth",
        "@bitwarden/billing",
        "@bitwarden/importer",
        "@bitwarden/key-management",
        "@bitwarden/key-management-ui",
        "@bitwarden/tools",
        "@bitwarden/vault",
      ]),
    },
  },
  {
    files: ["libs/importer/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // Importer can depend on most libs but not other domain libs
        "@bitwarden/admin-console",
        "@bitwarden/tools",
      ]),
    },
  },
  {
    files: ["libs/eslint/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // ESLint should not depend on app code
        "@bitwarden/admin-console",
        "@bitwarden/angular",
        "@bitwarden/auth",
        "@bitwarden/billing",
        "@bitwarden/components",
        "@bitwarden/importer",
        "@bitwarden/key-management",
        "@bitwarden/key-management-ui",
        "@bitwarden/node",
        "@bitwarden/platform",
        "@bitwarden/tools",
        "@bitwarden/ui",
        "@bitwarden/vault",
      ]),
    },
  },
  {
    files: ["libs/node/src/**/*.ts"],
    rules: {
      "no-restricted-imports": buildNoRestrictedImports([
        // Node can depend on common, shared, auth
        "@bitwarden/admin-console",
        "@bitwarden/angular",
        "@bitwarden/components",
        "@bitwarden/importer",
        "@bitwarden/key-management-ui",
        "@bitwarden/platform",
        "@bitwarden/tools",
        "@bitwarden/ui",
        "@bitwarden/vault",
      ]),
    },
  },

  /// Team overrides
  {
    files: [
      "apps/cli/src/admin-console/**/*.ts",
      "apps/web/src/app/admin-console/**/*.ts",
      "bitwarden_license/bit-cli/src/admin-console/**/*.ts",
      "bitwarden_license/bit-web/src/app/admin-console/**/*.ts",
      "libs/admin-console/src/**/*.ts",
    ],
    rules: {
      "@angular-eslint/component-class-suffix": "error",
      "@angular-eslint/contextual-lifecycle": "error",
      "@angular-eslint/directive-class-suffix": "error",
      "@angular-eslint/no-empty-lifecycle-method": "error",
      "@angular-eslint/no-input-rename": "error",
      "@angular-eslint/no-inputs-metadata-property": "error",
      "@angular-eslint/no-output-native": "error",
      "@angular-eslint/no-output-on-prefix": "error",
      "@angular-eslint/no-output-rename": "error",
      "@angular-eslint/no-outputs-metadata-property": "error",
      "@angular-eslint/use-lifecycle-interface": "error",
      "@angular-eslint/use-pipe-transform-interface": "error",
    },
  },
  {
    files: ["libs/common/src/state-migrations/**/*.ts"],
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          basePath: "libs/common/src/state-migrations",
          zones: [
            {
              target: "./",
              from: "../",
              // Relative to from, not basePath
              except: ["state-migrations"],
              message:
                "State migrations should rarely import from the greater codebase. If you need to import from another location, take into account the likelihood of change in that code and consider copying to the migration instead.",
            },
          ],
        },
      ],
    },
  },

  // Keep ignores at the end
  {
    ignores: [
      "**/build/",
      "**/dist/",
      "**/coverage/",
      ".angular/",
      "storybook-static/",

      "**/node_modules/",

      "**/webpack.*.js",
      "**/jest.config.js",

      "apps/browser/config/config.js",
      "apps/browser/src/auth/scripts/duo.js",
      "apps/browser/webpack/manifest.js",

      "apps/desktop/desktop_native",
      "apps/desktop/src/auth/scripts/duo.js",

      "apps/web/config.js",
      "apps/web/scripts/*.js",
      "apps/web/tailwind.config.js",

      "apps/cli/config/config.js",

      "tailwind.config.js",
      "libs/components/tailwind.config.base.js",
      "libs/components/tailwind.config.js",

      "scripts/*.js",
    ],
  }
);

/**
 * // Helper function for building no-restricted-imports rule
 * @param {string[]} additionalForbiddenPatterns
 * @returns {any}
 */
function buildNoRestrictedImports(
  additionalForbiddenPatterns = [],
  skipPlatform = false
) {
  return [
    "error",
    {
      patterns: [
        ...(skipPlatform
          ? []
          : ["**/platform/**/internal", "**/platform/messaging/**"]),
        "**/src/**/*", // Prevent relative imports across libs.
      ].concat(additionalForbiddenPatterns),
    },
  ];
}
