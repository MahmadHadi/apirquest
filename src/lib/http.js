import axios from 'axios';
import fs from 'fs-extra';
import { CONFIG_FILE } from './paths.js';
import { resolveRequest } from './environment.js';

function arrayToObject(pairs = []) {
  const out = {};
  for (const { key, value } of pairs) {
    if (key) out[key] = value;
  }
  return out;
}

function parseBody(body, headers) {
  if (!body) return undefined;
  const contentType = Object.keys(headers).find((k) => k.toLowerCase() === 'content-type');
  const isJsonType = contentType ? /json/i.test(headers[contentType]) : true;
  const trimmed = body.trim();
  if (isJsonType && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return body; // fall back to raw string if it doesn't actually parse
    }
  }
  return body;
}

async function getTimeout() {
  try {
    const cfg = await fs.readJson(CONFIG_FILE);
    return cfg.timeout ?? 15000;
  } catch {
    return 15000;
  }
}

/**
 * Executes a saved (or ad-hoc) request record. Applies {{VAR}} environment
 * interpolation, then performs the HTTP call and returns a normalized result
 * describing what happened either way (success or failure) rather than
 * throwing on non-2xx status codes.
 */
export async function executeRequest(record) {
  const resolved = await resolveRequest(record);
  const headers = arrayToObject(resolved.headers);
  const params = arrayToObject(resolved.query);
  const data = parseBody(resolved.body, headers);
  const timeout = await getTimeout();
  const startedAt = Date.now();

  try {
    const response = await axios({
      url: resolved.url,
      method: resolved.method,
      headers,
      params,
      data,
      timeout,
      validateStatus: () => true // we handle non-2xx ourselves, don't throw
    });

    return {
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
      durationMs: Date.now() - startedAt,
      requestedUrl: resolved.url,
      requestedMethod: resolved.method
    };
  } catch (err) {
    return {
      ok: false,
      error: describeAxiosError(err),
      durationMs: Date.now() - startedAt,
      requestedUrl: resolved.url,
      requestedMethod: resolved.method
    };
  }
}

function describeAxiosError(err) {
  if (err.code === 'ECONNABORTED') return `Request timed out.`;
  if (err.code === 'ENOTFOUND') return `Could not resolve host — check the URL.`;
  if (err.code === 'ECONNREFUSED') return `Connection refused — is the server running?`;
  if (err.code === 'ERR_INVALID_URL' || err instanceof TypeError) return `Invalid URL.`;
  return err.message || 'Unknown network error.';
}
