import { resolve } from 'path';

export const rootPath = resolve(__dirname, './fixtures/monorepo/');
export const rootEnv = resolve(rootPath, '.env.example');
export const packageEnv = resolve(rootPath, 'packages/test/.env.example');
export const nodeModulesRootEnv = resolve(
  rootPath,
  'node_modules/test/.env.example'
);
export const nodeModulesPackageEnv = resolve(
  rootPath,
  'packages/test/node_modules/another_test/.env.example'
);

