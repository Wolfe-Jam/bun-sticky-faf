# Bun Sticky - Publish Protocol

## Pre-Publish Checklist

### 1. Code Quality
- [ ] All 45 tests passing (`bun test`)
- [ ] Zero TypeScript errors
- [ ] Zero runtime dependencies
- [ ] Pure Bun APIs only

### 2. Version Bump
```bash
# Update version in:
# - package.json
# - index.ts (VERSION constant)
```

### 3. Test Suite
```bash
bun test
# Expect: 45 pass, 0 fail
```

### 4. Manual Verification
```bash
bun run index.ts --version
bun run index.ts help
bun run index.ts score
```

## Publish Commands

### npm Registry
```bash
# Login (first time)
npm login

# Publish
npm publish
```

### Bun Package Manager (future)
```bash
# When Bun has its own registry
bun publish
```

## Post-Publish

1. Tag release in git
2. Update ZIG-n-RUST.md benchmarks
3. Announce in faf-cli ecosystem

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 1.0.0 | TBD | Initial release - Wolfejam slot-based scoring |

---

*Fastest bun under the sum.*
*Zero dependencies. Pure Bun.*
