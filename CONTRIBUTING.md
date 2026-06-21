# Contributing to tms-pipeline

Thanks for helping improve the methodology. This repo is small and has no runtime dependencies — most
changes are Markdown (skills, agents, templates, docs) plus a tiny zero-dependency Node installer.

## Local checks

Requires Node ≥ 18.

```bash
node --test            # engine + manifest + version-sync tests
npm run check:links    # verify every relative markdown link resolves
```

Both run in CI on every push and PR. Please make them green before opening a PR.

## Repository layout

```
skills/        15 tms-* skills (pipeline + audit + refactoring)
agents/        5 mob roles
commands/      /tms-init onboarding command
installer/     core engine + the `npx tms-pipeline` wizard  (installer/test/ holds the tests)
templates/     AGENTS/CLAUDE templates, pipeline forms, doc-base skeletons, worked example
docs/          methodology + getting-started + configuration + doc-base (EN + .ru.md)
scripts/       check-links.mjs and other dev tooling
```

## Docs are bilingual — Russian is canonical

Every doc exists as `name.md` (English) and `name.ru.md` (Russian). **Russian is the source of truth.**
When you change a doc:

1. Edit the `.ru.md` file first.
2. Port the same change into the English `.md` counterpart.
3. Keep cross-links language-consistent: `.ru.md` files link to other `.ru.md` files, `.md` to `.md`.

A PR that updates only one language of a doc pair will usually be asked to update both.

## Adding or renaming a skill

`installer/test/engine.test.js` asserts that the skill list in **both** plugin manifests
(`.claude-plugin/plugin.json` and `.codex-plugin/plugin.json`) matches the folders in `skills/`. If you
add, remove, or rename a skill, update both manifests or the test fails.

## The onboarding question set has one source of truth

`installer/core/questions.js` is the single canonical list of onboarding questions and tokens. The CLI,
the `/tms-init` command, and the templates all derive from it. Don't duplicate the question list
elsewhere — if a template uses a new `{{TOKEN}}`, add it to `QUESTIONS` or `DEFERRED_TOKENS` (a test
enforces that every template token is one or the other).

## Versioning

The version string is hardcoded in four files and a test keeps them in sync:

- `package.json`
- `.claude-plugin/plugin.json`
- `.codex-plugin/plugin.json`
- `.claude-plugin/marketplace.json`

Bump all four together and add a `CHANGELOG.md` entry.

## Commit / PR conventions

- Keep changes scoped and described in plain language.
- Do not add AI/agent attribution to commit messages (a licensing constraint this project follows).
- Update `CHANGELOG.md` under `## [Unreleased]` for user-visible changes.
