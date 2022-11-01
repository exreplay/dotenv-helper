import { Command } from './commands/command';
import { ExamplesCommand } from './commands/examples';
import { UsageCommand } from './commands/usage';
import { VersionCommand } from './commands/version';

export class Setenver {
  root: string;
  usage: UsageCommand;
  commands: Command[] = [];

  constructor(root: string) {
    this.root = root;

    this.commands.push(new UsageCommand(this.commands));
    this.commands.push(new ExamplesCommand(root));
    this.commands.push(new VersionCommand());
  }

  async executeCommand(command: Command) {
    await command.run();
    await command.afterRun?.();
  }

  async run() {
    for (const command of this.commands) {
      if (command.shouldRun()) {
        await this.executeCommand(command);
        return;
      }
    }

    await this.executeCommand(this.commands.find((c) => c.name === 'usage'));
  }
}
