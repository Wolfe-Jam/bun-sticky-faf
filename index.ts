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
import { maybeStarNudge } from "./lib/star-nudge.ts";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const VERSION = "2.1.0";

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
    console.log(`${DIM}Run: faf init <name>${RESET}`);
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

  // Capture the reservoir — a tasteful, throttled star-ask at the winning moment.
  await maybeStarNudge(result.score);
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

// Slotignore maps: which stack slots to slotignore per project type
const SLOTIGNORE_MAP: Record<string, string[]> = {
  cli:       ["frontend", "css_framework", "ui_library", "state_management", "backend", "api_type", "database", "connection", "hosting", "cicd"],
  library:   ["frontend", "css_framework", "ui_library", "state_management", "backend", "api_type", "database", "connection", "hosting", "cicd"],
  mobile:    ["frontend", "css_framework", "ui_library", "state_management", "backend", "api_type", "database", "connection", "hosting", "cicd"],
  api:       ["frontend", "css_framework", "ui_library", "state_management"],
  webapp:    ["backend", "api_type", "database", "connection"],
  fullstack: [],
};

function buildStackSection(type: string): string {
  const ignored = SLOTIGNORE_MAP[type] || [];
  const lines: string[] = [];

  // Stack slots in canonical order
  const stackSlots = [
    { key: "frontend",         hint: "React" },
    { key: "css_framework",    hint: "Tailwind" },
    { key: "ui_library",       hint: "shadcn" },
    { key: "state_management", hint: "zustand" },
    { key: "backend",          hint: "Express" },
    { key: "api_type",         hint: "REST" },
    { key: "runtime",          hint: "Bun" },
    { key: "database",         hint: "PostgreSQL" },
    { key: "connection",       hint: "Prisma" },
    { key: "hosting",          hint: "Vercel" },
    { key: "build",            hint: "bun build" },
    { key: "cicd",             hint: "GitHub Actions" },
  ];

  for (const slot of stackSlots) {
    if (ignored.includes(slot.key)) {
      lines.push(`  ${slot.key}: slotignored`);
    } else if (slot.key === "runtime") {
      lines.push(`  runtime: Bun`);
    } else if (slot.key === "build") {
      lines.push(`  build: bun build`);
    } else {
      lines.push(`  ${slot.key}: ${slot.hint}`);
    }
  }

  return lines.join("\n");
}

async function cmdInit(name: string): Promise<void> {
  const file = Bun.file("project.faf");

  if (await file.exists()) {
    console.log(`${YELLOW}project.faf already exists${RESET}`);
    process.exit(1);
  }

  // Default to cli type for Bun projects
  const type = "cli";
  const stackSection = buildStackSection(type);

  const template = `# ${name} - Project DNA
# Generated by Bun Sticky v${VERSION}

faf_version: 2.5.0

project:
  name: ${name}
  goal: Define your project goal here
  main_language: TypeScript
  type: ${type}
  version: 0.1.0

human_context:
  who: Your target users
  what: What this project does
  why: Why it exists
  where: Where it runs
  when: When to use it
  how: How to get started

stack:
${stackSection}
`;

  await Bun.write("project.faf", template);
  console.log(BANNER);
  console.log(`  ${GREEN}Created${RESET} project.faf`);
  console.log(`  ${DIM}Run: faf score${RESET}`);
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

  const scoreBadge = `**${tier.emoji} ${result.score}% ${tier.name}** - ${result.filled}/${result.total} slots filled`;
  const claudeFile = Bun.file("CLAUDE.md");

  if (await claudeFile.exists()) {
    // Update existing CLAUDE.md - preserve content, update/insert score badge
    let existing = await claudeFile.text();
    const badgePattern = /^\*\*[🏆🥇🥈🥉🟢🟡🔴⚪🍊]\s*\d+%.*\*\*.*slots filled$/mu;

    if (badgePattern.test(existing)) {
      // Replace existing badge
      existing = existing.replace(badgePattern, scoreBadge);
    } else {
      // Insert badge after first paragraph (after title + description)
      const lines = existing.split("\n");
      let insertIndex = 1;

      // Find first empty line after title
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === "") {
          insertIndex = i + 1;
          // Skip consecutive empty lines
          while (insertIndex < lines.length && lines[insertIndex].trim() === "") {
            insertIndex++;
          }
          break;
        }
      }

      // Check if next line is already a heading, insert before it
      if (lines[insertIndex]?.startsWith("#")) {
        lines.splice(insertIndex, 0, scoreBadge, "");
      } else {
        lines.splice(insertIndex, 0, "", scoreBadge);
      }
      existing = lines.join("\n");
    }

    await Bun.write("CLAUDE.md", existing);
  } else {
    // Create new minimal CLAUDE.md
    const claudeMd = `# ${name}

${goal}

${scoreBadge}

---
*Synced by Bun Sticky*
`;
    await Bun.write("CLAUDE.md", claudeMd);
  }

  console.log(BANNER);
  console.log(`  ${GREEN}Synced${RESET} project.faf → CLAUDE.md`);
  console.log();
}

async function cmdWasmScore(): Promise<void> {
  const file = Bun.file("project.faf");

  if (!(await file.exists())) {
    console.log(`${RED}No project.faf found${RESET}`);
    process.exit(1);
  }

  const { init } = await import("./lib/core/index");
  const content = await file.text();
  const kernel = await init("rust");
  const result = kernel.score(content);
  const tier = getTier(result.score);

  console.log(BANNER);
  console.log(`  ${tier.color}${tier.emoji} ${BOLD}${result.score}%${RESET} ${tier.color}${tier.name}${RESET}`);
  console.log(`  ${DIM}Filled: ${result.populated}/${result.active} slots${RESET}`);
  console.log(`  ${DIM}Powered by faf-wasm-core v1.0.0 (${kernel.engine} ${kernel.version()} Mk4 WASM)${RESET}`);
  console.log();

  // Show empty slots
  const emptySlots = Object.entries(result.slots)
    .filter(([_, state]) => state === "empty")
    .map(([name]) => name);

  if (emptySlots.length > 0) {
    console.log(`  ${YELLOW}Empty slots:${RESET}`);
    for (const slot of emptySlots) {
      console.log(`    ${DIM}${slot}${RESET}`);
    }
    console.log();
  }
}

async function cmdBench(): Promise<void> {
  const file = Bun.file("project.faf");

  if (!(await file.exists())) {
    console.log(`${RED}No project.faf found${RESET}`);
    process.exit(1);
  }

  const { init } = await import("./lib/core/index");
  const content = await file.text();
  const kernel = await init("rust");

  // Warmup
  kernel.score(content);

  const runs = 100;
  const start = Bun.nanoseconds();
  for (let i = 0; i < runs; i++) {
    kernel.score(content);
  }
  const elapsed = Bun.nanoseconds() - start;

  console.log(BANNER);
  console.log(`  ${BOLD}Benchmark${RESET}`);
  console.log();
  console.log(`  ${runs} scores in ${(elapsed / 1e6).toFixed(1)}ms`);
  console.log(`  Average: ${(elapsed / runs / 1000).toFixed(1)}us per score`);
  console.log(`  Engine: ${kernel.engine} v${kernel.version()} (Mk4 WASM)`);
  console.log();
}

async function cmdBadge(): Promise<void> {
  const file = Bun.file("project.faf");

  if (!(await file.exists())) {
    console.log(`${RED}No project.faf found${RESET}`);
    process.exit(1);
  }

  // Try to detect git remote for badge URL
  let owner = "owner";
  let repo = "repo";
  try {
    const result = Bun.spawnSync(["git", "remote", "get-url", "origin"]);
    const url = result.stdout.toString().trim();
    const match = url.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    if (match) {
      owner = match[1];
      repo = match[2];
    }
  } catch {
    // No git remote, use placeholders
  }

  const badgeUrl = `https://mcpaas.live/badge/${owner}/${repo}`;
  const repoUrl = `https://github.com/${owner}/${repo}`;
  const markdown = `[![FAF Score](${badgeUrl})](${repoUrl})`;

  console.log(BANNER);
  console.log(`  ${BOLD}Badge${RESET}`);
  console.log();
  console.log(`  ${DIM}URL:${RESET}      ${badgeUrl}`);
  console.log(`  ${DIM}Markdown:${RESET} ${markdown}`);
  console.log();
  console.log(`  ${DIM}Add to README.md for live FAF score badge${RESET}`);
  console.log();
}

function cmdHelp(): void {
  console.log(BANNER);
  console.log(`  ${BOLD}Commands${RESET}`);
  console.log();
  console.log(`    score       Show FAF score + tier`);
  console.log(`    wasm-score  Score via Mk4 WASM kernel`);
  console.log(`    bench       Benchmark WASM scoring speed`);
  console.log(`    badge       Get mcpaas.live badge markdown`);
  console.log(`    init <n>    Create project.faf`);
  console.log(`    sync        Sync to CLAUDE.md`);
  console.log(`    version     Show version`);
  console.log(`    help        Show this help`);
  console.log();
  console.log(`  ${DIM}Zero dependencies. Mk4 WASM kernel.${RESET}`);
  console.log(`  ${DIM}Wolfejam slot-based scoring.${RESET}`);
  console.log();
  console.log(`  ${DIM}Full toolchain: ${GREEN}bunx faf-cli auto${RESET}`);
  console.log(`  ${DIM}https://faf.one${RESET}`);
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
  case "wasm-score":
    await cmdWasmScore();
    break;
  case "bench":
    await cmdBench();
    break;
  case "badge":
    await cmdBadge();
    break;
  case "init":
    const name = args[1];
    if (!name) {
      console.log(`${RED}Usage: faf init <name>${RESET}`);
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
