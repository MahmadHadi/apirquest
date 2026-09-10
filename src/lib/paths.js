import os from 'os';
import path from 'path';
import fs from 'fs-extra';

/**
 * Resolves the root data directory for apirquest.
 *
 * Resolution order:
 *   1. APIRQUEST_HOME env var (explicit override)
 *   2. ./.apirquest in the current working directory, IF it already exists
 *      (lets a project "opt in" to local, project-scoped storage)
 *   3. ~/.apirquest (default, global storage)
 */
export function getRootDir() {
  if (process.env.APIRQUEST_HOME) {
    return path.resolve(process.env.APIRQUEST_HOME);
  }

  const localDir = path.join(process.cwd(), '.apirquest');
  if (fs.pathExistsSync(localDir)) {
    return localDir;
  }

  return path.join(os.homedir(), '.apirquest');
}

export const ROOT_DIR = getRootDir();
export const REQUESTS_DIR = path.join(ROOT_DIR, 'requests');
export const HISTORY_DIR = path.join(ROOT_DIR, 'history');
export const ENV_DIR = path.join(ROOT_DIR, 'environments');
export const CONFIG_FILE = path.join(ROOT_DIR, 'config.json');
export const COLLECTIONS_FILE = path.join(ROOT_DIR, 'collections.json');

/**
 * Ensures the full directory tree exists. Safe to call repeatedly —
 * fs-extra's ensureDir is idempotent and creates parents as needed.
 */
export async function ensureDirs() {
  await fs.ensureDir(REQUESTS_DIR);
  await fs.ensureDir(HISTORY_DIR);
  await fs.ensureDir(ENV_DIR);

  if (!(await fs.pathExists(CONFIG_FILE))) {
    await fs.writeJson(
      CONFIG_FILE,
      {
        activeEnvironment: null,
        historyLimit: 20,
        timeout: 15000
      },
      { spaces: 2 }
    );
  }
}
