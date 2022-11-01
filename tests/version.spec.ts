import { describe, it, expect, vi, afterEach } from 'vitest';
import { VersionCommand } from '../src/commands/version';

vi.mock('setenver/package.json', () => ({
  version: '1.0.0'
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('version command', () => {
  it('should show help correctly', async () => {
    const command = new VersionCommand();
    command.argv = { _: [], help: true };
    await command.run();

    expect(command.sections).toMatchInlineSnapshot(`
      [
        "Usage: setenver [36mversion[39m [args]",
        "Prints the current version of setenver",
      ]
    `);
  });

  it('should print version correctly', async () => {
    const command = new VersionCommand();
    await command.run();

    expect(command.sections).toMatchInlineSnapshot(`
      [
        "setenver [36mv1.0.0[39m",
      ]
    `);
  });
});
