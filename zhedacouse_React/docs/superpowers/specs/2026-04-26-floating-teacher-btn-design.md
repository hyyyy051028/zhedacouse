# Floating Teacher Info Button Design

## 1. Overview
在首页添加一个全局右侧悬浮按钮“联系老师”。点击后弹出一个模态框（Modal），以轮播图（左右箭头切换）的形式展示 `data/index.ts` 中定义的各个老师的信息（姓名、电话、二维码、报名链接）。

## 2. UI & Interaction Design
### 2.1 Floating Button
- **位置**: `position: fixed; right: 0; top: 50%; transform: translateY(-50%)`。
- **样式**: 参考 `prototype/浙商企业家创新提升高级研修班.html` 中的 `.floating-btn`：
  - 白底黑字（`#000` 文字和边框），左侧圆角 `30px 0 0 30px`。
  - `writing-mode: vertical-lr` 竖排文字。
  - Hover 时有轻微向左浮动和阴影加深效果。
  - 滑光动画效果。

### 2.2 Modal
- **触发**: 点击悬浮按钮打开 `antd` 的 `Modal`，不显示默认 Footer（无确认/取消按钮）。
- **内容布局**:
  - 中间显示：老师二维码（使用 `antd` `Image` 组件）、姓名、电话、一个主要按钮用于跳转到 `signupUrl`。
  - 左右两侧各有一个箭头按钮 `<` 和 `>`。
- **交互逻辑**:
  - 数据源：`Object.values(teachers)` 转换成数组。
  - 使用 `currentIndex` state 维护当前显示的老师索引。
  - 点击 `<` 切换到 `(currentIndex - 1 + length) % length`。
  - 点击 `>` 切换到 `(currentIndex + 1) % length`。

## 3. Technical Implementation
### 3.1 Component Structure
- 新建组件: `src/components/common/ui/FloatingTeacherBtn/FloatingTeacherBtn.tsx`
- 新建样式: `src/components/common/ui/FloatingTeacherBtn/FloatingTeacherBtn.css`
- 在 `src/pages/Home.tsx` 中引入并挂载该组件。

### 3.2 Data Binding
- `import { teachers } from "../../../../data"`
- `const teacherList = Object.values(teachers);`
- `const [currentIndex, setCurrentIndex] = useState(0);`
- 考虑将 `Home.tsx` 中的 URL 参数 `teacherKey` 的对应老师设为初始值，如果没有或者未找到，默认索引为 0。

## 4. Acceptance Criteria
1. 首页右侧正确显示竖向排版的黑白悬浮按钮。
2. 悬浮按钮自带滑光动画和 hover 交互。
3. 点击悬浮按钮，正确弹出 Modal，Modal 内部左右切换功能正常，无越界错误。
4. 二维码支持点击放大（antd `Image`），信息展示准确。
5. 样式在桌面端和移动端具有良好的自适应性。
