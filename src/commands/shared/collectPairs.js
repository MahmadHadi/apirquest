import inquirer from 'inquirer';

/**
 * Interactively collects a list of {key, value} pairs — used for both
 * headers and query params so the prompt flow stays consistent.
 */
export async function collectPairs(label, existing = []) {
  const pairs = [...existing];

  const { wantsAny } = await inquirer.prompt([
    { type: 'confirm', name: 'wantsAny', message: `Add ${label}s?`, default: pairs.length > 0 }
  ]);
  if (!wantsAny) return pairs;

  let addMore = true;
  while (addMore) {
    const { key, value } = await inquirer.prompt([
      { type: 'input', name: 'key', message: `${label} key:` },
      { type: 'input', name: 'value', message: `${label} value:` }
    ]);
    if (key.trim()) pairs.push({ key: key.trim(), value });

    const { more } = await inquirer.prompt([
      { type: 'confirm', name: 'more', message: `Add another ${label}?`, default: false }
    ]);
    addMore = more;
  }

  return pairs;
}
