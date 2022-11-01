import { describe, it, expect } from 'vitest';
import { Command } from '../src/commands/command';
import { UsageCommand } from '../src/commands/usage';

describe('usage command', () => {
  it('should show help correctly', async () => {
    const command = new UsageCommand([]);
    command.argv = { _: [], help: true };
    await command.run();

    expect(command.sections).toMatchInlineSnapshot(`
      [
        "Usage: setenver [36musage[39m [args]",
        "Show usage information (default)",
      ]
    `);
  });

  it('should print usage information correctly', async () => {
    const hello = new Command();
    hello.name = 'hello';

    const world = new Command();
    world.name = 'world';

    const commands = [hello, world];
    const command = new UsageCommand(commands);
    await command.run();

    expect(command.sections).toMatchInlineSnapshot(`
      [
        "Usage: setenver [36mhello|world[39m [args]",
        "Use [36msetenver [command] --help[39m to see help for a command.",
      ]
    `);
  });
});
