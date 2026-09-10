import inquirer from 'inquirer';
import chalk from 'chalk';
import { getRequest, updateRequest, NotFoundError } from '../lib/store.js';
import { collectPairs } from './shared/collectPairs.js';

export async function editCommand(id) {
  let record;
  try {
    record = await getRequest(id);
  } catch (err) {
    if (err instanceof NotFoundError) {
      console.error(chalk.red(`✖ ${err.message}`));
      process.exitCode = 1;
      return null;
    }
    throw err;
  }

  const basics = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'Request title:', default: record.title },
    { type: 'input', name: 'url', message: 'URL:', default: record.url },
    {
      type: 'list',
      name: 'method',
      message: 'Method:',
      choices: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      default: record.method
    }
  ]);

  const { editHeaders } = await inquirer.prompt([
    { type: 'confirm', name: 'editHeaders', message: 'Redo headers?', default: false }
  ]);
  const headers = editHeaders ? await collectPairs('header') : record.headers;

  const { editQuery } = await inquirer.prompt([
    { type: 'confirm', name: 'editQuery', message: 'Redo query params?', default: false }
  ]);
  const query = editQuery ? await collectPairs('query param') : record.query;

  let body = record.body;
  const { editBody } = await inquirer.prompt([
    { type: 'confirm', name: 'editBody', message: 'Edit body?', default: false }
  ]);
  if (editBody) {
    const { bodyText } = await inquirer.prompt([
      { type: 'editor', name: 'bodyText', message: 'Request body (opens your editor):', default: record.body }
    ]);
    body = bodyText;
  }

  const updated = await updateRequest(id, { ...basics, headers, query, body });
  console.log(chalk.green(`\n✔ Updated ${chalk.bold(updated.id)}`));
  return updated;
}
