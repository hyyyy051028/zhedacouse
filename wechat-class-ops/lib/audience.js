'use strict';

/**
 * 三类人群判定（纯函数，无 IO，便于测试）。
 *
 * current  在读老学员：命中本期名册
 * makeup   往期补课  ：不在本期名册，但在学员表全集里
 * new      新客      ：两边都没有
 *
 * entry 来自二维码：current / makeup / new（兼容旧值 old）。
 */

const AUDIENCES = ['current', 'new', 'makeup'];

function normaliseEntry(entry) {
  if (entry === 'old') return 'current';
  return AUDIENCES.includes(entry) ? entry : 'current';
}

function digitsOf(v) {
  return String(v || '').replace(/\D/g, '').slice(-4);
}

/**
 * @param {object} p
 * @param {string} p.l4      手机号后四位
 * @param {string} p.entry   入口类型
 * @param {Array}  p.roster  本期名册（含 l4 / id）
 * @param {Array}  p.all     学员表全集
 * @param {Array}  p.trials  新客户试听（仅 entry=new 时用）
 * @returns {{audience:string, match?:object, reason?:string, notice?:string}}
 */
function decide({ l4, entry, roster = [], all = [], trials = [] }) {
  const target = digitsOf(l4);
  const mode = normaliseEntry(entry);
  if (target.length !== 4) return { audience: mode, reason: 'invalid' };

  const rosterIds = new Set(roster.map((s) => s.id));

  // 新客码：先拦"其实是学员"的人，避免产生重复新客记录
  if (mode === 'new') {
    const studentHit = all.filter((s) => s.l4 === target);
    if (studentHit.length) {
      const inRoster = studentHit.some((s) => rosterIds.has(s.id));
      return {
        audience: inRoster ? 'current' : 'makeup',
        match: studentHit[0],
        reason: 'isStudent',
        notice: inRoster
          ? '你已是本期学员，请扫描「老学员码」'
          : '你已有学员记录，请扫描「往期补课码」',
      };
    }
    const hits = trials.filter((t) => t.l4 === target);
    if (hits.length === 1) return { audience: 'new', match: hits[0] };
    if (hits.length > 1) return { audience: 'new', reason: 'multiple' };
    return { audience: 'new', reason: 'none' };
  }

  // 学员码 / 补课码：先本期名册，再学员表全集
  const inRoster = roster.filter((s) => s.l4 === target);
  if (inRoster.length === 1) return { audience: 'current', match: inRoster[0] };
  if (inRoster.length > 1) return { audience: 'current', reason: 'multiple' };

  const alumni = all.filter((s) => s.l4 === target && !rosterIds.has(s.id));
  const notice = mode === 'makeup' ? '' : '你不在本期名册，已按往期补课处理';
  if (alumni.length === 1) return { audience: 'makeup', match: alumni[0], notice };
  if (alumni.length > 1) {
    const sameName = alumni[0];
    return { audience: 'makeup', match: sameName, reason: 'multiple', notice };
  }

  return { audience: mode, reason: 'none' };
}

module.exports = { AUDIENCES, normaliseEntry, digitsOf, decide };
