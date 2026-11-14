import next from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const config = [
  ...next,
  ...nextTs,
  { ignores: ['.next/**', 'node_modules/**', 'src/generated/**', 'next-env.d.ts'] },
  {
    rules: {
      // Raw HTML injection is banned outside of explicitly reviewed JSON-LD helpers.
      'react/no-danger': 'error',
      'no-restricted-syntax': [
        'error',
        { selector: "CallExpression[callee.property.name='$queryRawUnsafe']", message: 'Use $queryRaw tagged templates (parameterized).' },
        { selector: "CallExpression[callee.property.name='$executeRawUnsafe']", message: 'Use $executeRaw tagged templates (parameterized).' },
      ],
    },
  },
]
export default config
