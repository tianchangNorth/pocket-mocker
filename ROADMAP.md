# PocketMocker Roadmap

This document outlines the development plan for PocketMocker. Our goal is to keep the tool lightweight and efficient while solving core pain points in real-world development scenarios.

> **Note:** This roadmap is subject to change based on community feedback and priorities.

## Phase 1: Core Experience Enhancements (v1.2.x)
*Focus: Solving rule management pain points and improving daily efficiency & visual experience.*

- [x] **UI State Persistence** (v1.2.3)
    - Persist panel position, size, and dashboard state.
- [x] **Enhanced JSON Editor** (v1.2.3)
    - Support code folding, readonly mode, and formatted display in network details.
- [x] **Network Detail View Optimization** (v1.0.2 - v1.2.3)
    - Tabbed interface (Headers/Payload/Response).
    - Unified and beautiful JSON formatting.
- [x] **Visual & UX Polish** (v1.2.0)
    - Glassmorphism effect and animations for floating window.
    - Toast notification system.
- [x] **Rule Grouping & Environment Management**
    - Introduce "Groups" or folders to organize rules, solving the mess when rule count grows.
    - Add "Environment" switching (e.g., Dev, Staging, Error-Test) to toggle entire sets of rules instantly.(To be determined)
- [ ] **Easy Config Sharing**
    - Implement "Copy All Config" functionality, allowing Local Mode users to quickly share rules with colleagues or backup to clipboard.
- [ ] **UX Improvements**
    - [ ] Add "Copy to Clipboard" buttons (for response bodies).
    - [ ] Support "Clone Rule" functionality.
    - [ ] Draggable sorting for rules.

## Phase 2: Modernization & Differentiation (v1.3.0)
*Focus: Adapting to modern app architectures and providing unique debugging capabilities.*

- [ ] **Response Streaming Simulation**
    - Support simulated chunked response data with configurable delays per chunk.
    - **Core Use Case**: Perfectly suited for testing AI/LLM chat applications (ChatGPT-like).
- [ ] **GraphQL Support**
    - Implement matching based on `operationName` in `matcher.ts`, breaking the limitation of URL-only matching.
    - Add GraphQL-specific UI in the Rule Editor.

## Phase 3: Personalization (v2.0.0)
*Focus: Enhancing visual experience.*

- [ ] **Theming System**
    - Introduce CSS variables for full theming support.
    - Enable custom theme capabilities.

## Contributing

We welcome contributions to any of these items!
- Check out [GOOD_FIRST_ISSUES.md](https://github.com/tianchangNorth/pocket-mocker/issues) for beginner-friendly tasks.
- Read [CONTRIBUTING.md](./CONTRIBUTING.md) to get started.
