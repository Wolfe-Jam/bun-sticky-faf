# bun-sticky

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

🥐 Bun Sticky v1.0.4 .faf CLI
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
npm install -g bun-sticky
```

Or run directly:

```bash
bunx bun-sticky score
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

**bun-sticky** scores your project's AI-readiness using the Wolfejam slot-based system.

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

| Package | Runtime | Downloads |
|---------|---------|-----------|
| [faf-cli](https://npmjs.com/package/faf-cli) | Node.js | 15,000+ |
| **bun-sticky** | Bun | you are here |
| xai-faf-zig | Zig | ultra-fast |
| xai-faf-rust | Rust | WASM |

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
