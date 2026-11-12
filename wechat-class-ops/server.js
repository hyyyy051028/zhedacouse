'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const cfg = require('./lib/config');
const phase = require('./lib/phase');
const audience = require('./lib/audience');

const impl = cfg.mode === 'live' ? require('./lib/base') : require('./lib/mock');

const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
};

function send(res, status, data) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': typeof data === 'string' ? 'text/plain; charset=utf-8' : 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) { reject(new Error('请求体过大')); req.destroy(); }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(new Error('请求体不是合法 JSON')); }
    });
    req.on('error', reject);
  });
}

function requireAdmin(req) {
  if (!cfg.adminToken) return;
  const got = req.headers['x-admin-token'] || '';
  if (got && got === cfg.adminToken) return;
  const err = new Error('口令不正确');
  err.status = 401;
  throw err;
}

/** 响应里的 person 一律脱敏（证件号/手机号），内部逻辑仍用完整值 */
function mask(result) {
  if (result && result.person && impl.publicPerson) result.person = impl.publicPerson(result.person);
  return result;
}

/** 请求里带 sessionId 就用指定课次，否则由实现回落到"当前课次" */
async function sessionOf(body) {
  const id = body && body.sessionId;
  if (!id || !impl.sessionFrom) return undefined;
  return impl.sessionFrom(id);
}

/* ---------------- 基础安全：限流 ---------------- */
const RATE = new Map();

function clientIp(req) {
  const ra = req.socket.remoteAddress || '';
  const behindProxy = ra === '127.0.0.1' || ra === '::1' || /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(ra);
  if (behindProxy) {
    const fwd = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    if (fwd) return fwd;
  }
  return ra || 'unknown';
}

function allow(key, limit, windowMs) {
  const now = Date.now();
  let e = RATE.get(key);
  if (!e || now > e.reset) { e = { n: 0, reset: now + windowMs }; RATE.set(key, e); }
  e.n += 1;
  if (RATE.size > 5000) {
    for (const [k, v] of RATE) if (now > v.reset) RATE.delete(k);
  }
  return e.n <= limit;
}

/**
 * 限流按「设备」为主、IP 只做总量兜底：
 * 校园 Wi-Fi 下全班共用一个出口 IP，按 IP 掐 10 次/分钟会把整个班挡住。
 */
function hitLimit(req, pathname) {
  const ip = clientIp(req);
  const dev = String(req.headers['x-device-id'] || '').slice(0, 64);
  const who = dev ? 'dev:' + dev : 'ip:' + ip;

  if (pathname === '/api/health' || pathname === '/api/qr') return true;

  if (pathname === '/api/identify') {
    const okMin = allow(who + ':id:m', 10, 60 * 1000);
    const okHour = allow(who + ':id:h', 50, 60 * 60 * 1000);
    const okIpCap = allow('ipcap:' + ip, 150, 60 * 1000);   // 防单 IP 狂刷
    return okMin && okHour && okIpCap;
  }
  const okApi = allow(who + ':api:m', 60, 60 * 1000);
  const okIpCap = allow('ipcap:' + ip, 300, 60 * 1000);
  return okApi && okIpCap;
}

const routes = {
  'GET /api/health': async () => ({ ok: true, mode: cfg.mode }),
  'GET /api/bootstrap': async (body, req, url) => {
    const sessionId = url.searchParams.get('s') || '';
    const entry = url.searchParams.get('m') || '';
    const session = sessionId && impl.sessionFrom ? await impl.sessionFrom(sessionId) : undefined;
    return impl.bootstrap(session, entry);
  },
  'GET /api/phase': async () => (impl.syncSchedule ? impl.syncSchedule() : phase.current()),
  'POST /api/admin/state': async (body, req) => {
    requireAdmin(req);
    phase.setState(body.state || null, 'staff');
    return phase.current();
  },
  'GET /api/schema': async (body, req) => {
    if (cfg.mode === 'live') requireAdmin(req);
    if (cfg.mode !== 'live') return { mode: 'mock', tables: null, resolved: null, missing: [] };
    const schema = await impl.getSchema();
    return {
      mode: 'live',
      baseToken: cfg.feishu.baseToken,
      tables: Object.fromEntries(Object.entries(schema.tables).map(([k, v]) => [k, { id: v.id, name: v.name, fields: v.fields.map((f) => ({ name: f.name, type: f.type })) }])),
      resolved: schema.resolved,
      missing: schema.missing,
    };
  },
  'GET /api/sessions': async (body, req) => {
    if (cfg.mode === 'live') requireAdmin(req);
    // 给工作人员页生成三入口链接用；live 下取不到课次列表时返回空数组
    if (!impl.listSessions) return { items: [], currentId: '' };
    const items = await impl.listSessions();
    let currentId = '';
    if (impl.currentSession) {
      const cur = await impl.currentSession().catch(() => null);
      currentId = (cur && cur.recordId) || '';
    }
    let target = null;
    if (impl.sessionTarget) target = impl.sessionTarget();
    return { items, currentId, target };
  },
  'POST /api/admin/target': async (body, req) => {
    requireAdmin(req);
    if (!impl.setSessionTarget) throw Object.assign(new Error('当前模式不支持指定课次'), { status: 501 });
    const r = await impl.setSessionTarget(body.sessionId || null, 'staff');
    return { target: r.target, session: r.session ? { id: r.session.recordId, name: r.session.name } : null };
  },
  'GET /api/public/days': async (body, req, url) => {
    const sid = url.searchParams.get('s') || '';
    if (!impl.publicDays) return { items: [] };
    return { items: await impl.publicDays(sid) };
  },
  'POST /api/identify': async (body) => mask(await impl.identify(body.l4, body.entry || body.entryMode, await sessionOf(body))),
  'POST /api/person': async (body) => mask(await impl.person(body.id, body.type, await sessionOf(body))),
  'POST /api/rsvp': async (body) => mask(await impl.rsvp(body.id, body.type, body.action, body.reason, {
    profile: body.profile,
    session: await sessionOf(body),
  })),
  'POST /api/checkin': async (body) => mask(await impl.checkin(body.id, body.type, await sessionOf(body))),
  'POST /api/survey': async (body) => mask(await impl.survey(body.id, body.type, body.answers || {}, await sessionOf(body))),
  'POST /api/register': async (body) => mask(await impl.register(body, await sessionOf(body))),
  'POST /api/guest': async (body) => mask(await impl.guest(body, await sessionOf(body))),
};

// 演示控制台接口只在 mock 模式开放
if (cfg.mode === 'mock') {
  routes['POST /api/demo/state'] = async (body) => impl.setState(body.state);
  routes['POST /api/demo/reset'] = async () => { impl.reset(); return { ok: true }; };
}

// 课次信息读写只在 live 模式开放（直接落飞书多维表格）
if (cfg.mode === 'live') {
  routes['GET /api/admin/session'] = async () => impl.sessionInfo();
  routes['POST /api/admin/session'] = async (body, req) => {
    requireAdmin(req);
    return impl.updateSession(body);
  };
}

/** /q/{课次recordId}/{current|new|makeup} 三个入口都落到同一个 H5 */
function isEntryPath(pathname) {
  return pathname === '/q' || pathname.startsWith('/q/')
    || pathname === '/s' || pathname === '/n' || pathname === '/a';
}

function serveStatic(req, res, pathname) {
  if (pathname === '/staff' || pathname === '/staff/') pathname = '/staff.html';
  if (isEntryPath(pathname)) pathname = '/';
  const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const file = path.join(PUBLIC_DIR, rel);
  if (!file.startsWith(PUBLIC_DIR)) { send(res, 403, 'Forbidden'); return; }

  fs.readFile(file, (err, buf) => {
    if (err) {
      if (rel !== 'index.html') { send(res, 404, 'Not Found'); return; }
      fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (e2, b2) => {
        if (e2) send(res, 404, 'Not Found');
        else { res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store' }); res.end(b2); }
      });
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': pathname === '/' ? 'no-store' : 'public, max-age=60',
    });
    res.end(buf);
  });
}

/* ---------------- 二维码（服务端生成，带缓存） ---------------- */
const QR_CACHE = new Map();

async function handleQr(res, url) {
  const text = url.searchParams.get('text') || '';
  const size = Math.min(600, Math.max(80, Number(url.searchParams.get('size')) || 220));
  if (!text) { send(res, 400, '缺少 text 参数'); return; }
  const key = size + '|' + text;
  const hit = QR_CACHE.get(key);
  if (hit) {
    res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' });
    res.end(hit);
    return;
  }
  try {
    const up = await fetch('https://api.qrserver.com/v1/create-qr-code/?margin=8&size='
      + size + 'x' + size + '&data=' + encodeURIComponent(text));
    if (!up.ok) throw new Error('二维码服务返回 ' + up.status);
    const buf = Buffer.from(await up.arrayBuffer());
    if (QR_CACHE.size > 300) QR_CACHE.clear();
    QR_CACHE.set(key, buf);
    res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' });
    res.end(buf);
  } catch (e) {
    console.error('[qr] 生成失败：', e.message);
    send(res, 502, '二维码生成失败：' + e.message);
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const key = `${req.method} ${url.pathname}`;

  if (url.pathname === '/api/qr') { await handleQr(res, url); return; }

  if (url.pathname.startsWith('/api/')) {
    const handler = routes[key];
    if (!handler) { send(res, 404, { error: `接口不存在：${key}` }); return; }

    if (!hitLimit(req, url.pathname)) {
      res.writeHead(429, { 'Content-Type': 'application/json; charset=utf-8', 'Retry-After': '60' });
      res.end(JSON.stringify({ error: '请求过于频繁，请稍后再试' }));
      return;
    }

    try {
      // 所有 /api/admin/* 一律要口令（含 GET）
      if (url.pathname.startsWith('/api/admin/')) requireAdmin(req);
      const body = req.method === 'POST' ? await readBody(req) : {};
      send(res, 200, await handler(body, req, url));
    } catch (err) {
      const status = err.status || 500;
      console.error(`[api] ${key} 失败：`, err.message, err.detail ? JSON.stringify(err.detail) : '');
      send(res, status, { error: err.message || '服务异常' });
    }
    return;
  }

  serveStatic(req, res, url.pathname);
});

server.listen(cfg.port, () => {
  console.log(`\n扫码签到服务已启动：http://localhost:${cfg.port}`);
  console.log(`运行模式：${cfg.mode === 'live' ? 'live（飞书多维表格）' : 'mock（本地假数据）'}`);
  console.log(`三个入口：/q/{课次recordId}/current · /q/{课次recordId}/new · /q/{课次recordId}/makeup`);
  if (cfg.mode === 'mock') console.log('填好 .env 里的 FEISHU_APP_ID / FEISHU_APP_SECRET 并把 FEISHU_MODE 改成 live，即可切到真实数据。');
  if (cfg.mode === 'live' && (!cfg.feishu.appId || !cfg.feishu.appSecret)) {
    console.warn('警告：live 模式缺少 FEISHU_APP_ID / FEISHU_APP_SECRET');
  }
  if (cfg.mode === 'live' && !cfg.adminToken) {
    console.warn('警告：live 模式未设置 ADMIN_TOKEN，任何人都能切换场次阶段');
  }
  console.log(`入口类型：${audience.AUDIENCES.join(' / ')}`);
});
