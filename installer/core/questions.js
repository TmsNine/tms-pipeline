// questions.js — the SINGLE canonical onboarding question set.
// Both onboarding front-ends (the `npx tms-pipeline` CLI and the in-Claude `/tms-init` command) use
// this list, so the wording never drifts. Keep it minimal: ask only what is needed to render a usable
// AGENTS.md / CLAUDE.md. Anything not asked here is left as a clearly-marked TODO for the user.

'use strict';

/**
 * Each question:
 *  - token:   the {{PLACEHOLDER}} it fills in the templates
 *  - prompt:  the question text
 *  - default: pressed-Enter value (null = required, must be answered)
 *  - kind:    'text' | 'confirm'  (confirm = y/n)
 */
const QUESTIONS = [
  {
    token: 'OUTPUT_LANGUAGE',
    prompt: 'Output language for everything the user reads (e.g. English, Russian)',
    default: 'English',
    kind: 'text',
  },
  {
    token: 'AUDIENCE_PROFILE',
    prompt: 'Who reads the output? (e.g. "a non-technical product owner", "a senior engineer")',
    default: 'a senior engineer',
    kind: 'text',
  },
  {
    token: 'PROJECT_ONE_LINER',
    prompt: 'One line: what is this project and its stack?',
    default: '',
    kind: 'text',
  },
  {
    token: 'TASK_FOLDER_PATTERN',
    prompt: 'Where do per-task pipeline folders live?',
    default: 'docs/<TICKET-ID>/',
    kind: 'text',
  },
  {
    token: 'DOC_BASE_PATH',
    prompt: 'Path to your documentation base (vault / docs tree where PRD, flows, architecture, backlog live)',
    default: 'docs/',
    kind: 'text',
  },
  {
    token: 'BACKLOG_LOCATION',
    prompt: 'Where is the backlog (single source of truth for tasks)?',
    default: 'docs/backlog.md',
    kind: 'text',
  },
  {
    token: 'TICKET_ID_FORMAT',
    prompt: 'Ticket-ID format (e.g. PROJ-123)',
    default: 'PROJ-123',
    kind: 'text',
  },
  {
    token: 'TEST_CMD',
    prompt: 'Command to run tests',
    default: 'npm test',
    kind: 'text',
  },
  {
    token: 'TYPECHECK_CMD',
    prompt: 'Command to typecheck (blank if none)',
    default: '',
    kind: 'text',
  },
  {
    token: 'LINT_CMD',
    prompt: 'Command to lint (blank if none)',
    default: '',
    kind: 'text',
  },
  {
    token: 'BUILD_CMD',
    prompt: 'Command to build (blank if none)',
    default: '',
    kind: 'text',
  },
  {
    token: 'LAUNCH_PLAYBOOK_LOCATION',
    prompt: 'Where are pre-launch manual actions tracked? (a launch playbook/checklist; blank if none yet)',
    default: '',
    kind: 'text',
  },
];

// Confirmations (y/n). The first two pick which agent tool(s) you use so we don't write anything you
// don't need (e.g. no .claude/CLAUDE.md if you only use Codex). The rest drive copy actions.
const CONFIRMS = [
  {
    key: 'useClaude',
    prompt: 'Do you use Claude Code?',
    default: true,
  },
  {
    key: 'useCodex',
    prompt: 'Do you use Codex?',
    default: true,
  },
  {
    key: 'copyPipeline',
    prompt: 'Copy the task-pipeline template into your project?',
    default: true,
  },
  {
    key: 'copyDocsVault',
    prompt: 'Copy the documentation-base blank skeletons into your project?',
    default: false,
  },
];

// Tokens we intentionally do NOT ask (project-specific judgement). The engine leaves a clear TODO so the
// user fills them in by hand or with help from Claude/Codex.
const DEFERRED_TOKENS = [
  'AUDIENCE_PROFILE_NOTE',
  'DOC_INDEX_HINT',
  'CODE_LAYOUT_HINT',
  'PERSISTENCE_AND_TENANCY',
  'TRACEABILITY_LOCATION',
  'PROFILE_C_TRIGGERS',
  'MIGRATION_POLICY',
  'LAUNCH_STAGE_MAPPING',
];

module.exports = { QUESTIONS, CONFIRMS, DEFERRED_TOKENS };
