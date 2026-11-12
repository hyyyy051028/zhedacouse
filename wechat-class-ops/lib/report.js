'use strict';

/**
 * 三张报备表（表7 在读 / 表10 新客 / 表16 补课）的字段构造。
 * 纯函数：不碰网络，只负责把"人 + 课次"翻译成多维表格的 fields 对象。
 */

const AUDIENCE_TABLE = {
  current: 'report',      // 表7 入校报备表
  new: 'newReport',       // 表10 新客入校报备表
  makeup: 'makeupReport', // 表16 补课学员入校报备表
};

/** 有报备状态字段的只有表7 */
const AUDIENCE_HAS_STATUS = { current: true, new: false, makeup: false };

/** 车牌颜色推断：新能源牌 8 位（或尾字符 D/F）→ 绿，其余 → 蓝 */
function plateColor(plate) {
  // 先归一化（去空格/·/-），否则「浙A·88888」会被当成 8 位误判为新能源
  const p = normalizePlate(plate);
  if (!p) return '';
  if (p.length >= 8 || /[DF]$/.test(p)) return '绿';
  return '蓝';
}

function normalizePlate(plate) {
  return String(plate || '').replace(/[\s·•\-—]/g, '').toUpperCase().slice(0, 12);
}

/**
 * @param {object} p
 * @param {object} p.person   { name, company, phone, idcard, plate, gender, idType }
 * @param {object} p.session  { recordId, classIds }
 * @param {object} p.f        该报备表已解析出的字段名
 * @param {string} p.audience current | new | makeup
 * @param {string} p.status   报备状态文本（仅表7 用）
 * @param {number} p.now
 * @param {string} p.trialId  新客的试听记录 recordId（表10 用）
 */
function buildFields({ person, session, f, audience, status, now, trialId, day }) {
  const fields = {};
  const put = (name, value) => {
    if (!name || value === undefined || value === null) return;
    fields[name] = typeof value === 'string' ? value.trim() : value;
  };

  const plate = normalizePlate(person.plate);
  put(f.name, person.name);
  put(f.gender, person.gender || '');
  put(f.idType, person.idType || '身份证');
  put(f.idNumber, person.idcard);
  put(f.company, person.company);
  put(f.phone, person.phone);
  // 车牌留空也要显式写空串：用户选了"今天不开车"时要覆盖旧车牌
  if (f.plate) fields[f.plate] = plate;
  if (f.plateColor) put(f.plateColor, plate ? plateColor(plate) : '');
  if (f.klass && session && session.classIds && session.classIds.length) put(f.klass, session.classIds);
  if (f.session && session) put(f.session, [session.recordId]);
  // 只有新客才有试听记录；补课学员没有，别乱关联
  if (audience === 'new' && f.trial && trialId) put(f.trial, [trialId]);
  if (audience === 'new' && f.day && day) put(f.day, day);
  if (AUDIENCE_HAS_STATUS[audience] && f.status) put(f.status, status || '已提交');
  if (AUDIENCE_HAS_STATUS[audience] && f.submittedAt) fields[f.submittedAt] = now || Date.now();

  return fields;
}

module.exports = { AUDIENCE_TABLE, AUDIENCE_HAS_STATUS, plateColor, normalizePlate, buildFields };
