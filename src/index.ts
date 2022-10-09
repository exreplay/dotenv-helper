import { readFile, writeFile, access } from 'fs/promises';
import { constants } from 'fs';
import { globbySync } from 'globby';
import { relative, resolve } from 'path';
import prompts, { PromptObject, Answers } from 'prompts';
import { Files, Variable, VariableType } from './types';
import mri from 'mri';

export class Setenver {
  root: string;
  files: Files = {};

  noGitignore = true;

  constructor(root: string) {
    this.root = root;

    const argv = mri(process.argv.slice(2));

    if (argv.gitignore === false) {
      this.noGitignore = true;
    }
  }

  async parseGitignore() {
    const gitignore = resolve(this.root, '.gitignore');

    try {
      await access(gitignore, constants.F_OK);
    } catch {
      return [];
    }

    const content = await readFile(gitignore, 'utf-8');
    const lines = content.split('\n');
    const files = lines
      .filter((line) => !line.startsWith('#'))
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return files;
  }

  async collectFiles() {
    const gitignoreFiles = this.noGitignore ? await this.parseGitignore() : [];
    return globbySync(`${this.root}/**/.env.example`, {
      ignore: gitignoreFiles
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

  async selectFiles() {
    const collectedFiles = await this.collectFiles();

    const { files } = await prompts({
      type: 'multiselect',
      name: 'files',
      message: 'Select files to parse',
      choices: collectedFiles.map((file) => ({
        title: relative(this.root, file),
        value: file,
        selected: true
      }))
    });

    return files as string[];
  }

  async parseFiles(files: string[]) {
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

  async execute() {
    const selectedFiles = await this.selectFiles();
    if (!selectedFiles.length) {
      console.log('No files selected. Exiting...');
      return;
    }

    await this.parseFiles(selectedFiles);

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
