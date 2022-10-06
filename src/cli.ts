import { Envmate } from '../src/index';

const helper = new Envmate(process.cwd());
helper.execute().catch(console.error);
