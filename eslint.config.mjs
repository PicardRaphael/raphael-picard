import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: [
      'next',
      'next/core-web-vitals',
      'next/typescript',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ],
  }),
];

export default eslintConfig;
module.exports = {
  extends: [
    'next',
    'next/core-web-vitals',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['react', '@typescript-eslint', 'prettier'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  ignores: [
    "*/**.js",
    "*.js",
    "zod",
    "*/**.mjs",
    "next-env.d.ts",
    ".next",
    ".vercel",
    ".vscode",
    "tailwind.config.js",
    "eslint.config.mjs",
    "**/worker.js",
  ],

};
