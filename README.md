<div align="center">

# PocketMocker

<p>
  <a href="https://www.npmjs.com/package/pocket-mocker" target="_blank">
    <img src="https://img.shields.io/npm/v/pocket-mocker?style=for-the-badge&logo=npm" alt="NPM Version" />
  </a>
  <a href="https://github.com/tianchangNorth/pocket-mocker/blob/main/LICENSE" target="_blank">
    <img src="https://img.shields.io/github/license/tianchangNorth/pocket-mocker?style=for-the-badge&color=blue" alt="License" />
  </a>
  <a href="https://github.com/tianchangNorth/pocket-mocker/actions/workflows/ci.yml" target="_blank">
    <img src="https://img.shields.io/github/actions/workflow/status/tianchangNorth/pocket-mocker/ci.yml?branch=main&style=for-the-badge&logo=github" alt="CI Status" />
  </a>
</p>

<p>
  <a href="https://tianchangnorth.github.io/pocket-mocker/" target="_blank">
    <strong>Live Demo</strong>
  </a>
  ·
  <a href="docs/USER_MANUAL.md"><strong>📖 User Manual</strong></a>
  ·
  <a href="#installation">Installation</a>
  ·
  <a href="#quick-start">Quick Start</a>
  ·
  <a href="#contributing--contact">Contributing & Contact</a>
  ·
  <a href="https://github.com/tianchangNorth/pocket-mocker/discussions">Discussions</a>
  ·
  <a href="https://discord.gg/cjGqnppNZW" target="_blank">
    <strong>💬 Discord</strong>
  </a>
</p>

<p>
  <strong>English</strong> · <a href="docs/README.zh-CN.md">中文</a>
</p>

</div>

## Documentation

- **[English User Manual](docs/USER_MANUAL.md)**: Detailed guide on features, syntax, and usage.
- **[中文用户手册](docs/USER_MANUAL.zh-CN.md)**: 功能、语法及使用指南。

## What is PocketMocker?

**PocketMocker is an in-page HTTP controller for frontend development.**

In simple terms, it lets you decide what your API responses should be—without touching the backend or setting up a mock server.

It provides a **visual control panel** directly in your browser to **intercept**, **override**, and **manipulate** HTTP responses, helping you build robust UIs faster by seeing changes instantly.

---

## Why PocketMocker?

### Mock Effortlessly
Stop writing mock code. Intercept requests automatically, generate smart data, import API docs with one click.

### Control Completely
*   **Timing**: Simulate network latency, race conditions
*   **Status**: Force 500 errors, 401 unauthorized, empty responses
*   **Payload**: Test edge cases and exception scenarios

### Debug Instantly
Edit responses directly in your browser and see UI updates instantly. No tool switching, stay in the flow.

---

## Real-World Use Cases

### Instant State Switching
Toggle between **Success**, **Error (500/404)**, or **Empty Data** states in one click. verify how your UI handles loading spinners or error toasts without changing a single line of code.

### On-the-fly Data Tweaking
Need to test a long username? A missing avatar? Or a specific price format? Just edit the response JSON directly in the panel and see the UI update instantly.

### Edge Case Verification
Simulate network delays (latency), timeout errors, or unauthorized (401) responses to ensure your application handles exceptions gracefully.  

https://github.com/user-attachments/assets/e7501191-7ef1-4bd4-bd21-6500585fe4ad

## Installation

```bash
npm install pocket-mocker --save-dev
# or
yarn add pocket-mocker -D
# or
pnpm add pocket-mocker -D
```

---

## Quick Start

### Method 1: Zero Configuration (Local Mode)

Perfect for individual development or quick experimentation. Simply import and start in your project's entry file:

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

**1. Import and start in your project's entry file:**

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

---

## Advanced Features

### URL Pattern Matching

PocketMock supports powerful URL patterns to mock complex APIs:

- **Path Parameters**: `/api/users/:id` → matches `/api/users/123`, `/api/users/john`
- **Wildcards**: `/api/*` → matches `/api/users`, `/api/users/123/posts`
- **Mixed Patterns**: `/api/:version/users/*/profile` → matches `/api/v1/users/123/profile`

Access captured parameters in mock functions:
```javascript
(req) => {
  const { id, version } = req.params;
  const { include } = req.query;
  return { id: parseInt(id), version, includeAuthor: include === 'true' };
}
```

### Smart Mock Data Generation

PocketMock includes a powerful **Smart Mock Generator** that allows you to create realistic test data with simple template syntax.

#### Quick Example

```javascript
{
  "user": {                           // → Generate user data
    "id": "@guid",                   // → "550e8400-e29b-41d4-a716-446655440000"
    "name": "@name",                 // → "John"
    "username": "@username",       // → "brightpanda"
    "email": "@email",               // → "john.smith@example.com"
    "avatar": "@image(100x100)",     // → "https://via.placeholder.com/100x100"
    "age": "@integer(18,60)",       // → 25
    "role": "@pick(admin,user)",     // → "admin"
    "ip": "@ip",                  // → "192.168.1.1"
    "ipv6": "@ip(v6)"                // → "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
  }
}
```

#### Common Generators

| Syntax | Function | Example |
|--------|----------|---------|
| `@guid` | Unique ID | `"f47ac..."` |
| `@name` | Random Name | `"John"` |
| `@username` | Random Username | `"cool_coder"` |
| `@email` | Email Address | `"user@example.com"` |
| `@ip` | Random IP (v4/v6) | `@ip` → `192.168.1.1` |
| `@integer(min,max)` | Random Integer | `@integer(1,100)` → `42` |
| `@pick(A,B,C)` | Random Choice | `@pick(apple,banana)` → `"apple"` |
| `@image(100x100)` | Placeholder Image | `"https://via.placeholder.com/100x100"` |

#### More Features

<details>
<summary>📖 View Complete Generator List</summary>

| Category | Syntax | Description |
|----------|--------|-------------|
| **Basic Types** |
| `@float(min,max,decimals)` | Random Float | `@float(0,1,2)` → `0.57` |
| `@boolean` | Random Boolean | `true` |
| `@string(length)` | Random String | `@string(8)` → `"aX9bK2pQ"` |
| **Personal** |
| `@username(separator, randomDigits, maxLength, dictType)` | Username | `@username("-", 2, 20)` |
| `@phone(countryCode)` | Phone Number | `@phone(+1)` |
| **Network** |
| `@ip(version)` | IP Address | `@ip(v6/v4/6/4)` → IPv(x), `@ip` → IPv4 |
| **Date/Time** |
| `@date(start,end)` | Random Date | `@date(2023-01-01,2024-12-31)` |
| **Other** |
| `@color` | Random Color | `"#a3f4c2"` |
| `@text(wordCount)` | Random Text | Generate text with specified word count |
| `@address(countries)` | Address Object | `@address(US,UK)` |
| `@company(industries)` | Company Object | `@company(Tech,Finance)` |
| `@url(tlds)` | Random URL | `@url(com,io)` |

**Array Syntax:**
```javascript
{
  "users|5": {            // Generate 5 users
    "id": "@guid",
    "name": "@name"
  },
  "scores|3-5": "@integer(60,100)"  // Generate 3 to 5 scores
}
```
</details>

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

### Config Import

Import mock rules directly from popular API documentation formats with auto-conversion.

- **Supported Formats**: Postman Collection v2.1.0, OpenAPI 3.0 (Swagger)
- **Smart Conversion**:
  - `user_id` -> `@guid`
  - `avatar` -> `@image`
  - `{{baseUrl}}/users` -> `/users`

**How to use**: Click the "Import" button in the dashboard header and select your JSON file.

### Comprehensive Network Panel

The built-in Network panel logs all network requests (both mocked and real) in real-time, providing powerful debugging capabilities:

- **View Details**: Click logs to view full Request/Response Body.
- **One-Click Mock**: Click the "Mock" button on any log to instantly convert a real request into a mock rule.
- **Filter**: Filter logs by URL, Method, or Mock status.

---

## Technical Architecture

- **Monkey Patching**: Intercepts requests by overriding `window.fetch` and extending `XMLHttpRequest` prototype chain.
- **Shadow DOM**: Encapsulates debugging UI in Shadow Root for complete style sandboxing.
- **Vite Library Mode**: Uses Vite's library mode with `css: 'injected'` strategy to inline all CSS into JS for **single-file import** experience.

---

## Roadmap

Check out our [Roadmap](ROADMAP.md) to see what's next for PocketMocker and how you can contribute to its future!

---

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

---

## License

MIT © [tianchangNorth](https://github.com/tianchangNorth)

---

<div align="center">

**Master HTTP, Master Your Frontend!**

</div>