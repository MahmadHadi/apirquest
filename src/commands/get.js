import chalk from 'chalk';
import { getRequest, NotFoundError } from '../lib/store.js';
import { colorMethod, formatJson, box } from '../lib/format.js';

export async function getCommand(id) {
  try {
    const r = await getRequest(id);
    const lines = [
      `${chalk.bold(r.title)}  ${chalk.dim(`[${r.id}]`)}`,
      `${colorMethod(r.method)} ${r.url}`,
      ''
    ];
    if (r.headers?.length) {
      lines.push(chalk.bold('Headers:'));
      r.headers.forEach((h) => lines.push(`  ${chalk.cyan(h.key)}: ${h.value}`));
      lines.push('');
    }
    if (r.query?.length) {
      lines.push(chalk.bold('Query:'));
      r.query.forEach((q) => lines.push(`  ${chalk.cyan(q.key)}: ${q.value}`));
      lines.push('');
    }
    if (r.body) {
      lines.push(chalk.bold('Body:'));
      lines.push(formatJson(r.body));
      lines.push('');
    }
    lines.push(chalk.dim(`Created ${r.createdAt}`));
    lines.push(chalk.dim(`Updated ${r.updatedAt}`));

    console.log(box(lines.join('\n')));
    return r;
  } catch (err) {
    if (err instanceof NotFoundError) {
      console.error(chalk.red(`✖ ${err.message}`));
      process.exitCode = 1;
      return null;
    }
    throw err;
  }
}
