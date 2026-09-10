import inquirer from 'inquirer';
import chalk from 'chalk';
import { listRequests } from './lib/store.js';
import { addCommand } from './commands/add.js';
import { listCommand } from './commands/list.js';
import { getCommand } from './commands/get.js';
import { runCommand } from './commands/run.js';
import { deleteCommand } from './commands/delete.js';
import { editCommand } from './commands/edit.js';
import { exportCommand } from './commands/exportCmd.js';

async function pickRequest(message = 'Pick a request:') {
  const records = await listRequests();
  if (!records.length) {
    console.log(chalk.dim('No saved requests yet.'));
    return null;
  }
  const { id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'id',
      message,
      choices: records.map((r) => ({
        name: `${r.method.padEnd(6)} ${r.url}  ${chalk.dim(r.title)}`,
        value: r.id
      }))
    }
  ]);
  return id;
}

export async function startMenu() {
  console.log(chalk.bold.cyan('\n  apirquest — interactive mode\n'));

  let running = true;
  while (running) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'List requests', value: 'list' },
          { name: 'Add a new request', value: 'add' },
          { name: 'View a request', value: 'get' },
          { name: 'Run a request', value: 'run' },
          { name: 'Edit a request', value: 'edit' },
          { name: 'Delete a request', value: 'delete' },
          { name: 'Export a request', value: 'export' },
          new inquirer.Separator(),
          { name: 'Quit', value: 'quit' }
        ]
      }
    ]);

    try {
      switch (action) {
        case 'list':
          await listCommand();
          break;
        case 'add':
          await addCommand();
          break;
        case 'get': {
          const id = await pickRequest();
          if (id) await getCommand(id);
          break;
        }
        case 'run': {
          const id = await pickRequest('Pick a request to run:');
          if (id) await runCommand(id);
          break;
        }
        case 'edit': {
          const id = await pickRequest('Pick a request to edit:');
          if (id) await editCommand(id);
          break;
        }
        case 'delete': {
          const id = await pickRequest('Pick a request to delete:');
          if (id) await deleteCommand(id);
          break;
        }
        case 'export': {
          const id = await pickRequest('Pick a request to export:');
          if (id) {
            const { format } = await inquirer.prompt([
              {
                type: 'list',
                name: 'format',
                message: 'Export as:',
                choices: ['json', 'curl', 'fetch', 'axios']
              }
            ]);
            await exportCommand(id, { format });
          }
          break;
        }
        case 'quit':
          running = false;
          break;
      }
    } catch (err) {
      console.error(chalk.red(`✖ ${err.message}`));
    }

    if (running && action !== 'quit') {
      console.log(); // spacing between loops
    }
  }

  console.log(chalk.dim('\nGoodbye!\n'));
}
