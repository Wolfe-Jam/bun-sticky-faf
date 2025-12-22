# bun-sticky

## Fastest bun under the sum

**Bun-native FAF scoring CLI with Wolfejam slot-based scoring**

---

## Features

### Zero Dependencies
Pure Bun APIs only. No node_modules bloat. No supply chain risk.

### TypeScript Native
No build step. No transpilation. Bun runs TypeScript directly.

### Wolfejam Slot-Based Scoring
21 slots across 5 categories. Type-aware scoring that knows CLI differs from fullstack.

### Instant Feedback
Cold start <50ms. Score command <100ms. Fast enough you'll actually use it.

### Bi-Sync
Keep project.faf and CLAUDE.md in sync. Non-destructive - preserves your content.

### Championship Testing
328 tests. WJTTC certified. Full Bun test API coverage.

---

## Commands

```bash
faf score      # Show FAF score + tier
faf init myapp # Create project.faf
faf sync       # Sync to CLAUDE.md
faf help       # Show commands
```

---

## Tier System

| Score | Tier | Status |
|-------|------|--------|
| 100% | Trophy | Perfect |
| 99%+ | Gold | Exceptional |
| 95%+ | Silver | Excellent |
| 85%+ | Bronze | Production ready |
| 70%+ | Green | Solid |
| 55%+ | Yellow | Needs work |
| <55% | Red | Critical |

---

# Specifications

## Scoring Categories

| Category | Slots | Fields |
|----------|-------|--------|
| Project | 3 | name, goal, main_language |
| Frontend | 4 | frontend, css_framework, ui_library, state_management |
| Backend | 5 | backend, api_type, runtime, database, connection |
| Universal | 3 | hosting, build, cicd |
| Human | 6 | who, what, why, where, when, how |

## Type-Aware Slot Counts

| Project Type | Applicable Slots |
|--------------|------------------|
| CLI | 9 |
| Library | 9 |
| API | 17 |
| Webapp | 16 |
| Fullstack | 21 |

## Formula

```
Score = (Filled Slots / Applicable Slots) × 100
```

## Performance

| Metric | Target | Actual |
|--------|--------|--------|
| Cold start | <50ms | <50ms |
| Score command | <100ms | <100ms |
| Dependencies | 0 | 0 |

## Technical

| Spec | Value |
|------|-------|
| Runtime | Bun >=1.0.0 |
| Language | TypeScript (native) |
| Tests | 328 |
| License | MIT |
| Package Size | 24.4 kB |

## Installation

```bash
# npm
npm install -g bun-sticky

# bunx (run directly)
bunx bun-sticky score
```

## Links

| Resource | URL |
|----------|-----|
| npm | https://npmjs.com/package/bun-sticky |
| GitHub | https://github.com/Wolfe-Jam/bun-sticky |
| FAF Ecosystem | https://faf.one |

---

*Part of the FAF ecosystem. Built for Bun. Made for Claude Code.*

**v1.0.3** | MIT License | Zero Dependencies
