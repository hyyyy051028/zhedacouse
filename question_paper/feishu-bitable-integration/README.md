# 企业家研修报名系统 - 飞书多维表格对接方案

## 项目结构

```
entrepreneur-registration/
├── frontend/          # 前端代码
│   ├── index.html     # 报名表单页面
│   ├── style.css      # 样式文件
│   └── app.js         # 前端逻辑
├── backend/           # 后端代码
│   ├── server.js      # Express服务器
│   ├── package.json   # 依赖配置
│   └── .env.example   # 环境变量示例
└── README.md          # 说明文档
```

## 快速开始

### 1. 后端部署

```bash
cd backend
npm install
# 复制 .env.example 为 .env 并填写飞书配置
npm start
```

### 2. 前端部署

将 `frontend` 目录下的文件部署到任意静态服务器，或使用 Live Server 本地预览。

## 飞书配置说明

需要在飞书开放平台创建应用，获取以下配置：
- `FEISHU_APP_ID` - 应用ID
- `FEISHU_APP_SECRET` - 应用密钥
- `FEISHU_BASE_TOKEN` - 多维表格 Token（或个人版直接使用URL方式）

## API接口

- `POST /api/submit` - 提交报名数据
- `GET /api/health` - 健康检查
