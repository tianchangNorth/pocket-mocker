# PocketMocker 用户手册

欢迎使用 PocketMocker！这是一款专为前端开发者设计的浏览器内 HTTP 模拟工具。本手册将帮助您全面掌握 PocketMocker 的各项功能，从基础的规则配置到高级的动态模拟。

---

## 目录

1. [快速入门](#快速入门)
2. [界面概览](#界面概览)
3. [规则管理](#规则管理)
   - [创建规则](#创建规则)
   - [编辑规则](#编辑规则)
   - [规则分组](#规则分组)
   - [智能 Mock 语法](#智能-mock-语法)
   - [动态函数 Mock](#动态函数-mock)
4. [网络调试](#网络调试)
5. [导入配置](#导入配置)
6. [常见问题](#常见问题)

---

## 快速入门

PocketMocker 提供了两种使用模式，满足不同场景的需求。

### 1. 本地模式（零配置）
适合快速尝试或非 Vite 项目。数据仅存储在浏览器本地存储（LocalStorage）中，刷新页面不丢失，但无法与团队共享。

**安装**:
```bash
npm install pocket-mocker -D
```

**使用**:
在项目入口文件（如 `main.ts` 或 `index.js`）中加入：
```javascript
import { pocketMock } from 'pocket-mocker';

if (process.env.NODE_ENV === 'development') {
  pocketMock();
}
```

### 2. 服务器模式（推荐，Vite 插件）
适合团队协作。Mock 规则将保存为项目根目录下的 json 文件，可提交到 Git 仓库共享。

**配置 `vite.config.ts`**:
```typescript
import { defineConfig } from 'vite';
import pocketMockPlugin from 'pocket-mocker/vite-plugin';

export default defineConfig({
  plugins: [
    pocketMockPlugin()
  ]
});
```
启动开发服务器后，PocketMocker 会自动检测并连接到文件系统。

---

## 界面概览

启动项目后，您会在页面右下角看到 PocketMocker 的悬浮胶囊。

### 悬浮胶囊

<div align="center">
  <img src="https://res.oafimg.cn/-/4e46afc0718bec0c/img1.png" alt="最小化状态的悬浮胶囊" width="400">
</div>

- **点击**: 展开/收起控制面板。
- **拖拽**: 将胶囊拖动到屏幕任意位置。
- **规则计数**: 显示当前生效的规则数量。

### 主控制面板

<div align="center">
  <img src="https://res.oafimg.cn/-/42ccdd70c1b9d346/img2.png" alt="展开后的主控制面板" width="400">
</div>

面板主要分为三个区域：
1.  **顶部栏 (Header)**:
    - **导入按钮**: 支持导入 Postman 或 OpenAPI 文件。
    - **新建规则 (+)**: 手动创建一条空白规则。
    - **最小化**: 收起面板。
2.  **标签页 (Tabs)**:
    - **Rules (规则)**: 管理所有 Mock 规则。
    - **Network (网络)**: 实时监控网络请求日志。
3.  **内容区**: 显示规则列表或网络日志。

> **提示**: 您可以拖拽面板边缘调整其大小。

---

## 规则管理

### 创建规则
您可以通过以下方式创建规则：
1.  点击顶部栏的 **+** 按钮手动创建。
2.  在 **Network** 标签页中，点击某条请求日志上的 "Mock" 按钮（推荐）。
3.  导入外部 API 文档。

### 编辑规则
点击任意规则即可进入编辑模式。

<div align="center">
  <img src="https://res.oafimg.cn/-/056c8014b2ae4226/img3.png" alt="规则编辑界面" width="400">
</div>

- **URL**: 请求路径，支持模式匹配。
    - 精确匹配: `/api/user`
    - 参数匹配: `/api/user/:id` (如 `/api/user/123`)
    - 通配符: `/api/*`
- **Method**: 请求方法 (GET, POST, etc.)。
- **Status**: 响应状态码。常用：200 (成功), 404 (未找到), 500 (服务器错误)。
- **Delay**: 响应延迟（毫秒）。用于模拟弱网环境，测试 Loading 状态。
- **Response Type**:
    - **JSON**: 返回静态 JSON 数据，支持智能 Mock 语法。
    - **Function**: 编写 JavaScript 函数动态生成响应。

### 规则分组
当规则较多时，可以使用分组进行管理。

<div align="center">
  <img src="https://res.oafimg.cn/-/2a943d894a3c9a5b/img4.png" alt="规则列表界面" width="400">
</div>

1.  点击工具栏上的 **文件夹图标** 新建分组。
2.  在规则详情中，通过 "Group" 下拉框将规则移动到指定分组。
3.  点击分组标题可折叠/展开该组规则。

### 筛选与搜索
在规则列表顶部的工具栏中：
- **搜索框**: 输入 URL 关键字过滤规则。
- **Method**: 按 HTTP 方法筛选。
- **Status**: 筛选 "已启用" 或 "已禁用" 的规则。

### 智能 Mock 语法
在 JSON 编辑器中，PocketMocker 支持使用特殊语法生成随机数据。

#### 基础类型

| 语法 | 说明 | 示例 |
| :--- | :--- | :--- |
| `@guid` | 生成 UUID | `"550e84..."` |
| `@integer(min, max)` | 随机整数 | `@integer(1, 100)` → `42` |
| `@float(min, max, dec)` | 随机浮点数 | `@float(0, 100, 2)` → `42.57` |
| `@boolean` | 随机布尔值 | `true` |
| `@string(length)` | 指定长度的随机字符串 | `@string(8)` → `"aB3dEf9g"` |
| `@pick(a, b, c)` | 随机选择一项 | `@pick(Admin, User)` → `"Admin"` |
| `@date(start, end)` | 随机日期 | `@date(2023-01-01, 2023-12-31)` |
| `@color` | 随机十六进制颜色 | `"#f0a1b2"` |

#### 用户与信息

| 语法 | 说明 | 示例 |
| :--- | :--- | :--- |
| `@name` | 随机姓名 | `"John Doe"` |
| `@email(domains)` | 随机邮箱 | `@email(gmail.com, outlook.com)` |
| `@phone(prefix)` | 随机电话号码 | `@phone(+86)` |
| `@username` | 随机用户名 | `"happy_cat_123"` |
| `@ip` | 随机 IP 地址 (支持 v6) | `@ip` 或 `@ip(v6)` |
| `@address(country)` | 随机地址对象 | `@address(US)` |
| `@company(industry)` | 随机公司对象 | `@company(Tech)` |

#### 内容生成

| 语法 | 说明 | 示例 |
| :--- | :--- | :--- |
| `@image(WxH)` | 占位图片 URL | `@image(200x200)` |
| `@url(tlds)` | 随机 URL | `@url(com, cn)` |
| `@text(words)` | 随机英文文本段落 | `@text(20)` |

#### 数组生成
通过在键名后添加 `|count` 来生成数组。

**示例**:
```json
{
  "users|5": {  // 生成包含 5 个用户的数组
    "id": "@guid",
    "name": "@name",
    "avatar": "@image(100x100)",
    "role": "@pick(admin, editor, viewer)"
  }
}
```

### 动态函数 Mock
PocketMocker 的编辑器具有智能识别功能。当您在 **Body** 编辑器中编写 JavaScript 函数（而不是标准的 JSON 格式）时，编辑器将自动识别并切换为 **Function** 模式，实现完全的动态响应逻辑。

```javascript
(req) => {
  // req 包含: url, method, params, query, body, headers
  
  // 场景1: 根据 ID 返回不同数据
  if (req.params.id === '1') {
    return { name: '管理员', role: 'admin' };
  }
  
  // 场景2: 模拟错误
  if (req.query.forceError) {
    return {
      status: 500,
      body: { error: 'Internal Server Error' }
    };
  }
  
  // 场景3: 回显请求体
  return {
    receivedData: req.body,
    timestamp: Date.now()
  };
}
```

---

## 网络调试

切换到 **Network** 标签页，PocketMocker 会记录所有的 fetch 和 XMLHttpRequest 请求（无论是否被 Mock）。

<div align="center">
  <img src="https://res.oafimg.cn/-/ecf6b55c25c6a035/img5.png" alt="Network 面板请求列表" width="400">
</div>

- **查看详情**: 点击列表项，展开查看完整的 Request Headers, Body 和 Response Body。
- **右键菜单**: 在任意日志上右键单击即可：
  - **复制 URL/响应**: 快速复制数据到剪贴板。
  - **复制为 cURL**: 生成 cURL 命令以便在终端重现请求。
  - **添加到 Mock 规则**: 即时将真实请求转换为 Mock 规则。
- **一键 Mock**: 点击日志右侧的 **Mock** 按钮。系统会自动提取该请求的 URL、Method 和 Response，生成一条新的 Mock 规则。这是最快的规则创建方式！
- **状态标记**:
    - **MOCK**: 带有蓝色左边框和 "MOCK" 标签的日志，表示该请求已被拦截。
    - **REAL**: 带有 "REAL" 标签的日志，表示真实的透传请求。
    - **状态颜色**: 绿色表示成功 (2xx)，红色表示失败 (4xx/5xx)。

---

## 导入与导出

PocketMocker 支持无缝集成现有的 API 工作流。

### 导入
支持从常见的 API 文档工具导入配置：
1. 点击顶部栏的 **Import** 图标（文件夹箭头）。
2. 选择导出的 JSON 文件。
3. 系统会自动转换并生成带智能语法的 Mock 规则。

**支持格式**:
- Postman Collection (v2.1)
- OpenAPI 3.0 (Swagger)

### 导出
您可以将 Mock 规则导出为 Postman JSON 格式，方便分享或在其他工具中测试。
- 在规则编辑器中，点击导出按钮即可下载 JSON 文件。

---

## 常见问题

**Q: 为什么我的请求没有被拦截？**
A: 请检查以下几点：
1. 规则是否处于 "Enabled"（启用）状态。
2. 请求的 URL 是否匹配规则的 Pattern。
3. 请求的 Method 是否一致。
4. 确保 PocketMocker 已在项目入口处正确初始化。

**Q: Function Mock 中的 `req.body` 是空的？**
A: 请确保发送请求时设置了正确的 `Content-Type` (如 `application/json`)，否则解析器可能无法正确解析 Body。

**Q: 如何在生产环境中禁用 PocketMocker？**
A: 请在初始化时包裹环境变量判断：
```javascript
if (process.env.NODE_ENV === 'development') {
  pocketMock();
}
```
这样在构建生产包时，Tree-shaking 会自动移除相关代码。