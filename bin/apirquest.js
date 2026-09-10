#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

import { startMenu } from '../src/menu.js';
import { addCommand } from '../src/commands/add.js';
import { listCommand } from '../src/commands/list.js';
import { getCommand } from '../src/commands/get.js';
import { runCommand } from '../src/commands/run.js';
import { deleteCommand } from '../src/commands/delete.js';
import { editCommand } from '../src/commands/edit.js';
import { runUrlCommand } from '../src/commands/runUrl.js';
import { exportCommand } from '../src/commands/exportCmd.js';
import { importCommand } from '../src/commands/importCmd.js';
import { envListCommand, envShowCommand, envSetCommand, envUseCommand } from '../src/commands/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf8'));

const program = new Command();

program
  .name('apirquest')
  .description('A terminal-based API testing and management tool')
  .version(pkg.version);

program
  .command('add')
  .description('Add a new API request (interactive)')
  .action(async () => {
    await addCommand();
  });

program
  .command('list')
  .alias('ls')
  .description('List all saved requests')
  .action(async () => {
    await listCommand();
  });

program
  .command('get <id>')
  .description('View a specific request')
  .action(async (id) => {
    await getCommand(id);
  });

program
  .command('run <id>')
  .description('Execute a saved request and show the response')
  .option('--no-history', 'skip saving this run to history')
  .action(async (id, opts) => {
    await runCommand(id, { saveHistory: opts.history !== false });
  });

program
  .command('delete <id>')
  .alias('rm')
  .description('Delete a request')
  .option('-f, --force', 'skip confirmation prompt')
  .action(async (id, opts) => {
    await deleteCommand(id, { force: opts.force });
  });

program
  .command('edit <id>')
  .description('Edit an existing request (interactive)')
  .action(async (id) => {
    await editCommand(id);
  });

program
  .command('run-url <url>')
  .description('Quick one-off request without saving')
  .option('-m, --method <method>', 'HTTP method', 'GET')
  .option('-H, --header <header...>', 'header as "Key: Value" (repeatable)')
  .option('-d, --data <body>', 'request body')
  .action(async (url, opts) => {
    await runUrlCommand(url, opts);
  });

program
  .command('export <id>')
  .description('Export a request as curl, JSON, fetch, or axios code')
  .option('-f, --format <format>', 'json | curl | fetch | axios', 'json')
  .option('-o, --out <file>', 'write output to a file instead of stdout')
  .action(async (id, opts) => {
    await exportCommand(id, opts);
  });

program
  .command('import <file>')
  .description('Import a request (or array of requests) from a JSON file')
  .action(async (file) => {
    await importCommand(file);
  });

const env = program.command('env').description('Manage environments and variables');

env
  .command('list')
  .description('List environments')
  .action(async () => {
    await envListCommand();
  });

env
  .command('show <name>')
  .description('Show variables in an environment')
  .action(async (name) => {
    await envShowCommand(name);
  });

env
  .command('set <name> <key> <value>')
  .description('Set a variable in an environment')
  .action(async (name, key, value) => {
    await envSetCommand(name, key, value);
  });

env
  .command('use <name>')
  .description('Set the active environment')
  .action(async (name) => {
    await envUseCommand(name);
  });

// No arguments at all → open the interactive menu.
if (process.argv.length <= 2) {
  startMenu().catch(handleFatal);
} else {
  program.parseAsync(process.argv).catch(handleFatal);
}

function handleFatal(err) {
  console.error(chalk.red(`\n✖ ${err.message}\n`));
  process.exitCode = 1;
}
