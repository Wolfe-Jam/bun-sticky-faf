/**
 * Star nudge — capture the reservoir.
 *
 * A tool with real pull but no social proof (many installs, few stars) leaves
 * the reservoir open. This shows a single, tasteful star-ask at the winning
 * moment (a top-tier score, interactive terminal only), throttled so it can
 * never nag. Pure gate (`shouldNudge`) + IO wrapper (`maybeStarNudge`).
 *
 * Opt out with BUN_STICKY_NO_NUDGE, or the family-wide FAF_NO_NUDGE.
 * Zero dependencies — Bun + node:os/node:path only.
 */
import { homedir } from "node:os";
import { join } from "node:path";

const REPO_URL = "https://github.com/Wolfe-Jam/bun-sticky-faf";
const STATE_PATH = join(homedir(), ".config", "faf", "bun-sticky-nudge");

const MIN_SCORE = 95; // only at the winning moment — self-limiting by design
const MAX_SHOWS = 3; // never more than three times, ever
const THROTTLE_DAYS = 30; // and never twice inside 30 days

export interface NudgeState {
  shown: number;
  last: number; // epoch ms of the last time it was shown (0 = never)
}

export interface NudgeContext {
  score: number;
  isTTY: boolean;
  isCI: boolean;
  optedOut: boolean;
  state: NudgeState;
  now: number; // epoch ms
}

/**
 * Pure gate — no IO, fully deterministic, unit-tested. Returns true only when
 * every condition holds: opted in, interactive, not CI, top-tier score, under
 * the show cap, and outside the throttle window.
 */
export function shouldNudge(c: NudgeContext): boolean {
  if (c.optedOut) return false;
  if (!c.isTTY || c.isCI) return false;
  if (c.score < MIN_SCORE) return false;
  if (c.state.shown >= MAX_SHOWS) return false;
  if (c.state.last > 0 && (c.now - c.state.last) / 86_400_000 < THROTTLE_DAYS) return false;
  return true;
}

async function readState(): Promise<NudgeState> {
  try {
    const f = Bun.file(STATE_PATH);
    if (await f.exists()) {
      const s = (await f.json()) as Partial<NudgeState>;
      return { shown: Number(s.shown) || 0, last: Number(s.last) || 0 };
    }
  } catch {
    // corrupt / unreadable state → treat as fresh, never break the CLI
  }
  return { shown: 0, last: 0 };
}

async function writeState(s: NudgeState): Promise<void> {
  try {
    await Bun.write(STATE_PATH, JSON.stringify(s));
  } catch {
    // best-effort; a nudge must never fail a score
  }
}

/**
 * IO wrapper — reads state, applies the pure gate, prints once, records the
 * show. Never throws: a star-ask is not worth crashing a score over.
 */
export async function maybeStarNudge(score: number): Promise<void> {
  const state = await readState();
  const ctx: NudgeContext = {
    score,
    isTTY: Boolean(process.stdout.isTTY),
    isCI: Boolean(process.env.CI),
    optedOut: Boolean(process.env.BUN_STICKY_NO_NUDGE || process.env.FAF_NO_NUDGE),
    state,
    now: Date.now(),
  };
  if (!shouldNudge(ctx)) return;

  const DIM = "\x1b[2m";
  const BOLD = "\x1b[1m";
  const RESET = "\x1b[0m";
  console.log(`  ⭐ ${BOLD}Nice score.${RESET} ${DIM}If Bun Sticky helped, a star keeps it sticky:${RESET}`);
  console.log(`     ${REPO_URL}`);
  console.log();

  await writeState({ shown: state.shown + 1, last: ctx.now });
}
