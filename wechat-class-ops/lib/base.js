'use strict';

/**
 * live 模式：把业务动作映射到飞书多维表格（新 Base）。
 *
 * 表结构对应关系：
 *   学员 / 签到 / 确认 / 答卷 / 新客户试听 / 临时登记 / 课次 / 场次问卷
 */

const cfg = require('./config');
const feishu = require('./feishu');
const phase = require('./phase');
const target = require('./target');
const audience = require('./audience');
const report = require('./report');
const { maskId, maskPhone, publicPerson, usableId } = require('./privacy');

const SCHEMA_TTL = 5 * 60 * 1000;
let schemaCache = { at: 0, value: null };

const LIST_TTL = 10 * 1000;
const listCache = new Map();

function httpError(status, message, extra) {
  const err = new Error(message);
  err.status = status;
  if (extra) err.detail = extra;
  return err;
}

/* ---------------- 单元格读取（兼容文本数组 / 公式 / 关联） ---------------- */

function readText(cell) {
  if (cell === null || cell === undefined) return '';
  if (typeof cell === 'string') return cell;
  if (typeof cell === 'number') return String(cell);
  if (typeof cell === 'boolean') return cell ? '是' : '';
  if (Array.isArray(cell)) return cell.map(readText).filter(Boolean).join('');
  if (typeof cell === 'object') {
    if (Array.isArray(cell.value)) return readText(cell.value);
    if (typeof cell.value === 'string' || typeof cell.value === 'number') return String(cell.value);
    if (typeof cell.text === 'string') return cell.text;
    if (typeof cell.name === 'string') return cell.name;
    return '';
  }
  return '';
}

function readNumber(cell) {
  if (typeof cell === 'number') return cell;
  const n = Number(readText(cell).replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

/**
 * 关联单元格 → recordId 数组。
 * 真实结构（2026-11 实测）：
 *   [{ record_ids: ['rec...'], table_id: 'tbl...', text: '金融26期', type: 'text' }]
 * 老接口还可能返回 { link_record_ids: [...] } 或裸字符串数组，这里一并兼容。
 */
function linkIds(cell) {
  const arr = Array.isArray(cell) ? cell : (cell ? [cell] : []);
  const out = [];
  for (const x of arr) {
    if (!x) continue;
    if (typeof x === 'string') { out.push(x); continue; }
    if (Array.isArray(x.record_ids)) { out.push(...x.record_ids); continue; }
    if (Array.isArray(x.link_record_ids)) { out.push(...x.link_record_ids); continue; }
    if (Array.isArray(x.recordIds)) { out.push(...x.recordIds); continue; }
    if (x.id) { out.push(x.id); continue; }
    if (x.record_id) { out.push(x.record_id); continue; }
  }
  return out.filter(Boolean);
}

/* ---------------- 表结构 ---------------- */

function pickTable(all, want) {
  const exact = all.find((t) => t.name === want);
  if (exact) return exact;
  const bySuffix = all.filter((t) => t.name.endsWith(want)).sort((a, b) => a.name.length - b.name.length);
  if (bySuffix.length) return bySuffix[0];
  const byIncludes = all.filter((t) => t.name.includes(want)).sort((a, b) => a.name.length - b.name.length);
  return byIncludes[0] || null;
}

async function getSchema() {
  if (schemaCache.value && Date.now() - schemaCache.at < SCHEMA_TTL) return schemaCache.value;

  const all = await feishu.listTables();
  const tables = {};
  const missing = [];

  for (const [key, wantName] of Object.entries(cfg.tables)) {
    const found = pickTable(all, wantName);
    if (!found) { missing.push({ key, name: wantName }); continue; }

    const fields = await feishu.listFields(found.table_id);
    tables[key] = {
      id: found.table_id,
      name: found.name,
      fields: fields.map((f) => ({ name: f.field_name, type: f.type, property: f.property || {} })),
    };
  }

  const c = cfg.candidates;
  const resolved = {
    student: resolveFields(tables.student, cfg.fields.student, {
      name: c.studentName, phone: c.studentPhone, l4: c.studentL4, company: c.studentCompany,
      idcard: c.studentIdcard, plate: c.studentPlate, status: c.studentStatus,
      period: c.studentPeriod, klass: c.studentClass,
      reportStatus: c.studentReportStatus, reportDate: c.studentReportDate,
    }),
    checkin: resolveFields(tables.checkin, cfg.fields.checkin, {
      student: c.checkinStudent, trial: c.checkinTrial, session: c.checkinSession,
      name: c.checkinName, time: c.checkinTime, date: c.checkinDate,
      status: c.checkinStatus, way: c.checkinWay,
    }),
    trial: resolveFields(tables.trial, cfg.fields.trial, {
      company: c.trialCompany, name: c.trialName, position: c.trialPosition, idcard: c.trialIdcard,
      phone: c.trialPhone, plate: c.trialPlate, inviter: c.trialInviter,
      day: c.trialDay, reportLink: c.trialReportLink,
    }),
    confirm: resolveFields(tables.confirm, cfg.fields.confirm, {
      student: c.confirmStudent, session: c.confirmSession, status: c.confirmStatus,
      reason: c.confirmReason, source: c.confirmSource, time: c.confirmTime,
    }),
    survey: resolveFields(tables.survey, cfg.fields.survey, {
      student: c.surveyStudent, trial: c.surveyTrial, session: c.surveySession,
      questionnaire: c.surveyQuestionnaire,
      q1: c.surveyQ1, q2: c.surveyQ2, q3: c.surveyQ3, q4: c.surveyQ4, q5: c.surveyQ5, time: c.surveyTime,
    }),
    guest: resolveFields(tables.guest, cfg.fields.guest, {
      session: c.guestSession, name: c.guestName, company: c.guestCompany,
      phone: c.guestPhone, status: c.guestStatus, time: c.guestTime,
    }),
    report: resolveFields(tables.report, cfg.fields.report, reportCandidates(c)),
    newReport: resolveFields(tables.newReport, cfg.fields.newReport, reportCandidates(c)),
    makeupReport: resolveFields(tables.makeupReport, cfg.fields.makeupReport, reportCandidates(c)),
  };

  const value = { tables, missing, resolved };
  schemaCache = { at: Date.now(), value };
  return value;
}

function reportCandidates(c) {
  return {
    name: c.reportName, gender: c.reportGender, idType: c.reportIdType,
    idNumber: c.reportIdNumber, company: c.reportCompany, phone: c.reportPhone,
    plate: c.reportPlate, plateColor: c.reportPlateColor, status: c.reportStatus,
    submittedAt: c.reportSubmittedAt, klass: c.reportClass,
    session: c.reportSession, trial: c.reportTrial, day: c.reportDay,
  };
}

function resolveFields(table, fixed, candidates) {
  const out = {};
  const available = table ? table.fields : [];
  const has = (n) => available.some((f) => f.name === n);

  for (const [key, want] of Object.entries(fixed || {})) {
    out[key] = want && has(want) ? want : '';
  }
  for (const [key, names] of Object.entries(candidates || {})) {
    if (out[key]) continue;
    const hit = (names || []).find((n) => has(n));
    if (hit) out[key] = hit;
  }
  return out;
}

async function tableRef(key) {
  const schema = await getSchema();
  const table = schema.tables[key];
  if (!table) {
    const miss = schema.missing.find((m) => m.key === key);
    throw httpError(501, `飞书里找不到表「${miss ? miss.name : cfg.tables[key]}」，请检查 .env 里的表名`);
  }
  return table;
}

function fieldMeta(table, name) {
  return name ? table.fields.find((x) => x.name === name) : null;
}

function selectValue(table, name, keywords) {
  const meta = fieldMeta(table, name);
  if (!meta) return '';
  if (meta.type === 3) {
    const opts = (meta.property && meta.property.options) || [];
    for (const kw of keywords) {
      const hit = opts.find((o) => String(o.name).includes(kw));
      if (hit) return hit.name;
    }
    return '';
  }
  return keywords[0] || '';
}

/* ---------------- 当前课次 ---------------- */

function localStartMs(ms, hhmm) {
  const d = new Date(ms);
  const [h, mi] = String(hhmm || '00:00').split(':').map(Number);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h || 0, mi || 0).getTime();
}

function sessionGroupKey(s) {
  if (!s) return '';
  const period = (s.periodIds && s.periodIds[0]) || '';
  if (period && s.seq) return period + '#' + s.seq;
  const name = (s.name || '').replace(/\s*·\s*第[一二三四五六七八九十\d]+天.*$/, '').trim();
  return period + '#' + (name || s.recordId);
}

async function loadSessions() {
  const table = await tableRef('session');
  return cached('sessions:all', LIST_TTL, async () => {
    const rows = await feishu.searchRecords(table.id, { pageSize: 500 });
    return rows.map(shapeSession).filter((x) => x.date);
  });
}

async function groupOf(session) {
  try {
    const key = sessionGroupKey(session);
    const rows = await loadSessions();
    return rows.filter((x) => sessionGroupKey(x) === key).sort((a, b) => a.date - b.date);
  } catch {
    return session ? [session] : [];
  }
}

async function currentSession() {
  return cached('session', 60 * 1000, async () => {
    const table = await tableRef('session');
    // 优先级：.env 固定 > /staff 人工指定 > 按日期自动
    const forced = cfg.session.recordId || (target.read() || {}).recordId || '';
    if (forced) {
      const rec = await feishu.getRecord(table.id, forced);
      const s = shapeSession({ recordId: rec.recordId, fields: rec.fields });
      await applySessionSchedule(s);
      return s;
    }
    const rows = await feishu.searchRecords(table.id, { pageSize: 500 });
    const list = rows.map((r) => shapeSession(r)).filter((x) => x.date);
    if (!list.length) return null;

    const now = Date.now();
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const day = dayStart.getTime();

    const hit = list.find((x) => x.date >= day && x.date < day + 86400000)
      || list.filter((x) => x.date >= now).sort((a, b) => a.date - b.date)[0]
      || list.filter((x) => x.date < now).sort((a, b) => b.date - a.date)[0]
      || null;

    if (hit) console.log(`[live] 当前课次：${hit.name || hit.recordId}（${new Date(hit.date).toLocaleDateString('zh-CN')}）`);
    await applySessionSchedule(hit);
    return hit;
  });
}

/** 按 recordId 取课次（二维码 URL 里带的就是它）；取不到时退回"按日期自动选" */
async function sessionFrom(recordId) {
  if (!recordId) return currentSession().catch(() => null);
  try {
    return await cached('session:' + recordId, 60 * 1000, async () => {
      const table = await tableRef('session');
      const rec = await feishu.getRecord(table.id, recordId);
      return shapeSession({ recordId: rec.recordId, fields: rec.fields });
    });
  } catch (e) {
    console.warn('[live] 指定课次读取失败，回退当前课次：' + e.message);
    return currentSession().catch(() => null);
  }
}

/** 用课次的上课日期 + 上课时段驱动自动阶段流转 */
async function applySessionSchedule(s) {
  if (!s || !s.date) return;
  const d = new Date(s.date);
  const day = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const m = /(\d{1,2}):(\d{2})\s*[-–~—]\s*(\d{1,2}):(\d{2})/.exec(s.timeRange || '');
  const windowStart = m ? `${pad(m[1])}:${m[2]}` : cfg.course.windowStart;
  const windowEnd = m ? `${pad(m[3])}:${m[4]}` : cfg.course.windowEnd;

  // 同一课次组还有下一天：当天结束回到「报名确认」，等次日签到；最后一天结束才进评价
  const group = await groupOf(s);
  const later = group.find((x) => x.date > s.date);
  let nextStart = null;
  if (later) {
    const lm = /(\d{1,2}):(\d{2})/.exec(later.timeRange || '');
    nextStart = new Date(localStartMs(later.date, lm ? `${pad(lm[1])}:${lm[2]}` : cfg.course.windowStart)).toISOString();
  }
  // 课次表「签到开放时间/签到关闭时间」优先
  const explicit = s.openAt && s.closeAt && s.openAt < s.closeAt;
  phase.setSchedule({
    day, windowStart, windowEnd,
    startMs: explicit ? s.openAt : 0,
    endMs: explicit ? s.closeAt : 0,
    afterEnd: later ? 'confirm' : 'survey',
    nextStart,
  });
}

async function syncSchedule() {
  try {
    const s = await currentSession();
    if (s) await applySessionSchedule(s);
  } catch (e) {
    console.warn('[live] 课次同步失败：' + e.message);
  }
  return phase.current();
}

function shapeSession(rec) {
  const f = rec.fields || {};
  return {
    recordId: rec.recordId,
    name: readText(f[cfg.session.nameField]),
    date: readNumber(f[cfg.session.dateField]),
    state: readText(f['场次状态']),
    topic: readText(f['课程主题']),
    place: readText(f['上课地点']),
    campus: readText(f['上课校区']),
    speaker: readText(f['主讲人']),
    intro: readText(f['讲师介绍']),
    take: readText(f['本期收获']),
    agenda: readText(f['今日议程']),
    room: readText(f['教室']),
    timeRange: readText(f['上课时段']),
    seq: readNumber(f['课次序号']),
    periodIds: linkIds(f['所属期次']),
    teacherIds: linkIds(f[cfg.session.teacherField]),
    classIds: linkIds(f['所属班级']),
    deadline: readNumber(f['确认出席截止日']),
    reportDeadline: readNumber(f['报备截止日']),
    openAt: readNumber(f['签到开放时间']),
    closeAt: readNumber(f['签到关闭时间']),
    oldCode: readText(f['老学员码']),
    newCode: readText(f['新学员码']),
  };
}

function sessionLabel() {
  return { label: '所属课次' };
}

/* ---------------- 读取 ---------------- */
async function cached(key, ttl, fn) {
  const hit = listCache.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.value;
  const value = await fn();
  listCache.set(key, { at: Date.now(), value });
  return value;
}

function invalidate() { listCache.clear(); }

async function loadStudents() {
  const table = await tableRef('student');
  const f = (await getSchema()).resolved.student;
  return cached('students', LIST_TTL, async () => {
    const records = await feishu.searchRecords(table.id, { pageSize: 500 });
    return records.map((r) => {
      const phone = f.phone ? readText(r.fields[f.phone]) : '';
      const formulaL4 = f.l4 ? readText(r.fields[f.l4]) : '';
      const l4 = (phone.replace(/\D/g, '').slice(-4) || formulaL4.replace(/\D/g, '').slice(-4));
      return {
        id: r.recordId,
        name: readText(r.fields[f.name]),
        company: f.company ? readText(r.fields[f.company]) : '',
        phone,
        l4,
        idcard: f.idcard ? readText(r.fields[f.idcard]) : '',
        plate: f.plate ? readText(r.fields[f.plate]).trim() : '',
        status: f.status ? readText(r.fields[f.status]) : '',
        periodIds: f.period ? linkIds(r.fields[f.period]) : [],
        classIds: f.klass ? linkIds(r.fields[f.klass]) : [],
        reportStatus: f.reportStatus ? readText(r.fields[f.reportStatus]) : '',
      };
    }).filter((s) => s.name && s.l4);
  });
}

/* ---------------- 期次名册（方案二） ----------------
 * 学员表 = 人员主档（一人一行，不绑期次）
 * 金融XX期学员表 = 该期名册（谁在读、哪个班）
 * 识别顺序：本期名册表 → 学员表按所属期次过滤 → 全量（并告警）
 * ---------------------------------------------- */

async function loadPeriodName(periodId) {
  if (!periodId) return '';
  try {
    return await cached('period:name:' + periodId, 5 * 60 * 1000, async () => {
      const table = await tableRef('period');
      const rec = await feishu.getRecord(table.id, periodId);
      return readText(rec.fields[cfg.period.nameField]);
    });
  } catch {
    return '';
  }
}

/** 按「期次名称」找名册表并读出成员；找不到表返回 null */
async function loadRosterMembers(periodName) {
  if (!periodName) return null;
  const want = cfg.rosterTable.replace('{period}', periodName);
  const all = await feishu.listTables();
  const table = pickTable(all, want);
  if (!table) return null;
  return cached('roster:' + table.table_id, 60 * 1000, async () => {
    const rows = await feishu.searchRecords(table.table_id, { pageSize: 500 });
    const sf = (await getSchema()).resolved.student;
    const out = [];
    for (const r of rows) {
      const f = r.fields || {};
      const name = sf.name ? readText(f[sf.name]) : '';
      const phone = sf.phone ? readText(f[sf.phone]) : '';
      const l4 = phone.replace(/\D/g, '').slice(-4)
        || (sf.l4 ? readText(f[sf.l4]).replace(/\D/g, '').slice(-4) : '');
      if (!name || !l4) continue;
      out.push({
        rosterId: r.recordId,
        name,
        phone,
        l4,
        idcard: sf.idcard ? readText(f[sf.idcard]) : '',
        plate: sf.plate ? readText(f[sf.plate]).trim() : '',
        company: sf.company ? readText(f[sf.company]) : '',
      });
    }
    return out;
  });
}

const digitsOf = (v) => String(v || '').replace(/\D/g, '');

/**
 * 名册上下文。list 里的 id 始终是「学员表」的 recordId，
 * 这样确认/签到/答卷的关联字段不用改指向。
 */
async function rosterContext(session) {
  const master = await loadStudents();
  const periodId = session && session.periodIds && session.periodIds[0];
  if (!periodId) return { list: master, source: 'all', missing: 0, periodName: '' };

  const periodName = await loadPeriodName(periodId);
  const members = await loadRosterMembers(periodName).catch(() => null);

  if (members && members.length) {
    const byPhone = new Set(members.map((m) => digitsOf(m.phone)).filter(Boolean));
    const byName = new Set(members.map((m) => m.name));
    const list = master.filter((s) => byPhone.has(digitsOf(s.phone)) || byName.has(s.name));
    // 名册里有、主档里没有的人（需要先补录到学员表，否则没法写入确认/签到）
    const missing = members.filter((m) => !master.some((s) => digitsOf(s.phone) === digitsOf(m.phone) || s.name === m.name));
    return { list, source: 'roster', missing: missing.length, missingNames: missing.map((m) => m.name), periodName };
  }

  const bound = master.filter((s) => s.periodIds.includes(periodId));
  if (bound.length) return { list: bound, source: 'master', missing: 0, periodName };
  return { list: master, source: 'all', missing: 0, periodName };
}

async function periodRoster(session) {
  return (await rosterContext(session)).list;
}

async function schemaTables() {
  const schema = await getSchema();
  return schema.tables;
}

async function loadTeachers() {
  const table = (await schemaTables()).teacher;
  if (!table) return [];
  return cached('teachers', LIST_TTL, async () => {
    const records = await feishu.searchRecords(table.id, { pageSize: 200 });
    return records.map((r) => {
      const f = r.fields || {};
      return {
        id: r.recordId,
        name: readText(f['姓名']),
        title: readText(f['头衔']),
        org: readText(f['机构']),
        intro: readText(f['简介']),
        type: readText(f['类型']),
      };
    }).filter((t) => t.name);
  });
}

async function loadTrials() {
  const table = await tableRef('trial');
  const f = (await getSchema()).resolved.trial;
  return cached('trials', LIST_TTL, async () => {
    const records = await feishu.searchRecords(table.id, { pageSize: 500 });
    return records.map((r) => {
      const phone = f.phone ? readText(r.fields[f.phone]) : '';
      return {
        id: r.recordId,
        name: f.name ? readText(r.fields[f.name]) : '',
        company: f.company ? readText(r.fields[f.company]) : '',
        position: f.position ? readText(r.fields[f.position]) : '',
        inviter: f.inviter ? readText(r.fields[f.inviter]) : '',
        day: f.day ? readText(r.fields[f.day]) : '',
        idcard: f.idcard ? readText(r.fields[f.idcard]) : '',
        plate: f.plate ? readText(r.fields[f.plate]).trim() : '',
        phone,
        l4: phone.replace(/\D/g, '').slice(-4),
      };
    });
  });
}

async function loadCheckins() {
  const table = await tableRef('checkin');
  const f = (await getSchema()).resolved.checkin;
  return cached('checkins', LIST_TTL, async () => {
    const fieldNames = [f.name, f.time, f.student, f.trial, f.session].filter(Boolean);
    const records = await feishu.searchRecords(table.id, { pageSize: 500, fieldNames });
    return records.map((r) => ({
      recordId: r.recordId,
      name: f.name ? readText(r.fields[f.name]) : '',
      studentIds: f.student ? linkIds(r.fields[f.student]) : [],
      trialIds: f.trial ? linkIds(r.fields[f.trial]) : [],
      sessionIds: f.session ? linkIds(r.fields[f.session]) : [],
      time: f.time ? readNumber(r.fields[f.time]) : 0,
    }));
  });
}

async function loadConfirms() {
  const table = await tableRef('confirm');
  const f = (await getSchema()).resolved.confirm;
  return cached('confirms', LIST_TTL, async () => {
    const fieldNames = [f.student, f.session, f.status, f.reason].filter(Boolean);
    const records = await feishu.searchRecords(table.id, { pageSize: 500, fieldNames });
    return records.map((r) => ({
      recordId: r.recordId,
      studentId: f.student ? (linkIds(r.fields[f.student])[0] || '') : '',
      sessionIds: f.session ? linkIds(r.fields[f.session]) : [],
      status: f.status ? readText(r.fields[f.status]) : '',
      reason: f.reason ? readText(r.fields[f.reason]) : '',
    }));
  });
}

async function loadSurveys() {
  const table = await tableRef('survey');
  const f = (await getSchema()).resolved.survey;
  return cached('surveys', LIST_TTL, async () => {
    const fieldNames = [f.student, f.trial, f.session, f.q1].filter(Boolean);
    const records = await feishu.searchRecords(table.id, { pageSize: 500, fieldNames });
    return records.map((r) => ({
      recordId: r.recordId,
      studentIds: f.student ? linkIds(r.fields[f.student]) : [],
      trialIds: f.trial ? linkIds(r.fields[f.trial]) : [],
      sessionIds: f.session ? linkIds(r.fields[f.session]) : [],
      q1: f.q1 ? readNumber(r.fields[f.q1]) : 0,
    }));
  });
}

/* ---------------- 阶段 / 课程信息 ---------------- */

function courseState() {
  return phase.current().state;
}

function pad(n) { return String(n).padStart(2, '0'); }

function formatSessionDate(ms, timeRange) {
  const d = new Date(ms);
  const week = '日一二三四五六'[d.getDay()];
  const base = `${d.getMonth() + 1} 月 ${d.getDate()} 日 周${week}`;
  return timeRange ? `${base} · ${timeRange}` : base;
}

async function courseInfo(sessionArg) {
  const info = Object.assign({}, cfg.course);
  try {
    const s = sessionArg === undefined ? await currentSession() : sessionArg;
    if (s) {
      info.sessionId = s.recordId;
      info.sessionName = s.name;
      if (s.topic) info.title = s.topic;
      else if (s.name) info.title = s.name;
      if (s.name) {
        const period = s.name.split('·')[0].trim();
        if (period) info.period = period;
      }
      const place = resolvePlace(s);
      if (place) info.place = place;
      if (s.speaker) info.speaker = s.speaker;
      if (s.intro) info.intro = s.intro;
      if (s.agenda) info.agenda = s.agenda;
      // 讲师及嘉宾：关联「讲师表」，支持一课多人
      const allTeachers = await loadTeachers().catch(() => []);
      const list = (s.teacherIds || []).map((id) => allTeachers.find((t) => t.id === id)).filter(Boolean);
      if (list.length) {
        info.teachers = list;
        info.speaker = list
          .map((t) => t.name + (t.type && t.type !== '主讲' ? '（' + t.type + '）' : ''))
          .join('、');
      }
      if (s.date) {
        info.date = formatSessionDate(s.date, s.timeRange);
        const d = new Date(s.date);
        info.day = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      }
      // 同一次课次里，确认截止沿用配置；时间窗用来展示
      info.window = s.timeRange || info.window;
      const m = /(\d{1,2}):(\d{2})\s*[-–~—]\s*(\d{1,2}):(\d{2})/.exec(s.timeRange || '');
      if (m) {
        info.windowStart = `${pad(m[1])}:${m[2]}`;
        info.windowEnd = `${pad(m[3])}:${m[4]}`;
      }
      // 默认「课程当天 0 点」截止；课次表里填了则人工覆盖
      const dl = deadlineOf(s);
      info.deadline = dl ? formatDeadline(dl) : '';
      info.deadlineAt = dl || 0;
    }
  } catch (e) {
    console.warn('[live] 课次信息读取失败：' + e.message);
  }
  return info;
}

/** 地点：优先「上课地点」，否则用「教室」，教室没带校区时补上前缀 */
function resolvePlace(s) {
  if (!s) return '';
  const room = s.room || '';
  const campus = s.campus || '';
  let place = s.place || '';
  if (!place) {
    place = room || campus;
    if (room && campus && !room.includes(campus)) place = campus + ' · ' + room;
  }
  return place;
}

/** 北京时间的当天 00:00（与服务器所在时区无关） */
function startOfDayCN(ms) {
  const CN = 8 * 3600 * 1000;
  const d = new Date(ms + CN);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - CN;
}

/**
 * 确认截止：
 *   - 课次表「确认出席截止日」填了就用它（人工覆盖）
 *   - 没填则默认「课程当天 0 点」——11.14 的课，11.14 00:00 截止
 */
function deadlineOf(s) {
  if (!s || !s.date) return 0;
  if (s.deadline) return s.deadline;
  return startOfDayCN(s.date);
}

/** 按北京时间格式化，避免服务器时区不同导致偏移 */
function formatDeadline(ms) {
  const CN = 8 * 3600 * 1000;
  const d = new Date(ms + CN);
  return `${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

/* ---------------- 统计 ---------------- */

async function stats(sessionArg) {
  const session = sessionArg === undefined ? await currentSession().catch(() => null) : sessionArg;
  const [students, checkins, surveys, confirms, trials, guests] = await Promise.all([
    loadStudents(),
    loadCheckins().catch((e) => logSoft('签到表', e)),
    loadSurveys().catch((e) => logSoft('答卷表', e)),
    loadConfirms().catch((e) => logSoft('确认表', e)),
    loadTrials().catch((e) => logSoft('新客户试听', e)),
    loadGuests().catch((e) => logSoft('临时登记表', e)),
  ]);
  const roster = await periodRoster(session).catch(() => students);
  const q1 = surveys.filter((s) => inSession(s, session)).map((s) => s.q1).filter((n) => n > 0);
  return {
    total: roster.length,
    rsvp: confirms.filter((c) => inSession(c, session) && c.status.includes('确认')).length,
    signed: checkins.filter((c) => inSession(c, session)).length,
    surveyed: surveys.filter((s) => inSession(s, session)).length,
    surveyAvg: q1.length ? Number((q1.reduce((a, b) => a + b, 0) / q1.length).toFixed(1)) : null,
    registered: trials.length,
    guests: guests.length,
  };
}

async function loadGuests() {
  const table = await tableRef('guest');
  return cached('guests', LIST_TTL, async () => feishu.searchRecords(table.id, { pageSize: 500 }));
}

function logSoft(label, err) {
  console.warn(`[live] ${label} 读取失败，统计暂时按 0 计：${err.message}`);
  return [];
}

/* ---------------- 单人快照 ---------------- */

/** 只保留属于指定课次的记录；session 未知时不过滤（兼容没有课次关联的旧数据） */
function inSession(row, session) {
  if (!session) return true;
  const ids = row.sessionIds || [];
  return ids.includes(session.recordId);
}

/** 找这个人最近一次报备（任意课次），用于"沿用上次入校信息" */
async function lastReportOf(student) {
  const phone = digitsOf(student.phone);
  for (const kind of ['report', 'makeupReport']) {
    try {
      const rows = await loadReports(kind);
      const hit = rows.find((r) => (phone && digitsOf(r.phone) === phone) || r.name === student.name);
      if (hit) return { company: hit.company || '', plate: hit.plate || '', kind };
    } catch { /* 忽略 */ }
  }
  return null;
}

async function personOf(type, id, sessionArg) {
  const session = sessionArg === undefined ? await currentSession().catch(() => null) : sessionArg;
  const [signin, survey] = await Promise.all([
    checkinOf(type, id, session).catch(() => null),
    surveyOf(type, id, session).catch(() => null),
  ]);

  if (type === 'new') {
    const hit = (await loadTrials()).find((t) => t.id === id);
    if (!hit) throw httpError(404, '找不到该试听学员');
    return {
      id,
      type: 'new',
      name: hit.name,
      company: hit.company,
      phone: hit.phone,
      idcard: hit.idcard || '',
      plate: hit.plate || '',
      position: hit.position,
      inviter: hit.inviter,
      rsvp: null,
      reason: null,
      signin,
      survey,
      profileMissing: !hit.company || !hit.idcard,
    };
  }

  const hit = (await loadStudents()).find((s) => s.id === id);
  if (!hit) throw httpError(404, '找不到该学员');
  const confirm = (await loadConfirms()).find((c) => c.studentId === id && inSession(c, session)) || null;

  return {
    id,
    type: 'old',
    name: hit.name,
    company: hit.company,
    phone: hit.phone,
    idcard: hit.idcard,
    plate: hit.plate,
    periodIds: hit.periodIds,
    classIds: hit.classIds,
    position: '',
    rsvp: confirm ? (confirm.status.includes('请假') ? 'leave' : 'confirm') : null,
    reason: confirm ? confirm.reason : null,
    reportStatus: hit.reportStatus,
    lastReport: await lastReportOf(hit).catch(() => null),
    signin,
    survey,
    profileMissing: !hit.company,
  };
}

async function checkinOf(type, id, sessionArg) {
  const session = sessionArg === undefined ? await currentSession().catch(() => null) : sessionArg;
  let rows;
  try { rows = await loadCheckins(); } catch { return null; }
  const hit = rows.find((r) => inSession(r, session)
    && (type === 'new' ? r.trialIds.includes(id) : r.studentIds.includes(id)));
  if (!hit) return null;
  const d = new Date(hit.time || Date.now());
  // 序号按签到时间排序，避免并发时按表格行序产生错乱
  const ordered = rows.filter((r) => inSession(r, session) && r.time).sort((a, b) => a.time - b.time);
  const seq = Math.max(1, ordered.findIndex((r) => r.recordId === hit.recordId) + 1);
  return { t: `${pad(d.getHours())}:${pad(d.getMinutes())}`, seq, time: hit.time };
}

async function surveyOf(type, id, sessionArg) {
  const session = sessionArg === undefined ? await currentSession().catch(() => null) : sessionArg;
  let rows;
  try { rows = await loadSurveys(); } catch { return null; }
  const hit = rows.find((r) => inSession(r, session)
    && (type === 'new' ? r.trialIds.includes(id) : r.studentIds.includes(id)));
  return hit ? { q1: hit.q1 } : null;
}

/* ---------------- 业务动作 ---------------- */

async function listSessions() {
  const table = await tableRef('session');
  const teachers = await loadTeachers().catch(() => []);
  return cached('sessions:list', 60 * 1000, async () => {
    const rows = await feishu.searchRecords(table.id, { pageSize: 500 });
    return rows.map(shapeSession)
      .filter((x) => x.date)
      .sort((a, b) => a.date - b.date)
      .slice(0, 40)
      .map((x) => ({
        id: x.recordId,
        name: x.name,
        date: x.date,
        timeRange: x.timeRange,
        place: x.place || x.campus || '',
        room: x.room || '',
        campus: x.campus || '',
        topic: x.topic || '',
        take: x.take || '',
        agenda: x.agenda || '',
        speaker: x.speaker || '',
        seq: x.seq || 0,
        periodId: (x.periodIds || [])[0] || '',
        teachers: (x.teacherIds || [])
          .map((id) => teachers.find((t) => t.id === id))
          .filter(Boolean)
          .map((t) => ({ name: t.name, title: t.title, org: t.org, type: t.type })),
      }));
  });
}

async function bootstrap(sessionArg, entryArg) {
  const session = sessionArg === undefined ? await currentSession().catch(() => null) : sessionArg;
  const [st, course] = await Promise.all([stats(session), courseInfo(session)]);
  const rosterInfo = await rosterStatus(session).catch(() => ({ bound: false, count: 0, periodId: '' }));
  return {
    mode: 'live',
    state: phase.current().state,
    entry: audience.normaliseEntry(entryArg),
    course,
    session: session ? {
      id: session.recordId,
      name: session.name,
      date: session.date,
      timeRange: session.timeRange,
      place: resolvePlace(session),
      deadline: deadlineOf(session) ? formatDeadline(deadlineOf(session)) : '',
      deadlineAt: deadlineOf(session) || 0,
      periodId: (session.periodIds || [])[0] || '',
    } : null,
    stats: st,
    students: [],
    newStudents: [],
    guests: [],
    baseToken: cfg.feishu.baseToken,
    audiences: audience.AUDIENCES,
    roster: rosterInfo,
    warnings: (() => {
      const w = [];
      if (rosterInfo.source === 'roster') {
        if (rosterInfo.missing) {
          w.push('名册里有 ' + rosterInfo.missing + ' 人不在学员主档（' + rosterInfo.missingNames.join('、') + '），这些人无法签到');
        }
      } else if (rosterInfo.source === 'master') {
        w.push('没找到「' + rosterInfo.periodName + '学员表」，已改用学员表按「所属期次」过滤');
      } else {
        w.push('本期名册为空：课次所属期次上没有绑定学员，任何一期的人都可能识别进来');
      }
      return w;
    })(),
  };
}

/**
 * 名册是否已按「所属期次」绑定。
 * 未绑定时 periodRoster 会退化为全量，跨期次时会串人，这里把这个状态暴露出去。
 */
async function rosterStatus(session) {
  const ctx = await rosterContext(session);
  return {
    bound: ctx.source !== 'all',
    source: ctx.source,
    periodName: ctx.periodName,
    count: ctx.list.length,
    total: (await loadStudents()).length,
    missing: ctx.missing || 0,
    missingNames: ctx.missingNames || [],
    periodId: (session && session.periodIds && session.periodIds[0]) || '',
  };
}

async function identify(l4, entry, sessionArg) {
  const session = sessionArg === undefined ? await currentSession().catch(() => null) : sessionArg;
  const [roster, all, trials] = await Promise.all([
    periodRoster(session).catch(() => []),
    loadStudents(),
    loadTrials().catch(() => []),
  ]);

  const verdict = audience.decide({ l4, entry, roster, all, trials });
  const base = {
    audience: verdict.audience,
    entry: audience.normaliseEntry(entry),
    notice: verdict.notice || '',
  };
  if (verdict.reason) return Object.assign(base, { found: false, reason: verdict.reason });

  const type = verdict.audience === 'new' ? 'new' : 'old';
  const person = await personOf(type, verdict.match.id, session);
  return Object.assign(base, { found: true, person });
}

function normalizeProfile(profile, student) {
  const p = profile || {};
  const pick = (v, fallback) => (v === undefined || v === null ? (fallback || '') : v);
  return {
    name: student.name,
    company: String(pick(p.company, student.company)).trim(),
    phone: String(pick(p.phone, student.phone)).trim(),
    idcard: usableId(pick(p.idcard, student.idcard)) || student.idcard,
    // 显式传空串代表"今天不开车"，要覆盖掉档案里的旧车牌
    plate: report.normalizePlate(pick(p.plate, student.plate)),
    idType: String(p.idType || '身份证').trim(),
    gender: String(p.gender || '').trim(),
  };
}

async function loadReports(kind) {
  const table = await tableRef(kind);
  return cached('reports:' + kind, LIST_TTL, async () => {
    const f = (await getSchema()).resolved[kind];
    const records = await feishu.searchRecords(table.id, { pageSize: 500 });
    return records.map((r) => ({
      recordId: r.recordId,
      name: f.name ? readText(r.fields[f.name]) : '',
      phone: f.phone ? readText(r.fields[f.phone]) : '',
      plate: f.plate ? readText(r.fields[f.plate]) : '',
      company: f.company ? readText(r.fields[f.company]) : '',
      day: f.day ? readText(r.fields[f.day]) : '',
      sessionIds: f.session ? linkIds(r.fields[f.session]) : [],
    }));
  });
}

async function saveStudentProfile(studentId, p, schema) {
  const sf = schema.resolved.student;
  const fields = {};
  if (sf.company && p.company) fields[sf.company] = p.company;
  if (sf.idcard && p.idcard) fields[sf.idcard] = p.idcard;
  if (sf.plate) fields[sf.plate] = p.plate || '';
  if (!Object.keys(fields).length) return;
  const table = await tableRef('student');
  await feishu.updateRecord(table.id, studentId, fields);
}

/**
 * 写报备：在读 → 表7，补课 → 表16。
 * 幂等键 = 课次 + (手机号 or 姓名)，避免重复提交产生重复报备。
 */
async function submitReport({ student, session, kind, profile }) {
  const schema = await getSchema();
  const tableKey = report.AUDIENCE_TABLE[kind];
  const table = await tableRef(tableKey);
  const f = schema.resolved[tableKey];
  if (!f || !f.name) throw httpError(501, '报备表字段未识别，请检查表名与字段名');

  const person = normalizeProfile(profile, student);
  if (!person.company) throw httpError(400, '请填写单位名称（入校报备必填）');
  if (!person.idcard) throw httpError(400, '请补充身份证号（入校报备必填）');

  const payload = report.buildFields({
    person, session, f, audience: kind, status: '已提交', now: Date.now(),
  });

  const phoneDigits = person.phone.replace(/\D/g, '');
  // 表7/表16 已经有「所属课次」，必须按课次精确匹配；
  // 否则无课次的历史记录（手工补的）会被当成"通用记录"反复覆盖。
  const hasSessionField = Boolean(f.session);
  const existed = (await loadReports(tableKey)).find((r) => {
    const sameSession = hasSessionField
      ? (session && r.sessionIds.includes(session.recordId))
      : true;
    if (!sameSession) return false;
    return (phoneDigits && r.phone.replace(/\D/g, '') === phoneDigits) || r.name === person.name;
  });

  let recordId;
  if (existed) {
    await feishu.updateRecord(table.id, existed.recordId, payload);
    recordId = existed.recordId;
  } else {
    recordId = (await feishu.createRecord(table.id, payload)).recordId;
  }

  await saveStudentProfile(student.id, person, schema).catch((e) => {
    console.warn('[live] 学员档案回写失败：' + e.message);
  });

  // 只有表7 有「报备状态」，顺手同步回学员表，班主任一眼能看到
  if (kind === 'current') {
    const sf = schema.resolved.student;
    const stFields = {};
    if (sf.reportStatus) stFields[sf.reportStatus] = '已提交';
    if (sf.reportDate) stFields[sf.reportDate] = Date.now();
    if (Object.keys(stFields).length) {
      const stTable = await tableRef('student');
      await feishu.updateRecord(stTable.id, student.id, stFields).catch((e) => {
        console.warn('[live] 学员表报备状态回写失败：' + e.message);
      });
    }
  }

  return { kind, recordId, plate: person.plate, company: person.company, updated: Boolean(existed) };
}

async function rsvp(id, type, action, reason, opts = {}) {
  if (type === 'new') throw httpError(400, '新学员无需参加确认');

  const session = opts.session === undefined ? await currentSession().catch(() => null) : opts.session;
  const student = (await loadStudents()).find((s) => s.id === id);
  if (!student) throw httpError(404, '找不到该学员');

  const schema = await getSchema();
  const table = await tableRef('confirm');
  const f = schema.resolved.confirm;
  const existing = (await loadConfirms()).find((c) => c.studentId === id && inSession(c, session)) || null;
  const act = action === 'leave' ? 'leave' : (action === 'makeup' ? 'makeup' : 'confirm');

  const fields = {};
  if (f.student) fields[f.student] = [id];
  if (f.session && session) fields[f.session] = [session.recordId];

  if (f.status) {
    const value = act === 'leave'
      ? selectValue(table, f.status, ['请假', '不参加'])
      : selectValue(table, f.status, ['确认', '参加']);
    if (!value) throw httpError(501, `确认表「${f.status}」缺少「确认 / 请假」选项，请先在飞书里补齐`);
    fields[f.status] = value;
  }
  if (f.reason && act === 'leave' && reason) {
    const value = selectValue(table, f.reason, [reason, '其他']);
    if (value) fields[f.reason] = value;
  }
  if (f.source) {
    const value = selectValue(table, f.source, ['手机号后四位', '扫码']);
    if (value) fields[f.source] = value;
  }
  if (f.time) fields[f.time] = Date.now();

  if (existing) await feishu.updateRecord(table.id, existing.recordId, fields);
  else await feishu.createRecord(table.id, fields);

  // 确认即报备：在读 → 表7，补课 → 表16；请假不写报备
  let reportResult = null;
  if (act !== 'leave') {
    reportResult = await submitReport({
      student,
      session,
      kind: act === 'makeup' ? 'makeup' : 'current',
      profile: opts.profile,
    });
  }

  invalidate();
  return {
    person: await personOf('old', id, session),
    report: reportResult,
    stats: await stats(session),
  };
}

async function checkin(id, type, sessionArg) {
  const schema = await getSchema();
  const table = await tableRef('checkin');
  const f = schema.resolved.checkin;
  const session = sessionArg === undefined ? await currentSession().catch(() => null) : sessionArg;
  const person = await personOf(type, id, session);
  if (person.signin) return { person, stats: await stats(session) };

  const fields = {};
  if (f.student && type === 'old') fields[f.student] = [id];
  if (f.trial && type === 'new') fields[f.trial] = [id];
  if (f.session && session) fields[f.session] = [session.recordId];
  if (f.name) fields[f.name] = person.name;

  const now = Date.now();
  if (f.time) fields[f.time] = now;
  if (f.date) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    fields[f.date] = d.getTime();
  }
  if (f.status) {
    const value = selectValue(table, f.status, ['有效', '正常']);
    if (!value) throw httpError(501, `签到表「${f.status}」缺少「有效」选项，请先在飞书里补齐`);
    fields[f.status] = value;
  }
  if (f.way) {
    const value = selectValue(table, f.way, ['手机号后四位', '扫码', '现场']);
    if (!value) throw httpError(501, `签到表「${f.way}」缺少「手机号后四位」选项，请先在飞书里补齐`);
    fields[f.way] = value;
  }

  await feishu.createRecord(table.id, fields);
  invalidate();
  return { person: await personOf(type, id, session), stats: await stats(session) };
}

async function survey(id, type, answers, sessionArg) {
  const schema = await getSchema();
  const table = await tableRef('survey');
  const f = schema.resolved.survey;
  const session = sessionArg === undefined ? await currentSession().catch(() => null) : sessionArg;
  const person = await personOf(type, id, session);

  // 同一课次已提交过就不再重复写
  if (person.survey) return { person, stats: await stats(session) };

  const fields = {};
  if (f.student && type === 'old') fields[f.student] = [id];
  if (f.trial && type === 'new') fields[f.trial] = [id];
  if (f.session && session) fields[f.session] = [session.recordId];
  if (f.questionnaire && session) {
    const qn = await questionnaireOf(session.recordId).catch(() => null);
    if (qn) fields[f.questionnaire] = [qn];
  }

  const putNumber = (name, value) => {
    const meta = fieldMeta(table, name);
    if (!meta || value === null || value === undefined || value === '') return;
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    fields[meta.name] = n;
  };
  putNumber(f.q1, answers.q1);
  putNumber(f.q2, answers.q2);
  putNumber(f.q3, answers.q3);
  putNumber(f.q4, answers.q4);
  if (f.q5) {
    const meta = fieldMeta(table, f.q5);
    if (meta) fields[f.q5] = String(answers.q5 || '').slice(0, 500);
  }
  if (f.time) fields[f.time] = Date.now();

  if (!fields[f.student] && !fields[f.trial]) {
    throw httpError(501, `答卷表「${table.name}」缺少学员/试听记录关联字段，无法带入真实姓名`);
  }

  await feishu.createRecord(table.id, fields);
  invalidate();
  return { person: await personOf(type, id, session), stats: await stats(session) };
}

async function questionnaireOf(sessionId) {
  const schema = await getSchema();
  if (!schema.tables.questionnaire) return null;
  return cached('questionnaire:' + sessionId, 60 * 1000, async () => {
    const table = schema.tables.questionnaire;
    const records = await feishu.searchRecords(table.id, { pageSize: 100 });
    const hit = records.find((r) => linkIds(r.fields['所属课次']).includes(sessionId));
    return hit ? hit.recordId : null;
  });
}

/**
 * 新客登记：表9 新客户试听 + 表10 新客入校报备，两边互相关联。
 * 同一手机号重复登记时直接返回已有记录，避免像表10 那样出现重复行。
 */
async function register(payload, sessionArg) {
  const schema = await getSchema();
  const table = await tableRef('trial');
  const f = schema.resolved.trial;
  const session = sessionArg === undefined ? await currentSession().catch(() => null) : sessionArg;

  const company = String(payload.company || '').trim();
  const name = String(payload.name || '').trim();
  const phone = String(payload.phone || '').trim();
  const idcard = String(payload.idcard || '').trim();
  const plate = report.normalizePlate(payload.plate);

  // 试听第几天：把记录和报备挂到那一天的课次上
  const dayLabel = String(payload.trialDay || '').trim();
  let target = session;
  const dayIndex = ['第一天', '第二天', '第三天', '第四天'].indexOf(dayLabel);
  if (dayIndex >= 0 && session) {
    const group = await groupOf(session).catch(() => []);
    if (group[dayIndex]) target = group[dayIndex];
  }
  if (!company || !name || phone.length !== 11) throw httpError(400, '企业名称、姓名、11 位手机号必填');
  if (!idcard) throw httpError(400, '请填写身份证号（入校报备必填）');

  // 同一手机号：同一天重复登记才拦，不同天（第二天再来试听）允许
  const dup = (await loadTrials()).find((t) => t.phone.replace(/\D/g, '') === phone.replace(/\D/g, '')
    && (!dayLabel || (t.day || '') === dayLabel));
  if (dup) {
    return {
      person: await personOf('new', dup.id, session),
      duplicated: true,
      report: null,
      stats: await stats(session),
    };
  }

  // 第一列（主键）自动填「企业-姓名」
  const primary = table.fields[0] ? table.fields[0].name : '';
  const fields = {};
  if (primary) fields[primary] = `${company}-${name}`;

  const put = (fieldName, value) => {
    if (!fieldName || !value || fieldName === primary) return;
    const meta = fieldMeta(table, fieldName);
    if (!meta) return;
    fields[fieldName] = String(value);
  };
  put(f.company, company);
  put(f.name, name);
  put(f.position, payload.position);
  put(f.idcard, idcard);
  put(f.phone, phone);
  put(f.plate, plate);
  put(f.inviter, payload.inviter);
  put(f.day, dayLabel);
  if (target && table.fields.some((x) => x.name === '所属课次')) {
    fields['所属课次'] = [target.recordId];
  }

  const rec = await feishu.createRecord(table.id, fields);
  invalidate();

  // 新客报备：写表10，并把表9 的「新客入校报备」关联指回去
  let reportResult = null;
  try {
    const person = {
      name, company, phone, idcard, plate,
      idType: String(payload.idType || '身份证').trim(),
      gender: String(payload.gender || '').trim(),
    };
    const rf = schema.resolved.newReport;
    const rTable = await tableRef('newReport');
    const rPayload = report.buildFields({
      person, session, f: rf, audience: 'new', now: Date.now(), trialId: rec.recordId, day: dayLabel,
    });
    const existed = (await loadReports('newReport')).find((r) => {
      // 表10 没有「所属课次」，按手机号 + 试听天数判重（两天各一条报备）
      const sameSession = !r.sessionIds.length || (session && r.sessionIds.includes(session.recordId));
      const sameDay = !dayLabel || (r.day || '') === dayLabel;
      return sameSession && sameDay && r.phone.replace(/\D/g, '') === phone.replace(/\D/g, '');
    });
    let rId;
    if (existed) {
      await feishu.updateRecord(rTable.id, existed.recordId, rPayload);
      rId = existed.recordId;
    } else {
      rId = (await feishu.createRecord(rTable.id, rPayload)).recordId;
    }
    // 表9 的「新客入校报备」是关联字段，指回刚建的报备记录
    const linkField = f.reportLink;
    if (linkField) {
      await feishu.updateRecord(table.id, rec.recordId, { [linkField]: [rId] })
        .catch((e) => console.warn('[live] 试听表报备关联回写失败：' + e.message));
    }
    reportResult = { kind: 'new', recordId: rId, plate, company };
  } catch (e) {
    console.warn('[live] 新客报备写入失败：' + e.message);
    reportResult = { kind: 'new', error: e.message };
  }

  invalidate();
  return {
    person: await personOf('new', rec.recordId, session),
    report: reportResult,
    stats: await stats(session),
  };
}

async function guest(payload, sessionArg) {
  const schema = await getSchema();
  const table = await tableRef('guest');
  const f = schema.resolved.guest;
  const session = sessionArg === undefined ? await currentSession().catch(() => null) : sessionArg;

  const name = String(payload.name || '').trim();
  const mobile = String(payload.mobile || '').trim();
  if (!name || mobile.length !== 11) throw httpError(400, '请填写姓名和 11 位手机号');

  const fields = {};
  if (f.name) fields[f.name] = name;
  if (f.company && payload.company) fields[f.company] = String(payload.company).trim();
  if (f.phone) fields[f.phone] = mobile;
  if (f.session && session) fields[f.session] = [session.recordId];
  if (f.status) {
    const value = selectValue(table, f.status, ['待审', '待审核']);
    if (value) fields[f.status] = value;
  }
  if (f.time) fields[f.time] = Date.now();

  const rec = await feishu.createRecord(table.id, fields);
  invalidate();
  return {
    person: { id: rec.recordId, type: 'new', name, company: String(payload.company || ''), phone: mobile, position: '', inviter: '', rsvp: null, reason: null, signin: null, survey: null },
    stats: await stats(session),
  };
}

const SESSION_EDIT_FIELDS = {
  name: '课次名称',
  date: '上课日期',
  deadline: '确认出席截止日',
  reportDeadline: '报备截止日',
  openAt: '签到开放时间',
  closeAt: '签到关闭时间',
  timeRange: '上课时段',
  topic: '课程主题',
  room: '教室',
  place: '上课地点',
  campus: '上课校区',
  speaker: '主讲人',
  intro: '讲师介绍',
  take: '本期收获',
  agenda: '今日议程',
};

/** 读取/设置「当前课次」的人工指定 */
function sessionTarget() {
  return target.read();
}

async function setSessionTarget(recordId, by) {
  const saved = target.write(recordId || null, by || 'staff');
  invalidate();            // 让 currentSession 的缓存失效
  await syncSchedule().catch(() => null);
  return { target: saved, session: await currentSession().catch(() => null) };
}

async function sessionInfo() {
  const s = await currentSession();
  if (!s) return null;
  const teachers = await loadTeachers().catch(() => []);
  return Object.assign({}, s, {
    teachers,
    selectedTeachers: (s.teacherIds || []).map((id) => teachers.find((t) => t.id === id)).filter(Boolean),
  });
}

/** 工作人员在 /staff 页直接改当前课次（写回飞书课次表） */
async function updateSession(patch) {
  const s = await currentSession();
  if (!s) throw httpError(404, '当前没有可编辑的课次');
  const schema = await getSchema();
  const table = schema.tables.session;
  if (!table) throw httpError(404, '找不到课次表');
  const exists = (name) => table.fields.some((f) => f.name === name);

  const fields = {};
  for (const [key, fieldName] of Object.entries(SESSION_EDIT_FIELDS)) {
    if (patch[key] === undefined || !exists(fieldName)) continue;
    if (['date', 'deadline', 'reportDeadline', 'openAt', 'closeAt'].includes(key)) {
      const v = String(patch[key] || '').trim();
      if (!v) continue;
      // datetime-local 带 T，纯日期不带；统一按北京时间解析
      const iso = v.includes('T') ? v + ':00+08:00' : v + 'T00:00:00+08:00';
      const ms = new Date(iso).getTime();
      if (Number.isFinite(ms)) fields[fieldName] = ms;
    } else {
      fields[fieldName] = String(patch[key] || '');
    }
  }
  if (Array.isArray(patch.teacherIds) && exists(cfg.session.teacherField)) {
    fields[cfg.session.teacherField] = patch.teacherIds;
  }
  if (!Object.keys(fields).length) throw httpError(400, '没有可更新的字段');

  await feishu.updateRecord(table.id, s.recordId, fields);
  invalidate();
  await syncSchedule();
  return sessionInfo();
}

/** 对外接口统一用 (id, type)，且与 mock 一样返回 { person } */
async function personById(id, type, session) {
  return { person: await personOf(type, id, session) };
}

module.exports = {
  bootstrap, identify, person: personById, personOf, rsvp, checkin, survey, register, guest,
  publicPerson, maskId, maskPhone,
  stats, getSchema, courseState, currentSession, sessionFrom, syncSchedule, listSessions,
  submitReport, loadReports, periodRoster, courseInfo, sessionInfo, updateSession, loadTeachers,
  sessionTarget, setSessionTarget,
};
