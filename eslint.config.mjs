import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

/**
 * Flat config. `eslint-config-next` v16 ships native flat configs, so
 * they are spread directly — routing them through `FlatCompat` breaks
 * on a circular reference in the plugin object.
 */
const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'next-env.d.ts',
      // Emitted for AI tooling by `next dev`, not source.
      'AGENTS.md',
      'CLAUDE.md',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // The site pre-encodes every image at the exact widths its layouts
      // request and exports statically, so there is no optimizer for
      // `next/image` to call. Plain `<img>` inside `<picture>` is the
      // correct primitive here, and is used deliberately.
      '@next/next/no-img-element': 'off',
    },
  },
];

export default eslintConfig;
