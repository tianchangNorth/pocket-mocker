# PocketMocker

> **Visual in-browser HTTP mocking tool for modern frontend development.**
>
> A lightweight, visual debugging tool that intercepts and modifies HTTP requests directly in your browser.

**Live Demo:** [https://tianchangnorth.github.io/pocket-mocker/](https://tianchangnorth.github.io/pocket-mocker/)

Have questions or ideas?  
Please open an [Issue](https://github.com/tianchangNorth/pocket-mocker/issues) or start a [Discussion](https://github.com/tianchangnorth/pocket-mocker/discussions) — all levels of feedback are welcome!

[![npm version](https://badge.fury.io/js/pocket-mocker.svg)](https://badge.fury.io/js/pocket-mocker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT). 



**English** | [中文文档](docs/README.zh-CN.md)

## Table of Contents

- [Features](#-features)
- [Comparison](#-comparison)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Advanced Features](#advanced-features)
  - [Smart Mock Data Generation](#smart-mock-data-generation)
  - [Config Import](#-config-import)
  - [Dynamic Response](#dynamic-response-function-mock)
  - [Network Panel](#comprehensive-network-panel)
- [Roadmap](#roadmap)
- [Technical Architecture](#technical-architecture)
- [Contributing & Contact](#contributing--contact)

![PocketMocker Demo](public/pocket.webp)


**PocketMocker** is a zero-intrusion frontend Mock tool. Unlike Postman or traditional `mock.js`, it embeds directly **into your page**, allowing you to intercept `fetch` and `XMLHttpRequest` in real-time during development, dynamically modify response data, simulate network latency, and test error status codes.

## ✨ Features

- **Dual-Core Interception Engine**: Native support for both `fetch` and `XMLHttpRequest` (Ajax), seamlessly compatible with Axios and other third-party libraries
- **Visual Console**: Built-in Svelte debugging panel with **CodeMirror 6** editor (JS syntax highlighting), toggle switches, and real-time preview
- **Dynamic Response**: Support writing JavaScript functions to handle complex logic and return dynamic data based on request parameters
- **Smart UI**: Auto-adaptive **Light/Dark Theme**, elegant **Toast** notifications, and responsive layout
- **Comprehensive Network Panel**: Logs all network requests (mocked or real), with **search & filter**, **details view** (request/response body), **single-log deletion**, and **"Mock It"** feature to convert real requests into mock rules with one click
- **Config Import**: Import mock rules directly from **Postman Collections** and **OpenAPI 3.0** specifications with smart data generation
- **Shadow DOM Isolation**: UI styles are completely isolated, never polluting your application's CSS or being affected by external styles
- **Network Simulation**: One-click simulation of API **latency**, **404/500 errors**, perfect for testing skeleton screens and error boundaries
- **Dual-Mode Persistence**:
  - **Local Mode**: Default browser LocalStorage storage, rules persist across page refreshes
  - **Server Mode**: Vite plugin integration saves rules to local files for **team collaboration**

## Comparison

| Feature | PocketMocker | Mock.js | Postman | MSW |
| :--- | :---: | :---: | :---: | :---: |
| **Browser Integration** | ✅ (In-page UI) | ✅ | ❌ (Independent App) | ✅ (No UI) |
| **Visual Editing** | ✅ | ❌ | ✅ | ❌ |
| **Network Logging** | ✅ | ❌ | ✅ | ❌ |
| **Real-time Toggle** | ✅ | ❌ | ❌ | ❌ |
| **Smart Data Gen** | ✅ | ✅ | ❌ | ❌ |
| **Config Import** | ✅ (Postman/OA3) | ❌ | ✅ | ❌ |

## Installation
```bash
npm install pocket-mocker --save-dev
# or
yarn add pocket-mocker -D
# or
pnpm add pocket-mocker -D
```

## Quick Start

### Method 1: Zero Configuration (Local Mode)

Perfect for individual development or quick experimentation. Simply import and start in your project's entry file(save in local storage):

```javascript
import { pocketMock } from 'pocket-mocker';

// Only start in development environment
if (process.env.NODE_ENV === 'development') {
  pocketMock();
}
```

After starting your project, you'll see the **PocketMock** floating panel in the bottom-right corner.

### Method 2: Team Collaboration Mode (Vite Plugin) 🔥 Recommended

Ideal for production-level projects. The Vite plugin integrates with the file system, saving Mock rules to config files for team sharing.

**1. import and start in your project's entry file:**

```javascript
import { pocketMock } from 'pocket-mocker';

if (process.env.NODE_ENV === 'development') {
  pocketMock();
}
```

**2. Configure `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import pocketMockPlugin from 'pocket-mocker/vite-plugin';

export default defineConfig({
  plugins: [
    pocketMockPlugin()
  ]
});
```

**3. Start Development**

Run `npm run dev`. PocketMock automatically detects the plugin environment and switches to **Server Mode**.

## Advanced Features


### Smart Mock Data Generation

PocketMock includes a powerful **Smart Mock Generator** that allows you to create realistic test data with simple template syntax.

#### Cheat Sheet

| Syntax | Description | Example |
|:---|:---|:---|
| `@guid` | UUID | `"f47ac-..."` |
| `@cname` / `@name` | Name | `"John Doe"` |
| `@email` | Email | `"user@example.com"` |
| `@image(200x200)` | Image URL | `"https://via..."` |
| `@date` | Date | `"2023-12-25"` |
| `@integer(1,100)` | Integer | `42` |
| `@boolean` | Boolean | `true` |
| `@pick(A,B,C)` | Random Pick | `"B"` |

#### Usage Example

```javascript
// Use in response body
{
  "code": 0,
  "data": {
    "users|5": { // Generate array with 5 users
      "id": "@guid",
      "name": "@name",
      "avatar": "@image(100x100)",
      "role": "@pick(admin,guest,editor)",
      "score": "@integer(60,100)"
    }
  }
}
```

### Config Import

Import mock rules directly from popular API documentation formats with auto-conversion.

- **Supported Formats**: Postman Collection v2.1.0, OpenAPI 3.0 (Swagger)
- **Smart Conversion**:
  - `user_id` -> `@guid`
  - `avatar` -> `@image`
  - `{{baseUrl}}/users` -> `/users`

**How to use**: Click the "Import" button in the dashboard header and select your JSON file.

### Dynamic Response (Function Mock)

You are not limited to static JSON. You can write JavaScript functions to generate responses dynamically based on request!

```javascript
(req) => {
  // Dynamic response based on Query parameters
  if (req.query.id === '1') {
    return { id: 1, name: 'Admin', role: 'admin' };
  }

  // Dynamic response based on Body content
  if (req.body?.type === 'error') {
    return {
      status: 400,
      body: { message: 'Invalid Parameter' }
    };
  }

  // Default response
  return { id: 2, name: 'Guest' };
}
```

### Comprehensive Network Panel

The built-in Network panel logs all network requests (both mocked and real) in real-time, providing powerful debugging capabilities:

- **View Details**: Click logs to view full Request/Response Body.
- **One-Click Mock**: Click the "Mock" button on any log to instantly convert a real request into a mock rule.
- **Filter**: Filter logs by URL, Method, or Mock status.

## Technical Architecture

- **Monkey Patching**: Intercepts requests by overriding `window.fetch` and extending `XMLHttpRequest` prototype chain.
- **Shadow DOM**: Encapsulates debugging UI in Shadow Root for complete style sandboxing.
- **Vite Library Mode**: Uses Vite's library mode with `css: 'injected'` strategy to inline all CSS into JS for **single-file import** experience.

## Roadmap

Check out our [Roadmap](ROADMAP.md) to see what's next for PocketMocker and how you can contribute to its future!

## Contributing & Contact

We welcome all contributions to PocketMocker! Whether it's reporting bugs, suggesting new features, improving documentation, or submitting code, your help is greatly appreciated.

Please read our [Contribution Guidelines](CONTRIBUTING.md) for details on how to get started.

### Contact Me

If you have any questions, suggestions, or would like to connect, feel free to reach out:

- **Twitter (X)**: [https://x.com/tiancha79267301](https://x.com/tiancha79267301)
- **WeChat**
<div align="center">
  <img src="https://res.oafimg.cn/-/f69b6474980d7347/wechat.jpg" alt="My WeChat" width="150px">
</div>

## 📄 License

MIT © [tianchangNorth](https://github.com/tianchangNorth)
---

**Happy Mocking!**
