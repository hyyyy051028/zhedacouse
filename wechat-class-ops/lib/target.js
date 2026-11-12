'use strict';

/**
 * 当前课次的人工指定（补签 / 提前发码 / 补录历史课次用）。
 * 优先级：.env SESSION_RECORD_ID > 这里的人工指定 > 按日期自动选。
 * 存在 data/session-target.json，重启不丢。
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'session-target.json');

function read() {
  try {
    const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (data && data.recordId) return data;
  } catch { /* 没有人工指定 */ }
  return null;
}

function write(recordId, by) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  if (!recordId) {
    try { fs.unlinkSync(FILE); } catch { /* 已不存在 */ }
    return null;
  }
  const data = { recordId, by: by || '', at: new Date().toISOString() };
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  return data;
}

module.exports = { read, write };
