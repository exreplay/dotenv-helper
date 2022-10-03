import { readFile, writeFile } from 'fs/promises';
import { globbySync } from 'globby';
import { relative } from 'path';
import prompts, { PromptObject, Answers } from 'prompts';
import { Files, Variable, VariableType } from './types';

export class DotenvHelper {
  root: string;
  files: Files = {};

  constructor(root: string) {
    this.root = root;
  }

  collectFiles() {
    return globbySync(`${this.root}/**/.env.example`, {
      ignore: ['**/node_modules/**']
    });
  }

  parseContent(content: string) {
    const lines = content.split('\n');
    const variables: Variable[] = [];

    for (const line of lines) {
      if (line.startsWith('#')) {
        variables.push({
          defaultValue: line,
          type: VariableType.COMMENT
        });
      } else if (line === '') {
        variables.push({
          defaultValue: line,
          type: VariableType.NEW_LINE
        });
      } else {
        const [variable, value] = line.split('=');

        variables.push({
          key: variable,
          defaultValue: value,
          type: VariableType.VARIABLE
        });
      }
    }

    return variables;
  }

  async parseFiles() {
    const files = this.collectFiles();

    for (const file of files) {
      const content = await readFile(file, 'utf-8');
      this.files[file] = this.parseContent(content);
    }
  }

  generateQuestions() {
    const questions: { [filename: string]: PromptObject[] | undefined } = {};

    for (const [file, variables] of Object.entries(this.files)) {
      for (let i = 0; i < variables.length; i++) {
        const variable = variables[i];
        if (variable.type !== VariableType.VARIABLE) continue;

        if (!questions[file]) questions[file] = [];

        questions[file].push({
          type: 'text',
          name: i.toString(),
          message: variable.key,
          initial: variable.defaultValue
        });
      }
    }

    return questions;
  }

  setAnswers(file: string, answers: Answers<string>) {
    for (const [key, answer] of Object.entries(answers)) {
      const parsedKey = parseInt(key, 10);

      if (this.files[file][parsedKey]) {
        this.files[file][parsedKey].value = answer;
      }
    }
  }

  prepareEnvFilesContent() {
    const files: { file: string; contents: string }[] = [];

    for (const [file, variables] of Object.entries(this.files)) {
      let fileContent = '';

      for (const variable of variables) {
        if (variable.type === VariableType.VARIABLE) {
          fileContent += `${variable.key}=${
            variable.value || variable.defaultValue
          }\n`;
        } else if (variable.type === VariableType.COMMENT) {
          fileContent += `${variable.defaultValue}\n`;
        } else if (variable.type === VariableType.NEW_LINE) {
          fileContent += '\n';
        }
      }

      files.push({
        file: file.replace('.example', ''),
        contents: fileContent
      });
    }

    return files;
  }

  async displayFoundFiles() {
    console.log('Found the following .env.example files:');

    for (const [file] of Object.entries(this.files)) {
      console.log(`- ${relative(this.root, file)}`);
    }

    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: 'Do you want to continue?',
      initial: true
    });

    return confirm;
  }

  async execute() {
    await this.parseFiles();

    await this.displayFoundFiles();

    if (!confirm) {
      console.log('Aborting...');
      return;
    }

    const questions = this.generateQuestions();
    for (const [file, question] of Object.entries(questions)) {
      if (question) {
        console.log(relative(this.root, file));

        const answers = await prompts(question, {
          onCancel: () => process.exit(0)
        });

        this.setAnswers(file, answers);
      }
    }

    const files = this.prepareEnvFilesContent();
    for (const { file, contents } of files) {
      await writeFile(file, contents);
    }

    return this.root;
  }
}
