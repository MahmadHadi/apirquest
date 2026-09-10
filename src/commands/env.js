import chalk from 'chalk';
import {
  listEnvironments,
  getEnvironment,
  setEnvironmentVar,
  getActiveEnvironmentName,
  setActiveEnvironment
} from '../lib/environment.js';

export async function envListCommand() {
  const envs = await listEnvironments();
  const active = await getActiveEnvironmentName();
  if (!envs.length) {
    console.log(chalk.dim('No environments yet. Use `apirquest env set <name> <key> <value>` to create one.'));
    return envs;
  }
  console.log(chalk.bold('\nEnvironments:'));
  for (const name of envs) {
    const marker = name === active ? chalk.green(' (active)') : '';
    console.log(`  ${name}${marker}`);
  }
  console.log();
  return envs;
}

export async function envShowCommand(name) {
  const vars = await getEnvironment(name);
  console.log(chalk.bold(`\n${name}:`));
  const keys = Object.keys(vars);
  if (!keys.length) {
    console.log(chalk.dim('  (empty)'));
  } else {
    keys.forEach((k) => console.log(`  ${chalk.cyan(k)} = ${vars[k]}`));
  }
  console.log();
  return vars;
}

export async function envSetCommand(name, key, value) {
  await setEnvironmentVar(name, key, value);
  console.log(chalk.green(`✔ Set ${key} in "${name}"`));
}

export async function envUseCommand(name) {
  await setActiveEnvironment(name);
  console.log(chalk.green(`✔ Active environment set to "${name}"`));
}
