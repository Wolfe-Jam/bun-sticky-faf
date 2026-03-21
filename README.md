# Bun Sticky

Fastest bun under the sun. Zero dependencies. Mk4 WASM kernel. Pure Bun.

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

🥐 Bun Sticky v2.0.0
   Fastest bun under the sun.

────────────────────────────────────────────────

  Project: my-cli
  Type:    cli

  🏆 100%  Trophy
  Filled: 11/11 slots
  Powered by faf-wasm-core v1.0.0 (Rust Mk4 WASM)
```

## What is This?

**Bun Sticky** scores your project's AI-readiness using the Mk4 WASM kernel — the same Rust compiler that powers faf-cli, mcpaas.live, and builder.faf.one. 284μs per score.

[FAF](https://faf.one) (Foundational AI-context Format) is an [IANA-registered](https://www.iana.org/assignments/media-types/application/vnd.faf+yaml) format — project DNA for AI assistants.

## v2.0.0 — The WASM Edition

- **faf-wasm-core** embedded — Mk4 Rust WASM kernel (322KB)
- **Data-driven slotignore** — the .faf file carries the scoring truth
- **284μs** per score — benchmarked
- **405 tests** across 2 packages, 0 failures
- **Zero dependencies** — still zero

Read the blog post: [The WASM Edition](https://faf.one/blog/wasm-edition)

## Try It

No install needed:

```bash
bunx bun-sticky score       # Score your project
bunx bun-sticky wasm-score  # Score via Mk4 WASM kernel
bunx bun-sticky bench       # Benchmark: 284μs per score
bunx bun-sticky badge       # Get your mcpaas.live badge
bunx bun-sticky init myapp  # Create project.faf
bunx bun-sticky sync        # Sync to CLAUDE.md
bunx bun-sticky version     # Show version
bunx bun-sticky help        # All commands
```

Or install globally:

```bash
bun install -g bun-sticky
```

## Scoring

21 slots across 5 categories. Data-driven — the `.faf` file carries the truth:

- **populated** — slot has a value (counts toward score)
- **empty** — slot is missing (counts against score)
- **slotignored** — slot doesn't apply to this project type (excluded from denominator)

**Score = Populated / Active × 100** where Active = Total - Ignored

A CLI project marks frontend/backend slots as `slotignored` in the .faf file itself. Every engine reads the same file, skips the same slots, gets the same score.

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

- **WASM score**: 284μs average (Mk4 Rust kernel)
- **Cold start**: <50ms
- **Zero dependencies**: Pure Bun APIs
- **TypeScript native**: No build step
- **322KB**: Embedded WASM binary

## Testing

405 tests across 2 packages. Full Bun test API coverage.

```bash
bun test
```

## The Kernel

bun-sticky embeds [faf-wasm-core](https://github.com/Wolfe-Jam/faf-wasm-core) — a kernel router that wraps the published Rust WASM behind a `FafKernel` interface. Rust today, Zig Cascade tomorrow. Same interface, no consumer changes.

```typescript
import { init } from "./lib/core";

const kernel = await init("rust");  // or "zig" when Cascade ships
const result = kernel.score(yaml);  // Same interface. Any engine.
```

TS and WASM produce identical scores. Two engines, one truth.

## Want More?

bun-sticky scores your project. **faf-cli** is the full toolchain — 33 MCP tools, bi-sync, tri-sync, and more.

```bash
bunx faf-cli auto          # Bun
npx faf-cli auto           # npm
brew install faf-cli && faf auto  # Homebrew
```

## FAF Ecosystem

**36,000+ downloads** across npm, PyPI, and crates.io:

| Package | Runtime | What |
|---------|---------|------|
| [faf-cli](https://npmjs.com/package/faf-cli) | Node.js + Bun | The CLI |
| [claude-faf-mcp](https://npmjs.com/package/claude-faf-mcp) | MCP | Anthropic MCP #2759 |
| [faf-mcp](https://npmjs.com/package/faf-mcp) | MCP | Universal MCP |
| [grok-faf-mcp](https://npmjs.com/package/grok-faf-mcp) | MCP | xAI Grok MCP |
| **bun-sticky** | Bun + WASM | This one |
| [faf-wasm-core](https://github.com/Wolfe-Jam/faf-wasm-core) | WASM | The kernel |

## License

MIT

---

*Part of the [FAF ecosystem](https://faf.one). Powered by Mk4 WASM.*
