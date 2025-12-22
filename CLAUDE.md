# Bun Sticky

Fastest bun under the sum. Bun-native .faf CLI.

## Quick Start
```bash
bunx bun-sticky score    # Score current project
bunx bun-sticky init app # Create project.faf
bunx bun-sticky help     # Show commands
```

## Architecture
```
bun-sticky/
├── index.ts           # CLI + ASCII banner
├── lib/
│   ├── parser.ts      # Zero-dep YAML parser
│   ├── scorer.ts      # Wolfejam slot-based scoring
│   └── tier.ts        # 9-tier system
├── tests/
│   └── sticky.test.ts # 177 tests, WJTTC championship
└── package.json       # Zero dependencies
```

## Core Concepts

**Wolfejam Slot-Based Scoring** (NOT Elon weights)
- 21 total slots across 5 categories
- Type-aware: CLI=9 slots, Fullstack=21 slots
- Score = Filled Slots / Applicable Slots × 100

**Tier System**
| Score | Tier | Emoji |
|-------|------|-------|
| 100%  | Trophy | 🏆 |
| 99%+  | Gold   | 🥇 |
| 95%+  | Silver | 🥈 |
| 85%+  | Bronze | 🥉 |
| 70%+  | Green  | 🟢 |
| 55%+  | Yellow | 🟡 |
| <55%  | Red    | 🔴 |

## Key Files
| File | Line | What |
|------|------|------|
| `lib/scorer.ts` | 16 | SLOTS definition (21 slots) |
| `lib/scorer.ts` | 68 | TYPE_CATEGORIES mapping |
| `lib/scorer.ts` | 173 | calculateScore() |
| `lib/tier.ts` | 22 | getTier() |
| `lib/parser.ts` | 1 | parseYaml() zero-dep |

## Design Principles
1. **Zero Dependencies** - Pure Bun APIs
2. **TypeScript Native** - No build step
3. **Speed First** - Sub-50ms cold start
4. **WJTTC Testing** - Championship-grade test suite

## Commands
| Command | Description |
|---------|-------------|
| `score` | Show FAF score + tier |
| `init <name>` | Create project.faf |
| `sync` | Sync project.faf → CLAUDE.md |
| `version` | Show version |
| `help` | Show help |

## Testing
```bash
bun test
# 177 tests, 1254 assertions
# Full Bun API: test.each, mock, spyOn, snapshots
# WJTTC Championship Grade
```

## Part of FAF Ecosystem
- **faf-cli** - Full Node.js CLI (15,000+ downloads)
- **bun-sticky** - Bun-native lite CLI (you are here)
- **xai-faf-zig** - Ultra-fast Zig implementation

---
*Zero dependencies. Pure Bun. Wolfejam slot-based scoring.*
