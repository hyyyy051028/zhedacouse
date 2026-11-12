'use strict';

/**
 * 打印飞书多维表格的真实表名与字段名，用于填充 .env 的字段映射。
 * 用法：在 .env 里配好 FEISHU_APP_ID / FEISHU_APP_SECRET 后执行 npm run inspect
 */

const cfg = require('../lib/config');
const feishu = require('../lib/feishu');

(async () => {
  if (!cfg.feishu.appId || !cfg.feishu.appSecret) {
    console.error('缺少 FEISHU_APP_ID / FEISHU_APP_SECRET，请先填写 .env');
    process.exit(1);
  }
  console.log(`Base: ${cfg.feishu.baseToken}\n`);

  const tables = await feishu.listTables();
  for (const t of tables) {
    console.log(`■ ${t.name}   (table_id: ${t.table_id})`);
    const fields = await feishu.listFields(t.table_id);
    for (const f of fields) {
      const opts = (f.property && f.property.options || []).map((o) => o.name).join(' / ');
      console.log(`   - ${f.field_name}  [type=${f.type}]${opts ? '  选项: ' + opts : ''}`);
    }
    console.log('');
  }

  console.log('需要关注的表名：');
  for (const [key, name] of Object.entries(cfg.tables)) {
    const hit = tables.find((t) => t.name === name) || tables.find((t) => t.name.endsWith(name)) || tables.find((t) => t.name.includes(name));
    console.log(`   ${key.padEnd(8)} ${name.padEnd(12)} → ${hit ? hit.name : '未找到'}`);
  }

  // 字段自动探测结果：这里没匹配上的，需要在 .env 里补对应 FIELD_*
  const base = require('../lib/base');
  const schema = await base.getSchema();
  console.log('\n字段探测结果：');
  for (const [group, map] of Object.entries(schema.resolved)) {
    const lines = Object.entries(map).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`);
    console.log(`   ${group.padEnd(8)} ${lines.length ? lines.join('  ') : '(空)'}`);
  }
  if (schema.missing.length) {
    console.log('\n缺失的表：' + schema.missing.map((m) => m.name).join('、'));
  }
})().catch((e) => {
  console.error('读取失败：', e.message);
  if (e.detail) console.error(JSON.stringify(e.detail, null, 2));
  process.exit(1);
});
