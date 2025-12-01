# 🛠️ PocketMock

> **Visual in-browser HTTP mocking tool for modern frontend development.**
>
> A lightweight, visual debugging tool that intercepts and modifies HTTP requests directly in your browser.

[![npm version](https://badge.fury.io/js/pocket-mocker.svg)](https://badge.fury.io/js/pocket-mocker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT). 

**English** | [中文](README.zh-CN.md)

**PocketMock** is a zero-intrusion frontend Mock tool. Unlike Postman or traditional `mock.js`, it embeds directly **into your page**, allowing you to intercept `fetch` and `XMLHttpRequest` in real-time during development, dynamically modify response data, simulate network latency, and test error status codes.

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

## 📦 Installation
```bash
npm install pocket-mocker --save-dev
# or
yarn add pocket-mocker -D
# or
pnpm add pocket-mocker -D
```

## 🚀 Quick Start

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

**1. Configure `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import pocketMockPlugin from 'pocket-mocker/vite-plugin';

export default defineConfig({
  plugins: [
    pocketMockPlugin()
  ]
});
```

**2. Start Development**

Run `npm run dev`. PocketMock automatically detects the plugin environment and switches to **Server Mode**.

## Advanced Features

### Smart Mock Data Generation

PocketMock includes a powerful **Smart Mock Generator** that allows you to create realistic test data with simple template syntax. Perfect for generating complex API responses, user profiles, and test data.

#### Basic Usage

```javascript
// Static JSON with smart generators
{
  "users": [
    {
      "id": "@guid",
      "name": "@name",
      "email": "@email",
      "phone": "@phone",
      "avatar": "@image(200x200)",
      "age": "@integer(18,65)",
      "isActive": "@boolean",
      "address": "@address",
      "company": "@company"
    }
  ]
}
```

#### Array Generation with Templates

```javascript
// Generate 5 users with same template
{
  "users|5": {
    "id": "@guid",
    "name": "@name",
    "email": "@email",
    "profile": {
      "age": "@integer(18,80)",
      "bio": "@text(30)",
      "website": "@url",
      "skills": ["@pick(JavaScript,TypeScript,React,Vue,Angular)", "@pick(Node.js,Python,Java)"]
    }
  }
}
```

#### Available Generators

| Generator | Description | Example | Parameters |
|-----------|-------------|---------|------------|
| `@guid` | UUID v4 | `"f47ac10b-58cc-4372-a567-0e02b2c3d479"` | None |
| `@integer(min,max)` | Random integer | `42` | `1,100` (default: `0,100`) |
| `@string(length)` | Random string | `"abc123XYZ"` | `10` (default: `10`) |
| `@float(min,max,decimals)` | Random float | `3.14` | `0,1,2` (default: `0,1,2`) |
| `@boolean` | Random boolean | `true` | None |
| `@email(domains)` | Email address | `"john123@gmail.com"` | `"gmail.com,yahoo.com"` (optional) |
| `@phone(countryCode)` | Phone number | `"+15551234567"` | `"+44"` (default: `"+1"`) |
| `@address(countries)` | Address object | `{ street: "123 Main St", ... }` | `"US,UK,FR"` (default: `US`) |
| `@company(industries)` | Company object | `{ name: "Tech Solutions", ... }` | `"Tech,Finance"` (optional) |
| `@color` | Random color (hex) | `"#ff6b6b"` | None |
| `@url(tlds)` | Random URL | `"https://example.com"` | `"com,org,dev"` (optional) |
| `@text(wordCount)` | Random text | `"The quick brown fox..."` | `20` (default: `10`) |
| `@date(start,end)` | Random date | `"2023-12-25"` | `"2020-01-01,2023-12-31"` |
| `@image(widthxheight)` | Placeholder image URL | `"https://via.placeholder.com/300x200"` | `"200x200"` (default: `150x150`) |
| `@pick(options)` | Random choice | `"apple"` | `"apple,banana,orange"` |
| `@name` | Random name | `"John"` | None |

#### Advanced Examples

```javascript
// E-commerce product response
{
  "products|10": {
    "id": "@guid",
    "name": "@pick(Laptop,Phone,Tablet,Watch,Headphones)",
    "price": "@float(99.99,1999.99,2)",
    "category": "@pick(Electronics,Computers,Accessories)",
    "inStock": "@boolean",
    "rating": "@float(1,5,1)",
    "images": ["@image(400x300)", "@image(400x300)"],
    "description": "@text(50)",
    "specs": {
      "color": "@pick(Black,Silver,White,Blue,Red)",
      "weight": "@integer(100,2000)",
      "warranty": "@integer(1,3)"
    }
  }
}

// User profile with nested data
{
  "user": {
    "id": "@guid",
    "personal": {
      "name": "@name",
      "email": "@email(custom.com,company.org)",
      "phone": "@phone",
      "birthDate": "@date(1990-01-01,2005-12-31)",
      "avatar": "@image(150x150)"
    },
    "location": "@address(US,CA)",
    "company": "@company(Technology,Software,Finance)",
    "preferences": {
      "theme": "@pick(light,dark)",
      "language": "@pick(en,es,fr,de,zh)",
      "notifications": "@boolean"
    },
    "lastLogin": "@date(2023-01-01,2023-12-31)"
  }
}
```

#### Combining with Dynamic Responses

You can use smart generators within function responses for even more power:

```javascript
(req) => {
  const userId = req.query.id;

  if (userId === 'admin') {
    return {
      id: "@guid",
      name: "Admin User",
      role: "administrator",
      email: "@email(admin.com)",
      permissions: ["read", "write", "delete"],
      lastActive: "@date(2023-01-01,2023-12-31)"
    };
  }

  return {
    "users|10": {
      id: "@guid",
      name: "@name",
      email: "@email",
      profile: {
        avatar: "@image(100x100)",
        bio: "@text(20)"
      }
    }
  };
}
```

### 📥 Config Import

Import mock rules directly from popular API documentation formats. Smart data generation automatically converts request bodies and schema definitions into realistic mock responses.

#### Supported Formats

- **Postman Collection v2.1.0**: Import requests, folders, and request bodies
- **OpenAPI 3.0**: Import paths, operations, and response schemas with `$ref` support

#### Import Process

1. Click the import button in the PocketMock dashboard
2. Select a Postman Collection or OpenAPI JSON file
3. PocketMock automatically detects the format and converts it to mock rules
4. Smart data generation intelligently infers mock data based on field names and types

#### Smart Data Generation

The import feature includes intelligent mock data generation:

- **ID fields** (`id`, `user_id`, etc.) → `@guid`
- **Names** (`name`, `username`) → `@cname`
- **Email addresses** → `@email`
- **Images** (`avatar`, `photo`) → `@image(200x200)`
- **Dates/Times** (`created_at`, `date`) → `@date`
- **Numbers** (`age`, `count`) → `@integer(1,100)`
- **Booleans** (`is_active`, `has_permission`) → `@boolean`
- **URLs** (`website`, `link`) → `@url`
- **Phone numbers** → `@phone`

#### Example: Postman Collection Import

```json
{
  "info": { "name": "User API", "schema": "v2.1.0" },
  "item": [
    {
      "name": "Create User",
      "request": {
        "method": "POST",
        "body": {
          "mode": "raw",
          "raw": "{\"name\": \"John\", \"email\": \"john@example.com\"}"
        },
        "url": { "raw": "/users" }
      }
    }
  ]
}
```

**Automatically converts to**:
```javascript
{
  id: "generated-id",
  method: "POST",
  url: "/users",
  response: {
    name: "@cname",        // Smart inferred
    email: "@email",       // Smart inferred
    id: "@guid"           // Auto-added ID
  }
}
```

#### Example: OpenAPI Import

```json
{
  "openapi": "3.0.0",
  "paths": {
    "/users/{id}": {
      "get": {
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "id": { "type": "string", "format": "uuid" },
                    "name": { "type": "string" },
                    "email": { "type": "string", "format": "email" },
                    "created_at": { "type": "string", "format": "date-time" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

**Automatically converts to**:
```javascript
{
  id: "generated-id",
  method: "GET",
  url: "/users/:id",      // {id} → :id conversion
  response: {
    id: "@guid",          // format: "uuid"
    name: "@cname",       // string type + inference
    email: "@email",      // format: "email"
    created_at: "@date"   // format: "date-time"
  }
}
```

#### Variable Conversion

The import feature automatically converts common variable patterns:

- **Postman**: `{{userId}}` → `:userId`
- **OpenAPI**: `{userId}` → `:userId`

This ensures compatibility with PocketMock's URL matching system while maintaining clear parameter naming.

### Dynamic Response (Function Mock)

You are not limited to static JSON. You can write JavaScript functions to generate responses dynamically based on request!

```javascript
// In the Dashboard editor or config file:
(req) => {
  // Access query parameters (e.g. /api/user?id=1)
  if (req.query.id === '1') {
    return { id: 1, name: 'Admin User', role: 'admin' };
  }

  // Access JSON body
  if (req.body && req.body.type === 'guest') {
    return { id: 2, name: 'Guest', role: 'guest' };
  }

  // Return custom status and headers
  return {
    status: 404,
    headers: { 'X-Error': 'User not found' },
    body: { error: 'User not found' }
  };
}
```

### Rule Configuration

Each Mock rule supports the following fields:

```typescript
interface MockRule {
  id: string;
  method: string;       // GET, POST, PUT, DELETE...
  url: string;          // URL pattern (supports /api/users/:id)
  response: any | ((req) => any); // Static data OR Function
  enabled: boolean;
  delay: number;        // Latency in ms
  status: number;       // HTTP Status (200, 400, 500...)
  headers: Record<string, string>;
}
```

### Comprehensive Network Panel

The built-in Network panel logs all network requests (both mocked and real) in real-time, providing powerful debugging capabilities:

- **All Requests**: See every `fetch` and `XMLHttpRequest` call made by your application.
- **Search & Filter**: Quickly find requests by URL or method, and filter by type (Mocked/Real).
- **Details View**: Click on any log entry to expand and view the full response body.
- **"Mock It" Feature**: Convert any real network request into a new mock rule with a single click, automatically pre-filling URL, method, and response body.
- **Single Log Deletion**: Remove individual log entries for better clarity.
- **Clear All Logs**: Clear the entire log history instantly.

### Smart Fallback Strategy

PocketMock uses a progressive architecture:

1. **Startup**: Attempts to connect to the development server API
2. **Server Mode**: If successful, enables file read/write operations
3. **Local Mode**: If connection fails (no plugin or non-Vite environment), automatically falls back to LocalStorage storage

This ensures compatibility with Webpack, RSPack, or even pure HTML projects.

## 💡 Technical Architecture

- **Monkey Patching**: Intercepts requests by overriding `window.fetch` and extending `XMLHttpRequest` prototype chain
- **Shadow DOM**: Encapsulates debugging UI in Shadow Root for complete style sandboxing
- **Vite Library Mode**: Uses Vite's library mode with `css: 'injected'` strategy to inline all CSS into JS for **single-file import** experience

## 🎯 Use Cases

- **API Development**: Mock backend responses before API completion
- **Error Testing**: Simulate network failures, timeouts, and server errors
- **Performance Testing**: Test loading states and skeleton screens with artificial delays
- **Offline Development**: Work without backend dependencies
- **Team Collaboration**: Share Mock configurations across development teams

## 🔧 Advanced Configuration

### Custom Integration

```javascript
import { pocketMock } from 'pocket-mocker';

pocketMock({
  enable: true // Optional explicit enable flag
});
```

### TypeScript Support

Full TypeScript support included:

```typescript
import { pocketMock, MockRule } from 'pocket-mocker';

// Types are automatically available
const rule: MockRule = {
  id: 'custom-rule',
  method: 'GET',
  url: '/api/users',
  response: { users: [] },
  enabled: true,
  delay: 1000,
  status: 200,
  headers: { 'X-Custom': 'value' }
};
```

## 🤝 Contributing

Local development setup:

```bash
git clone https://github.com/tianchangNorth/pocket-mock.git
cd pocket-mock
npm install

# Start development server
npm run dev

# Build distribution package
npm run build

# Run tests
npm test
```

## 📄 License

MIT © [Your Name](https://github.com/tianchangNorth)

## 🙏 Acknowledgments

- Built with [Svelte](https://svelte.dev/) for reactive UI
- Powered by [Vite](https://vitejs.dev/) for fast development and building
- Inspired by modern web development needs for better debugging tools

---

**Happy Mocking! 🚀**