import { Setenver } from '../src/index';

const helper = new Setenver(process.cwd());
helper.execute().catch(console.error);
