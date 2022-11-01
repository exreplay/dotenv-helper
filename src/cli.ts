import { Setenver } from '../src/index';

const helper = new Setenver(process.cwd());
helper.run().catch(console.error);
