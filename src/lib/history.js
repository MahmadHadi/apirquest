import path from 'path';
import fs from 'fs-extra';
import { HISTORY_DIR, CONFIG_FILE, ensureDirs } from './paths.js';
import { atomicWriteJson } from './atomic.js';

async function getHistoryLimit() {
  try {
    const cfg = await fs.readJson(CONFIG_FILE);
    return cfg.historyLimit ?? 20;
  } catch {
    return 20;
  }
}

/** Save one response snapshot for a request, then prune old entries beyond the configured limit. */
export async function saveHistoryEntry(requestId, entry) {
  await ensureDirs();
  const dir = path.join(HISTORY_DIR, requestId);
  await fs.ensureDir(dir);
  const filename = `response_${Date.now()}.json`;
  await atomicWriteJson(path.join(dir, filename), entry);

  const limit = await getHistoryLimit();
  const files = (await fs.readdir(dir)).filter((f) => f.startsWith('response_')).sort();
  const excess = files.length - limit;
  if (excess > 0) {
    await Promise.all(files.slice(0, excess).map((f) => fs.remove(path.join(dir, f))));
  }
}

/** List history entries for a request, newest first. */
export async function listHistory(requestId) {
  const dir = path.join(HISTORY_DIR, requestId);
  if (!(await fs.pathExists(dir))) return [];
  const files = (await fs.readdir(dir)).filter((f) => f.startsWith('response_')).sort().reverse();
  return Promise.all(files.map((f) => fs.readJson(path.join(dir, f))));
}
