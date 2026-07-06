# TEST: prism ci sync

## Test Plan

| Level | Scope | Command / Tool |
|-------|-------|----------------|
| unit | syncSkills input/output, missing dir, platform support | npx vitest run ci.test.ts |

## Coverage vs AC

| AC (REQUIREMENT) | Test evidence |
|------------------|---------------|
| US-1 | ci.test.ts: syncs agent files to destination |

## Results

- [x] All required suites pass (2/2 tests)
- [x] Full test suite green (113 passed)
