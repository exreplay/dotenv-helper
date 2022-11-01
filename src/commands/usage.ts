import { cyan } from 'colorette';
import { Command, CommandInterface } from './command';

export class UsageCommand extends Command implements CommandInterface {
  name = 'usage';
  description = 'Show usage information (default)';

  commands: Command[];

  constructor(commands: Command[]) {
    super();
    this.commands = commands;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async run() {
    if (!(await super.run())) return;

    this.sections.push(
      `Usage: setenver ${cyan(
        this.commands.map((c) => c.name).join('|')
      )} [args]`
    );

    this.sections.push(
      `Use ${cyan('setenver [command] --help')} to see help for a command.`
    );

    return true;
  }
}
