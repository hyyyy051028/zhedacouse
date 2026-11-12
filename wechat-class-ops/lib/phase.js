'use strict';

/**
 * 场次阶段：自动按课表时间流转，工作人员可临时手动覆盖。
 * 时间统一按 Asia/Shanghai（+08:00）计算，与服务器所在时区无关。
 */

const fs = require('fs');
const path = require('path');
const cfg = require('./config');

const FILE = path.join(__dirname, '..', 'data', 'phase-override.json');
const STATES = ['confirm', 'checkin', 'survey'];

// 由 live 模式从「课次表」解析出的当期课表，优先于 .env 里的静态课表
let scheduleOverride = null;

function setSchedule(next) {
  scheduleOverride = next && next.day ? next : null;
}

function atLocal(day, hhmm) {
  if (!day) return null;
  const [y, mo, d] = String(day).split('-').map(Number);
  const [h, m] = String(hhmm || '00:00').split(':').map(Number);
  if (!y || !mo || !d) return null;
  return new Date(Date.UTC(y, mo - 1, d, (h || 0) - 8, m || 0));
}

function schedule() {
  const c = cfg.course;
  const day = (scheduleOverride && scheduleOverride.day) || c.day;
  const windowStart = (scheduleOverride && scheduleOverride.windowStart) || c.windowStart;
  const windowEnd = (scheduleOverride && scheduleOverride.windowEnd) || c.windowEnd;
  // 课次表填了「签到开放/关闭时间」就用绝对时间，否则按上课时段推算
  const explicitStart = scheduleOverride && scheduleOverride.startMs;
  const explicitEnd = scheduleOverride && scheduleOverride.endMs;
  const checkinStart = explicitStart ? new Date(explicitStart) : atLocal(day, windowStart);
  const checkinEnd = explicitEnd ? new Date(explicitEnd) : atLocal(day, windowEnd);
  const surveyEnd = atLocal(c.surveyEndDay || day, c.surveyEnd || '23:59');
  return {
    checkinStart,
    checkinEnd,
    surveyEnd,
    // 当天结束后去向：多天课次回到「报名确认」等次日，最后一天才进入评价
    afterEnd: (scheduleOverride && scheduleOverride.afterEnd) || 'survey',
    nextStart: (scheduleOverride && scheduleOverride.nextStart) || null,
  };
}

/** 由 live 模式把「课次表」解析出的当期课表推给阶段机 */
function setSchedule(next) {
  scheduleOverride = next && next.day ? next : null;
}

function autoState(now = new Date()) {
  const s = schedule();
  if (!s.checkinStart || !s.checkinEnd) return 'confirm';
  if (now < s.checkinStart) return 'confirm';
  if (now < s.checkinEnd) return 'checkin';
  if (s.afterEnd === 'confirm') return 'confirm';
  return 'survey';
}

function nextChange(now = new Date()) {
  const s = schedule();
  if (!s.checkinStart || !s.checkinEnd) return null;
  if (now < s.checkinStart) return { at: s.checkinStart.toISOString(), to: 'checkin', label: '现场签到' };
  if (now < s.checkinEnd) {
    if (s.afterEnd === 'confirm' && s.nextStart) return { at: s.nextStart, to: 'checkin', label: '现场签到' };
    return { at: s.checkinEnd.toISOString(), to: 'survey', label: '课后评价' };
  }
  if (s.afterEnd === 'confirm' && s.nextStart && now < new Date(s.nextStart)) {
    return { at: s.nextStart, to: 'checkin', label: '现场签到' };
  }
  return null;
}

function readOverride() {
  try {
    const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (data && STATES.includes(data.state)) return data;
  } catch { /* 无覆盖文件 */ }
  return null;
}

function writeOverride(state, by) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  if (!state) {
    try { fs.unlinkSync(FILE); } catch { /* 已不存在 */ }
    return null;
  }
  if (!STATES.includes(state)) {
    const err = new Error('非法阶段');
    err.status = 400;
    throw err;
  }
  const data = { state, by: by || '', at: new Date().toISOString() };
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  return data;
}

/** 当前生效阶段：手动覆盖优先，否则按课表自动判断 */
function current(now = new Date()) {
  const override = readOverride();
  return {
    state: override ? override.state : autoState(now),
    source: override ? 'manual' : 'auto',
    override: override || null,
    nextChange: nextChange(now),
    schedule: (() => {
      const s = schedule();
      return {
        checkinStart: s.checkinStart ? s.checkinStart.toISOString() : null,
        checkinEnd: s.checkinEnd ? s.checkinEnd.toISOString() : null,
      };
    })(),
    serverTime: now.toISOString(),
  };
}

module.exports = { current, setState: writeOverride, setSchedule, autoState, nextChange, STATES };
