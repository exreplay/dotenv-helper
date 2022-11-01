import { Command, CommandInterface } from './command';
import { cyan } from 'colorette';

export class VersionCommand extends Command implements CommandInterface {
  name = 'version';
  description = 'Prints the current version of setenver';

  async run() {
    if (!(await super.run())) return;

    // @ts-expect-error - TS cannot resolve the package.json file
    // eslint-disable-next-line import/no-unresolved
    const pkg = await import('setenver/package.json');

    this.sections.push(`setenver ${cyan(`v${pkg.version}`)}`);

    return true;
  }
}
