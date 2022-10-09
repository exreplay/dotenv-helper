# setenver

When setting up a new project (e.g. a monorepo) you have to look in every package if there is a `.env.example`, copy the file, rename it to `.env` and update its content.

To fix this problem, this package walks through your project, collects all the `.env.example` files, gives you a prompt for every variable and writes the `.env` files when you are done. 

## How to use

Just use the execute command from your prefered package manager.

```bash
# npm
$ npx setenver

# yarn
$ yarn dlx setenver

# pnpm
$ pnpm dlx setenver
```

## Arguments

### --no-gitignore

default: `false`

By default, we parse the .gitignore inside the root folder and use it to exclude files and folders. You can use this argument to disable that behavior. 

