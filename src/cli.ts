import { SetEnvHelper } from '../src/index';

const helper = new SetEnvHelper(process.cwd());
helper.execute().catch(console.error);
