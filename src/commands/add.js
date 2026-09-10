import inquirer from 'inquirer';
import chalk from 'chalk';
import { createRequest } from '../lib/store.js';
import { collectPairs } from './shared/collectPairs.js';

export async function addCommand() {
  const basics = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'Request title:', default: 'new request' },
    {
      type: 'input',
      name: 'url',
      message: 'URL:',
      validate: (v) => (v.trim() ? true : 'URL is required')
    },
    {
      type: 'list',
      name: 'method',
      message: 'Method:',
      choices: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      default: 'GET'
    }
  ]);

  const headers = await collectPairs('header');
  const query = await collectPairs('query param');

  let body = '';
  if (['POST', 'PUT', 'PATCH'].includes(basics.method)) {
    const { wantsBody } = await inquirer.prompt([
      { type: 'confirm', name: 'wantsBody', message: 'Add a request body?', default: true }
    ]);
    if (wantsBody) {
      const { bodyText } = await inquirer.prompt([
        { type: 'editor', name: 'bodyText', message: 'Request body (opens your editor):' }
      ]);
      body = bodyText;
    }
  }

  const record = await createRequest({ ...basics, headers, query, body });
  console.log(chalk.green(`\n✔ Saved "${record.title}" as ${chalk.bold(record.id)}`));
  return record;
}
