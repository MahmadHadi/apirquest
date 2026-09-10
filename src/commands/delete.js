import chalk from 'chalk';
import inquirer from 'inquirer';
import { getRequest, deleteRequest, NotFoundError } from '../lib/store.js';

export async function deleteCommand(id, { force = false } = {}) {
  try {
    const record = await getRequest(id);

    if (!force) {
      const { confirmed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message: `Delete "${record.title}" (${record.method} ${record.url})?`,
          default: false
        }
      ]);
      if (!confirmed) {
        console.log(chalk.dim('Cancelled.'));
        return false;
      }
    }

    await deleteRequest(id);
    console.log(chalk.green(`✔ Deleted ${chalk.bold(id)}`));
    return true;
  } catch (err) {
    if (err instanceof NotFoundError) {
      console.error(chalk.red(`✖ ${err.message}`));
      process.exitCode = 1;
      return false;
    }
    throw err;
  }
}
