/**
 * 🥐 Bun Sticky v2.0.0 — WASM Kernel Tests
 *
 * Tests the faf-wasm-core integration:
 * - WASM loading and initialization
 * - Mk4 scoring via Rust kernel
 * - Parity between TS scorer and WASM scorer
 * - Benchmark (< 1ms per score)
 * - Badge command output
 * - Compile/decompile roundtrip
 */

import { describe, test, expect, beforeAll, afterEach } from "bun:test";
import { init, reset, capabilities, score, TIERS, KernelCapabilityError } from "../lib/core/index";
import type { FafKernel, ScoreResult } from "../lib/core/types";
import { parseYaml } from "../lib/parser";
import { calculateScore } from "../lib/scorer";
import { getTier } from "../lib/tier";

const MINIMAL_FAF = `project:
  name: test-project
  goal: Testing WASM integration
  main_language: TypeScript`;

const CLI_FAF = `project:
  name: sticky-test
  goal: CLI tool
  main_language: TypeScript
  type: cli
human_context:
  who: Developers
  what: FAF scoring
  why: AI context
  where: Terminal
  when: "2026"
  how: Bun
stack:
  frontend: slotignored
  css_framework: slotignored
  ui_library: slotignored
  state_management: slotignored
  backend: slotignored
  api_type: slotignored
  runtime: Bun
  database: slotignored
  connection: slotignored
  hosting: slotignored
  build: bun build
  cicd: slotignored`;

const FULLSTACK_FAF = `faf_version: "2.5.0"
project:
  name: full-app
  goal: Complete web application
  main_language: TypeScript
  type: fullstack
stack:
  frontend: React
  css_framework: Tailwind
  ui_library: shadcn
  state_management: zustand
  backend: Express
  api_type: REST
  runtime: Bun
  database: PostgreSQL
  connection: Prisma
  hosting: Vercel
  build: Vite
  cicd: GitHub Actions
human_context:
  who: Enterprise teams
  what: Full-stack web app
  why: Production deployment
  where: Cloud
  when: "2026"
  how: TypeScript + React + Bun`;

afterEach(() => {
  reset();
});

// =========================================================================
// WASM LOADING
// =========================================================================

describe("WASM Loading", () => {
  test("loads Rust kernel successfully", async () => {
    const kernel = await init("rust");
    expect(kernel.engine).toBe("rust");
  });

  test("returns version string", async () => {
    const kernel = await init("rust");
    expect(kernel.version()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test("engineVersion matches version()", async () => {
    const kernel = await init("rust");
    expect(kernel.engineVersion).toBe(kernel.version());
  });

  test("Zig kernel not yet available", async () => {
    expect(init("zig")).rejects.toThrow("Zig Cascade");
  });

  test("caches kernel across calls", async () => {
    const k1 = await init("rust");
    const k2 = await init("rust");
    expect(k1).toBe(k2);
  });

  test("reset clears cache", async () => {
    await init("rust");
    reset();
    expect(() => {
      const { getKernel } = require("../lib/core/index");
      getKernel();
    }).toThrow();
  });
});

// =========================================================================
// WASM SCORING
// =========================================================================

describe("WASM Scoring", () => {
  let kernel: FafKernel;

  beforeAll(async () => {
    kernel = await init("rust");
  });

  test("score returns ScoreResult shape", () => {
    const result = kernel.score(MINIMAL_FAF);
    expect(result).toHaveProperty("score");
    expect(result).toHaveProperty("tier");
    expect(result).toHaveProperty("populated");
    expect(result).toHaveProperty("empty");
    expect(result).toHaveProperty("ignored");
    expect(result).toHaveProperty("active");
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("slots");
  });

  test("score is 0-100", () => {
    const result = kernel.score(MINIMAL_FAF);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  test("populated + empty + ignored = total", () => {
    const result = kernel.score(MINIMAL_FAF);
    expect(result.populated + result.empty + result.ignored).toBe(result.total);
  });

  test("base scoring uses 21 slots", () => {
    const result = kernel.score(MINIMAL_FAF);
    expect(result.total).toBe(21);
  });

  test("enterprise scoring uses 33 slots", () => {
    const result = kernel.scoreEnterprise(MINIMAL_FAF);
    expect(result.total).toBe(33);
  });

  test("fullstack .faf scores high", () => {
    const result = kernel.score(FULLSTACK_FAF);
    expect(result.score).toBeGreaterThanOrEqual(85);
  });

  test("tier emoji is valid", () => {
    const result = kernel.score(MINIMAL_FAF);
    const validEmojis = Object.values(TIERS).map(t => t.emoji);
    expect(validEmojis).toContain(result.tier);
  });

  test("convenience score() works", async () => {
    reset();
    const result = await score(MINIMAL_FAF);
    expect(result.score).toBeGreaterThan(0);
  });
});

// =========================================================================
// VALIDATION
// =========================================================================

describe("WASM Validation", () => {
  let kernel: FafKernel;

  beforeAll(async () => {
    kernel = await init("rust");
  });

  test("validates correct YAML", () => {
    expect(kernel.validate(MINIMAL_FAF)).toBe(true);
  });

  test("rejects empty string", () => {
    expect(kernel.validate("")).toBe(false);
  });

  test("rejects non-mapping YAML", () => {
    expect(kernel.validate("- item")).toBe(false);
  });

  test("rejects plain text", () => {
    expect(kernel.validate("just some text")).toBe(false);
  });
});

// =========================================================================
// COMPILE / DECOMPILE
// =========================================================================

describe("FAFb Compile/Decompile", () => {
  let kernel: FafKernel;

  beforeAll(async () => {
    kernel = await init("rust");
  });

  test("compile returns Uint8Array", () => {
    const bytes = kernel.compile(MINIMAL_FAF);
    expect(bytes).toBeInstanceOf(Uint8Array);
  });

  test("compiled binary has FAFB magic header", () => {
    const bytes = kernel.compile(MINIMAL_FAF);
    const magic = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
    expect(magic).toBe("FAFB");
  });

  test("compile is deterministic", () => {
    const a = kernel.compile(MINIMAL_FAF);
    const b = kernel.compile(MINIMAL_FAF);
    expect(a).toEqual(b);
  });

  test("decompile returns structured data", () => {
    const bytes = kernel.compile(MINIMAL_FAF);
    const info = kernel.decompile(bytes);
    expect(info).toHaveProperty("version");
    expect(info).toHaveProperty("sections");
    expect(info.sections.length).toBeGreaterThan(0);
  });

  test("binaryInfo returns metadata", () => {
    const bytes = kernel.compile(MINIMAL_FAF);
    const info = kernel.binaryInfo(bytes);
    expect(info).toHaveProperty("section_count");
    expect(info.section_count).toBeGreaterThan(0);
  });

  test("scoreBinary returns name from binary", () => {
    const bytes = kernel.compile(MINIMAL_FAF);
    const result = kernel.scoreBinary(bytes);
    expect(result).toHaveProperty("name");
    expect(result.name).toBe("test-project");
  });
});

// =========================================================================
// CAPABILITIES
// =========================================================================

describe("Kernel Capabilities", () => {
  test("Rust kernel has full capabilities", async () => {
    await init("rust");
    const caps = capabilities();
    expect(caps.score).toBe(true);
    expect(caps.scoreEnterprise).toBe(true);
    expect(caps.validate).toBe(true);
    expect(caps.compile).toBe(true);
    expect(caps.decompile).toBe(true);
    expect(caps.scoreBinary).toBe(true);
    expect(caps.binaryInfo).toBe(true);
  });
});

// =========================================================================
// PARITY — TS vs WASM
// =========================================================================

describe("Parity: TS Scorer vs WASM Kernel", () => {
  let kernel: FafKernel;

  beforeAll(async () => {
    kernel = await init("rust");
  });

  test("both score minimal .faf > 0", () => {
    const faf = parseYaml(MINIMAL_FAF);
    const tsResult = calculateScore(faf);
    const wasmResult = kernel.score(MINIMAL_FAF);

    expect(tsResult.score).toBeGreaterThan(0);
    expect(wasmResult.score).toBeGreaterThan(0);
  });

  test("both detect 3 project fields filled", () => {
    const faf = parseYaml(MINIMAL_FAF);
    const tsResult = calculateScore(faf);
    const wasmResult = kernel.score(MINIMAL_FAF);

    // TS scorer counts 3 project slots populated
    expect(tsResult.sections.project.filled).toBe(3);
    // WASM also populates 3 slots
    expect(wasmResult.populated).toBe(3);
  });

  test("tier system agrees on high scores", () => {
    const wasmResult = kernel.score(FULLSTACK_FAF);
    const tsTier = getTier(wasmResult.score);

    // Both should agree the tier is high
    expect(wasmResult.score).toBeGreaterThanOrEqual(85);
    expect(tsTier.emoji).toMatch(/[🏆★◆◇]/);
  });

  test("both score CLI with slotignored at 100%", () => {
    // With proper slotignored values in the .faf, both engines agree
    const faf = parseYaml(CLI_FAF);
    const tsResult = calculateScore(faf);
    const wasmResult = kernel.score(CLI_FAF);

    // TS: 9/9 = 100% (type-aware, only counts project + human)
    // WASM: 11/11 = 100% (slotignored excluded from denominator)
    expect(tsResult.score).toBe(100);
    expect(wasmResult.score).toBe(100);
  });

  test("WASM respects slotignored in denominator", () => {
    const wasmResult = kernel.score(CLI_FAF);

    // 10 stack slots are slotignored for CLI
    expect(wasmResult.ignored).toBe(10);
    // active = total - ignored
    expect(wasmResult.active).toBe(wasmResult.total - wasmResult.ignored);
    // populated fills all active slots
    expect(wasmResult.populated).toBe(wasmResult.active);
  });
});

// =========================================================================
// BENCHMARK
// =========================================================================

describe("Performance", () => {
  test("WASM scoring < 2ms average", async () => {
    const kernel = await init("rust");

    // Warmup
    kernel.score(MINIMAL_FAF);

    const runs = 50;
    const start = Bun.nanoseconds();
    for (let i = 0; i < runs; i++) {
      kernel.score(MINIMAL_FAF);
    }
    const elapsed = Bun.nanoseconds() - start;
    const avgMs = elapsed / runs / 1e6;

    // Real-world average is ~284μs; 2ms is a CI-noise-tolerant ceiling — a loaded
    // shared runner can measure ~1ms+. Matches the sibling "compile < 2ms" bar.
    expect(avgMs).toBeLessThan(2);
  });

  test("WASM compile < 2ms average", async () => {
    const kernel = await init("rust");

    kernel.compile(MINIMAL_FAF);

    const runs = 50;
    const start = Bun.nanoseconds();
    for (let i = 0; i < runs; i++) {
      kernel.compile(MINIMAL_FAF);
    }
    const elapsed = Bun.nanoseconds() - start;
    const avgMs = elapsed / runs / 1e6;

    expect(avgMs).toBeLessThan(2);
  });
});

// =========================================================================
// TIERS CONSTANT
// =========================================================================

describe("TIERS Constant", () => {
  test("has 7 levels", () => {
    expect(Object.keys(TIERS)).toHaveLength(7);
  });

  test("Trophy at 100", () => {
    expect(TIERS.TROPHY.min).toBe(100);
  });

  test("Red at 0", () => {
    expect(TIERS.RED.min).toBe(0);
  });
});

// =========================================================================
// ERROR TYPES
// =========================================================================

describe("KernelCapabilityError", () => {
  test("formats message correctly", () => {
    const err = new KernelCapabilityError("compile", "zig");
    expect(err.message).toContain("compile()");
    expect(err.message).toContain("zig");
    expect(err.name).toBe("KernelCapabilityError");
  });
});
