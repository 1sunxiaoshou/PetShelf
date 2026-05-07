# PetShelf Agent 指南

本文记录 PetShelf 的基础项目规范。详细产品、数据、设计和组件规范放在 `docs/` 目录中维护。

## 项目文档

- 产品规划：`docs/产品规划.md`
- 宠物数据模型与上传契约：`docs/宠物数据模型.md`
- 设计系统：`docs/设计系统.md`
- 组件架构：`docs/组件架构.md`

## 产品规则

- PetShelf 是面向 Codex 兼容宠物的轻量 Web 资源库。
- 应用只接受原始宠物文件夹，不接受 Zip 文件。
- 有效宠物文件夹遵循 `hatch-pet` 的 Codex Pet Contract：
  - `pet.json`
  - `spritesheet.webp`
- `pet.json` 必须包含 `id`、`displayName`、`description`、`spritesheetPath`。
- spritesheet atlas 必须为 `1536x1872`，8 列 x 9 行，单格 `192x208`，透明背景。
- 存储原始文件夹文件。用户需要归档包时，在下载或导出阶段组装。
- 首页保持轻量：搜索、排序按钮、上传、文档、用户面板、宠物卡片。
- 首页不增加全局左侧边栏。
- `我的上传` 和 `我的点赞` 放在用户面板中。
- 除非产品决策变化，不增加分类、标签、筛选字段。
- MVP 阶段不做审核或审批流程。

## 架构规则

- 前端技术栈：React + Vite。
- `src/App.jsx` 只保留组合和页面级状态。
- 可复用 UI 放在 `src/components/`。
- 静态演示和产品数据放在 `src/data/`。
- 共享常量放在 `src/constants/`。
- 纯函数和浏览器端校验逻辑放在 `src/utils/`。
- 样式放在 `src/styles/`，按职责拆分：
  - `global.css`：reset、令牌、基础元素。
  - `layout.css`：页面外壳、顶部栏、主体、页脚、响应式布局。
  - `components.css`：可复用组件类。
- 在确实出现共享复杂状态前，不增加状态管理库。
- 在出现真实第二页面前，不急着增加复杂路由。静态 Markdown 文档可以先直接链接。

## 组件规则

- 组件应小而清晰，并按产品角色命名，如 `AppHeader`、`PetCard`、`UploadDialog`、`UserPanel`。
- 文件上传解析不要写进 UI 组件，使用 `utils/uploadValidation.js`。
- 可共享的显示格式化不要写进组件，使用 `utils/format.js`。
- 首页卡片保持现有字段：宠物图、名称、作者、下载量、点赞量。
- 标准 UI 图标使用 `lucide-react`。
- 当前 MVP 的像素宠物预览只是临时占位，后续应替换为真实 spritesheet 渲染。

## 设计规则

- 遵循 `docs/设计系统.md` 中的视觉方向、设计令牌、组件状态和可访问性规范。
- 新页面和组件必须基于设计系统构建，不要发明一次性 UI。
- 如果新需求不适配当前设计系统，应先更新设计系统，再实现界面。
- 首页保持应用工作台形态，不做成营销落地页。
- 组件拆分和页面边界参考 `docs/组件架构.md`。

## 上传规则

- 上传入口是单个 `上传` 按钮。
- 点击上传后，通过目录文件输入打开文件夹选择。
- 展示确认前必须先在本地校验：
  - 文件夹大小小于 10 MB。
  - 文件夹包含 `pet.json`。
  - `pet.json` 可解析为 JSON。
  - 必填 manifest 字段存在。
  - `spritesheetPath` 指向真实文件。
  - spritesheet 是 PNG 或 WebP。
  - spritesheet 尺寸符合 Codex atlas 契约。
  - spritesheet 包含透明像素。
- 用户可见校验摘要保持紧凑，只显示 `文件夹大小`、`pet.json`、`spritesheet`。
- 校验成功后隐藏校验细节，改为展示宠物信息。
- 校验失败时禁用确认。
- 后续后端上传必须重复服务端校验。

## Git 工作流

- 主分支：`main`。
- 有意义的前端改动提交前运行 `npm run build`。
- 不提交 `node_modules/`、`dist/`、本地环境文件或生成的调试产物。
- 提交保持聚焦，描述清晰。
