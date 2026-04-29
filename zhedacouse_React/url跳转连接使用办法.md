# url跳转使用办法

- 路由总览
  - 当前有效路由： / 、 /register
  - 统一使用查询参数传老师： ?teacher=<teacherKey>
- URL 规则
  - teacher ：老师 key（来自 data/index.ts 的 teachers ）
  - calendar ：是否展示日历区块（ 1/true/show ）
- 跳转示例（复制即用）
  - 首页： /?teacher=zhanglu
  - 报名页： /register?teacher=zhanglu
  - 带锚点： /?teacher=zhanglu#courses
- 组件如何读写 teacher（统一约定）
  - Header/Footer/Home/FloatingTeacherBtn：从 useSearchParams() 读取 teacher
  - 生成链接时保留 teacherSuffix
- 重定向策略
  - 当 teacher 存在但无效（不在 teachers 中）时： replace 跳回 /
- 常见坑
  - 不再使用 /:teacherKey 路由参数（当前路由表里没有）
  - 外链打开报名表单时使用 rel="noopener noreferrer" 等
