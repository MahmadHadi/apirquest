import chalk from 'chalk';
import fs from 'fs-extra';
import { importRequest } from '../lib/store.js';

export async function importCommand(file) {
  if (!(await fs.pathExists(file))) {
    console.error(chalk.red(`✖ File not found: ${file}`));
    process.exitCode = 1;
    return null;
  }

  let data;
  try {
    data = await fs.readJson(file);
  } catch {
    console.error(chalk.red(`✖ ${file} is not valid JSON`));
    process.exitCode = 1;
    return null;
  }

  const items = Array.isArray(data) ? data : [data];
  const imported = [];
  for (const item of items) {
    try {
      const record = await importRequest(item);
      imported.push(record);
      console.log(chalk.green(`✔ Imported "${record.title}" as ${chalk.bold(record.id)}`));
    } catch (err) {
      console.error(chalk.red(`✖ Skipped an entry: ${err.message}`));
    }
  }

  return imported;
}
