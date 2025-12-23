# bun-sticky-faf

> **Renamed from `bun-sticky`** (+439 downloads) to include `-faf` for the [IANA-registered FAF format](https://www.iana.org/assignments/media-types/application/vnd.faf+yaml).

Fastest bun under the sum. Zero dependencies. Pure Bun.

```bash
faf score
```

```
────────────────────────────────────────────────

   ▄▄       ▄▀▀▀ ▀█▀ █ ▄▀▀ █▄▀ █ █
  ████      ▀▀█▄  █  █ █   █▀▄  █
██████      ▄▄▄▀  █  █ ▀▀▀ █ █  █
████████
████████    █▀▄  █ █ █▀▄
 ██████     ██▀  █ █ █ █
   ████     █▄▀  ▀▄▀ █ █
     ▀▀

🥐 bun-sticky-faf v1.0.6
   Fastest bun under the sum.

────────────────────────────────────────────────

  Project: my-app
  Type:    cli

  Project   ████████████ 3/3
  Human     ████████░░░░ 4/6

  🟢 78% Green
  Filled: 7/9 slots
```

## Install

```bash
npm install -g bun-sticky-faf
```

Or run directly:

```bash
bunx bun-sticky-faf score
```

## Commands

```bash
faf score      # Show FAF score + tier
faf init myapp # Create project.faf
faf sync       # Sync to CLAUDE.md
faf help       # Show commands
```

## What is FAF?

**FAF** (Foundational AI-context Format) is project DNA for AI assistants. A `project.faf` file tells Claude, Cursor, Copilot, and other AI tools what your project is about.

**bun-sticky-faf** scores your project's AI-readiness using the Wolfejam slot-based system.

## Scoring

21 slots across 5 categories. Type-aware scoring:

| Type | Slots | Categories |
|------|-------|------------|
| CLI | 9 | project + human |
| Library | 9 | project + human |
| API | 17 | project + backend + universal + human |
| Webapp | 16 | project + frontend + universal + human |
| Fullstack | 21 | all |

**Score = Filled Slots / Applicable Slots × 100**

## Tiers

| Score | Tier |
|-------|------|
| 100% | 🏆 Trophy |
| 99%+ | 🥇 Gold |
| 95%+ | 🥈 Silver |
| 85%+ | 🥉 Bronze |
| 70%+ | 🟢 Green |
| 55%+ | 🟡 Yellow |
| <55% | 🔴 Red |

## Speed

Built for Bun's speed:

- **Cold start**: <50ms
- **Score command**: <100ms
- **Zero dependencies**: Pure Bun APIs
- **TypeScript native**: No build step

## Testing

328 tests. Championship-grade WJTTC test suite.

```bash
bun test
```

Full Bun test API coverage: `test.each`, `mock`, `spyOn`, `snapshots`, custom matchers.

## FAF Ecosystem

**18,000+ npm downloads** across the FAF family:

| Package | Runtime | Notes |
|---------|---------|-------|
| [faf-cli](https://npmjs.com/package/faf-cli) | Node.js | 16,000+ |
| [claude-faf-mcp](https://npmjs.com/package/claude-faf-mcp) | MCP | uses faf-cli |
| **bun-sticky-faf** | Bun | 500+* |
| [bun-sticky-zig](https://github.com/Wolfe-Jam/bun-sticky-zig) | Zig | 77KB binary |

*\*includes bun-sticky prior to rename*

## Philosophy

Built the Anthropic way:

- First principles
- Zero dependencies
- Native Bun APIs
- TypeScript native

Wolfejam slot-based scoring. Not Elon weights.

## License

MIT

---

*Part of the FAF ecosystem. Made for Claude Code.*
