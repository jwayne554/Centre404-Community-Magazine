import tseslint from "typescript-eslint";

// ESLint 9 flat config for Next.js
export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      "**/*.config.js",
      "**/*.config.mjs",
      "scripts/**/*.js",
      "prisma/**/*.js",
      // Prototype reference files (not part of actual application)
      "Mirrorful File/**",
      "Mirrorful File (1)/**",
      // Old/backup files
      "**/*-old.tsx",
      "**/*-old.ts",
    ],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ...tseslint.configs.recommended[0],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
    },
    rules: {
      // Next.js specific rules
      "@next/next/no-html-link-for-pages": "off",
      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // General rules
      "prefer-const": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
