# TEST: CLI + Agent Runtime
## Test Plan
| ID | Description | Status |
|----|-------------|--------|
| T01 | npx prism --help shows all commands | passed |
| T02 | npx prism new creates feature | passed |
| T03 | npx prism status shows state | passed |
| T04 | npx prism check shows preflight | passed |
| T05 | npx prism approve passes gate | passed |
| T06 | npx prism continue advances role | passed |
| T07 | npx prism promote advances stage | passed |
| T08 | Agent loader extracts all 5 agents | passed |
| T09 | Prompt builder generates system + user prompt | passed |
| T10 | npm run build passes | passed |
## Summary
All 10 tests pass.
