module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'react', 'jsx-a11y'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  rules: {
    'jsx-a11y/anchor-is-valid': 'off',
    'jsx-a11y/click-events-have-key-events': 'warn',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
    'jsx-a11y/aria-role': 'warn',
    // Ensure controls have accessible labels, including our Button component
    'jsx-a11y/control-has-associated-label': ['error', {
      'labelAttributes': ['aria-label', 'aria-labelledby', 'title'],
      'controlComponents': ['Button', 'IconButton'],
      'depth': 5
    }],
    // Optional: stricter enforcement for aria-label on non-text controls if possible
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
}
