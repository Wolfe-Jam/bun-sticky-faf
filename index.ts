#!/usr/bin/env bun
/**
 * 🥐 Bun Sticky - Fastest bun under the sum.
 *
 * Built the Anthropic way:
 * - First principles
 * - Zero dependencies
 * - Native Bun APIs
 * - TypeScript native
 *
 * Wolfejam slot-based scoring (NOT Elon weights).
 * For Claude Codesters.
 */

import { parseYaml, getNestedValue } from "./lib/parser.ts";
import { calculateScore, FafScore } from "./lib/scorer.ts";
import { getTier } from "./lib/tier.ts";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VERSION = "1.0.1";

// Standard colors only (B/W version - color reserved for ZIG poster child)
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASCII ART BANNER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BANNER = `
────────────────────────────────────────────────

   ▄▄       ▄▀▀▀ ▀█▀ █ ▄▀▀ █▄▀ █ █
  ████      ▀▀█▄  █  █ █   █▀▄  █
██████      ▄▄▄▀  █  █ ▀▀▀ █ █  █
████████
████████    █▀▄  █ █ █▀▄
 ██████     ██▀  █ █ █ █
   ████     █▄▀  ▀▄▀ █ █
     ▀▀

🥐 Bun Sticky v${VERSION} .faf CLI
   Fastest bun under the sum.

────────────────────────────────────────────────
`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMMANDS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function cmdScore(): Promise<void> {
  const file = Bun.file("project.faf");

  if (!(await file.exists())) {
    console.log(`${RED}No project.faf found${RESET}`);
    console.log(`${DIM}Run: bun-sticky init <name>${RESET}`);
    process.exit(1);
  }

  const content = await file.text();
  const faf = parseYaml(content);
  const result = calculateScore(faf);
  const tier = getTier(result.score);

  console.log(BANNER);

  // Project name & type
  const name = (getNestedValue(faf, "project.name") as string) || "Unknown";
  console.log(`  Project: ${BOLD}${name}${RESET}`);
  console.log(`  Type:    ${DIM}${result.projectType}${RESET}`);
  console.log();

  // Section breakdown (only show applicable sections)
  const { sections } = result;

  if (sections.project.total > 0) {
    console.log(`  ${DIM}Project${RESET}   ${formatBar(sections.project.percentage)} ${sections.project.filled}/${sections.project.total}`);
  }
  if (sections.frontend.total > 0) {
    console.log(`  ${DIM}Frontend${RESET}  ${formatBar(sections.frontend.percentage)} ${sections.frontend.filled}/${sections.frontend.total}`);
  }
  if (sections.backend.total > 0) {
    console.log(`  ${DIM}Backend${RESET}   ${formatBar(sections.backend.percentage)} ${sections.backend.filled}/${sections.backend.total}`);
  }
  if (sections.universal.total > 0) {
    console.log(`  ${DIM}Universal${RESET} ${formatBar(sections.universal.percentage)} ${sections.universal.filled}/${sections.universal.total}`);
  }
  if (sections.human.total > 0) {
    console.log(`  ${DIM}Human${RESET}     ${formatBar(sections.human.percentage)} ${sections.human.filled}/${sections.human.total}`);
  }
  console.log();

  // Total
  console.log(`  ${tier.color}${tier.emoji} ${BOLD}${result.score}%${RESET} ${tier.color}${tier.name}${RESET}`);
  console.log(`  ${DIM}Filled: ${result.filled}/${result.total} slots${RESET}`);
  console.log();

  // Show missing slots with copy-paste YAML
  if (result.missing.length > 0) {
    console.log(`  ${YELLOW}Add to project.faf:${RESET}`);
    console.log();

    // Group by section
    const projectMissing = result.missing.filter(s => s.startsWith("project."));
    const humanMissing = result.missing.filter(s => s.startsWith("human_context."));
    const stackMissing = result.missing.filter(s => s.startsWith("stack."));

    if (projectMissing.length > 0) {
      console.log(`  ${DIM}project:${RESET}`);
      for (const slot of projectMissing) {
        const field = slot.replace("project.", "");
        console.log(`    ${DIM}${field}:${RESET} "${getHint(field)}"`);
      }
    }

    if (stackMissing.length > 0) {
      console.log(`  ${DIM}stack:${RESET}`);
      for (const slot of stackMissing) {
        const field = slot.replace("stack.", "");
        console.log(`    ${DIM}${field}:${RESET} "${getHint(field)}"`);
      }
    }

    if (humanMissing.length > 0) {
      console.log(`  ${DIM}human_context:${RESET}`);
      for (const slot of humanMissing) {
        const field = slot.replace("human_context.", "");
        console.log(`    ${DIM}${field}:${RESET} "${getHint(field)}"`);
      }
    }
    console.log();
  }
}

function getHint(field: string): string {
  const hints: Record<string, string> = {
    // Project
    name: "Project name",
    goal: "What problem does this solve?",
    main_language: "TypeScript",
    // Human context - questions that make you think
    who: "Who is it for?",
    what: "What does it do?",
    why: "Why does it exist?",
    where: "Where is it deployed/used?",
    when: "When is it due/released?",
    how: "How is it built?",
    // Stack
    frontend: "React",
    css_framework: "Tailwind",
    ui_library: "shadcn",
    state_management: "zustand",
    backend: "Node.js",
    api_type: "REST",
    runtime: "Bun",
    database: "PostgreSQL",
    connection: "prisma",
    hosting: "Vercel",
    build: "vite",
    cicd: "GitHub Actions",
  };
  return hints[field] || "";
}

function formatBar(percent: number): string {
  const width = 12;
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);

  if (percent >= 85) return `${GREEN}${bar}${RESET}`;
  if (percent >= 70) return `${GREEN}${bar}${RESET}`;
  if (percent >= 55) return `${YELLOW}${bar}${RESET}`;
  return `${RED}${bar}${RESET}`;
}

async function cmdInit(name: string): Promise<void> {
  const file = Bun.file("project.faf");

  if (await file.exists()) {
    console.log(`${YELLOW}project.faf already exists${RESET}`);
    process.exit(1);
  }

  const template = `# ${name} - Project DNA
# Generated by Bun Sticky

faf_version: 2.5.0

project:
  name: ${name}
  goal: Define your project goal here
  main_language: TypeScript
  type: cli
  version: 0.1.0

human_context:
  who: Your target users
  what: What this project does
  why: Why it exists
  where: Where it runs
  when: When to use it
  how: How to get started

stack:
  runtime: Bun
  build: bun build
`;

  await Bun.write("project.faf", template);
  console.log(BANNER);
  console.log(`  ${GREEN}Created${RESET} project.faf`);
  console.log(`  ${DIM}Run: bun-sticky score${RESET}`);
  console.log();
}

async function cmdSync(): Promise<void> {
  const fafFile = Bun.file("project.faf");

  if (!(await fafFile.exists())) {
    console.log(`${RED}No project.faf found${RESET}`);
    process.exit(1);
  }

  const content = await fafFile.text();
  const faf = parseYaml(content);
  const name = (getNestedValue(faf, "project.name") as string) || "Project";
  const goal = (getNestedValue(faf, "project.goal") as string) || "";
  const result = calculateScore(faf);
  const tier = getTier(result.score);

  // Generate CLAUDE.md
  const claudeMd = `# ${name}

${goal}

## Score: ${tier.emoji} ${result.score}%

Filled: ${result.filled}/${result.total} slots

---
*Synced by Bun Sticky*
`;

  await Bun.write("CLAUDE.md", claudeMd);
  console.log(BANNER);
  console.log(`  ${GREEN}Synced${RESET} project.faf → CLAUDE.md`);
  console.log();
}

function cmdHelp(): void {
  console.log(BANNER);
  console.log(`  ${BOLD}Commands${RESET}`);
  console.log();
  console.log(`    score       Show FAF score + tier`);
  console.log(`    init <n>    Create project.faf`);
  console.log(`    sync        Sync to CLAUDE.md`);
  console.log(`    version     Show version`);
  console.log(`    help        Show this help`);
  console.log();
  console.log(`  ${DIM}Zero dependencies. Pure Bun.${RESET}`);
  console.log(`  ${DIM}Wolfejam slot-based scoring.${RESET}`);
  console.log();
}

function cmdVersion(): void {
  console.log(`bun-sticky v${VERSION}`);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const args = process.argv.slice(2);
const cmd = args[0] || "help";

switch (cmd) {
  case "score":
    await cmdScore();
    break;
  case "init":
    const name = args[1];
    if (!name) {
      console.log(`${RED}Usage: bun-sticky init <name>${RESET}`);
      process.exit(1);
    }
    await cmdInit(name);
    break;
  case "sync":
    await cmdSync();
    break;
  case "version":
  case "-v":
  case "--version":
    cmdVersion();
    break;
  case "help":
  case "-h":
  case "--help":
  default:
    cmdHelp();
    break;
}
