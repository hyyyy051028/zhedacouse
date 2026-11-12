'use strict';

/**
 * 飞书开放平台最小客户端（零依赖）。
 * 只覆盖本项目的接口需求：tenant_access_token、表结构、记录读写。
 */

const cfg = require('./config');

let tokenCache = { token: '', expireAt: 0 };

async function http(method, path, { query, body, token } = {}) {
  const url = new URL(path, cfg.feishu.baseUrl);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  const headers = { 'Content-Type': 'application/json; charset=utf-8' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }

  if (!res.ok || (json.code !== undefined && json.code !== 0)) {
    const err = new Error(`飞书接口失败 ${method} ${path}: ${json.msg || json.message || res.status}`);
    err.detail = json;
    err.status = res.status;
    throw err;
  }
  return json.data !== undefined ? json.data : json;
}

async function getToken() {
  const now = Date.now();
  if (tokenCache.token && now < tokenCache.expireAt) return tokenCache.token;

  if (!cfg.feishu.appId || !cfg.feishu.appSecret) {
    throw new Error('缺少 FEISHU_APP_ID / FEISHU_APP_SECRET，无法以 live 模式访问飞书');
  }
  const data = await http('POST', '/open-apis/auth/v3/tenant_access_token/internal', {
    body: { app_id: cfg.feishu.appId, app_secret: cfg.feishu.appSecret },
  });
  tokenCache = {
    token: data.tenant_access_token,
    // 提前 5 分钟过期，避免边界失败
    expireAt: now + Math.max(60, (data.expire || 7200) - 300) * 1000,
  };
  return tokenCache.token;
}

async function listTables() {
  const token = await getToken();
  const out = [];
  let pageToken = '';
  do {
    const data = await http('GET', `/open-apis/bitable/v1/apps/${cfg.feishu.baseToken}/tables`, {
      query: { page_size: 100, page_token: pageToken || undefined },
      token,
    });
    out.push(...(data.items || []));
    pageToken = data.has_more ? data.page_token : '';
  } while (pageToken);
  return out;
}

async function listFields(tableId) {
  const token = await getToken();
  const out = [];
  let pageToken = '';
  do {
    const data = await http('GET', `/open-apis/bitable/v1/apps/${cfg.feishu.baseToken}/tables/${tableId}/fields`, {
      query: { page_size: 100, page_token: pageToken || undefined },
      token,
    });
    out.push(...(data.items || []));
    pageToken = data.has_more ? data.page_token : '';
  } while (pageToken);
  return out;
}

/**
 * 搜索记录（自动翻页）。之前只取一页、超过 500 行会静默截断。
 * maxPages 兜底，避免异常分页导致死循环。
 */
async function searchRecords(tableId, { fieldNames, filter, pageSize = 500, maxPages = 40 } = {}) {
  const token = await getToken();
  const out = [];
  let pageToken = '';
  for (let page = 0; page < maxPages; page += 1) {
    const body = { automatic_fields: false };
    if (fieldNames && fieldNames.filter(Boolean).length) body.field_names = fieldNames.filter(Boolean);
    if (filter) body.filter = filter;
    const data = await http('POST', `/open-apis/bitable/v1/apps/${cfg.feishu.baseToken}/tables/${tableId}/records/search`, {
      query: { page_size: Math.min(500, pageSize), page_token: pageToken || undefined, user_id_type: 'open_id' },
      body,
      token,
    });
    out.push(...(data.items || []).map(normalizeRecord));
    pageToken = data.has_more ? data.page_token : '';
    if (!pageToken) break;
  }
  return out;
}

async function getRecord(tableId, recordId) {
  const token = await getToken();
  const data = await http('GET', `/open-apis/bitable/v1/apps/${cfg.feishu.baseToken}/tables/${tableId}/records/${recordId}`, {
    query: { user_id_type: 'open_id' },
    token,
  });
  return normalizeRecord(data.record || {});
}

async function createRecord(tableId, fields) {
  const token = await getToken();
  const data = await http('POST', `/open-apis/bitable/v1/apps/${cfg.feishu.baseToken}/tables/${tableId}/records`, {
    query: { user_id_type: 'open_id' },
    body: { fields },
    token,
  });
  return normalizeRecord(data.record || {});
}

async function updateRecord(tableId, recordId, fields) {
  const token = await getToken();
  const data = await http('PUT', `/open-apis/bitable/v1/apps/${cfg.feishu.baseToken}/tables/${tableId}/records/${recordId}`, {
    query: { user_id_type: 'open_id' },
    body: { fields },
    token,
  });
  return normalizeRecord(data.record || {});
}

async function deleteRecord(tableId, recordId) {
  const token = await getToken();
  await http('DELETE', `/open-apis/bitable/v1/apps/${cfg.feishu.baseToken}/tables/${tableId}/records/${recordId}`, { token });
}

async function createTable(name, fields) {
  const token = await getToken();
  const data = await http('POST', `/open-apis/bitable/v1/apps/${cfg.feishu.baseToken}/tables`, {
    body: { table: { name, fields } },
    token,
  });
  return data.table_id || (data.table && data.table.table_id) || '';
}

async function createField(tableId, field) {
  const token = await getToken();
  const data = await http('POST', `/open-apis/bitable/v1/apps/${cfg.feishu.baseToken}/tables/${tableId}/fields`, {
    body: field,
    token,
  });
  return data.field || null;
}

function normalizeRecord(rec) {
  return { recordId: rec.record_id || '', fields: rec.fields || {} };
}

module.exports = {
  getToken, listTables, listFields, searchRecords, getRecord,
  createRecord, updateRecord, deleteRecord, createTable, createField, http,
};
