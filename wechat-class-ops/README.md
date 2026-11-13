# wechat-class-ops

扫码签到 H5 + 飞书多维表格接口层。零第三方依赖，Node `>= 20.6`。

## 三个入口

二维码里只放 URL，一个部署支撑所有期次/课次：

| 入口 | URL | 人群 | 报备写入 |
|---|---|---|---|
| 在读老学员 | `/q/{课次recordId}/current` | 本期名册 | 表7 入校报备表 |
| 新客 | `/q/{课次recordId}/new` | 两边都没有 | 表9 新客户试听 + 表10 新客入校报备表 |
| 往期补课 | `/q/{课次recordId}/makeup` | 学员表里有、本期名册里没有 | 表16 补课学员入校报备表 |

兼容短链：`/s`（在读）、`/n`（新客）、`/a`（补课）；`?s={课次}&m=current|new|makeup` 也可用。
不传课次时自动按日期选「当前课次」。`/staff` 页会列出三个入口的完整链接。

## 流程

```
识别（手机号后四位）→ 匹配本人 → 确认本次入校信息 → 确认上课（写报备）→ 现场签到 → 课后评价
```

- **确认即报备**：点「确认参加」立刻写报备表，报备状态=已提交（表7）
- **入校信息每次都确认**：单位名称必填、证件号必填、车牌每次都能改（沿用上次 / 换车 / 今天不开车）
- **请假不写报备**
- **幂等**：确认按「课次 + 手机号/姓名」，签到按「课次 + 学员」，同一课次重复点不会产生重复记录

## 运行

```bash
npm start                 # 读取 .env；没有凭证时自动是 mock
npm run inspect           # 打印飞书真实表名/字段名，确认字段映射
```

mock 模式下 `data/state.json` 保存演示数据；live 模式直接读写飞书多维表格。

## 环境变量

复制 `.env.example` 为 `.env`。关键项：

- `FEISHU_MODE` `mock` / `live`
- `FEISHU_APP_ID`、`FEISHU_APP_SECRET`、`FEISHU_BASE_TOKEN`
- `TABLE_*` 表名（留空用默认，匹配时允许 `表N｜` 前缀）
- `FIELD_*` 字段名（留空按候选名自动探测，正常情况下不用填）
- `ADMIN_TOKEN` `/staff` 口令（**live 模式建议必填**）

## 目录

```
server.js          路由 + 静态托管
lib/config.js      环境变量 → 表名/字段映射
lib/feishu.js      飞书客户端（token 缓存、分页搜索、记录 CRUD）
lib/base.js        live 实现
lib/mock.js        mock 实现（接口同构）
lib/phase.js       三阶段状态机（confirm → checkin → survey，北京时间）
lib/audience.js    三类人群判定（纯函数）
lib/report.js      三张报备表的字段构造 + 车牌颜色推断（纯函数）
public/index.html  学员 H5
public/staff.html  工作人员页（阶段切换 + 三入口链接）
scripts/inspect.js 表结构探测
```

## 名册规则（方案二）

- **学员表 = 人员主档**：一人一行，不承担"属于哪期"，确认/签到/答卷都关联它的 recordId。
- **金融XX期学员表 = 每期名册**：谁在这期、哪个班。表名由 `TABLE_ROSTER_PATTERN` 决定，默认 `{period}学员表`。
- **识别顺序**：本期名册表 → 学员表按「所属期次」过滤 → 全量（会告警）。
- 名册里的人如果不在学员主档，无法签到/报备，`/staff` 顶部会列出姓名，先补录到学员表即可。
- 12 次课：每次课有自己的二维码和「所属课次」，记录互不覆盖；学员表上的「报备状态/报备提交日期」只是最近一次，报备名单请按课次筛表7。

## 发布到 GitHub

本项目在仓库 `hyyyy051028/zhedacouse` 的 **`wechat-class-ops/`** 目录下（`main` 分支）。

```bash
./publish.sh                 # 提交本地改动并推送
./publish.sh "改了签到逻辑"   # 自定义提交说明
```

没有改动时会提示「远端已是最新」，不会产生空提交。

**它做了什么**：提交本地改动 → 只拉取远端目录结构（不下载仓库历史大文件）→ 把本项目挂到 `wechat-class-ops/` 下 → 推送到 `main`。仓库里的 `.trae/`、`zhedacouse_React/` 和 `gh-pages` 分支都不受影响。

### 换一台机器首次发布

```bash
git remote add origin ssh://git@ssh.github.com:443/hyyyy051028/zhedacouse.git
git config core.sshCommand "ssh -i ~/.ssh/id_ed25519_zhedacouse -o StrictHostKeyChecking=accept-new"
./publish.sh
```

需要先在 https://github.com/settings/ssh/new 添加本机公钥，并确保该账号对仓库有 Write 权限（或已被邀请为协作者并接受邀请）。

### 两个坑（脚本已处理，手工操作时注意）

- **不要用 `git read-tree --prefix`** 挂目录：会触发下载原仓库全部文件内容，大仓库会卡死；脚本改用 `git mktree --missing` 直接拼树。
- **父树里已有同名目录时要先剔除**，否则会生成重复条目，被 GitHub 以 `duplicateEntries` 拒绝。
- **不要执行 `git push origin main`**：本地 `main` 只包含本项目文件，直接推会覆盖仓库结构。只用 `./publish.sh`。

### 敏感文件

`.env`（飞书 App Secret）和 `data/` 已写入 `.gitignore`，不会进入仓库。

## 已知约束

- 课次表的「签到开放时间 / 签到关闭时间 / 场次状态 / 确认出席截止日」如果为空，阶段按日期 + `上课时段` 正则回落，确认截止日显示「以课次通知为准」
- 「所属班级」需要班级表里有对应记录，否则报备的班级字段留空
- 名册「单位名称」为空时，由学员在 H5 确认页补全，并回写学员表
