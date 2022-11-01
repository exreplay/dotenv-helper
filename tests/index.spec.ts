import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { Setenver } from '../src';
import { rootPath } from './setup';

const consoleLog = console.log;
const argv = process.argv;

vi.mock('setenver/package.json', () => ({
  version: '1.0.0'
}));

describe('setenver', () => {
  const mockLog = vi.fn();

  beforeEach(() => {
    console.log = mockLog;
  });

  afterEach(() => {
    console.log = consoleLog;
    process.argv = argv;
    vi.clearAllMocks();
  });

  it('should execute command correctly', async () => {
    process.argv = ['pnpm', 'dlx', 'setenver', 'version'];

    const setenver = new Setenver(rootPath);
    await setenver.run();

    expect(mockLog.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "
      ",
        ],
        [
          "setenver [36mv1.0.0[39m",
        ],
        [
          "
      ",
        ],
      ]
    `);
  });

  it('should execute usage command when nothing is passed', async () => {
    const setenver = new Setenver(rootPath);
    await setenver.run();

    expect(mockLog.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "
      ",
        ],
        [
          "Usage: setenver [36musage|examples|version[39m [args]

      Use [36msetenver [command] --help[39m to see help for a command.",
        ],
        [
          "
      ",
        ],
      ]
    `);
  });
});
