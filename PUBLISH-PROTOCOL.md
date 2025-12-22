# Bun Sticky - Publish Protocol

## Pre-Publish Checklist

### 1. Code Quality
- [x] All 328 tests passing (`bun test`)
- [x] Zero TypeScript errors
- [x] Zero runtime dependencies
- [x] Pure Bun APIs only

### 2. Version Bump
```bash
# Update version in:
# - package.json
# - index.ts (VERSION constant)
```

### 3. Test Suite
```bash
bun test
# Expect: 328 pass, 0 fail
```

### 4. Manual Verification
```bash
bunx bun-sticky --version  # ✓
bunx bun-sticky help       # ✓
bunx bun-sticky init test  # ✓
bunx bun-sticky score      # ✓
```

## Publish Commands

### npm Registry
```bash
npm publish --access public
```

### Verify
```bash
npm view bun-sticky
bunx bun-sticky help
```

## Post-Publish

1. [x] Tag release in git
2. [ ] Update ZIG-n-RUST.md benchmarks
3. [ ] Announce in faf-cli ecosystem

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | 2024-12-22 | Initial release - Wolfejam slot-based scoring, 177 tests |
| 1.0.1 | 2024-12-22 | Proper publish ceremony, version consistency |
| 1.0.2 | 2025-12-22 | Test fixes (rounding, TIERS export, Empty tier) |

---

*Fastest bun under the sum.*
*Zero dependencies. Pure Bun.*
