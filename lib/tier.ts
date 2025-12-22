/**
 * Tier System
 *
 * The medal hierarchy for FAF scores.
 * Zero dependencies. Pure Bun.
 */

export interface Tier {
  emoji: string;
  name: string;
  color: string;
}

// ANSI colors
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const ORANGE = "\x1b[38;5;208m";
const WHITE = "\x1b[37m";

export const TIERS: Tier[] = [
  { emoji: "🏆", name: "Trophy", color: YELLOW },
  { emoji: "🥇", name: "Gold", color: YELLOW },
  { emoji: "🥈", name: "Silver", color: WHITE },
  { emoji: "🥉", name: "Bronze", color: ORANGE },
  { emoji: "🟢", name: "Green", color: GREEN },
  { emoji: "🟡", name: "Yellow", color: YELLOW },
  { emoji: "🔴", name: "Red", color: RED },
];

export function getTier(score: number): Tier {
  if (score >= 105) return { emoji: "🍊", name: "Big Orange", color: ORANGE };
  if (score >= 100) return { emoji: "🏆", name: "Trophy", color: YELLOW };
  if (score >= 99) return { emoji: "🥇", name: "Gold", color: YELLOW };
  if (score >= 95) return { emoji: "🥈", name: "Silver", color: WHITE };
  if (score >= 85) return { emoji: "🥉", name: "Bronze", color: ORANGE };
  if (score >= 70) return { emoji: "🟢", name: "Green", color: GREEN };
  if (score >= 55) return { emoji: "🟡", name: "Yellow", color: YELLOW };
  if (score > 0) return { emoji: "🔴", name: "Red", color: RED };
  return { emoji: "⚪", name: "Empty", color: DIM };
}

export function isLaunchReady(score: number): boolean {
  return score >= 85;
}
