# Changelog

## v1.0.0 - YYYY-MM-DD

### ✨ Features
- **Smart Mock Data Generation**: Introduced intelligent data generation with support for `@guid`, `@cname`, `@image`, `@integer`, `@boolean`, `@float`, `@pick`, `@date`, and `@string` placeholders, as well as array generation using `key|count` syntax.
- **Configuration Import**:
  - **Postman Collection Import**: Added ability to import Postman Collection v2.1 files, converting requests into PocketMock rules with intelligent data inference from request bodies.
  - **OpenAPI 3.0 Import**: Added support for importing OpenAPI 3.0 specifications, converting paths and response schemas into Mock rules with smart mock data generation and path parameter (`{id}` to `:id`) conversion.
- **Dashboard Enhancements**:
  - **Rules Filtering and Search**: Implemented a search bar and filter options (by method, status, text) for the rules list, enhancing usability for larger rule sets.
  - **Improved Logging**: Refined console logs in the Vite plugin for a cleaner developer experience.

### 🐛 Bug Fixes
- Fixed a critical issue in `src/core/interceptor.ts` where `patchXHR` had incorrect variable scope and caused syntax errors.
- Corrected the missing export of `updateRules` in `src/core/store.ts` which led to runtime errors in the dashboard.

### ⚙️ Engineering Improvements
- Established a robust integration test suite in `src/main.ts` to verify core functionalities, including CRUD, interception, smart mock, dynamic response, and import features.
- Cleaned up verbose `console.log` statements from the Vite plugin.
- Added comprehensive type definitions for Postman and OpenAPI import structures.
