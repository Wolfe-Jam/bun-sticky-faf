# Bun Sticky

Fastest bun under the sum. Zero dependencies. Pure Bun.

```bash
bunx bun-sticky score
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

🥐 Bun Sticky v1.1.0
   Fastest bun under the sum.

────────────────────────────────────────────────

  Project: my-app
  Type:    cli

  Project   ████████████ 3/3
  Human     ████████░░░░ 4/6

  🟢 78% Green
  Filled: 7/9 slots
```

## What is This?

**Bun Sticky** scores your project's AI-readiness. Drop a `project.faf` file in your repo and AI tools (Claude, Cursor, Copilot) instantly understand your project.

[FAF](https://faf.one) (Foundational AI-context Format) is an [IANA-registered](https://www.iana.org/assignments/media-types/application/vnd.faf+yaml) format — project DNA for AI assistants.

Also available as a [Zig-native parser](https://github.com/Wolfe-Jam/bun-sticky-zig) — 2.7KB WASM. Bun is built on Zig.

## Try It

No install needed:

```bash
bunx bun-sticky score     # Score your project
bunx bun-sticky init myapp  # Create project.faf
bunx bun-sticky sync      # Sync to CLAUDE.md
```

Or install globally:

```bash
bun install -g bun-sticky
```

## Scoring

21 slots across 5 categories. Type-aware — a CLI scores differently than a fullstack app:

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

- **Cold start**: <50ms
- **Score command**: <100ms
- **Zero dependencies**: Pure Bun APIs
- **TypeScript native**: No build step

## Testing

328 tests. Full Bun test API coverage: `test.each`, `mock`, `spyOn`, `snapshots`, custom matchers.

```bash
bun test
```

## Want More?

bun-sticky scores your project. **faf-cli** is the full toolchain — 64 commands, 30+ MCP tools, bi-sync, tri-sync, and more.

```bash
bunx faf-cli auto          # Bun
npx faf-cli auto           # npm
brew install faf-cli && faf auto  # Homebrew
```

0% to 100% AI context in 0.5s. Same toolchain Claude Code ships on.

Read more: [Best Context Under the Bun](https://faf.one/blog/best-context-under-the-bun)

## FAF Ecosystem

**30,000+ npm downloads** across the FAF family:

| Package | Runtime | Downloads |
|---------|---------|-----------|
| [faf-cli](https://npmjs.com/package/faf-cli) | Node.js + Bun | 30,000+ |
| [claude-faf-mcp](https://npmjs.com/package/claude-faf-mcp) | MCP | 1,000+/week |
| **bun-sticky** | Bun | 1,100+ |
| [bun-sticky-zig](https://github.com/Wolfe-Jam/bun-sticky-zig) | Zig | 2.7KB WASM |

## License

MIT

---

*Part of the [FAF ecosystem](https://faf.one). 1,100+ downloads and counting.*
