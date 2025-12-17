# Changelog

## v1.2.1 - 2025-12-17

### Bug Fixes

- **Network Logging**: Fixed mock request logging to properly capture and display request headers and payload
- **Headers Display**: Resolved issue where request headers showed as `[object Headers]` instead of formatted JSON
- **Response Body Formatting**: Fixed response body formatting issues including double-serialized JSON data
### Improvements

- **UI**: Ensure draggable panel always stays within viewport bounds upon expansion, making controls accessible.

- **Data Formatting**: Added dedicated `formatResponseBody()` function for consistent response body display

## v1.2.0 - 2025-12-12

### Improvements

- **Floating Window UI**:
  - Optimized the basic style with a modern glassmorphism effect, subtle shadows, and refined border-radius.
  - Implemented an elegant, theme-colored rotating border animation for the minimized state on hover.
  - Improved panel resizing fluidity by disabling CSS transitions during drag operations.
- **Toast Notifications**: Corrected toast notification positioning to be page-based, ensuring they are always centered in the viewport regardless of the floating panel's position.
- **Rule Item Actions**: Replaced the second icon in `RuleItem.svelte` with a "send request" play icon, enhancing clarity for action buttons.

### Bug Fixes

- **Minimized Panel Border**: Resolved an issue where a subtle "double border" appeared around the minimized panel due to conflicting `background-clip` and `box-shadow` properties.

## v1.1.1 - 2025-12-05

### Improvements

- **Build Process**: Optimized NPM package size by preventing unnecessary static assets from being bundled, significantly reducing package footprint.

## v1.1.0 - 2025-12-05

### Refactor

- **Core Module Restructure**:
  - Optimized `src/core` directory structure for better modularity and maintainability.
  - Interceptor logic separated into `adapters/`, `engine/`, `manager/` sub-modules.
  - Consolidated core public API exports into `src/core/index.ts`.
- **Dashboard UI Componentization**:
  - `src/lib/dashboard.svelte` refactored into smaller, single-responsibility Svelte components.
  - UI state management extracted to `src/lib/stores/dashboard-store.ts`.

### Tests

- **Enhanced Test Coverage**:
  - Added unit tests for `src/core/engine/handler.ts`, `src/core/manager/rule-manager.ts`, and `src/core/utils/http.ts`.
  - Resolved `window`, `Headers`, and `Response` global object mocking issues in test environment.
  - Restructured `test/` directory to mirror `src/core/` for better organization.

### Documentation

- **README Update**:
  - Updated `README.md` and `README.zh-CN.md` with:
    - Table of Contents.
    - Comparison table against other mocking tools.
    - Improved Smart Generator quick-reference.
    - Enhanced code examples and clarifications.
- **Contribution Guidelines**:
  - Created `CONTRIBUTING.md` and `CONTRIBUTING.zh-CN.md` with project structure, development setup, and PR guidelines.

### Improvements

- **Rule Editor Stability**: Fixed an issue in `RuleEditor.svelte` where user input could be inadvertently overwritten during editing due to prop updates.

---

## v1.0.2 - 2025-12-05

### New Features

- **Tab-Based Request Details**: Network logs now feature a tabbed interface for better organization:
  - **Headers Tab**: View request headers in a formatted JSON view
  - **Payload Tab**: Inspect request body/payload data
  - **Response Tab**: View response body (default tab for quick access)

### Improvements

- **Enhanced Request Logging**:
  - Added full request headers capture and display
  - Added request payload logging for both fetch and XHR requests
  - Formatted JSON output for better readability

### Technical Changes

- **Code Structure**:
  - Added `formatHeaders` utility function for consistent header formatting
  - Updated `LogEntry` interface to include `requestPayload` and `requestHeaders` fields
  - Enhanced interceptor to capture and format request data

## v1.0.1 - 2025-12-04

### Improvements

- **Build Configuration**: Optimized build process for better performance

## v1.0.0 - 2025-12-01

### Initial Release

**PocketMock** v1.0.0 is officially released! This is a lightweight, zero-intrusion, visualization-first frontend mock tool designed to revolutionize your development workflow.

### Key Features

- **Dual-Core Interception Engine**: Natively supports both `fetch` and `XMLHttpRequest` (Ajax), ensuring seamless compatibility with libraries like Axios.
- **Smart Dashboard**: A built-in visual control panel injected into your page. It features a CodeMirror 6 editor, dark/light theme support, and intuitive rule management.
- **Intelligent Mock Data Generation**: Built-in "Smart Mock" generator allows you to create realistic data effortlessly using placeholders like `@guid`, `@name`, `@image`, `@email`, and `@date`. Supports complex nested structures and array generation (`key|count`).
- **One-Click Import**:
  - **Postman Collection v2.1**: Import your existing Postman collections directly.
  - **OpenAPI 3.0 (Swagger)**: Import API specifications.
  - **Smart Inference**: Automatically generates mock data based on field names and types during import (e.g., `avatar` field gets an image URL).
- **Dynamic Response**: Write JavaScript functions to dynamically generate responses based on request Query, Body, or Headers, enabling simulation of complex business logic.
- **Full-Featured Network Panel**:
  - Real-time logging of all requests (Mocked & Real).
  - Detailed inspection of request/response bodies.
  - **"One-Click Mock"**: Instantly convert a real network request into a mock rule.
  - Powerful search and filtering capabilities.
- **Dual-Mode Persistence**:
  - **Local Mode**: Zero-config, data saved in LocalStorage.
  - **Server Mode**: Paired with the Vite plugin, mock rules are automatically synced to a local file (`pocket-mock.json`), enabling team collaboration and version control.
- **Shadow DOM Isolation**: The entire UI is encapsulated within Shadow DOM, ensuring zero style conflicts with your application.