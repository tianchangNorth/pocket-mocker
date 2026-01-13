# Changelog

## v1.2.5 - 2026-01-13

### New Features

- **Import/Export Rules**:
  - Added `getAllRules()` utility function to retrieve all rules as JSON
  - Added `exportRules()` function to download rules as JSON file
  - Added import functionality with overwrite option
  - New "Export" and "Import" buttons in rule editor toolbar

- **Network Log Context Menu**:
  - Added right-click context menu for network log entries
  - Copy response body to clipboard
  - Copy as cURL command for easy reproduction
  - Clear all network logs option

### Improvements

- **Error Handling**:
  - Enhanced error response to include error details message
  - Improved error handling in mock response resolution
  - Better error messaging for mock function execution failures

- **Mock Data Generation**:
  - Optimized unique ID generation using `crypto.randomUUID()` when available
  - Improved test cases for UUID generation validation
  - Enhanced mock data generation logic consistency

- **UI/UX**:
  - Optimized context menu DOM management for better performance
  - Ensured URL format correctness in cURL generation
  - Fixed network log menu item display issues

### Documentation

- Updated README with import/export feature documentation
- Updated user manual with new features and screenshots
- Improved documentation clarity for network debugging features

---

## v1.2.4 - 2025-12-23

### New Features

- **Rule Grouping**:
  - Added rule grouping functionality to organize rules into folders
  - Create, rename, and delete groups from the rule list toolbar
  - Collapsible groups with visual hierarchy indicators
  - Rules can be assigned to groups via dropdown in rule editor
  - Group count display showing number of rules per group

- **Enhanced Rule Creation**:
  - "Add Rule" panel now supports selecting group during creation
  - Group dropdown only shows when groups exist

### Improvements

- **User Documentation**:
  - Added comprehensive [User Manual](docs/USER_MANUAL.md) in English
  - Added comprehensive [用户手册](docs/USER_MANUAL.zh-CN.md) in Chinese
  - New documentation includes quick start, interface overview, rule management guide, network debugging, and FAQ

- **ROADMAP Updates**:
  - Marked completed items in Phase 1: UI State Persistence, Enhanced JSON Editor, Network Detail View, Visual & UX Polish, and Rule Grouping
  - Updated to reflect v1.2.x iteration approach

---

## v1.2.3 - 2025-12-19

### New Features

- **Mock Data Generators**:
  - Add IP address generator supporting both IPv4 and IPv6 formats (`@ip`)
  - Add username generator with customizable options (`@username`)
  - Include comprehensive test coverage for new generators

### Improvements

- **UI State Persistence**:
  - Implement UI panel position and size persistence across sessions
  - Added `saveUiState` and `loadUiState` utilities in `src/core/utils/local.ts`
  - Dashboard state now remembers window position and dimensions

- **Enhanced JSON Editor**:
  - Increased size of code folding gutter markers for better visibility
  - Added readonly, maxHeight, and language support to JsonEditor
  - Integrated JsonEditor into NetworkDetail for formatted JSON viewing
  - Fixed JSON folding functionality for improved code navigation

- **Network Detail View**:
  - Upgraded NetworkDetail component with enhanced JSON formatting
  - Better display of request/response data with proper formatting
  - Improved tab organization and visibility

- **Core Utilities**:
  - Consolidated JSON formatting into a single `formatJSON` utility function
  - Replaced `formatRequestPayload` and `formatHeaders` with unified approach
  - Added support for Headers object formatting

- **Visual Enhancements**:
  - Optimized main.ts styling for better visual presentation
  - Improved Container component resize handle width
  - Enhanced RuleEditor with better UX features
  - Fixed delete SVG icon display issues

### Bug Fixes

- **Editor Folding**: Fixed the bug causing JSON code folding to not work properly in the editor
- **UI State Initialization**: Improved robustness of UI state initialization with better type safety
- **Filter Reset**: Fixed filter reset behavior on page refresh

## v1.2.2 - 2025-12-17

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