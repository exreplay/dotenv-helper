# setenver

This package aims to provide a set of helpful commands to interact with `.env` files.

## How to use

Just use the execute command from your prefered package manager.

```bash
# npm
$ npx setenver [command]

# yarn
$ yarn dlx setenver [command]

# pnpm
$ pnpm dlx setenver [command]
```

## Commands

### `usage`

Show usage information

### `version`

Show the current version of `setenver`

### `examples`

When setting up a new project (e.g. a monorepo) you have to look in every package if there is a `.env.example`, copy the file, rename it to `.env` and update its content.

To fix this problem, this command walks through your project, collects all the `.env.example` files, gives you a prompt for every variable and writes the `.env` files when you are done. 

### Arguments

**--no-gitignore**

default: `false`

By default, we parse the .gitignore inside the root folder and use it to exclude files and folders. You can use this argument to disable that behavior. 

