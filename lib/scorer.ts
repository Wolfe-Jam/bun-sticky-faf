/**
 * 🥐 Bun Sticky Scorer - Wolfejam Slot-Based Scoring
 *
 * Score = (Filled slots / Applicable slots) × 100
 *
 * 21 total slots, type-aware scoring.
 * Zero dependencies. Pure Bun.
 */

import { hasValue, getNestedValue } from "./parser.ts";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SLOT DEFINITIONS - 21 Slots Total
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SLOTS = {
  // Project slots (3)
  project: [
    "project.name",
    "project.goal",
    "project.main_language",
  ],
  // Frontend slots (4)
  frontend: [
    "stack.frontend",
    "stack.css_framework",
    "stack.ui_library",
    "stack.state_management",
  ],
  // Backend slots (5)
  backend: [
    "stack.backend",
    "stack.api_type",
    "stack.runtime",
    "stack.database",
    "stack.connection",
  ],
  // Universal slots (3)
  universal: [
    "stack.hosting",
    "stack.build",
    "stack.cicd",
  ],
  // Human context slots (6)
  human: [
    "human_context.who",
    "human_context.what",
    "human_context.why",
    "human_context.where",
    "human_context.when",
    "human_context.how",
  ],
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPE DEFINITIONS - Which slots apply to each type
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ProjectType =
  | "cli"
  | "library"
  | "api"
  | "webapp"
  | "fullstack"
  | "mobile"
  | "unknown";

export const TYPE_CATEGORIES: Record<ProjectType, (keyof typeof SLOTS)[]> = {
  // CLI/Tool: 9 slots (project + human)
  cli: ["project", "human"],

  // Library/Package: 9 slots (project + human)
  library: ["project", "human"],

  // API/Backend: 17 slots (project + backend + universal + human)
  api: ["project", "backend", "universal", "human"],

  // Web App: 16 slots (project + frontend + universal + human)
  webapp: ["project", "frontend", "universal", "human"],

  // Fullstack: 21 slots (all)
  fullstack: ["project", "frontend", "backend", "universal", "human"],

  // Mobile: 9 slots (project + human) - simplified
  mobile: ["project", "human"],

  // Unknown: 9 slots (project + human) - safe default
  unknown: ["project", "human"],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCORE INTERFACE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SlotSection {
  filled: number;
  total: number;
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
  score: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCORING FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Detect project type from .faf content
 */
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

  // Infer from stack
  const hasFrontend = hasValue(faf, "stack.frontend");
  const hasBackend = hasValue(faf, "stack.backend") || hasValue(faf, "stack.database");

  if (hasFrontend && hasBackend) return "fullstack";
  if (hasFrontend) return "webapp";
  if (hasBackend) return "api";

  return "unknown";
}

/**
 * Count filled slots in a section
 */
function countSection(
  faf: Record<string, unknown>,
  slots: readonly string[],
  applies: boolean
): SlotSection {
  if (!applies) {
    return { filled: 0, total: 0, percentage: 0 };
  }

  let filled = 0;
  for (const slot of slots) {
    if (hasValue(faf, slot)) filled++;
  }

  const total = slots.length;
  const percentage = total > 0 ? Math.round((filled / total) * 100) : 0;

  return { filled, total, percentage };
}

/**
 * Calculate score using wolfejam slot-based system
 * Score = (Filled slots / Applicable slots) × 100
 */
export function calculateScore(faf: Record<string, unknown>): FafScore {
  const projectType = detectProjectType(faf);
  const applicableCategories = TYPE_CATEGORIES[projectType];

  // Count each section
  const sections = {
    project: countSection(
      faf,
      SLOTS.project,
      applicableCategories.includes("project")
    ),
    frontend: countSection(
      faf,
      SLOTS.frontend,
      applicableCategories.includes("frontend")
    ),
    backend: countSection(
      faf,
      SLOTS.backend,
      applicableCategories.includes("backend")
    ),
    universal: countSection(
      faf,
      SLOTS.universal,
      applicableCategories.includes("universal")
    ),
    human: countSection(
      faf,
      SLOTS.human,
      applicableCategories.includes("human")
    ),
  };

  // Sum totals
  let filled = 0;
  let total = 0;

  for (const section of Object.values(sections)) {
    filled += section.filled;
    total += section.total;
  }

  // Calculate final score
  const score = total > 0 ? Math.round((filled / total) * 100) : 0;

  return {
    projectType,
    sections,
    filled,
    total,
    score,
  };
}
