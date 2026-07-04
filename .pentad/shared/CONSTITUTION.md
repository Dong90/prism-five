# Pentad Constitution

## Core Principles

1. **Single feature, single pipeline.** Only one active feature at a time.
2. **Agents are independent.** Each Agent has isolated context, reads only upstream artifacts.
3. **engineTruth is single source.** `.pentad/pipeline.json` always wins over conversation memory.
4. **Gates are non-negotiable.** Human gates require approval; auto gates require evidence.
5. **No skipping roles.** Every feature passes through all 5 roles.

## Forbidden Patterns

- NEVER use `any` or `@ts-ignore` in TypeScript
- NEVER skip TDD (write failing test first)
- NEVER bypass a gate
- NEVER share Agent conversation context across roles
- NEVER edit upstream feature artifacts

## Naming Conventions

- Variables/functions: camelCase
- Types/interfaces: PascalCase
- Files: kebab-case for config, PascalCase for components
- Feature slugs: lowercase hyphenated (e.g. `user-auth`)

## Agent Principles

| Agent | Paradigm | Motto |
|-------|----------|-------|
| Prototyper | Explorer | High discard rate. Most ideas don't ship. |
| Builder | Operator | No production code without a failing test. |
| Sweeper | Scout | Simplify. Remove. Unship. |
| Grower | Analyst | Data over intuition. Experiment over opinion. |
| Maintainer | Guardian | Secure. Reliable. Fast. Efficient. |
