import path from 'path';
import fs from 'fs-extra';
import { nanoid } from 'nanoid';
import { REQUESTS_DIR, HISTORY_DIR, ensureDirs } from './paths.js';
import { atomicWriteJson, withLock } from './atomic.js';

function requestFile(id) {
  return path.join(REQUESTS_DIR, `${id}.json`);
}

function lockFile(id) {
  return path.join(REQUESTS_DIR, `.${id}.lock`);
}

/** Thrown when a request id doesn't exist. Lets commands give a clean error. */
export class NotFoundError extends Error {
  constructor(id) {
    super(`No request found with id "${id}"`);
    this.name = 'NotFoundError';
    this.id = id;
  }
}

function validate(data) {
  if (!data.url || typeof data.url !== 'string') {
    throw new Error('req_url is required and must be a string');
  }
  const method = (data.method || 'GET').toUpperCase();
  const allowed = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  if (!allowed.includes(method)) {
    throw new Error(`req_method must be one of: ${allowed.join(', ')}`);
  }
  if (data.body && typeof data.body === 'string') {
    const trimmed = data.body.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        JSON.parse(trimmed);
      } catch {
        throw new Error('req_body looks like JSON but failed to parse. Fix the JSON or pass it as plain text.');
      }
    }
  }
  return method;
}

/** Create a new saved request. Returns the full record including its id. */
export async function createRequest(input) {
  await ensureDirs();
  const method = validate(input);
  const now = new Date().toISOString();
  const record = {
    id: nanoid(10),
    title: input.title?.trim() || 'new request',
    url: input.url.trim(),
    method,
    headers: Array.isArray(input.headers) ? input.headers : [],
    query: Array.isArray(input.query) ? input.query : [],
    body: input.body ?? '',
    createdAt: now,
    updatedAt: now
  };

  await withLock(lockFile(record.id), () => atomicWriteJson(requestFile(record.id), record));
  return record;
}

/** List all saved requests, newest-updated first. */
export async function listRequests() {
  await ensureDirs();
  const files = (await fs.readdir(REQUESTS_DIR)).filter((f) => f.endsWith('.json'));
  const records = await Promise.all(
    files.map(async (f) => {
      try {
        return await fs.readJson(path.join(REQUESTS_DIR, f));
      } catch {
        return null; // skip unreadable/corrupt files rather than crash the list
      }
    })
  );
  return records
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

/** Fetch a single request by id. Throws NotFoundError if missing. */
export async function getRequest(id) {
  await ensureDirs();
  const file = requestFile(id);
  if (!(await fs.pathExists(file))) throw new NotFoundError(id);
  return fs.readJson(file);
}

/** Update fields on an existing request. Merges with the current record. */
export async function updateRequest(id, updates) {
  await ensureDirs();
  return withLock(lockFile(id), async () => {
    const file = requestFile(id);
    if (!(await fs.pathExists(file))) throw new NotFoundError(id);
    const current = await fs.readJson(file);
    const merged = { ...current, ...updates, id: current.id, createdAt: current.createdAt };
    validate(merged);
    merged.method = (merged.method || 'GET').toUpperCase();
    merged.updatedAt = new Date().toISOString();
    await atomicWriteJson(file, merged);
    return merged;
  });
}

/** Delete a request and its history folder. */
export async function deleteRequest(id) {
  await ensureDirs();
  return withLock(lockFile(id), async () => {
    const file = requestFile(id);
    if (!(await fs.pathExists(file))) throw new NotFoundError(id);
    await fs.remove(file);
    await fs.remove(path.join(HISTORY_DIR, id));
  });
}

/** Import a request from a plain object (e.g. parsed from an imported JSON file). */
export async function importRequest(data) {
  return createRequest({
    title: data.title,
    url: data.url,
    method: data.method,
    headers: data.headers,
    query: data.query,
    body: data.body
  });
}
