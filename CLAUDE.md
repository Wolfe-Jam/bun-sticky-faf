<!-- faf:start -->
<!-- faf: bun-sticky | TypeScript | cli | Fastest bun under the sum. FAF scoring for Bun — powered by Mk4 WASM. -->
<!-- faf: claim=project.faf | family=FAF -->

# CLAUDE.md — bun-sticky

## What This Is

Fastest bun under the sum. FAF scoring for Bun — powered by Mk4 WASM.

## Stack

- **Language:** TypeScript
- **Runtime:** Bun
- **Package Manager:** npm
- **API:** CLI
- **Hosting:** npm registry
- **CI/CD:** GitHub Actions

## Context

- **Who:** wolfejam team
- **What:** Fastest bun under the sum. FAF scoring for Bun — powered by Mk4 WASM.
- **Why:** To enable faf, bun, bun-native, bunx, cli, scoring, wolfejam, ai-context, ai-readiness, project-dna, context-engineering, iana, claude, persistent-context, wasm, mk4
- **Where:** npm registry + GitHub
- **When:** Production/Stable
- **How:** bunx bun-sticky score

---

*STATUS: BI-SYNC ACTIVE — 2026-07-08T04:25:55.195Z*
<!-- faf:end -->

# bun-sticky

Fastest bun under the sum. Bun-native .faf CLI with Wolfejam slot-based scoring.

**🏆 100% Trophy** - 11/11 slots filled

## Quick Commands

```bash
bun test                    # Run test suite (369 tests)
bun run index.ts score      # Score current project
bun run index.ts wasm-score # Score via Mk4 WASM kernel
bun run index.ts bench      # Benchmark: 284μs per score
bun run index.ts help       # Show commands
```

## Architecture

```
bun-sticky/
├── index.ts              # CLI entry + ASCII banner
├── lib/
│   ├── core/             # Embedded faf-wasm-core
│   │   ├── index.ts      # init(), score(), getKernel()
│   │   ├── types.ts      # FafKernel, ScoreResult, TIERS
│   │   ├── kernels/      # Rust adapter + Zig placeholder
│   │   └── wasm/         # Embedded 322KB WASM binary
│   ├── parser.ts         # Zero-dep YAML parser
│   ├── scorer.ts         # Thin WASM wrapper
│   └── tier.ts           # 7-tier ranking system
└── tests/
    ├── sticky.test.ts    # Core unit tests
    ├── wasm.test.ts      # WASM kernel tests
    └── wjttc.test.ts     # Championship test suite
```

## Scoring System

**Wolfejam Slot-Based Scoring**:

- 21 total slots across 5 categories
- Data-driven slotignore — the .faf file carries the scoring truth
- Formula: `Score = Populated / Active × 100` where Active = Total - Ignored
- Powered by faf-wasm-core v1.0.0 (Rust Mk4 WASM, 322KB, 284μs)

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
---

**STATUS: BI-SYNC ACTIVE 🔗 - Synchronized with .faf context!**

*Last Sync: 2026-03-21T01:36:17.376Z*
*Sync Engine: F1-Inspired Software Engineering*
*🏎️⚡️_championship_sync*
