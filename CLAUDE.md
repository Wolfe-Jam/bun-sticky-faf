# bun-sticky

Fastest bun under the sum. Bun-native .faf CLI with Wolfejam slot-based scoring.

**🏆 100% Trophy** - 9/9 slots filled

## Quick Commands

```bash
bun test                    # Run WJTTC test suite (328 tests)
bun run index.ts score      # Score current project
bun run index.ts help       # Show commands
bun publish                 # Publish to npm (see PUBLISH-PROTOCOL.md)
```

## Architecture

```
bun-sticky/
├── index.ts              # CLI entry + ASCII banner
├── lib/
│   ├── parser.ts         # Zero-dep YAML parser
│   ├── scorer.ts         # Wolfejam 21-slot scoring
│   └── tier.ts           # 7-tier ranking system
└── tests/
    ├── sticky.test.ts    # Core unit tests
    └── wjttc.test.ts     # Championship test suite
```

## Scoring System

**Wolfejam Slot-Based Scoring** (NOT Elon weights):

- 21 total slots across 5 categories
- Type-aware: CLI=9, Fullstack=21, etc.
- Formula: `Score = (Filled / Applicable) × 100`

| Category | Slots | Fields |
|----------|-------|--------|
| Project | 3 | name, goal, main_language |
| Frontend | 4 | frontend, css_framework, ui_library, state_management |
| Backend | 5 | backend, api_type, runtime, database, connection |
| Universal | 3 | hosting, build, cicd |
| Human | 6 | who, what, why, where, when, how |

## Tier System

| Score | Tier | Emoji |
|-------|------|-------|
| 100% | Trophy | 🏆 |
| 99%+ | Gold | 🥇 |
| 95%+ | Silver | 🥈 |
| 85%+ | Bronze | 🥉 |
| 70%+ | Green | 🟢 |
| 55%+ | Yellow | 🟡 |
| <55% | Red | 🔴 |

## Key Files

| File | Purpose |
|------|---------|
| `lib/scorer.ts:16` | SLOTS definition (21 slots) |
| `lib/scorer.ts:68` | TYPE_CATEGORIES mapping |
| `lib/scorer.ts:173` | calculateScore() function |
| `lib/tier.ts:22` | getTier() function |
| `lib/parser.ts:1` | parseYaml() zero-dep parser |

## Testing

Championship-grade WJTTC test suite with full Bun test API coverage:

- `test.each` - Parametrized tests
- `test.concurrent` - Parallel execution
- `mock`, `spyOn` - Mocking
- Lifecycle hooks - beforeAll, afterEach, etc.
- Full matcher suite

```bash
bun test --coverage        # With coverage
bun test --watch           # Watch mode
CLAUDECODE=1 bun test      # AI-friendly output
```

## Development Rules

1. **Zero Dependencies** - Only Bun native APIs
2. **No npm repeats** - Follow PUBLISH-PROTOCOL.md exactly
3. **Tests first** - All changes need tests
4. **Wolfejam slots only** - Never use Elon weights

## Publishing

**NEVER publish without explicit GO! approval.**

See `PUBLISH-PROTOCOL.md` for the complete ceremony.

---
*Part of FAF ecosystem. Built for Claude Code.*
