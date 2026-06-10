# Mock State 联动能力设计文档

## 背景

PocketMocker 当前已经可以满足单接口 Mock 的主要需求：用户可以为某个 URL 配置固定 JSON、动态函数、状态码、延迟和响应头。

但在真实前端开发中，接口之间经常存在状态联动：

- `POST /api/users` 添加用户
- `GET /api/users` 获取用户列表
- `PUT /api/users/:id` 更新用户
- `DELETE /api/users/:id` 删除用户

当前能力只能让 `POST /api/users` 返回“添加成功”，而 `GET /api/users` 仍然返回事先写死的列表。前端页面执行新增后再刷新列表时，看不到刚新增的数据，导致完整业务流程无法闭环。

因此需要引入一套共享 Mock 状态机制，让不同接口规则可以读写同一份数据。

## 目标

### 必须支持

- 动态函数 Mock 可以读写共享状态。
- 一个接口写入的数据，可以被另一个接口读取。
- 保持现有规则配置兼容，旧的 `(req) => {}` 函数不需要修改。
- 支持本地模式和 Vite 插件模式。
- 用户可以在页面查看、编辑、清空当前共享状态。

### 暂不支持

- 第一阶段不内置完整数据库能力。
- 第一阶段不自动推断接口之间的业务关系。
- 第一阶段不强制生成 RESTful CRUD 规则。
- 第一阶段不处理多浏览器标签页之间的强一致同步。

## 核心方案

新增一个全局共享状态层，称为 `Mock State`。

现有规则执行链路：

```txt
请求
  -> matcher 匹配规则
  -> resolveMockResponse 执行 response
  -> 返回 mock 响应
```

调整后：

```txt
请求
  -> matcher 匹配规则
  -> resolveMockResponse 执行 response(req, ctx)
       -> ctx.state.get()
       -> ctx.state.set()
       -> ctx.state.update()
  -> 返回 mock 响应
```

`ctx.state` 是所有 Mock 规则共享的状态容器。任意动态函数规则都可以通过它读取或修改数据。

## 用户使用方式

用户在规则编辑页面中选择 `Function` 类型响应，然后使用第二个参数 `ctx`。

### 添加用户

规则配置：

```txt
Method: POST
URL: /api/users
Response Type: Function
```

响应函数：

```javascript
(req, ctx) => {
  const newUser = {
    id: Date.now(),
    ...req.body
  };

  ctx.state.update('users', (users = []) => [newUser, ...users]);

  return {
    code: 0,
    message: 'success',
    data: newUser
  };
}
```

### 获取用户列表

规则配置：

```txt
Method: GET
URL: /api/users
Response Type: Function
```

响应函数：

```javascript
(req, ctx) => {
  return {
    code: 0,
    data: ctx.state.get('users') || []
  };
}
```

当前端页面调用 `POST /api/users` 后，新增用户会写入 `users`。随后调用 `GET /api/users` 时，返回的列表会包含刚新增的数据。

### 更新用户

```javascript
(req, ctx) => {
  const id = Number(req.params.id);
  const patch = req.body;

  ctx.state.update('users', (users = []) => {
    return users.map((user) => {
      if (user.id !== id) return user;
      return { ...user, ...patch };
    });
  });

  return {
    code: 0,
    message: 'success'
  };
}
```

### 删除用户

```javascript
(req, ctx) => {
  const id = Number(req.params.id);

  ctx.state.update('users', (users = []) => {
    return users.filter((user) => user.id !== id);
  });

  return {
    code: 0,
    message: 'success'
  };
}
```

## 页面设计

在主面板中新增 `State` 标签页：

```txt
Rules | Network | State
```

### State 页面能力

- 展示当前 Mock State JSON。
- 支持直接编辑 JSON。
- 支持保存编辑后的 JSON。
- 支持清空所有状态。
- 支持重置为初始状态。
- 支持复制当前状态。
- 支持导入 JSON 作为当前状态。

### 推荐界面结构

```txt
Header
  - Persist 开关
  - Reset
  - Clear
  - Copy
  - Import
  - Save

JSON Editor
  - 当前完整 Mock State
```

### 示例 State

```json
{
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "role": "admin"
    }
  ],
  "todos": []
}
```

## API 设计

### 类型定义

新增 `MockContext` 和 `MockStateStore`。

```typescript
export interface MockContext {
  state: MockStateStore;
}

export interface MockStateStore {
  get<T = any>(key: string): T | undefined;
  set<T = any>(key: string, value: T): void;
  update<T = any>(key: string, updater: (value: T | undefined) => T): void;
  delete(key: string): void;
  clear(): void;
  all(): Record<string, any>;
  replace(value: Record<string, any>): void;
}
```

动态响应函数类型从：

```typescript
export type DynamicResponseFunction = (req: MockRequest) => any | Promise<any>;
```

调整为：

```typescript
export type DynamicResponseFunction = (
  req: MockRequest,
  ctx: MockContext
) => any | Promise<any>;
```

这是向后兼容的。已有函数只接收 `req` 时，会自动忽略第二个参数。

### 状态模块

建议新增文件：

```txt
src/core/state/mock-state.ts
```

模块职责：

- 保存内存态 `mockState`。
- 暴露 `getMockStateStore()`。
- 支持订阅变更，方便 UI 和持久化逻辑响应。
- 不直接依赖 Svelte，保持 core 层可测试。

示意实现：

```typescript
let mockState: Record<string, any> = {};

export const mockStateStore: MockStateStore = {
  get: (key) => mockState[key],
  set: (key, value) => {
    mockState = { ...mockState, [key]: value };
    notify();
  },
  update: (key, updater) => {
    mockState = {
      ...mockState,
      [key]: updater(mockState[key])
    };
    notify();
  },
  delete: (key) => {
    const next = { ...mockState };
    delete next[key];
    mockState = next;
    notify();
  },
  clear: () => {
    mockState = {};
    notify();
  },
  all: () => structuredClone(mockState),
  replace: (value) => {
    mockState = structuredClone(value);
    notify();
  }
};
```

## 执行链路改造

主要修改 `resolveMockResponse()`。

当前动态函数调用：

```typescript
resolvedResponse = await Promise.resolve(resolvedResponse(mockRequest));
```

调整为：

```typescript
const mockContext = createMockContext();
resolvedResponse = await Promise.resolve(resolvedResponse(mockRequest, mockContext));
```

`createMockContext()` 返回：

```typescript
{
  state: mockStateStore
}
```

## 持久化设计

Mock State 支持两种模式。

### 本地模式

使用 `localStorage`。

```txt
pocket_mock_state_v1
```

保存内容：

```json
{
  "persist": true,
  "state": {
    "users": []
  }
}
```

如果 `persist` 为 `false`，页面刷新后状态重置为空。

### Vite 插件模式

在项目根目录新增：

```txt
pocket-mock-state.json
```

新增插件接口：

```txt
GET  /__pocket_mock/state
POST /__pocket_mock/state/save
POST /__pocket_mock/state/reset
```

接口职责：

- `GET /state`：读取当前状态文件。
- `POST /state/save`：保存完整状态。
- `POST /state/reset`：清空状态文件或恢复初始状态。

第一阶段可以只保存完整 JSON，不做增量 patch。

## 初始状态

建议区分两个概念：

- `current state`：运行过程中被接口修改的当前状态。
- `initial state`：用户手动配置的初始数据。

第一阶段可以先只实现 `current state`。

第二阶段再引入：

```json
{
  "initialState": {
    "users": []
  },
  "currentState": {
    "users": []
  }
}
```

这样 `Reset` 可以把 `currentState` 恢复到 `initialState`。

## 与现有能力的关系

### 与静态 JSON Mock

静态 JSON Mock 不使用 `ctx.state`，行为不变。

### 与智能 Mock 语法

智能 Mock 仍然在响应对象上执行。`ctx.state` 是动态函数能力，二者可以组合：

```javascript
(req, ctx) => {
  const users = ctx.state.get('users') || [];

  return {
    code: 0,
    data: users,
    requestId: '@guid'
  };
}
```

如果函数返回对象中包含智能 Mock 语法，仍然可以继续走 `generateMockData()`。

### 与 Network 日志

Network 日志不需要改变。请求返回什么，仍然记录什么。

可选增强：在日志详情中展示本次请求是否修改了 State。

## 错误处理

### 函数执行错误

保持现有策略，返回 500 mock 错误：

```json
{
  "error": "Mock function execution failed",
  "details": "..."
}
```

### State JSON 编辑错误

State 页面保存时，如果 JSON 无法解析：

- 不写入状态。
- 显示 Toast 错误。
- 保留用户当前编辑内容，方便继续修改。

### 不可序列化数据

持久化前需要校验 State 是否可 JSON 序列化。

不支持保存：

- 函数
- DOM 对象
- 循环引用
- `Map`
- `Set`
- `Date` 对象会被序列化为字符串

第一阶段建议明确约束：Mock State 必须是 JSON-compatible 数据。

## 安全边界

当前动态函数 Mock 已经允许执行用户输入的 JavaScript。`ctx.state` 只是增加上下文能力，不改变安全模型。

需要避免：

- 把内部 store、插件 server 或文件系统能力直接暴露给动态函数。
- 让 `ctx.state` 可以任意读写项目文件。
- 在浏览器中暴露敏感运行时信息。

`ctx` 第一阶段只提供：

```typescript
{
  state
}
```

## 测试策略

### 单元测试

新增：

```txt
test/core/state/mock-state.test.ts
```

覆盖：

- `get`
- `set`
- `update`
- `delete`
- `clear`
- `replace`
- `all` 返回副本而不是内部引用

### Handler 测试

扩展：

```txt
test/core/engine/handler.test.ts
```

覆盖：

- 动态函数可以接收 `ctx`。
- `POST /api/users` 写入 state。
- `GET /api/users` 读取 state。
- 旧函数 `(req) => {}` 仍然正常执行。

### Store 测试

覆盖：

- localStorage 初始化 state。
- state 变化后触发保存。
- clear 后同步保存。

### Plugin 测试

扩展：

```txt
test/plugin/vite-plugin-pocket-mock.test.ts
```

覆盖：

- `GET /__pocket_mock/state`
- `POST /__pocket_mock/state/save`
- `POST /__pocket_mock/state/reset`
- state 文件不存在时返回空对象。

## 分阶段落地

### 阶段 1：核心联动能力

- 新增 core 层 `mock-state`。
- 扩展 `DynamicResponseFunction(req, ctx)`。
- `resolveMockResponse()` 注入 `ctx.state`。
- 增加基础单元测试。

此阶段已经能通过函数规则完成接口联动。

### 阶段 2：页面 State 面板

- 新增 `State` tab。
- 展示完整 State JSON。
- 支持编辑、保存、清空、复制。
- 支持 Toast 错误提示。

此阶段让用户可以可视化管理联动数据。

### 阶段 3：持久化

- 本地模式写入 `localStorage`。
- Vite 插件模式写入 `pocket-mock-state.json`。
- 增加持久化开关。

此阶段让联动数据可以跨刷新保存，也可以团队共享。

### 阶段 4：CRUD 模板

在 `ctx.state` 稳定后，再提供更高层能力：

```json
{
  "collection": "users",
  "baseUrl": "/api/users",
  "idKey": "id"
}
```

自动生成：

```txt
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

这属于增强体验，不作为第一阶段必要条件。

## 示例完整流程

用户在前端页面执行：

```javascript
await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Tom',
    age: 18
  })
});

const res = await fetch('/api/users');
const data = await res.json();
```

PocketMocker 行为：

1. `POST /api/users` 命中添加用户规则。
2. 添加用户规则调用 `ctx.state.update('users', ...)`。
3. 新用户写入 Mock State。
4. `GET /api/users` 命中列表规则。
5. 列表规则调用 `ctx.state.get('users')`。
6. 返回包含新用户的列表。

最终前端页面可以完成“新增后刷新列表”的真实业务闭环。

## 推荐结论

第一版优先实现 `ctx.state`，原因：

- 改动范围小。
- 和现有动态函数 Mock 模型一致。
- 对旧配置兼容。
- 能覆盖接口联动的核心痛点。
- 后续可以自然扩展出 State 面板、持久化和 CRUD 模板。

