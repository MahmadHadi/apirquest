import path from 'path';
import fs from 'fs-extra';
import { ENV_DIR, CONFIG_FILE, ensureDirs } from './paths.js';
import { atomicWriteJson } from './atomic.js';

function envFile(name) {
  return path.join(ENV_DIR, `${name}.json`);
}

export async function listEnvironments() {
  await ensureDirs();
  const files = (await fs.readdir(ENV_DIR)).filter((f) => f.endsWith('.json'));
  return files.map((f) => f.replace(/\.json$/, ''));
}

export async function getEnvironment(name) {
  await ensureDirs();
  const file = envFile(name);
  if (!(await fs.pathExists(file))) return {};
  return fs.readJson(file);
}

export async function setEnvironmentVar(name, key, value) {
  await ensureDirs();
  const current = await getEnvironment(name);
  current[key] = value;
  await atomicWriteJson(envFile(name), current);
  return current;
}

export async function getActiveEnvironmentName() {
  await ensureDirs();
  const cfg = await fs.readJson(CONFIG_FILE);
  return cfg.activeEnvironment || null;
}

export async function setActiveEnvironment(name) {
  await ensureDirs();
  const cfg = await fs.readJson(CONFIG_FILE);
  cfg.activeEnvironment = name;
  await atomicWriteJson(CONFIG_FILE, cfg);
}

/**
 * Replaces {{VAR_NAME}} tokens in a string using the active environment's
 * variables (falling back to leaving the token untouched if unresolved).
 */
export function interpolate(str, vars) {
  if (typeof str !== 'string') return str;
  return str.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match;
  });
}

/** Apply {{VAR}} interpolation across a full request record using the active environment. */
export async function resolveRequest(record) {
  const activeName = await getActiveEnvironmentName();
  const vars = activeName ? await getEnvironment(activeName) : {};

  return {
    ...record,
    url: interpolate(record.url, vars),
    headers: (record.headers || []).map((h) => ({
      key: interpolate(h.key, vars),
      value: interpolate(h.value, vars)
    })),
    query: (record.query || []).map((q) => ({
      key: interpolate(q.key, vars),
      value: interpolate(q.value, vars)
    })),
    body: interpolate(record.body, vars)
  };
}
