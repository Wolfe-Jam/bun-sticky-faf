/**
 * Minimal YAML Parser for .faf files
 *
 * Zero dependencies. Pure Bun.
 * Handles: scalars, nested objects, arrays
 */

export function parseYaml(content: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = content.split("\n");
  const stack: { indent: number; obj: Record<string, unknown> }[] = [
    { indent: -1, obj: result },
  ];

  for (const line of lines) {
    // Skip comments and empty lines
    if (line.trim().startsWith("#") || line.trim() === "") continue;

    const indent = line.search(/\S/);
    const trimmed = line.trim();

    // Handle key: value pairs
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();

    // Pop stack to find parent
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].obj;

    if (value === "" || value === "|" || value === ">") {
      // Nested object or multiline
      const newObj: Record<string, unknown> = {};
      parent[key] = newObj;
      stack.push({ indent, obj: newObj });
    } else if (value.startsWith("[") && value.endsWith("]")) {
      // Inline array
      parent[key] = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^["']|["']$/g, ""));
    } else if (value.startsWith("- ")) {
      // Array item (simple case)
      parent[key] = [value.slice(2).trim()];
    } else {
      // Scalar value
      parent[key] = value.replace(/^["']|["']$/g, "");
    }
  }

  return result;
}

export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function hasValue(obj: Record<string, unknown>, path: string): boolean {
  const value = getNestedValue(obj, path);
  if (value === undefined || value === null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
}
