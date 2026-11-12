# 上线部署指南（微信内打开）

目标：让学员在微信里打开 `https://你的域名/q/{课次}/current`，完成确认、签到、评价。

---

## 0. 先搞清楚：微信里打开网页需要什么

| 需求 | 是否需要 |
|---|---|
| HTTPS | **必须**（微信对 http 会提示不安全） |
| 公网可访问域名 | **必须** |
| ICP 备案 | **大陆服务器必须**；香港/海外服务器不需要但访问慢 |
| 微信公众号 | 不需要（普通 H5 链接即可打开） |
| 微信 JS-SDK | 只影响「分享卡片标题/缩略图」，不影响使用 |
| 微信登录/授权 | 不需要（本项目用手机号后四位识别） |

---

## 方案 A：内网穿透（今天就想在微信里看效果）

适合验证体验，不适合正式使用（地址会变、依赖第三方）。

```bash
# 1. 本机启动服务
cd wechat-class-ops && npm start

# 2. 另开一个终端，装 cloudflared（macOS）
brew install cloudflared

# 3. 开隧道
cloudflared tunnel --url http://localhost:3000
```

它会输出一个 `https://xxxx-xxxx.trycloudflare.com` 地址，把这个地址发到微信里打开即可。
注意：隧道重启地址会变；手机和电脑不需要同一网络。

---

## 方案 B：云服务器 + Docker（推荐正式用）

### B1. 准备

1. 域名（阿里云/腾讯云，几十块一年）
2. 大陆服务器需 **ICP 备案**（用学校或公司主体，1–3 周）
3. 轻量应用服务器：2 核 2G，Ubuntu 22.04，安全组放行 **80 / 443**
4. 域名解析：`A` 记录 → 服务器公网 IP

### B2. 上传代码

```bash
# 本地：排除本机配置和运行时数据
rsync -av --exclude '.env' --exclude 'data/' --exclude '.git' \
  ./wechat-class-ops/ user@your-server:/opt/wechat-class-ops/
```

### B3. 配置环境变量

```bash
ssh user@your-server
cd /opt/wechat-class-ops
cp .env.example .env
vi .env
```

必须确认的项：

```ini
FEISHU_MODE=live
FEISHU_APP_ID=cli_xxx
FEISHU_APP_SECRET=xxx
FEISHU_BASE_TOKEN=I3ErbIGs7ayB7LsR11NcaZ9an9c
ADMIN_TOKEN=换成一个足够长的随机串
```

> `.env` 只存在于服务器，**不要提交到仓库，也不要打进镜像**（`.dockerignore` 已排除）。

### B4. 启动

```bash
# 在服务器上装 Docker
curl -fsSL https://get.docker.com | sh

cd /opt/wechat-class-ops
DOMAIN=signup.example.com docker compose up -d --build
docker compose logs -f caddy
```

Caddy 会自动申请 Let's Encrypt 证书。第一次启动等 30 秒左右。

### B5. 验证

```bash
curl -I https://signup.example.com/api/health
# 期望 200，body: {"ok":true,"mode":"live"}
```

微信里打开 `https://signup.example.com/preview.html` 应该能看到华家池封面页。

---

## 方案 C：不用 Docker（systemd + 系统 Caddy）

```bash
# Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs

# 项目放到 /opt/wechat-class-ops，配好 .env
cp deploy/wechat-class-ops.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now wechat-class-ops
journalctl -u wechat-class-ops -f

# Caddy
apt install -y caddy
# /etc/caddy/Caddyfile 写：
#   signup.example.com {
#       reverse_proxy 127.0.0.1:3000
#   }
systemctl reload caddy
```

---

## 上线检查清单

### 微信内体验

- [ ] 用 https 打开，顶部没有「不安全」提示
- [ ] 微信右上角分享，标题能正常显示（默认取 `<title>`；要自定义图标/描述需公众号 JS-SDK）
- [ ] iOS 微信里页面底部按钮不被 Home 条遮挡（本项目已用 `env(safe-area-inset-bottom)`）
- [ ] 输入四位数字时键盘能弹出（已用真实 `<input>`，不是纯 div）
- [ ] 扫码用的是 `https://` 完整地址生成的二维码

### 安全

- [ ] `ADMIN_TOKEN` 已设置且足够长（否则谁都能切阶段）
- [ ] `.env` 不在仓库、不在镜像里
- [ ] 服务器只对外暴露 80/443，3000 端口不对公网开放
- [ ] 定期备份：飞书多维表格自带版本历史；服务器侧只有 `data/`（阶段覆盖文件），无敏感数据
- [ ] 日志里不打印证件号/手机号（当前代码只打印表名和错误信息）

### 合规（重要）

本页收集**身份证号、手机号、车牌**，属于个人敏感信息，按《个人信息保护法》需要：

- [ ] 一页《隐私政策》，说明收集目的（入校报备）、范围、保存期限、联系方式
- [ ] 提交前勾选「我已阅读并同意《隐私政策》」（**目前代码里还没有这个勾选**）
- [ ] 只收集必要字段（车牌可空，身份证用于门禁报备）
- [ ] 告知学员信息会同步到飞书多维表格，由学校管理

如果需要，我可以把隐私同意勾选加进新客登记页和确认页（不勾选不能提交）。

---

## 常见问题

**Q：微信里打开空白/一直加载？**
看服务器日志 `docker compose logs -f app`；多半是飞书凭证错误或 `FEISHU_BASE_TOKEN` 不对。

**Q：能直接发给学员一个链接吗？**
可以，但要带课次：`https://域名/q/{课次recordId}/current`。不带课次会按日期自动选当前课次，可能选错。

**Q：一次课要发几个码？**
三个入口各一个：`/current`（在读）、`/new`（新客）、`/makeup`（往期补课）。`/staff` 页可以直接复制这三条链接。

**Q：备案没好，能先用吗？**
能，用方案 A 的临时地址，或把服务器放香港（不需要备案，但国内访问延迟高、偶尔被拦截）。
