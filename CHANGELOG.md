# Changelog

All notable changes to tms-pipeline are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project aims to follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Zero-dependency test suite for the onboarding engine (`node --test`), covering token rendering, the
  no-overwrite-without-`--force` rule, dry-run, Codex-asset gating, version-sync across the four manifest
  files, and skill-manifest/disk parity.
- GitHub Actions CI running the tests and a relative-markdown-link check on Node 18/20/22.
- `scripts/check-links.mjs` and an `npm run check:links` script.
- CLI flags: `--help`, `--version`, `--dry-run`, and `--answers <file.json>` for non-interactive runs.
- Wizard now installs Codex skills/agents into `~/.codex` (only when Codex is selected).
- "In 30 seconds" summary and a prominent link to the worked example
  (`templates/example-task/ACME-101/`) in the README and getting-started docs.
- `CONTRIBUTING.md`, `CHANGELOG.md`, issue templates, and a pull-request template.

### Changed
- `/tms-init` now calls the canonical engine via `--answers` instead of re-implementing template
  rendering, removing the duplicated question list and the drift risk between the two onboarding paths.
- Russian is now the canonical language for docs; English files follow it.
- Concrete Codex install instructions (exact `~/.codex` paths and copy commands) across README and docs.

### Fixed
- `DESIGN_SYSTEM_HINT` was used in `AGENTS.template.md` but neither asked nor deferred; it is now a
  documented deferred token so it renders as a clear TODO and is covered by a test.

## [0.1.0]

### Added
- Initial release: the eight-stage delivery pipeline (ticket → research → design → gap-audit → plan →
  implement → test → review-gate), the four-stage codebase audit, refactoring and review-loop skills,
  five mob-role agents, the `npx tms-pipeline` onboarding wizard, templates, and bilingual docs.
