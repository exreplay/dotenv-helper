import { DotenvHelper } from '../src/index';

const helper = new DotenvHelper(process.cwd());
helper.execute().catch(console.error);
