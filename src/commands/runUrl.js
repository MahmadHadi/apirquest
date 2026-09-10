import { runResolvedRequest } from './run.js';

export async function runUrlCommand(url, opts = {}) {
  const headers = (opts.header || []).map((h) => {
    const [key, ...rest] = h.split(':');
    return { key: key.trim(), value: rest.join(':').trim() };
  });

  const record = {
    id: 'ad-hoc',
    title: 'ad-hoc request',
    url,
    method: (opts.method || 'GET').toUpperCase(),
    headers,
    query: [],
    body: opts.data || ''
  };

  return runResolvedRequest(record, { saveHistory: null });
}
