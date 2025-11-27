# 🗺️ PocketMock Roadmap

本文档详细规划了 **PocketMock** 的未来演进路线。我们的愿景是打造一个**零侵入、可视化、全栈友好**的前端 HTTP Mock 工具。

## 📅 阶段一：核心增强与体验打磨 (v1.x)
**目标**：消除开发中的痛点，使 Mock 规则更灵活、更强大，提升“开箱即用”的体验。

### 1.1 路由匹配增强 (Smart Routing) ✅ (Completed)
目前仅支持简单的字符串包含/精确匹配，无法处理 RESTful 风格的动态参数。
- **功能特性**:
  - 支持动态路径参数: `/api/users/:id`。
  - 支持通配符: `/api/files/*`。
  - 引入权重机制: 优先匹配精确路由，后匹配通配符路由。
- **技术方案**:
  - 引入轻量级路由匹配库（如 `regexparam` 或自研正则转换），保持零依赖或极小体积。
  - 在 `interceptor.ts` 中重构匹配逻辑，解析 URL 参数并注入到 Response 上下文中。

### 1.2 UI/UX 深度优化 (UI Polish) ✅ (Completed)
针对现有 Dashboard 的交互痛点进行彻底改造，确保其作为“生产力工具”的易用性。
- **样式隔离与组件化 (Style Isolation)**:
  - **问题**: 现有 `select/input` 依赖浏览器原生样式，易受宿主页面全局 CSS 污染。
  - **方案**: 构建一套轻量级、无依赖的自定义 UI 组件库（Button, Input, Select, Switch），完全接管渲染，确保在任何环境下样式一致且美观。
- **全功能编辑 (Full Editing)**:
  - **问题**: 现有规则创建后无法修改 URL 和 Method，只能删除重建。
  - **方案**: 改造编辑模式，支持对所有字段（URL, Method, Status, Delay, Response）的修改。
- **空状态体验 (Empty State UX)**:
  - **问题**: 删除所有规则后会自动“强塞”一条 Demo 规则，干扰用户操作。
  - **方案**: 移除自动恢复默认规则的逻辑，设计友好的 Empty State 界面（如“👋 暂无规则，点击右上角 + 添加”），支持一键恢复默认（可选）。
- **面板拖拽 (Draggable Panel)**:
  - **问题**: 固定右下角可能遮挡页面内容。
  - **方案**: 实现面板的自由拖拽与边缘吸附功能。

### 1.3 动态响应 (Dynamic Response)
静态 JSON 无法满足根据请求参数返回不同结果的需求。
- **功能特性**:
  - 支持函数式定义: `response: (req, params) => any`。
  - 能够读取 URL Query (`?id=1`) 和 Body (`{ type: "admin" }`)。
  - **示例**:
    ```javascript
    // 伪代码
    {
      url: '/api/login',
      method: 'POST',
      response: (req) => {
        if (req.body.username === 'admin') return { role: 'admin' };
        return { role: 'guest' };
      }
    }
    ```

### 1.4 开发者面板升级 (Dashboard 2.0)
目前的 Svelte 面板功能较为基础。
- **功能特性**:
  - **Monaco Editor 集成**: 替换简单的 `<textarea>`，提供 JSON 语法高亮、错误提示、折叠功能。
  - **搜索与过滤**: 支持按 URL 关键字、Method、状态（启用/禁用）筛选规则列表。
  - **快捷操作**: 从 Network 面板一键“生成规则”，将真实请求转为 Mock 规则。
  - **暗色模式**: 适配系统深色主题。

### 1.5 工程化建设
- **测试体系**: 建立单元测试 (Vitest) 和 E2E 测试 (Playwright)，确保拦截逻辑在不同浏览器中的稳定性。
- **类型定义**: 完善 `d.ts` 文件，确保用户在 `pocket-mock.config.ts` 中获得完美的 TypeScript 提示。

---

## 🚀 阶段二：智能化与场景管理 (v2.x)
**目标**：解决“造数据难”和“状态切换繁琐”的问题，支持复杂业务流模拟。

### 2.1 智能数据生成 (Smart Mock Data)
手写大量 JSON 数据非常耗时。
- **功能特性**:
  - **集成 Faker 语法**: 在 JSON 中直接使用占位符。
    ```json
    {
      "users|10": [{
        "id": "@guid",
        "name": "@cname",
        "avatar": "@image('200x200')"
      }]
    }
    ```
  - **Schema 驱动**: 支持导入 TS Interface 或 Swagger 定义，自动生成符合结构的 Mock 数据。

### 2.2 场景管理 (Scenario Management)
开发中常需要在“正常流”、“异常流”、“空状态”之间切换，目前只能手动开关单个规则。
- **功能特性**:
  - **Mock Sets (场景集)**: 定义一组规则的集合（如 `Login_Success`, `Login_Failed`, `Server_Down`）。
  - **一键切换**: 在面板顶部增加下拉菜单，全局切换当前应用的场景集。
  - **状态记忆**: 记住用户上次选择的场景。

### 2.3 有状态 Mock (Stateful Mock)
模拟真实的 CRUD 操作，而不仅仅是只读。
- **功能特性**:
  - 内置轻量级内存数据库（类似 `localStorage` 或 `IndexedDB` 封装）。
  - **示例**: POST `/todos` 后，GET `/todos` 能真正返回新增的那条数据，刷新页面后可选是否持久化。

---

## 🌐 阶段三：生态扩展与团队协作 (v3.x)
**目标**：打通团队协作流，支持更多构建工具和运行环境。

### 3.1 广泛的构建工具支持
- **Webpack / Rspack 插件**: 开发专用插件，对齐 Vite 插件的体验（文件系统读写能力）。
- **独立 CLI**: `npx pocket-mock start`，启动独立的 Mock 服务器，供非浏览器环境（如 Node.js 脚本、移动端 App 开发）使用。

### 3.2 团队协作流 (Team Collaboration)
- **远程规则源**: 支持从 URL 加载规则配置（如公司内部的 YApi/Swagger/Apifox 导出地址）。
- **配置分层**:
  - `base`: 团队共享的基础 Mock 数据 (git tracked)。
  - `local`: 开发者本地的覆盖配置 (git ignored)。
- **冲突解决**: 友好的 UI 界面解决本地规则与远程规则的冲突。

### 3.3 插件系统
- 允许开发者编写插件扩展 PocketMock 的功能（例如：自定义拦截器、自定义数据生成器）。

---

## 📝 文档与社区
- **多语言文档**: 完善英文与中文文档，提供更丰富的 Examples。
- **Recipe 库**: 针对常见框架（React, Vue, Angular）和请求库（Axios, React Query, SWR）提供最佳实践代码片段。
