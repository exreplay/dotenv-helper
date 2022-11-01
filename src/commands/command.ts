import { cyan } from 'colorette';
import mri, { Argv } from 'mri';

/**
 * Base interface for all commands
 **/
export interface CommandInterface {
  // The name of the command
  name: string;

  // The description of the command. Is also used as the help text.
  description: string;

  /**
   * Check if the command should be run. If there is additional logic to determine if the command should be run, it should be implemented here.
   *
   * @returns Whether the command should run
   **/
  shouldRun?(): boolean;

  /**
   * Run the command.
   *
   * @returns A promise that resolves when the command is done
   * @throws An error if the command fails
   **/
  run(): Promise<boolean>;

  /**
   * Logic to run after the command is done.
   *
   * @returns A promise that resolves when the command is done
   * @throws An error if the command fails
   **/
  afterRun?(): Promise<void>;
}

/**
 * Base class for all commands. It provides the args and a run function which handles the help flag.
 **/
export class Command implements CommandInterface {
  name: string;
  description: string;

  argv: Argv;
  /**
   * Sections to print after the command is done.
   **/
  sections: string[] = [];

  constructor() {
    this.argv = mri(process.argv.slice(2));
  }

  shouldRun() {
    return this.argv._.includes(this.name);
  }

  /**
   * Run the command. The super.run() function should be called first to handle the help flag.
   * This can be done by adding a guard at the start of the run method like this:
   *
   * if (!(await super.run())) return;
   *
   * @returns Whether the command should continue
   **/
  // eslint-disable-next-line @typescript-eslint/require-await
  async run() {
    if (this.argv.help) {
      this.help();
      return false;
    }
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async afterRun() {
    if (this.sections.length) {
      console.log('\n');
      console.log(this.sections.join('\n\n'));
      console.log('\n');
    }
  }

  /**
   * Print the help text for the current command
   **/
  help() {
    this.sections.push(`Usage: setenver ${cyan(this.name)} [args]`);
    this.sections.push(this.description);
  }
}
