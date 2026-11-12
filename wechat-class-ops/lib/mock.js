'use strict';

/**
 * mock 模式：本地假数据，用于无飞书凭证时跑通全流程。
 * 数据落在 data/state.json，重启不丢。
 *
 * 与 live 的接口保持同构：三个入口（在读/新客/往期补课）、确认即报备、车牌三态。
 */

const fs = require('fs');
const path = require('path');
const cfg = require('./config');
const phase = require('./phase');
const audience = require('./audience');
const report = require('./report');
const { publicPerson, usableId } = require('./privacy');

const FILE = path.join(__dirname, '..', 'data', 'state.json');

const MOCK_SESSION = {
  recordId: 'mock-session-1',
  name: '金融26期 · 第4次 · 第1天',
  date: Date.UTC(2026, 10, 21, 1, 0),
  timeRange: '09:00-16:30',
  place: '华家池',
  periodIds: ['mock-period-26'],
  classIds: [],
  deadline: 0,
};

function initState() {
  return {
    courseState: 'confirm',
    students: [
      { id: 's1', name: '张明', company: '', phone: '13800138821', idcard: '330102199001011234', plate: '浙A12345', l4: '8821', status: '在读', rsvp: null, reason: null, report: null, signin: null, survey: null },
      { id: 's2', name: '李婷', company: '恒远贸易有限公司', phone: '13900133320', idcard: '330102199202022345', plate: '浙AG13162', l4: '3320', status: '在读', rsvp: 'confirm', reason: null, report: null, signin: null, survey: null },
      { id: 's3', name: '王强', company: '强盛制造集团', phone: '13700134471', idcard: '330102198803033456', plate: '', l4: '4471', status: '在读', rsvp: 'leave', reason: '出差', report: null, signin: null, survey: null },
      { id: 's4', name: '陈璐', company: '启明教育科技', phone: '13600132093', idcard: '330102199504044567', plate: '浙A51F8D', l4: '2093', status: '在读', rsvp: null, reason: null, report: null, signin: null, survey: null },
      { id: 's5', name: '刘洋', company: '海川物流', phone: '13500136652', idcard: '330102199105055678', plate: '浙BR6N56', l4: '6652', status: '在读', rsvp: null, reason: null, report: null, signin: null, survey: null },
      // 往期学员：不在本期名册（status=结业）
      { id: 'a1', name: '周涛', company: '联创电子', phone: '13400137736', idcard: '330102198006066789', plate: '浙A667K5', l4: '7736', status: '结业', rsvp: null, reason: null, report: null, signin: null, survey: null },
    ],
    newStudents: [],
    guests: [],
  };
}

let state = load();

function load() {
  try {
    const raw = fs.readFileSync(FILE, 'utf8');
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.students) || !data.students.length) return initState();
    const base = initState();
    return Object.assign(base, data, {
      newStudents: data.newStudents || [],
      guests: data.guests || [],
    });
  } catch {
    return initState();
  }
}

function save() {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(state, null, 2));
  } catch { /* 本地演示，写盘失败不影响流程 */ }
}

function reset() {
  state = initState();
  save();
}

const nowHM = () => {
  const d = new Date();
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
};

const all = () => state.students.concat(state.newStudents);

/** mock 里"本期名册"= 状态为在读的学员 */
const roster = () => state.students.filter((s) => (s.status || '在读') !== '结业');

function stats() {
  const list = all();
  const q1 = list.filter((p) => p.survey).map((p) => Number(p.survey.q1) || 0);
  return {
    total: roster().length,
    rsvp: state.students.filter((s) => s.rsvp === 'confirm').length,
    signed: list.filter((p) => p.signin).length,
    surveyed: q1.length,
    surveyAvg: q1.length ? Number((q1.reduce((a, b) => a + b, 0) / q1.length).toFixed(1)) : null,
    registered: state.newStudents.length,
    guests: state.guests.length,
  };
}

function snapshot(p, type) {
  if (!p) return null;
  const kind = type || (state.newStudents.includes(p) ? 'new' : 'old');
  return {
    id: p.id,
    type: kind,
    name: p.name,
    company: p.company || '',
    phone: p.phone || '',
    idcard: p.idcard || '',
    plate: p.plate || '',
    status: p.status || '',
    position: p.position || '',
    inviter: p.inviter || '',
    rsvp: p.rsvp,
    reason: p.reason,
    report: p.report || null,
    signin: p.signin,
    survey: p.survey,
    profileMissing: !p.company || !p.idcard,
  };
}

function bootstrap(sessionArg, entryArg) {
  const c = Object.assign({}, cfg.course, {
    title: '《商业模式与资本路径》',
    period: '金融26期',
    date: '11 月 21 日 周六 · 09:00–16:30',
    place: '华家池',
    speaker: '张华光',
    deadline: '',
  });
  return {
    mode: 'mock',
    state: phase.current().state,
    entry: audience.normaliseEntry(entryArg),
    course: c,
    session: {
      id: MOCK_SESSION.recordId,
      name: MOCK_SESSION.name,
      date: MOCK_SESSION.date,
      timeRange: MOCK_SESSION.timeRange,
      place: MOCK_SESSION.place,
      deadline: '',
      periodId: 'mock-period-26',
    },
    stats: stats(),
    students: state.students,
    newStudents: state.newStudents,
    guests: state.guests,
    audiences: audience.AUDIENCES,
    roster: { bound: true, source: 'roster', periodName: '金融26期', count: roster().length, total: state.students.length, missing: 0, periodId: 'mock-period-26' },
    warnings: [],
  };
}

let mockTarget = null;

function currentSession() {
  return MOCK_SESSION;
}

function sessionTarget() {
  return mockTarget;
}

function setSessionTarget(recordId) {
  mockTarget = recordId ? { recordId, by: 'staff', at: new Date().toISOString() } : null;
  return { target: mockTarget, session: MOCK_SESSION };
}

function publicDays() {
  return [{
    date: MOCK_SESSION.date,
    topic: '《商业模式与资本路径》',
    timeRange: MOCK_SESSION.timeRange,
    take: '',
    speaker: '张华光',
    teachers: [{ name: '张华光', title: '执行主任', org: '清华大学商业模式研究工作室', type: '主讲' }],
  }];
}

function listSessions() {
  return [{
    id: MOCK_SESSION.recordId,
    name: MOCK_SESSION.name,
    date: MOCK_SESSION.date,
    timeRange: MOCK_SESSION.timeRange,
    place: MOCK_SESSION.place,
    room: '中心大楼南楼251',
    campus: '华家池校区',
    topic: '《商业模式与资本路径》',
    speaker: '张华光',
    seq: 4,
    periodId: 'mock-period-26',
    teachers: [{ name: '张华光', title: '执行主任', org: '清华大学商业模式研究工作室', type: '主讲' }],
  }];
}

function person(id, type) {
  const p = findPerson(id, type);
  if (!p) throw httpError(404, '找不到该学员');
  return { person: snapshot(p, type) };
}

function identify(l4, entry) {
  const verdict = audience.decide({
    l4,
    entry,
    roster: roster().map((s) => ({ id: s.id, l4: s.l4 })),
    all: state.students.map((s) => ({ id: s.id, l4: s.l4 })),
    trials: state.newStudents.map((s) => ({ id: s.id, l4: (s.phone || '').slice(-4) })),
  });
  const base = { audience: verdict.audience, entry: audience.normaliseEntry(entry), notice: verdict.notice || '' };
  if (verdict.reason) return Object.assign(base, { found: false, reason: verdict.reason });

  const type = verdict.audience === 'new' ? 'new' : 'old';
  const p = findPerson(verdict.match.id, type);
  if (!p) return Object.assign(base, { found: false, reason: 'none' });
  return Object.assign(base, { found: true, person: snapshot(p, type) });
}

function findPerson(id, type) {
  const list = type === 'new' ? state.newStudents : state.students;
  return list.find((p) => p.id === id) || null;
}

/**
 * 确认 / 请假 / 补课确认。
 * opts.profile = { company, idcard, plate, idType, phone }，plate 传空串表示"今天不开车"。
 */
function rsvp(id, type, action, reason, opts = {}) {
  const p = findPerson(id, type);
  if (!p) throw httpError(404, '找不到该学员');
  if (type === 'new') throw httpError(400, '新学员无需参加确认');

  const act = action === 'leave' ? 'leave' : (action === 'makeup' ? 'makeup' : 'confirm');

  if (act === 'leave') {
    p.rsvp = 'leave';
    p.reason = reason || null;
    save();
    return { person: snapshot(p, type), report: null, stats: stats() };
  }

  const profile = opts.profile || {};
  const company = String(profile.company !== undefined ? profile.company : p.company || '').trim();
  const idcard = usableId(profile.idcard) || p.idcard || '';
  const plate = report.normalizePlate(profile.plate !== undefined ? profile.plate : p.plate || '');
  if (!company) throw httpError(400, '请填写单位名称（入校报备必填）');
  if (!idcard) throw httpError(400, '请补充身份证号（入校报备必填）');

  p.company = company;
  p.idcard = idcard;
  p.plate = plate;
  p.rsvp = 'confirm';
  p.reason = null;
  p.report = { kind: act === 'makeup' ? 'makeup' : 'current', plate, company, at: Date.now() };
  save();
  return { person: snapshot(p, type), report: Object.assign({ kind: p.report.kind, recordId: 'mock-report' }, p.report), stats: stats() };
}

function checkin(id, type) {
  const p = findPerson(id, type);
  if (!p) throw httpError(404, '找不到该学员');
  if (!p.signin) {
    p.signin = { t: nowHM(), seq: all().filter((x) => x.signin).length + 1 };
    save();
  }
  return { person: snapshot(p, type), stats: stats() };
}

function survey(id, type, answers) {
  const p = findPerson(id, type);
  if (!p) throw httpError(404, '找不到该学员');
  p.survey = {
    q1: Number(answers.q1) || 0,
    q2: Number(answers.q2) || 0,
    q3: Number(answers.q3) || 0,
    q4: Number(answers.q4) || null,
    q5: String(answers.q5 || '').slice(0, 100),
  };
  save();
  return { person: snapshot(p, type), stats: stats() };
}

function register(payload) {
  const company = String(payload.company || '').trim();
  const name = String(payload.name || '').trim();
  const phone = String(payload.phone || '').trim();
  const idcard = String(payload.idcard || '').trim();
  if (!company || !name || phone.length !== 11) throw httpError(400, '企业名称、姓名、11 位手机号必填');
  if (!idcard) throw httpError(400, '请填写身份证号（入校报备必填）');

  const dup = state.newStudents.find((s) => (s.phone || '').replace(/\D/g, '') === phone.replace(/\D/g, ''));
  if (dup) {
    return { person: snapshot(dup, 'new'), duplicated: true, report: null, stats: stats() };
  }

  const plate = report.normalizePlate(payload.plate);
  const rec = {
    id: 'n' + Date.now(),
    name,
    company,
    position: String(payload.position || '').trim(),
    idcard,
    phone,
    plate,
    inviter: String(payload.inviter || '').trim(),
    signin: null,
    survey: null,
    rsvp: null,
    reason: null,
    report: { kind: 'new', plate, company, at: Date.now() },
  };
  state.newStudents.push(rec);
  save();
  return {
    person: snapshot(rec, 'new'),
    report: { kind: 'new', recordId: rec.id, plate, company },
    stats: stats(),
  };
}

function guest(payload) {
  const name = String(payload.name || '').trim();
  const mobile = String(payload.mobile || '').trim();
  if (!name || mobile.length !== 11) throw httpError(400, '请填写姓名和 11 位手机号');
  state.guests.push({ name, company: String(payload.company || '').trim(), mobile, status: '待审' });
  save();
  return { stats: stats() };
}

function setState(next) {
  if (!['confirm', 'checkin', 'survey'].includes(next)) throw httpError(400, '非法状态');
  phase.setState(next, 'demo-panel');
  return { state: phase.current().state };
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = {
  bootstrap, identify, person, rsvp, checkin, survey, register, guest, setState, reset,
  stats, snapshot, findPerson, httpError, listSessions, publicDays, currentSession, sessionTarget, setSessionTarget, MOCK_SESSION, publicPerson,
};
