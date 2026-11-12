'use strict';

/**
 * 隐私脱敏：接口返回的人员信息不带完整证件号/手机号。
 * 内部逻辑（写报备）仍使用后台已存的完整值。
 */

/** 身份证：保留前 6 后 4 */
function maskId(v) {
  const s = String(v || '').trim();
  if (s.length < 10) return s;
  return s.slice(0, 6) + '********' + s.slice(-4);
}

/** 手机号：138****8821 */
function maskPhone(v) {
  const s = String(v || '').replace(/\D/g, '');
  if (s.length !== 11) return s;
  return s.slice(0, 3) + '****' + s.slice(-4);
}

/** 对外返回的人员信息：证件号/手机号脱敏 */
function publicPerson(p) {
  if (!p) return p;
  return Object.assign({}, p, {
    idcard: maskId(p.idcard),
    phone: maskPhone(p.phone),
    idcardMasked: Boolean(p.idcard),
    phoneMasked: Boolean(p.phone),
  });
}

/** 只接受"看起来完整"的证件号；脱敏串或空值一律忽略 */
function usableId(v) {
  const s = String(v || '').trim();
  if (s.length < 15 || s.includes('*')) return '';
  return s;
}

module.exports = { maskId, maskPhone, publicPerson, usableId };
