# PocketMocker

> **所见即所得的浏览器端可视化 HTTP 调试工具。**
>
> 一款轻量级、可视化的浏览器内 HTTP Mock 工具，专为现代前端开发而设计。

**在线演示:** [https://tianchangnorth.github.io/pocket-mocker/](https://tianchangnorth.github.io/pocket-mocker/)

[![npm 版本](https://badge.fury.io/js/pocket-mocker.svg)](https://badge.fury.io/js/pocket-mocker)
[![开源协议: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](../README.md) | **中文文档**

## 目录

- [核心特性](#-核心特性)
- [工具对比](#-工具对比)
- [安装](#安装)
- [快速开始](#快速开始)
- [进阶功能](#进阶功能)
  - [智能 Mock 数据生成](#智能-mock-数据生成)
  - [配置导入](#-配置导入)
  - [动态响应](#动态响应-dynamic-response)
  - [网络面板](#功能全面的网络面板)
- [项目路线图](#项目路线图)
- [技术原理](#技术原理)
- [贡献与联系](#贡献与联系)

<video src="https://res.oafimg.cn/-/95cf85046b29fba1/pocket-mocker-new.mp4" controls width="800"></video>

**PocketMocker** 是一款零侵入的前端 Mock 工具。与 Postman 或传统的 `mock.js` 不同，它直接**嵌入在你的页面中**，让你在开发时可以实时拦截 `fetch` and `XMLHttpRequest`，动态修改响应数据、模拟网络延迟和异常状态码。

## ✨ 核心特性

- **双核拦截引擎**：原生支持 `fetch` 和 `XMLHttpRequest` (Ajax)，无缝兼容 Axios 等第三方库
- **可视化控制台**：内置 **CodeMirror 6** 编辑器，支持 JS 语法高亮、深色/浅色主题适配
- **动态响应**：支持编写 JavaScript 函数，根据请求参数 (Query/Body) 动态生成响应数据
- **网络面板**：实时记录所有请求，支持 **搜索**、**详情查看**，以及 **"一键 Mock"**（将真实请求转化为 Mock 规则）
- **配置导入**：支持从 **Postman Collections** 和 **OpenAPI 3.0** 直接导入，并自动生成智能数据
- **Shadow DOM 隔离**：UI 样式完全隔离，绝不污染你的业务页面
- **网络环境模拟**：一键模拟接口 **延迟 (Latency)**、**404/500 报错**
- **双模持久化**：支持 LocalStorage 本地存储和基于 Vite 插件的文件系统同步

## 工具对比

| 特性 | PocketMocker | Mock.js | Postman | MSW |
| :--- | :---: | :---: | :---: | :---: |
| **浏览器集成** | ✅ (页面内 UI) | ✅ | ❌ (独立 App) | ✅ (无 UI) |
| **可视化编辑** | ✅ | ❌ | ✅ | ❌ |
| **网络日志记录** | ✅ | ❌ | ✅ | ❌ |
| **实时开关/修改** | ✅ | ❌ | ❌ | ❌ |
| **智能数据生成** | ✅ | ✅ | ❌ | ❌ |
| **配置导入** | ✅ (Postman/OA3) | ❌ | ✅ | ❌ |

## 安装
```bash
npm install pocket-mocker --save-dev
# 或者
yarn add pocket-mocker -D
# 或者
pnpm add pocket-mocker -D
```

## 快速开始

### 方式一：零配置使用（本地模式）

适合个人开发或快速尝试。直接在项目的入口文件（如 `src/main.ts`）中引入并启动(配置存储在local storage中)：

```javascript
import { pocketMock } from 'pocket-mocker';

if (process.env.NODE_ENV === 'development') {
  pocketMock();
}
```

启动项目后，页面右下角会出现 **PocketMock** 浮窗。

### 方式二：团队协作模式（Vite 插件）🔥 推荐

适合生产级项目。通过 Vite 插件打通文件系统，将 Mock 规则保存为配置文件，方便 Git 共享。

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

## 进阶功能

### 智能 Mock 数据生成

PocketMock 内置强大的生成器，使用简单语法即可生成逼真的测试数据。

#### 常用生成器速查

| 语法 | 描述 | 示例 |
|:---|:---|:---|
| `@guid` | UUID | `"f47ac-..."` |
| `@cname` / `@name` | 姓名 | `"张三"` / `"John"` |
| `@email` | 邮箱 | `"user@example.com"` |
| `@image(200x200)` | 图片 URL | `"https://via..."` |
| `@date` | 日期 | `"2023-12-25"` |
| `@integer(1,100)` | 整数 | `42` |
| `@boolean` | 布尔值 | `true` |
| `@pick(A,B,C)` | 随机选择 | `"B"` |

#### 使用示例

```javascript
{
  "code": 0,
  "data": {
    "users|5": { // 生成包含 5 个用户的数组
      "id": "@guid",
      "name": "@cname",
      "avatar": "@image(100x100)",
      "role": "@pick(管理员,访客,编辑)",
      "score": "@integer(60,100)"
    }
  }
}
```

### 配置导入

支持直接导入 API 文档，自动转换并生成智能 Mock 数据。

- **支持格式**: Postman Collection v2.1.0, OpenAPI 3.0 (Swagger)
- **智能转换**:
  - `user_id` -> `@guid`
  - `avatar` -> `@image`
  - `{{baseUrl}}/users` -> `/users`

**操作步骤**: 点击控制台顶部的 "Import" 按钮，选择 JSON 文件即可。

### 动态响应 (Dynamic Response)

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

### 功能全面的网络面板

内置的网络面板将实时记录所有网络请求（包括 Mocked 和真实请求）：

- **查看详情**：点击日志查看完整的 Request/Response Body。
- **一键 Mock**：点击日志右侧的 "Mock" 按钮，将真实请求直接转换为 Mock 规则。
- **筛选**：支持按 URL、方法、Mock 状态筛选。

## 项目路线图

查阅我们的 [项目路线图](docs/ROADMAP.zh-CN.md) 了解 PocketMocker 的未来规划，以及您如何参与进来，共同构建项目的未来！

## 技术原理

- **拦截层**: 重写 `window.fetch` 和 `XMLHttpRequest` 原型链。
- **UI 隔离**: 使用 **Shadow DOM** 封装调试台 UI，实现样式完全沙箱化。
- **构建**: Vite 库模式打包，CSS 自动内联，实现单文件引入。

## 贡献与联系

我们非常欢迎所有对 PocketMocker 的贡献！无论是报告 Bug、提出新功能建议、改进文档还是提交代码，您的帮助都将使 PocketMocker 变得更好。

请阅读我们的 [贡献指南](docs/CONTRIBUTING.zh-CN.md) 了解如何参与项目。

<div align="center">
  <h3>联系我</h3>
  <p>如果您有任何疑问、建议或想加入用户群，可以通过以下方式联系：</p>
  <img src="https://res.oafimg.cn/-/f69b6474980d7347/wechat.jpg" alt="我的微信" width="200px">
</div>

## 📄 开源协议

MIT © [tianchangNorth](https://github.com/tianchangNorth)

---

**享受 Mock 的乐趣**