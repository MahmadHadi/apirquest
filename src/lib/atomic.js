import fs from 'fs-extra';
import path from 'path';

/**
 * Writes JSON to disk atomically: write to a temp file in the same
 * directory, then rename over the target. Rename is atomic on POSIX
 * and NTFS, so readers never see a half-written file.
 */
export async function atomicWriteJson(filePath, data) {
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);
  const tmpPath = path.join(
    dir,
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`
  );
  await fs.writeJson(tmpPath, data, { spaces: 2 });
  await fs.rename(tmpPath, filePath);
}

/**
 * A minimal cross-process lock using an exclusive-create lockfile
 * (`wx` flag fails if the file already exists). Good enough to stop
 * two `apirquest` invocations from writing the same record at once
 * without pulling in a native/dependency-heavy locking library.
 *
 * Usage: await withLock(lockPath, async () => { ...critical section... })
 */
export async function withLock(lockPath, fn, { retries = 50, delayMs = 40 } = {}) {
  let acquired = false;
  let attempt = 0;

  while (!acquired) {
    try {
      const fd = await fs.open(lockPath, 'wx');
      await fs.close(fd);
      acquired = true;
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
      attempt += 1;
      if (attempt > retries) {
        throw new Error(
          `Could not acquire lock at ${lockPath} — a previous operation may have crashed. ` +
            `If you're sure nothing else is running, delete this file and try again.`
        );
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  try {
    return await fn();
  } finally {
    await fs.remove(lockPath).catch(() => {});
  }
}
