module.exports = {
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig-server.json'],
    tsconfigRootDir: __dirname
  },
  env: {
    'jest/globals': true
  },
  plugins: ['prettier', 'jest'],
  extends: ['kotori/auto', 'prettier', 'prettier/@typescript-eslint'],
  rules: {
    'no-duplicate-imports': 'off',
    'react/display-name': 'off',
    'prettier/prettier': 'error',
    '@typescript-eslint/no-empty-interface': 'error'
  }
};
