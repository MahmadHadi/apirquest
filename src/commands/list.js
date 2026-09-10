import chalk from 'chalk';
import { listRequests } from '../lib/store.js';
import { requestSummaryLine } from '../lib/format.js';

export async function listCommand() {
  const records = await listRequests();
  if (!records.length) {
    console.log(chalk.dim('No saved requests yet. Run `apirquest add` to create one.'));
    return records;
  }

  console.log(chalk.bold(`\nSaved requests (${records.length}):\n`));
  for (const r of records) {
    console.log('  ' + requestSummaryLine(r));
  }
  console.log();
  return records;
}
