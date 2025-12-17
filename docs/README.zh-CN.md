<div align="center">

# PocketMocker

<p>
  <a href="https://www.npmjs.com/package/pocket-mocker" target="_blank">
    <img src="https://img.shields.io/npm/v/pocket-mocker?style=for-the-badge&logo=npm" alt="NPM 版本" />
  </a>
  <a href="https://github.com/tianchangNorth/pocket-mocker/blob/main/LICENSE" target="_blank">
    <img src="https://img.shields.io/github/license/tianchangNorth/pocket-mocker?style=for-the-badge&color=blue" alt="开源协议" />
  </a>
  <a href="https://github.com/tianchangNorth/pocket-mocker/actions/workflows/ci.yml" target="_blank">
    <img src="https://img.shields.io/github/actions/workflow/status/tianchangNorth/pocket-mocker/ci.yml?branch=main&style=for-the-badge&logo=github" alt="CI 状态" />
  </a>
</p>

<p>
  <a href="https://tianchangnorth.github.io/pocket-mocker/" target="_blank">
    <strong>🚀 在线演示</strong>
  </a>
  ·
  <a href="#安装">安装</a>
  ·
  <a href="#快速开始">快速开始</a>
  ·
  <a href="#贡献与联系">贡献与联系</a>
  ·
  <a href="https://github.com/tianchangNorth/pocket-mocker/discussions">讨论</a>
  ·
  <a href="https://discord.gg/cjGqnppNZW" target="_blank">
    <strong>💬 Discord</strong>
  </a>
</p>

<p>
  <a href="../README.md">English</a> · <strong>中文</strong>
</p>

</div>

## PocketMocker 是什么？

**PocketMocker 是一款前端开发专用的页面内 HTTP 控制器。**

简单来说，让你直接决定接口返回什么——无需改后端，无需起 Mock Server。

它提供了一个**可视化控制面板**直接嵌入浏览器，让你实时拦截和操作 HTTP 响应，通过**即时看到变化**来快速构建健壮的 UI。

---

## 为什么选择 PocketMocker？

### 轻松 Mock
告别手写 Mock 代码。自动拦截请求，智能生成数据，一键导入 API 文档。

### 完全掌控
*   **时序控制**：模拟网络延迟、竞态条件
*   **状态控制**：强制 500 错误、401 未授权、空响应
*   **载荷注入**：测试边界数据和异常情况

### 即时调试
在浏览器中实时编辑响应，立即看到 UI 更新。无需切换工具，保持开发心流。

---

## 实际应用场景

### 即时状态切换
一键切换**成功**、**错误（500/404）**或**空数据**状态。验证您的 UI 如何处理加载动画或错误提示，无需修改任何代码。

### 实时数据调整
需要测试超长用户名？缺失的头像？或特定的价格格式？直接在面板中编辑响应 JSON，立即看到 UI 更新。

### 边界情况验证
模拟网络延迟、超时错误或未授权（401）响应，确保您的应用优雅地处理异常情况。

https://github.com/user-attachments/assets/e7501191-7ef1-4bd4-bd21-6500585fe4ad

## 何时使用 PocketMocker？

**使用 Postman 进行：**
*   API 设计与文档
*   后端契约测试
*   团队级 API 管理

**使用 PocketMocker 进行：**
*   **快速 UI 开发**："我现在就需要让这个列表为空。"
*   **可视化调试**："为什么我的错误边界没有显示？"
*   **零上下文切换**：留在浏览器中，保持心流状态。
*   **Git 友好**：通过配置文件共享 Mock 规则，就像您的代码一样。

---

## 安装

```bash
npm install pocket-mocker --save-dev
# 或者
yarn add pocket-mocker -D
# 或者
pnpm add pocket-mocker -D
```

---

## 快速开始

### 方式一：零配置使用（本地模式）

适合个人开发或快速尝试。直接在项目的入口文件中引入并启动：

```javascript
import { pocketMock } from 'pocket-mocker';

// 仅在开发环境中启动
if (process.env.NODE_ENV === 'development') {
  pocketMock();
}
```

启动项目后，页面右下角会出现 **PocketMocker** 浮窗。

### 方式二：团队协作模式（Vite 插件）🔥 推荐

适合生产级项目。通过 Vite 插件打通文件系统，将 Mock 规则保存为配置文件，方便团队共享。

**1. 在入口文件引入**

```javascript
import { pocketMock } from 'pocket-mocker';

if (process.env.NODE_ENV === 'development') {
  pocketMock();
}
```

**2. 配置 `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import pocketMockPlugin from 'pocket-mocker/vite-plugin';

export default defineConfig({
  plugins: [
    pocketMockPlugin()
  ]
});
```

**3. 启动开发**

运行 `npm run dev`。PocketMock 会自动检测插件环境并切换到 **服务器模式**。

---

## 进阶功能

### URL 模式匹配

PocketMock 支持强大的 URL 模式来模拟复杂的 API：

- **路径参数**: `/api/users/:id` → 匹配 `/api/users/123`, `/api/users/john`
- **通配符**: `/api/*` → 匹配 `/api/users`, `/api/users/123/posts`
- **混合模式**: `/api/:version/users/*/profile` → 匹配 `/api/v1/users/123/profile`

在模拟函数中获取捕获的参数：
```javascript
(req) => {
  const { id, version } = req.params;
  const { include } = req.query;
  return { id: parseInt(id), version, includeAuthor: include === 'true' };
}
```

### 智能 Mock 数据生成

PocketMock 内置强大的智能生成器，使用简单语法即可生成逼真的测试数据。

#### 快速体验

```javascript
{
  "user": {
    "id": "@guid",                    // → "550e8400-e29b-41d4"
    "name": "@name",                  // → "张三"
    "email": "@email",                // → "zhangsan@example.com"
    "avatar": "@image(100x100)",      // → "https://via.placeholder.com/100x100"
    "age": "@integer(18,60)",        // → 25
    "role": "@pick(管理员,用户)"        // → "管理员"
  }
}
```

#### 常用生成器

| 语法 | 功能 | 示例 |
|------|------|------|
| `@guid` | 唯一标识 | `"f47ac..."` |
| `@name` | 随机姓名 | `"张三"` |
| `@email` | 邮箱地址 | `"user@example.com"` |
| `@integer(min,max)` | 随机整数 | `@integer(1,100)` → `42` |
| `@pick(A,B,C)` | 随机选择 | `@pick(苹果,香蕉)` → `"苹果"` |
| `@image(100x100)` | 占位图片 | `"https://via.placeholder.com/100x100"` |

#### 更多功能

<details>
<summary>查看完整生成器列表</summary>

| 分类 | 语法 | 说明 |
|------|------|------|
| **基础类型** |
| `@float(min,max,decimals)` | 随机浮点数 | `@float(0,1,2)` → `0.57` |
| `@boolean` | 随机布尔值 | `true` |
| `@string(length)` | 随机字符串 | `@string(8)` → `"aX9bK2pQ"` |
| **个人信息** |
| `@phone(countryCode)` | 电话号码 | `@phone(+86)` |
| **日期时间** |
| `@date(start,end)` | 随机日期 | `@date(2023-01-01,2024-12-31)` |
| **其他** |
| `@color` | 随机颜色 | `"#a3f4c2"` |
| `@text(wordCount)` | 随机文本 | 生成指定词数的文本 |
| `@address(countries)` | 地址对象 | `@address(中国,美国)` |
| `@company(industries)` | 公司对象 | `@company(科技,金融)` |
| `@url(tlds)` | 随机 URL | `@url(com,cn)` |

**数组语法：**
```javascript
{
  "users|5": {            // 生成5个用户
    "id": "@guid",
    "name": "@name"
  },
  "scores|3-5": "@integer(60,100)"  // 生成3到5个分数
}
```
</details>

### 动态响应（函数 Mock）

不再局限于静态 JSON！你可以编写 JavaScript 函数来根据请求动态生成响应。

```javascript
(req) => {
  // 根据 Query 参数动态返回
  if (req.query.id === '1') {
    return { id: 1, name: '管理员', role: 'admin' };
  }

  // 根据 Body 内容判断
  if (req.body?.type === 'error') {
    return {
      status: 400,
      body: { message: '参数错误' }
    };
  }

  // 默认返回
  return { id: 2, name: '访客' };
}
```

### 配置导入

支持直接导入 API 文档，自动转换并生成智能 Mock 数据。

- **支持格式**: Postman Collection v2.1.0, OpenAPI 3.0 (Swagger)
- **智能转换**:
  - `user_id` -> `@guid`
  - `avatar` -> `@image`
  - `{{baseUrl}}/users` -> `/users`

**使用方法**: 点击控制台顶部的"导入"按钮，选择 JSON 文件即可。

### 功能全面的网络面板

内置的网络面板将实时记录所有网络请求（包括 Mocked 和真实请求），提供强大的调试功能：

- **查看详情**: 点击日志查看完整的 Request/Response Body。
- **一键 Mock**: 点击日志上的"Mock"按钮，将真实请求直接转换为 Mock 规则。
- **筛选**: 支持按 URL、方法、Mock 状态筛选。

---

## 技术原理

- **猴子补丁**: 通过重写 `window.fetch` 和扩展 `XMLHttpRequest` 原型链来拦截请求
- **Shadow DOM**: 使用 Shadow Root 封装调试 UI，实现样式完全沙箱化
- **Vite 库模式**: 使用 Vite 的库模式和 `css: 'injected'` 策略，将 CSS 内联到 JS 中，实现**单文件导入**体验

---

## 项目路线图

查看我们的 [项目路线图](ROADMAP.zh-CN.md)，了解 PocketMocker 的未来规划以及如何参与贡献！

---

## 贡献与联系

我们欢迎所有对 PocketMocker 的贡献！无论是报告 Bug、提出新功能建议、改进文档还是提交代码，您的帮助都将使 PocketMocker 变得更好。

请阅读我们的 [贡献指南](CONTRIBUTING.zh-CN.md) 了解如何参与项目。

### 联系我

如果您有任何疑问、建议或想加入交流，欢迎通过以下方式联系：

- **Twitter (X)**: [https://x.com/tiancha79267301](https://x.com/tiancha79267301)
- **微信**
<div align="center">
  <img src="https://res.oafimg.cn/-/f69b6474980d7347/wechat.jpg" alt="我的微信" width="150px">
</div>

---

## License

MIT © [tianchangNorth](https://github.com/tianchangNorth)

---

<div align="center">

**掌控 HTTP，主宰你的前端！**

</div>