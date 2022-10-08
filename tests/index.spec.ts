import { rename } from 'fs/promises';
import { resolve } from 'path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Setenver } from '../src/index';

const rootPath = resolve(__dirname, './fixtures/monorepo/');

beforeAll(async () => {
  await rename(
    resolve(rootPath, '_.gitignore'),
    resolve(rootPath, '.gitignore')
  );
});

afterAll(async () => {
  await rename(
    resolve(rootPath, '.gitignore'),
    resolve(rootPath, '_.gitignore')
  );
});

describe('test', () => {
  it('should collect files correctly and should ignore folders from .gitignore', async () => {
    const rootEnv = resolve(rootPath, '.env.example');
    const packageEnv = resolve(rootPath, 'packages/test/.env.example');
    const nodeModulesEnv = resolve(rootPath, 'node_modules/test/.env.example');

    const helper = new Setenver(rootPath);
    const files = await helper.collectFiles();

    expect(files).toEqual([rootEnv, packageEnv]);

    expect(files).not.toContain(nodeModulesEnv);
  });

  it('should parse variables correctly', async () => {
    const rootEnv = resolve(rootPath, '.env.example');
    const packageEnv = resolve(rootPath, 'packages/test/.env.example');

    const helper = new Setenver(rootPath);
    const collectedFiles = await helper.collectFiles();
    await helper.parseFiles(collectedFiles);

    expect(helper.files).toEqual({
      [rootEnv]: [
        {
          defaultValue: '# A comment',
          type: 'comment'
        },
        {
          defaultValue: 'localhost',
          key: 'DATABASE_HOST',
          type: 'variable'
        },
        {
          defaultValue: 'admin',
          key: 'DATABASE_USER',
          type: 'variable'
        },
        {
          defaultValue: '',
          key: 'DATABASE_PASSWORD',
          type: 'variable'
        },
        {
          defaultValue: '',
          type: 'new-line'
        }
      ],
      [packageEnv]: [
        {
          defaultValue: 'super_secret_value',
          key: 'JWT_SECRET',
          type: 'variable'
        },
        {
          defaultValue: '',
          type: 'new-line'
        },
        {
          defaultValue: '# Another comment',
          type: 'comment'
        },
        {
          defaultValue: '',
          key: 'ADMIN_SECRET',
          type: 'variable'
        },
        {
          defaultValue: '',
          type: 'new-line'
        }
      ]
    });
  });

  it('should generate questions correctly', async () => {
    const rootEnv = resolve(rootPath, '.env.example');
    const packageEnv = resolve(rootPath, 'packages/test/.env.example');

    const helper = new Setenver(rootPath);
    const collectedFiles = await helper.collectFiles();
    await helper.parseFiles(collectedFiles);
    const questions = helper.generateQuestions();

    expect(questions).toEqual({
      [rootEnv]: [
        {
          initial: 'localhost',
          message: 'DATABASE_HOST',
          name: '1',
          type: 'text'
        },
        {
          initial: 'admin',
          message: 'DATABASE_USER',
          name: '2',
          type: 'text'
        },
        {
          initial: '',
          message: 'DATABASE_PASSWORD',
          name: '3',
          type: 'text'
        }
      ],
      [packageEnv]: [
        {
          initial: 'super_secret_value',
          message: 'JWT_SECRET',
          name: '0',
          type: 'text'
        },
        {
          initial: '',
          message: 'ADMIN_SECRET',
          name: '3',
          type: 'text'
        }
      ]
    });
  });

  it('should set answers correctly', async () => {
    const rootEnv = resolve(rootPath, '.env.example');
    const packageEnv = resolve(rootPath, 'packages/test/.env.example');

    const helper = new Setenver(rootPath);
    const collectedFiles = await helper.collectFiles();
    await helper.parseFiles(collectedFiles);

    helper.setAnswers(rootEnv, {
      1: 'localhost',
      2: 'root',
      3: 'password'
    });

    helper.setAnswers(packageEnv, {
      0: 'super_secret_value',
      3: 'admin_secret'
    });

    expect(helper.files).toEqual({
      [rootEnv]: [
        {
          defaultValue: '# A comment',
          type: 'comment'
        },
        {
          defaultValue: 'localhost',
          value: 'localhost',
          key: 'DATABASE_HOST',
          type: 'variable'
        },
        {
          defaultValue: 'admin',
          value: 'root',
          key: 'DATABASE_USER',
          type: 'variable'
        },
        {
          defaultValue: '',
          value: 'password',
          key: 'DATABASE_PASSWORD',
          type: 'variable'
        },
        {
          defaultValue: '',
          type: 'new-line'
        }
      ],
      [packageEnv]: [
        {
          defaultValue: 'super_secret_value',
          value: 'super_secret_value',
          key: 'JWT_SECRET',
          type: 'variable'
        },
        {
          defaultValue: '',
          type: 'new-line'
        },
        {
          defaultValue: '# Another comment',
          type: 'comment'
        },
        {
          defaultValue: '',
          value: 'admin_secret',
          key: 'ADMIN_SECRET',
          type: 'variable'
        },
        {
          defaultValue: '',
          type: 'new-line'
        }
      ]
    });
  });

  it('should prepare env file contents correctly', async () => {
    const rootEnv = resolve(rootPath, '.env.example');
    const packageEnv = resolve(rootPath, 'packages/test/.env.example');

    const helper = new Setenver(rootPath);
    const collectedFiles = await helper.collectFiles();
    await helper.parseFiles(collectedFiles);

    helper.setAnswers(rootEnv, {
      1: 'localhost',
      2: 'root',
      3: 'password'
    });

    helper.setAnswers(packageEnv, {
      0: 'super_secret_value',
      3: 'admin_secret'
    });

    const files = helper.prepareEnvFilesContent();

    expect(files).toEqual([
      {
        file: rootEnv.replace('.example', ''),
        contents: `# A comment
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=password

`
      },
      {
        file: packageEnv.replace('.example', ''),
        contents: `JWT_SECRET=super_secret_value

# Another comment
ADMIN_SECRET=admin_secret

`
      }
    ]);
  });
});
