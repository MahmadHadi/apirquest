import chalk from 'chalk';
import ora from 'ora';
import { getRequest, NotFoundError } from '../lib/store.js';
import { executeRequest } from '../lib/http.js';
import { saveHistoryEntry } from '../lib/history.js';
import { colorMethod, colorStatus, formatJson, box } from '../lib/format.js';

export async function runCommand(id, { saveHistory = true } = {}) {
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

  return runResolvedRequest(record, { saveHistory: saveHistory ? record.id : null });
}

/** Shared by `run <id>` and `run-url` — executes a request object and prints the result. */
export async function runResolvedRequest(record, { saveHistory = null } = {}) {
  const spinner = ora(`${record.method} ${record.url}`).start();
  const result = await executeRequest(record);
  spinner.stop();

  console.log(`${colorMethod(record.method)} ${record.url}`);

  if (!result.ok && result.error) {
    console.log(box(chalk.red(`✖ ${result.error}`), { color: 'red' }));
  } else {
    const statusLine = `${colorStatus(result.status)} ${chalk.dim(result.statusText || '')}  ${chalk.dim(
      `${result.durationMs}ms`
    )}`;
    const bodyText = formatJson(result.data);
    console.log(box(`${statusLine}\n\n${bodyText}`, { color: result.ok ? 'green' : 'yellow' }));
  }

  if (saveHistory) {
    await saveHistoryEntry(saveHistory, {
      timestamp: new Date().toISOString(),
      ...result
    });
  }

  return result;
}
