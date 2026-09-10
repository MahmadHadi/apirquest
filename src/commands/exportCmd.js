import chalk from 'chalk';
import fs from 'fs-extra';
import { getRequest, NotFoundError } from '../lib/store.js';
import { toCurl, toFetchSnippet, toAxiosSnippet } from '../lib/format.js';

export async function exportCommand(id, { format = 'json', out } = {}) {
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

  let output;
  switch (format) {
    case 'curl':
      output = toCurl(record);
      break;
    case 'fetch':
      output = toFetchSnippet(record);
      break;
    case 'axios':
      output = toAxiosSnippet(record);
      break;
    case 'json':
    default:
      output = JSON.stringify(record, null, 2);
  }

  if (out) {
    await fs.writeFile(out, output, 'utf8');
    console.log(chalk.green(`✔ Wrote ${format} export to ${out}`));
  } else {
    console.log(output);
  }

  return output;
}
