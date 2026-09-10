import chalk from 'chalk';
import boxen from 'boxen';

const methodColors = {
  GET: chalk.green,
  POST: chalk.yellow,
  PUT: chalk.blue,
  PATCH: chalk.magenta,
  DELETE: chalk.red
};

export function colorMethod(method) {
  const fn = methodColors[method] || chalk.white;
  return fn.bold(method.padEnd(6));
}

export function colorStatus(status) {
  if (!status) return chalk.red.bold('ERR');
  if (status >= 200 && status < 300) return chalk.green.bold(status);
  if (status >= 300 && status < 400) return chalk.cyan.bold(status);
  if (status >= 400 && status < 500) return chalk.yellow.bold(status);
  return chalk.red.bold(status);
}

/** Pretty-print a JSON value (or return the raw string) with light syntax coloring. */
export function formatJson(value) {
  let text;
  if (typeof value === 'string') {
    try {
      text = JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  } else {
    text = JSON.stringify(value, null, 2);
  }

  return text
    .split('\n')
    .map((line) => {
      const keyMatch = line.match(/^(\s*)"([^"]+)":/);
      if (keyMatch) {
        const rest = line.slice(keyMatch[0].length);
        return `${keyMatch[1]}${chalk.cyan(`"${keyMatch[2]}"`)}:${colorizeValue(rest)}`;
      }
      return colorizeValue(line);
    })
    .join('\n');
}

function colorizeValue(fragment) {
  if (/"[^"]*"\s*,?\s*$/.test(fragment) && !/:\s*"/.test(fragment) === false) {
    return fragment.replace(/"([^"]*)"(\s*,?\s*)$/, `${chalk.green('"$1"')}$2`);
  }
  if (/\b(true|false)\b/.test(fragment)) return fragment.replace(/\b(true|false)\b/, chalk.magenta('$1'));
  if (/\bnull\b/.test(fragment)) return fragment.replace(/\bnull\b/, chalk.gray('null'));
  if (/-?\d+(\.\d+)?\s*,?\s*$/.test(fragment.trim())) {
    return fragment.replace(/(-?\d+(\.\d+)?)(\s*,?\s*)$/, `${chalk.yellow('$1')}$3`);
  }
  return fragment;
}

export function requestSummaryLine(record) {
  return `${colorMethod(record.method)} ${chalk.white(record.url)}  ${chalk.dim(`[${record.id}]`)} ${chalk.dim(record.title)}`;
}

export function box(content, opts = {}) {
  return boxen(content, {
    padding: 1,
    borderColor: opts.color || 'cyan',
    borderStyle: 'round',
    ...opts
  });
}

export function toCurl(record) {
  const parts = [`curl -X ${record.method}`];
  for (const h of record.headers || []) {
    if (h.key) parts.push(`  -H '${h.key}: ${h.value}'`);
  }
  if (record.body) {
    parts.push(`  -d '${record.body.replace(/'/g, "'\\''")}'`);
  }
  const query = (record.query || []).filter((q) => q.key);
  let url = record.url;
  if (query.length) {
    const qs = query.map((q) => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value)}`).join('&');
    url += (url.includes('?') ? '&' : '?') + qs;
  }
  parts.push(`  '${url}'`);
  return parts.join(' \\\n');
}

export function toFetchSnippet(record) {
  const headers = arrayToObjLiteral(record.headers);
  const body = record.body ? `,\n  body: ${JSON.stringify(record.body)}` : '';
  return `fetch(${JSON.stringify(record.url)}, {\n  method: ${JSON.stringify(record.method)},\n  headers: ${headers}${body}\n})\n  .then(res => res.json())\n  .then(console.log)\n  .catch(console.error);`;
}

export function toAxiosSnippet(record) {
  const headers = arrayToObjLiteral(record.headers);
  return `import axios from 'axios';\n\nconst response = await axios({\n  url: ${JSON.stringify(record.url)},\n  method: ${JSON.stringify(record.method)},\n  headers: ${headers}${record.body ? `,\n  data: ${record.body}` : ''}\n});\n\nconsole.log(response.data);`;
}

function arrayToObjLiteral(pairs = []) {
  if (!pairs.length) return '{}';
  const lines = pairs.filter((p) => p.key).map((p) => `    ${JSON.stringify(p.key)}: ${JSON.stringify(p.value)}`);
  return `{\n${lines.join(',\n')}\n  }`;
}
