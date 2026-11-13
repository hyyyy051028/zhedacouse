# 部署到腾讯云服务器（zju.yolodeep.fun 所在机器）

现有环境：

```
域名   zju.yolodeep.fun  → DNS 在 DNSPod
服务器 101.35.2.223（腾讯云，Ubuntu/Debian 系）
Nginx  1.26.2，已占用 80/443，跑着静态站（React 原型）
证书   TrustAsia DV，只覆盖 zju.yolodeep.fun，2026-12-09 到期
SSH    22 端口开放
```

思路：**不动现有站点**，用一个子域名 `qd.yolodeep.fun` 指向同一台服务器，Nginx 反代到本机 3001 端口的 Node 服务。

---

## 第 1 步：加 DNS 记录（2 分钟）

DNSPod 控制台 → yolodeep.fun → 记录管理 → 添加记录：

| 主机记录 | 类型 | 记录值 | TTL |
|---|---|---|---|
| `qd` | A | `101.35.2.223` | 600 |

验证：本地执行 `dig +short qd.yolodeep.fun`，应返回 `101.35.2.223`。

---

## 第 2 步：从本地把代码传上去

在**你 Mac** 上执行（把 `root` 换成你的 SSH 用户）：

```bash
cd ~/Downloads/wechat-class-ops-v2

ssh root@101.35.2.223 "mkdir -p /opt/wechat-class-ops"

rsync -av --exclude '.env' --exclude 'data/' --exclude '.git' \
  ./ root@101.35.2.223:/opt/wechat-class-ops/
```

> `.env` 故意不传，下一步单独创建，避免和仓库混在一起。

---

## 第 3 步：服务器上装 Node 并写配置

SSH 登录服务器：

```bash
ssh root@101.35.2.223
```

**3.1 检查 Node（需要 ≥ 20.6）**

```bash
node -v
```

没有或版本太低就装：

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
```

**3.2 创建 `.env`**

```bash
cd /opt/wechat-class-ops
cat > .env <<'ENV'
FEISHU_MODE=live
FEISHU_APP_ID=填你的
FEISHU_APP_SECRET=填你的
FEISHU_BASE_TOKEN=I3ErbIGs7ayB7LsR11NcaZ9an9c
ADMIN_TOKEN=换成一个足够长的随机串
PORT=3001
ENV
chmod 600 .env
```

> 这三项（App ID / Secret / Base Token）和你本机 `.env` 里的一致，直接复制过来即可。

**3.3 注册为系统服务**

```bash
cp deploy/systemd-tencent.service /etc/systemd/system/wechat-class-ops.service
systemctl daemon-reload
systemctl enable --now wechat-class-ops
systemctl status wechat-class-ops --no-pager
```

**3.4 自测**

```bash
curl -s http://127.0.0.1:3001/api/health
# 期望：{"ok":true,"mode":"live"}
```

如果报错看日志：`journalctl -u wechat-class-ops -n 50 --no-pager`

---

## 第 4 步：申请证书（二选一）

**方式 A：腾讯云免费证书（推荐，和你现有那张一样）**

1. 腾讯云控制台 → SSL 证书 → 申请免费证书 → 域名填 `qd.yolodeep.fun`
2. 签发后下载 **Nginx 格式**，得到 `.crt` 和 `.key` 两个文件
3. 上传到服务器：

```bash
scp qd.yolodeep.fun_bundle.crt qd.yolodeep.fun.key root@101.35.2.223:/etc/nginx/ssl/
```

**方式 B：Let's Encrypt（在服务器上跑，自动续期）**

```bash
apt install -y certbot
certbot certonly --nginx -d qd.yolodeep.fun
```

证书路径会变成 `/etc/letsencrypt/live/qd.yolodeep.fun/fullchain.pem` 和 `privkey.pem`，记得改 Nginx 配置里的两行。

---

## 第 5 步：配 Nginx

```bash
cp /opt/wechat-class-ops/deploy/nginx-subdomain.conf /etc/nginx/conf.d/qd.yolodeep.fun.conf
nginx -t          # 语法检查
systemctl reload nginx
```

验证：

```bash
curl -s https://qd.yolodeep.fun/api/health
# 期望：{"ok":true,"mode":"live"}
```

---

## 第 6 步：发码

打开 `https://qd.yolodeep.fun/staff`，输入 `ADMIN_TOKEN`，页面会列出三个入口，每个下面直接有二维码可下载：

```
https://qd.yolodeep.fun/q/{课次recordId}/current   在读老学员
https://qd.yolodeep.fun/q/{课次recordId}/new       新客
https://qd.yolodeep.fun/q/{课次recordId}/makeup    往期补课
```

---

## 日常运维

| 操作 | 命令 |
|---|---|
| 看状态 | `systemctl status wechat-class-ops` |
| 看日志 | `journalctl -u wechat-class-ops -f` |
| 重启 | `systemctl restart wechat-class-ops` |
| 更新代码 | 本地 `rsync` 覆盖 → `systemctl restart wechat-class-ops` |
| 改口令 | 编辑 `/opt/wechat-class-ops/.env` 的 `ADMIN_TOKEN` → 重启 |

## 注意

- 现有 `zju.yolodeep.fun` 站点完全不受影响（Nginx 按 `server_name` 分流）
- `.env` 权限 `600`，不要提交到仓库
- 证书 12 月 9 日到期，记得续（方式 A 是手动换，方式 B 自动续）
- 服务器在国内，域名需已完成 ICP 备案（现有站点能访问，说明已备案；子域名无需单独备案）
