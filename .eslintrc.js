// @ts-check
/** @type {import('eslint').Linter.Config} */
module.exports = {
  parserOptions: {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    project: './tsconfig.eslint.json'
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.eslint.json'
      }
    }
  },
  extends: ['@averjs']
};
