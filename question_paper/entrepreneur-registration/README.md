# 浙江大学企业家研修报名系统

一个完整的企业家研修报名网页系统，对接飞书多维表格。

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
│   └── .env           # 环境变量（需自行配置）
└── README.md          # 说明文档
```

## 功能特点

### 前端
- ✅ 17个完整表单字段
- ✅ 分组布局，美观大方
- ✅ 手机号和身份证前端验证
- ✅ 响应式设计，适配移动端
- ✅ 加载动画和提交反馈

### 后端
- ✅ Express服务器
- ✅ 飞书开放API对接
- ✅ 数据格式转换
- ✅ CORS跨域支持
- ✅ 错误处理

## 部署步骤

### 1. 飞书开放平台配置

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 开启权限：`bitable:record:app:create`、`bitable:table:app:read`
4. 获取 App ID 和 App Secret
5. 发布应用，并分享给多维表格（需要编辑权限）

### 2. 后端部署

```bash
cd backend
npm install
cp .env.example .env
# 编辑 .env 文件，填写飞书配置
npm start
```

### 3. 前端部署

- 将 `frontend` 目录部署到任意静态服务器
- 或使用 Live Server 本地预览

## 环境变量配置

在 `.env` 文件中配置以下信息：

```
# 飞书开放平台配置
APP_ID=your_app_id
APP_SECRET=your_app_secret

# 飞书多维表格配置
BITABLE_APP_TOKEN=your_bitable_app_token
BITABLE_TABLE_ID=your_bitable_table_id

# 服务器配置
PORT=3000
NODE_ENV=development
```

## 字段映射

| 网页表单 | 飞书表格字段 | 类型 |
|---------|------------|------|
| 姓名 | 姓名 | text |
| 招生老师 | 招生老师 | single_select |
| 职务 | 职务 | single_select |
| 手机号 | 手机号 | telephone |
| 最高学历 | 最高学历 | single_select |
| 毕业院校 | 毕业院校 | text |
| 单位名称 | 单位名称 | text |
| 身份证号码 | 身份证号码 | text |
| 所属行业 | 所属行业 | single_select |
| 企业规模 | 企业规模 | single_select |
| 车牌号 | 车牌号 | text |
| 管理年限 | 管理年限 | single_select |
| 年销售额 | 年销售额 | single_select |
| 报名项目 | 报名项目 | single_select |
| 学习期望 | 学习期望 | text |
| 居住城市 | 居住城市 | text |
| 是否缴费 | 是否缴费 | checkbox |

## 技术栈

- **前端**: HTML5 + CSS3 + JavaScript (原生)
- **后端**: Node.js + Express
- **API**: 飞书开放平台 API

## 注意事项

1. 确保飞书应用已获得多维表格的编辑权限
2. 确保环境变量配置正确
3. 后端服务需要在网络环境中可访问
4. 生产环境建议使用 HTTPS

## 常见问题

### Q: 提交失败怎么办？
A: 检查网络连接、飞书配置和环境变量是否正确。

### Q: 如何获取 BITABLE_APP_TOKEN 和 BITABLE_TABLE_ID？
A: 在飞书多维表格中，点击「分享」→「高级设置」→「API」即可查看。

### Q: 表单验证不通过？
A: 确保手机号和身份证号码格式正确，所有必填字段都已填写。

## 联系我们

如有问题，请联系浙江大学传媒国际文化经济高培中心。