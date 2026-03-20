/**
 * 🥐 Bun Sticky Scorer - Wolfejam Slot-Based Scoring
 *
 * Score = (Populated slots / Active slots) × 100
 * Active = Total - Slotignored
 *
 * 21 total slots. Data-driven slotignore.
 * Same logic as WASM Mk4 — all engines get the same score.
 * Zero dependencies. Pure Bun.
 */

import { getNestedValue } from "./parser.ts";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ALL 21 SLOTS - Flat list, same as WASM Mk4
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const ALL_SLOTS = [
  // Project (3)
  "project.name",
  "project.goal",
  "project.main_language",
  // Human (6)
  "human_context.who",
  "human_context.what",
  "human_context.why",
  "human_context.where",
  "human_context.when",
  "human_context.how",
  // Stack (12)
  "stack.frontend",
  "stack.css_framework",
  "stack.ui_library",
  "stack.state_management",
  "stack.backend",
  "stack.api_type",
  "stack.runtime",
  "stack.database",
  "stack.connection",
  "stack.hosting",
  "stack.build",
  "stack.cicd",
] as const;

// Section grouping (for display only — scoring is flat)
// SLOTS alias for backward compat with tests
export const SECTIONS: Record<string, readonly string[]> = {
  project: ALL_SLOTS.slice(0, 3),
  human: ALL_SLOTS.slice(3, 9),
  frontend: ["stack.frontend", "stack.css_framework", "stack.ui_library", "stack.state_management"],
  backend: ["stack.backend", "stack.api_type", "stack.runtime", "stack.database", "stack.connection"],
  universal: ["stack.hosting", "stack.build", "stack.cicd"],
};

// Backward compat alias
export const SLOTS = SECTIONS;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLOT STATE — Same three states as WASM Mk4
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type SlotState = "populated" | "empty" | "slotignored";

function getSlotState(faf: Record<string, unknown>, path: string): SlotState {
  const value = getNestedValue(faf, path);

  // Missing or empty = empty
  if (value === undefined || value === null) return "empty";
  if (typeof value === "string" && value.trim() === "") return "empty";

  // Literal "slotignored" = slotignored
  if (typeof value === "string" && value.trim().toLowerCase() === "slotignored") return "slotignored";

  // Anything else = populated
  return "populated";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPE DETECTION (for display, NOT for scoring)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ProjectType =
  | "cli"
  | "library"
  | "api"
  | "webapp"
  | "fullstack"
  | "mobile"
  | "unknown";

export function detectProjectType(faf: Record<string, unknown>): ProjectType {
  const type = getNestedValue(faf, "project.type") as string;

  if (type) {
    const typeLower = type.toLowerCase();
    if (typeLower.includes("cli")) return "cli";
    if (typeLower.includes("lib") || typeLower.includes("package")) return "library";
    if (typeLower.includes("api") || typeLower.includes("backend")) return "api";
    if (typeLower.includes("web") || typeLower.includes("frontend")) return "webapp";
    if (typeLower.includes("full")) return "fullstack";
    if (typeLower.includes("mobile") || typeLower.includes("app")) return "mobile";
  }

  // Infer from stack (only non-slotignored values count)
  const frontendState = getSlotState(faf, "stack.frontend");
  const backendState = getSlotState(faf, "stack.backend");
  const dbState = getSlotState(faf, "stack.database");

  const hasFrontend = frontendState === "populated";
  const hasBackend = backendState === "populated" || dbState === "populated";

  if (hasFrontend && hasBackend) return "fullstack";
  if (hasFrontend) return "webapp";
  if (hasBackend) return "api";

  return "unknown";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCORE INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SlotSection {
  filled: number;
  total: number;
  ignored: number;
  percentage: number;
}

export interface FafScore {
  projectType: ProjectType;
  sections: {
    project: SlotSection;
    frontend: SlotSection;
    backend: SlotSection;
    universal: SlotSection;
    human: SlotSection;
  };
  filled: number;
  total: number;
  ignored: number;
  active: number;
  score: number;
  missing: string[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCORING — Data-driven, same as WASM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function countSection(
  faf: Record<string, unknown>,
  slots: readonly string[],
): SlotSection {
  let filled = 0;
  let ignored = 0;

  for (const slot of slots) {
    const state = getSlotState(faf, slot);
    if (state === "populated") filled++;
    if (state === "slotignored") ignored++;
  }

  const total = slots.length;
  const active = total - ignored;
  const percentage = active > 0 ? Math.round((filled / active) * 100) : 0;

  return { filled, total: active, ignored, percentage };
}

/**
 * Calculate score — data-driven slotignore.
 * Score = (Populated / Active) × 100
 * Active = Total - Slotignored
 *
 * All engines read the same .faf, all engines get the same score.
 */
export function calculateScore(faf: Record<string, unknown>): FafScore {
  const projectType = detectProjectType(faf);

  const sections = {
    project: countSection(faf, SECTIONS.project),
    frontend: countSection(faf, SECTIONS.frontend),
    backend: countSection(faf, SECTIONS.backend),
    universal: countSection(faf, SECTIONS.universal),
    human: countSection(faf, SECTIONS.human),
  };

  let filled = 0;
  let active = 0;
  let ignored = 0;

  for (const section of Object.values(sections)) {
    filled += section.filled;
    active += section.total; // total already excludes ignored
    ignored += section.ignored;
  }

  const score = active > 0 ? Math.round((filled / active) * 100) : 0;

  // Missing = empty slots (not slotignored)
  const missing: string[] = [];
  for (const slot of ALL_SLOTS) {
    if (getSlotState(faf, slot) === "empty") {
      missing.push(slot);
    }
  }

  return {
    projectType,
    sections,
    filled,
    total: active,
    ignored,
    active,
    score,
    missing,
  };
}
