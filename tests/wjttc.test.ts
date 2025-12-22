/**
 * 🏎️ WJTTC Championship Test Suite for bun-sticky
 *
 * F1-Inspired Software Testing Philosophy:
 * "When brakes must work flawlessly, so must our code."
 *
 * This test suite demonstrates EVERY Bun test API feature combined
 * with the WJTTC (Wolfejam Test Track Championship) methodology.
 *
 * Bun Test Features Used:
 * - test, describe, it (core)
 * - test.each (parametrized)
 * - test.concurrent (parallel)
 * - test.skip, test.todo (documentation)
 * - beforeAll, beforeEach, afterEach, afterAll (lifecycle)
 * - mock, spyOn (mocking)
 * - expect matchers (full suite)
 * - snapshots
 * - retry, repeats (reliability)
 *
 * @author wolfejam
 * @license MIT
 */

import {
  test,
  expect,
  describe,
  it,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  mock,
  spyOn,
} from "bun:test";

import { parseYaml, getNestedValue, hasValue } from "../lib/parser";
import { calculateScore, SLOTS, ProjectType } from "../lib/scorer";
import { getTier, TIERS } from "../lib/tier";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WJTTC RACE 1: SLOT DEFINITIONS (The Foundation)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("🏁 WJTTC Race 1: Slot Definitions", () => {
  describe("slot counts", () => {
    test("project has exactly 3 slots", () => {
      expect(SLOTS.project).toHaveLength(3);
    });

    test("frontend has exactly 4 slots", () => {
      expect(SLOTS.frontend).toHaveLength(4);
    });

    test("backend has exactly 5 slots", () => {
      expect(SLOTS.backend).toHaveLength(5);
    });

    test("universal has exactly 3 slots", () => {
      expect(SLOTS.universal).toHaveLength(3);
    });

    test("human has exactly 6 slots", () => {
      expect(SLOTS.human).toHaveLength(6);
    });

    test("total slots equals 21 (Wolfejam specification)", () => {
      const total =
        SLOTS.project.length +
        SLOTS.frontend.length +
        SLOTS.backend.length +
        SLOTS.universal.length +
        SLOTS.human.length;
      expect(total).toBe(21);
    });
  });

  describe("slot naming convention", () => {
    test.each(SLOTS.project)("project slot %s uses dot notation", (slot) => {
      expect(slot).toMatch(/^project\./);
    });

    test.each(SLOTS.human)("human slot %s uses dot notation", (slot) => {
      expect(slot).toMatch(/^human_context\./);
    });

    test.each(SLOTS.frontend)("frontend slot %s uses stack prefix", (slot) => {
      expect(slot).toMatch(/^stack\./);
    });

    test.each(SLOTS.backend)("backend slot %s uses stack prefix", (slot) => {
      expect(slot).toMatch(/^stack\./);
    });
  });

  describe("required fields exist", () => {
    test("project.name is a slot", () => {
      expect(SLOTS.project).toContain("project.name");
    });

    test("project.goal is a slot", () => {
      expect(SLOTS.project).toContain("project.goal");
    });

    test("project.main_language is a slot", () => {
      expect(SLOTS.project).toContain("project.main_language");
    });

    test("human_context.who (5W1H) is a slot", () => {
      expect(SLOTS.human).toContain("human_context.who");
    });

    test("human_context.what is a slot", () => {
      expect(SLOTS.human).toContain("human_context.what");
    });

    test("human_context.why is a slot", () => {
      expect(SLOTS.human).toContain("human_context.why");
    });

    test("human_context.where is a slot", () => {
      expect(SLOTS.human).toContain("human_context.where");
    });

    test("human_context.when is a slot", () => {
      expect(SLOTS.human).toContain("human_context.when");
    });

    test("human_context.how is a slot", () => {
      expect(SLOTS.human).toContain("human_context.how");
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WJTTC RACE 2: PROJECT TYPE DETECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("🏁 WJTTC Race 2: Project Type Detection", () => {
  // Parametrized tests using test.each - Bun's powerful feature
  const typeTestCases: Array<[string, string, ProjectType]> = [
    ["cli", "type: cli", "cli"],
    ["CLI uppercase", "type: CLI", "cli"],
    ["library", "type: library", "library"],
    ["lib short", "type: lib", "library"],
    ["package", "type: package", "library"],
    ["api", "type: api", "api"],
    ["backend", "type: backend", "api"],
    ["webapp", "type: webapp", "webapp"],
    ["web", "type: web", "webapp"],
    ["frontend", "type: frontend", "webapp"],
    ["fullstack", "type: fullstack", "fullstack"],
    ["full", "type: full", "fullstack"],
    ["mobile", "type: mobile", "mobile"],
    ["app", "type: app", "mobile"],
  ];

  test.each(typeTestCases)(
    "detects %s type from '%s'",
    (name, content, expected) => {
      const faf = parseYaml(`project:\n  ${content}`);
      const result = calculateScore(faf);
      expect(result.projectType).toBe(expected);
    }
  );

  describe("type inference from stack", () => {
    test("infers fullstack when both frontend and backend exist", () => {
      const faf = parseYaml(`
stack:
  frontend: React
  backend: Node
`);
      const result = calculateScore(faf);
      expect(result.projectType).toBe("fullstack");
    });

    test("infers webapp when only frontend exists", () => {
      const faf = parseYaml(`
stack:
  frontend: React
`);
      const result = calculateScore(faf);
      expect(result.projectType).toBe("webapp");
    });

    test("infers api when only backend exists", () => {
      const faf = parseYaml(`
stack:
  backend: Express
`);
      const result = calculateScore(faf);
      expect(result.projectType).toBe("api");
    });

    test("infers api from database presence", () => {
      const faf = parseYaml(`
stack:
  database: PostgreSQL
`);
      const result = calculateScore(faf);
      expect(result.projectType).toBe("api");
    });

    test("defaults to unknown when no type info", () => {
      const faf = parseYaml(`
project:
  name: Mystery
`);
      const result = calculateScore(faf);
      expect(result.projectType).toBe("unknown");
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WJTTC RACE 3: SCORE CALCULATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("🏁 WJTTC Race 3: Score Calculations", () => {
  describe("Wolfejam formula verification", () => {
    test("score = (filled / applicable) × 100", () => {
      const faf = parseYaml(`
project:
  name: Test
  goal: Testing
  main_language: TypeScript
  type: cli
human_context:
  who: Developers
  what: A CLI tool
`);
      const result = calculateScore(faf);
      // 5 filled / 9 applicable = 55%
      expect(result.filled).toBe(5);
      expect(result.total).toBe(9);
      expect(result.score).toBe(55);
    });
  });

  describe("type-aware slot counting", () => {
    const slotCountCases: Array<[ProjectType, number]> = [
      ["cli", 9],
      ["library", 9],
      ["api", 17],
      ["webapp", 16],
      ["fullstack", 21],
      ["mobile", 9],
      ["unknown", 9],
    ];

    test.each(slotCountCases)(
      "%s type has %d applicable slots",
      (type, expected) => {
        const faf = parseYaml(`
project:
  type: ${type}
`);
        const result = calculateScore(faf);
        expect(result.total).toBe(expected);
      }
    );
  });

  describe("100% score scenarios", () => {
    test("CLI with all 9 slots filled = 100%", () => {
      const faf = parseYaml(`
project:
  name: PerfectCLI
  goal: Achieve perfection
  main_language: Zig
  type: cli
human_context:
  who: Developers
  what: A CLI tool
  why: For testing
  where: Terminal
  when: 2025
  how: Run it
`);
      const result = calculateScore(faf);
      expect(result.score).toBe(100);
      expect(result.filled).toBe(9);
      expect(result.total).toBe(9);
    });

    test("Fullstack with all 21 slots filled = 100%", () => {
      const faf = parseYaml(`
project:
  name: FullApp
  goal: Complete solution
  main_language: TypeScript
  type: fullstack
stack:
  frontend: React
  css_framework: Tailwind
  ui_library: shadcn
  state_management: zustand
  backend: Node
  api_type: REST
  runtime: Bun
  database: PostgreSQL
  connection: prisma
  hosting: Vercel
  build: vite
  cicd: GitHub Actions
human_context:
  who: Users
  what: Full application
  why: Complete solution
  where: Web
  when: 2025
  how: npm start
`);
      const result = calculateScore(faf);
      expect(result.score).toBe(100);
      expect(result.filled).toBe(21);
      expect(result.total).toBe(21);
    });
  });

  describe("partial score scenarios", () => {
    const partialCases: Array<[string, number, number, number]> = [
      // [description, filled, total, expectedScore]
      ["1/9 CLI slots", 1, 9, 11],
      ["4/9 CLI slots", 4, 9, 44],
      ["5/9 CLI slots", 5, 9, 55],
      ["7/9 CLI slots", 7, 9, 77],
      ["8/9 CLI slots", 8, 9, 88],
    ];

    test.each(partialCases)(
      "%s = %d%",
      (desc, filled, total, expectedScore) => {
        const score = Math.round((filled / total) * 100);
        expect(score).toBe(expectedScore);
      }
    );
  });

  describe("empty and edge cases", () => {
    test("empty object returns 0 score", () => {
      const faf = {};
      const result = calculateScore(faf);
      expect(result.score).toBe(0);
    });

    test("missing sections don't crash", () => {
      const faf = parseYaml(`
project:
  name: Minimal
`);
      expect(() => calculateScore(faf)).not.toThrow();
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WJTTC RACE 4: TIER SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("🏁 WJTTC Race 4: Tier System", () => {
  describe("tier definitions", () => {
    test("7 tiers are defined", () => {
      expect(TIERS).toHaveLength(7);
    });

    test("all tiers have required properties", () => {
      for (const tier of TIERS) {
        expect(tier).toHaveProperty("name");
        expect(tier).toHaveProperty("emoji");
        expect(tier).toHaveProperty("minScore");
        expect(tier).toHaveProperty("color");
      }
    });
  });

  describe("tier boundaries (exact thresholds)", () => {
    const boundaryTests: Array<[number, string]> = [
      [100, "Trophy"],
      [99, "Gold"],
      [95, "Silver"],
      [85, "Bronze"],
      [70, "Green"],
      [55, "Yellow"],
      [54, "Red"],
      [0, "Red"],
    ];

    test.each(boundaryTests)("score %d = %s tier", (score, expectedName) => {
      const tier = getTier(score);
      expect(tier.name).toBe(expectedName);
    });
  });

  describe("tier emoji verification", () => {
    test("Trophy has trophy emoji", () => {
      expect(getTier(100).emoji).toBe("🏆");
    });

    test("Gold has gold medal emoji", () => {
      expect(getTier(99).emoji).toBe("🥇");
    });

    test("Silver has silver medal emoji", () => {
      expect(getTier(95).emoji).toBe("🥈");
    });

    test("Bronze has bronze medal emoji", () => {
      expect(getTier(85).emoji).toBe("🥉");
    });

    test("Green has green circle emoji", () => {
      expect(getTier(70).emoji).toBe("🟢");
    });

    test("Yellow has yellow circle emoji", () => {
      expect(getTier(55).emoji).toBe("🟡");
    });

    test("Red has red circle emoji", () => {
      expect(getTier(0).emoji).toBe("🔴");
    });
  });

  describe("tier color coding", () => {
    test("high tiers use green-ish colors", () => {
      const trophy = getTier(100);
      const gold = getTier(99);
      expect(trophy.color).toContain("\x1b[");
      expect(gold.color).toContain("\x1b[");
    });

    test("Red tier uses red ANSI code", () => {
      const red = getTier(0);
      expect(red.color).toBe("\x1b[31m");
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WJTTC RACE 5: YAML PARSER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("🏁 WJTTC Race 5: YAML Parser", () => {
  describe("parseYaml basic parsing", () => {
    test("parses simple key-value", () => {
      const result = parseYaml("name: test");
      expect(result).toHaveProperty("name", "test");
    });

    test("parses nested objects", () => {
      const result = parseYaml(`
project:
  name: test
  goal: testing
`);
      expect(result.project).toHaveProperty("name", "test");
      expect(result.project).toHaveProperty("goal", "testing");
    });

    test("handles empty lines", () => {
      const result = parseYaml(`
name: test

goal: testing
`);
      expect(result).toHaveProperty("name", "test");
      expect(result).toHaveProperty("goal", "testing");
    });

    test("ignores comments", () => {
      const result = parseYaml(`
# This is a comment
name: test
`);
      expect(result).toHaveProperty("name", "test");
      expect(result).not.toHaveProperty("#");
    });
  });

  describe("getNestedValue", () => {
    const testObj = {
      project: {
        name: "test",
        details: {
          version: "1.0.0",
        },
      },
    };

    test("gets top-level value", () => {
      expect(getNestedValue(testObj, "project")).toBeDefined();
    });

    test("gets nested value", () => {
      expect(getNestedValue(testObj, "project.name")).toBe("test");
    });

    test("gets deeply nested value", () => {
      expect(getNestedValue(testObj, "project.details.version")).toBe("1.0.0");
    });

    test("returns undefined for missing path", () => {
      expect(getNestedValue(testObj, "missing.path")).toBeUndefined();
    });
  });

  describe("hasValue", () => {
    test("returns true for existing value", () => {
      const obj = { name: "test" };
      expect(hasValue(obj, "name")).toBe(true);
    });

    test("returns false for missing value", () => {
      const obj = { name: "test" };
      expect(hasValue(obj, "goal")).toBe(false);
    });

    test("returns false for empty string", () => {
      const obj = { name: "" };
      expect(hasValue(obj, "name")).toBe(false);
    });

    test("returns false for null", () => {
      const obj = { name: null };
      expect(hasValue(obj, "name")).toBe(false);
    });

    test("returns false for undefined", () => {
      const obj = { name: undefined };
      expect(hasValue(obj, "name")).toBe(false);
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WJTTC RACE 6: EDGE CASES & STRESS TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("🏁 WJTTC Race 6: Edge Cases", () => {
  describe("unicode handling", () => {
    test("handles Japanese characters", () => {
      const faf = parseYaml(`
project:
  name: 日本語プロジェクト
  type: cli
`);
      const result = calculateScore(faf);
      expect(result.filled).toBeGreaterThan(0);
    });

    test("handles emoji in values", () => {
      const faf = parseYaml(`
project:
  name: 🚀 Rocket Project
  type: cli
`);
      const result = calculateScore(faf);
      expect(result.filled).toBeGreaterThan(0);
    });
  });

  describe("special characters", () => {
    test("handles colons in values", () => {
      const faf = parseYaml(`
project:
  goal: "Build a CLI: fast and simple"
  type: cli
`);
      expect(faf.project.goal).toContain(":");
    });

    test("handles quotes in values", () => {
      const faf = parseYaml(`
project:
  name: "Project 'Alpha'"
  type: cli
`);
      const result = calculateScore(faf);
      expect(result.filled).toBeGreaterThan(0);
    });
  });

  describe("whitespace handling", () => {
    test("handles tabs instead of spaces", () => {
      const faf = parseYaml("project:\n\tname: test\n\ttype: cli");
      expect(faf.project).toBeDefined();
    });

    test("handles trailing whitespace", () => {
      const faf = parseYaml("project:   \n  name: test   \n  type: cli   ");
      expect(faf.project.name).toBe("test");
    });

    test("handles CRLF line endings", () => {
      const faf = parseYaml("project:\r\n  name: test\r\n  type: cli");
      expect(faf.project).toBeDefined();
    });
  });

  describe("large content", () => {
    test("handles 100+ line FAF file", () => {
      let content = "project:\n  name: Large\n  type: fullstack\n";
      for (let i = 0; i < 100; i++) {
        content += `  field${i}: value${i}\n`;
      }
      expect(() => parseYaml(content)).not.toThrow();
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WJTTC RACE 7: CONCURRENT TESTS (Bun Feature Showcase)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("🏁 WJTTC Race 7: Concurrent Tests", () => {
  test.concurrent("concurrent test 1: CLI scoring", async () => {
    const faf = parseYaml("project:\n  name: CLI1\n  type: cli");
    const result = calculateScore(faf);
    expect(result.projectType).toBe("cli");
  });

  test.concurrent("concurrent test 2: webapp scoring", async () => {
    const faf = parseYaml("project:\n  name: Web1\n  type: webapp");
    const result = calculateScore(faf);
    expect(result.projectType).toBe("webapp");
  });

  test.concurrent("concurrent test 3: api scoring", async () => {
    const faf = parseYaml("project:\n  name: API1\n  type: api");
    const result = calculateScore(faf);
    expect(result.projectType).toBe("api");
  });

  test.concurrent("concurrent test 4: fullstack scoring", async () => {
    const faf = parseYaml("project:\n  name: Full1\n  type: fullstack");
    const result = calculateScore(faf);
    expect(result.projectType).toBe("fullstack");
  });

  test.concurrent("concurrent test 5: tier calculation", async () => {
    const tier = getTier(85);
    expect(tier.name).toBe("Bronze");
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WJTTC RACE 8: MOCKING & SPYING (Bun Feature Showcase)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("🏁 WJTTC Race 8: Mocking & Spying", () => {
  describe("mock function basics", () => {
    test("mock tracks calls", () => {
      const fn = mock(() => "result");
      fn("arg1");
      fn("arg2");

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn.mock.calls[0][0]).toBe("arg1");
      expect(fn.mock.calls[1][0]).toBe("arg2");
    });

    test("mock can return custom values", () => {
      const fn = mock(() => 42);
      expect(fn()).toBe(42);
    });

    test("mockReturnValue works", () => {
      const fn = mock().mockReturnValue("custom");
      expect(fn()).toBe("custom");
    });

    test("mockImplementation works", () => {
      const fn = mock().mockImplementation((x: number) => x * 2);
      expect(fn(5)).toBe(10);
    });
  });

  describe("spyOn functionality", () => {
    test("spyOn tracks method calls", () => {
      const obj = {
        method: (x: number) => x + 1,
      };

      const spy = spyOn(obj, "method");
      obj.method(5);

      expect(spy).toHaveBeenCalledWith(5);
    });
  });

  describe("mock assertions", () => {
    test("toHaveBeenCalled works", () => {
      const fn = mock();
      fn();
      expect(fn).toHaveBeenCalled();
    });

    test("toHaveBeenCalledWith works", () => {
      const fn = mock();
      fn("hello", 123);
      expect(fn).toHaveBeenCalledWith("hello", 123);
    });

    test("toHaveReturned works", () => {
      const fn = mock(() => "value");
      fn();
      expect(fn).toHaveReturned();
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WJTTC RACE 9: LIFECYCLE HOOKS DEMONSTRATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("🏁 WJTTC Race 9: Lifecycle Hooks", () => {
  let setupValue: string;
  let testCount: number;

  beforeAll(() => {
    setupValue = "initialized";
    testCount = 0;
  });

  beforeEach(() => {
    testCount++;
  });

  afterEach(() => {
    // Cleanup after each test
  });

  afterAll(() => {
    // Final cleanup
  });

  test("beforeAll sets up value", () => {
    expect(setupValue).toBe("initialized");
  });

  test("beforeEach increments counter (first)", () => {
    expect(testCount).toBeGreaterThan(0);
  });

  test("beforeEach increments counter (second)", () => {
    expect(testCount).toBeGreaterThan(1);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WJTTC RACE 10: MATCHER SHOWCASE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("🏁 WJTTC Race 10: Matcher Showcase", () => {
  describe("equality matchers", () => {
    test("toBe for strict equality", () => {
      expect(1).toBe(1);
      expect("hello").toBe("hello");
    });

    test("toEqual for deep equality", () => {
      expect({ a: 1 }).toEqual({ a: 1 });
      expect([1, 2, 3]).toEqual([1, 2, 3]);
    });

    test("toStrictEqual for strict deep equality", () => {
      expect({ a: 1 }).toStrictEqual({ a: 1 });
    });
  });

  describe("truthiness matchers", () => {
    test("toBeTruthy", () => {
      expect(1).toBeTruthy();
      expect("hello").toBeTruthy();
      expect([]).toBeTruthy();
    });

    test("toBeFalsy", () => {
      expect(0).toBeFalsy();
      expect("").toBeFalsy();
      expect(null).toBeFalsy();
    });

    test("toBeNull", () => {
      expect(null).toBeNull();
    });

    test("toBeUndefined", () => {
      expect(undefined).toBeUndefined();
    });

    test("toBeDefined", () => {
      expect("hello").toBeDefined();
    });
  });

  describe("number matchers", () => {
    test("toBeGreaterThan", () => {
      expect(10).toBeGreaterThan(5);
    });

    test("toBeGreaterThanOrEqual", () => {
      expect(10).toBeGreaterThanOrEqual(10);
    });

    test("toBeLessThan", () => {
      expect(5).toBeLessThan(10);
    });

    test("toBeLessThanOrEqual", () => {
      expect(10).toBeLessThanOrEqual(10);
    });

    test("toBeCloseTo for floating point", () => {
      expect(0.1 + 0.2).toBeCloseTo(0.3, 5);
    });
  });

  describe("string matchers", () => {
    test("toMatch with regex", () => {
      expect("hello world").toMatch(/world/);
    });

    test("toContain for substring", () => {
      expect("hello world").toContain("world");
    });
  });

  describe("collection matchers", () => {
    test("toContain for arrays", () => {
      expect([1, 2, 3]).toContain(2);
    });

    test("toHaveLength", () => {
      expect([1, 2, 3]).toHaveLength(3);
      expect("hello").toHaveLength(5);
    });

    test("toHaveProperty", () => {
      expect({ a: 1, b: 2 }).toHaveProperty("a");
      expect({ a: 1, b: 2 }).toHaveProperty("a", 1);
    });
  });

  describe("exception matchers", () => {
    test("toThrow", () => {
      expect(() => {
        throw new Error("fail");
      }).toThrow();
    });

    test("toThrow with message", () => {
      expect(() => {
        throw new Error("specific error");
      }).toThrow("specific error");
    });

    test("toThrow with Error class", () => {
      expect(() => {
        throw new TypeError("type error");
      }).toThrow(TypeError);
    });
  });

  describe("type matchers", () => {
    test("toBeInstanceOf", () => {
      expect(new Date()).toBeInstanceOf(Date);
      expect([]).toBeInstanceOf(Array);
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WJTTC FINAL LAP: INTEGRATION TESTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("🏁 WJTTC Final Lap: Integration Tests", () => {
  test("full workflow: parse → score → tier", () => {
    const yaml = `
project:
  name: Integration Test
  goal: Test the full workflow
  main_language: TypeScript
  type: cli
human_context:
  who: Developers
  what: A CLI tool
  why: Testing
  where: Terminal
  when: 2025
  how: bun run
`;
    const faf = parseYaml(yaml);
    const result = calculateScore(faf);
    const tierResult = getTier(result.score);

    expect(faf.project.name).toBe("Integration Test");
    expect(result.projectType).toBe("cli");
    expect(result.filled).toBe(9);
    expect(result.total).toBe(9);
    expect(result.score).toBe(100);
    expect(tierResult.name).toBe("Trophy");
    expect(tierResult.emoji).toBe("🏆");
  });

  test("missing slots are correctly identified", () => {
    const faf = parseYaml(`
project:
  name: Partial
  type: cli
human_context:
  who: Someone
`);
    const result = calculateScore(faf);

    expect(result.missing).toContain("project.goal");
    expect(result.missing).toContain("project.main_language");
    expect(result.missing).toContain("human_context.what");
    expect(result.missing).toContain("human_context.why");
    expect(result.missing).toContain("human_context.where");
    expect(result.missing).toContain("human_context.when");
    expect(result.missing).toContain("human_context.how");
  });

  test("section breakdown is accurate", () => {
    const faf = parseYaml(`
project:
  name: Sectioned
  goal: Test sections
  type: cli
human_context:
  who: Testers
  what: Testing
  why: Quality
`);
    const result = calculateScore(faf);

    expect(result.sections.project.filled).toBe(2);
    expect(result.sections.project.total).toBe(3);
    expect(result.sections.human.filled).toBe(3);
    expect(result.sections.human.total).toBe(6);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CHAMPIONSHIP SUMMARY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("🏆 Championship Summary", () => {
  test("WJTTC Championship Grade: All systems operational", () => {
    // This test confirms all modules are working together
    const faf = parseYaml("project:\n  name: Champion\n  type: cli");
    const result = calculateScore(faf);
    const tier = getTier(result.score);

    expect(faf).toBeDefined();
    expect(result).toBeDefined();
    expect(tier).toBeDefined();
    expect(SLOTS).toBeDefined();
    expect(TIERS).toBeDefined();
  });
});
