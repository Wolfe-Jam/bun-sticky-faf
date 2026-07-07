import { describe, expect, test } from "bun:test";
import { shouldNudge, type NudgeContext } from "./lib/star-nudge.ts";

// A context that SHOULD nudge — each test flips one field to prove the gate.
const base: NudgeContext = {
  score: 100,
  isTTY: true,
  isCI: false,
  optedOut: false,
  state: { shown: 0, last: 0 },
  now: 1_700_000_000_000,
};

describe("shouldNudge — pure gate", () => {
  test("shows at a top-tier score in an interactive terminal", () => {
    expect(shouldNudge(base)).toBe(true);
  });

  test("silent when opted out (BUN_STICKY_NO_NUDGE / FAF_NO_NUDGE)", () => {
    expect(shouldNudge({ ...base, optedOut: true })).toBe(false);
  });

  test("silent when not a TTY (piped or redirected)", () => {
    expect(shouldNudge({ ...base, isTTY: false })).toBe(false);
  });

  test("silent in CI", () => {
    expect(shouldNudge({ ...base, isCI: true })).toBe(false);
  });

  test("silent below the score threshold", () => {
    expect(shouldNudge({ ...base, score: 94 })).toBe(false);
    expect(shouldNudge({ ...base, score: 95 })).toBe(true); // boundary
  });

  test("silent once the show cap is reached", () => {
    expect(shouldNudge({ ...base, state: { shown: 3, last: 0 } })).toBe(false);
  });

  test("silent inside the 30-day throttle window", () => {
    const last = base.now - 5 * 86_400_000; // 5 days ago
    expect(shouldNudge({ ...base, state: { shown: 1, last } })).toBe(false);
  });

  test("shows again after the throttle window passes", () => {
    const last = base.now - 31 * 86_400_000; // 31 days ago
    expect(shouldNudge({ ...base, state: { shown: 1, last } })).toBe(true);
  });
});
