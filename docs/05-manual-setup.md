# Manual setup — finish onboarding with your AI agent

Onboarding tms-pipeline has two halves, on purpose:

1. **Thin installer** (`npx tms-pipeline` or `/plugin install`) — places the skills and drops a starter
   `AGENTS.md` that is mostly `<<TODO>>`. It never interrogates you about your project.
2. **Agent-driven setup** (`/tms-init`, run inside Claude Code or Codex) — reads your repository and
   fills most of `AGENTS.md` for you, asking only about the gaps it can't discover.

This page covers the **last mile**: the handful of fields that need human judgement and are best filled
in a short conversation with your agent reading the code alongside you. `/tms-init` leaves these as
`<<TODO>>` rather than guessing. Work through the ones relevant to your project — each has a ready
prompt you can paste to your agent.

> How to use a prompt: open your project in Claude Code / Codex, paste the prompt, let the agent read
> the code and propose a value, then confirm or correct it. Apply the agreed value into `AGENTS.md`
> (replace the matching `<<TODO: …>>` marker).

---

## 1. `AUDIENCE_PROFILE` — who reads the output

Sets the tone and altitude every stage writes at (a non-technical product owner vs a senior engineer).

> **Prompt:** "Look at who actually consumes this project's task documents and reviews — am I a solo
> engineer, a team with PMs, an agency reporting to a client? Propose a one-line `AUDIENCE_PROFILE` and
> explain the tone it implies for research/design/review output."

## 2. `PROJECT_ONE_LINER` — what this is and its stack

Baseline context so research/design don't start blind.

> **Prompt:** "Read the README, package manifest, and entry points. Draft a one- or two-sentence
> `PROJECT_ONE_LINER`: what the product is, who it's for, and the core stack. Keep it factual."

## 3. `PROFILE_C_TRIGGERS` — when a task needs the heavyweight escort

Profile C adds Security (and Architect) proving agents during implementation. Define what makes a task
high-risk **for your domain** so the pipeline escalates only when it should.

> **Prompt:** "Based on this codebase, list the concrete conditions that should trigger the high-risk
> 'Profile C' escort — e.g. touches auth/authz, payments, PII, multi-tenant scoping, migrations,
> public API contracts, money math. Give me a short bullet list tailored to what this project actually
> has, not generic advice."

## 4. `PERSISTENCE_AND_TENANCY` — data model & isolation rules

How data is stored and how tenants/users are isolated — the rules design must never violate.

> **Prompt:** "Inspect the data layer (schemas, ORM models, queries) and any auth/session code. Describe
> the persistence model and the tenancy/isolation rules: how are rows scoped to a user/org, what must
> always be filtered, what would be a data-leak bug. Summarise as `PERSISTENCE_AND_TENANCY`."

## 5. `MIGRATION_POLICY` — how schema/data changes ship

So implementation knows the safe way to change schemas (expand/contract? backwards-compatible? review
gates?).

> **Prompt:** "Find how database/schema migrations are written and deployed here (tooling, folders, CI
> steps). State the project's `MIGRATION_POLICY`: ordering rules, backward-compatibility expectations,
> and anything that's forbidden (e.g. destructive drops without a two-step deploy)."

## 6. `LAUNCH_STAGE_MAPPING` & `LAUNCH_PLAYBOOK_LOCATION` — pre-launch manual actions

Where pre-launch manual steps are tracked and how pipeline stages map to them, so nothing found mid-task
gets lost.

> **Prompt:** "Do we have a launch/release checklist or runbook? If yes, where, and how should pipeline
> stages route manual pre-launch actions into it? If not, propose a minimal `LAUNCH_PLAYBOOK_LOCATION`
> and a stage→action mapping."

## 7. `TRACEABILITY_LOCATION`, `CODE_LAYOUT_HINT`, `DOC_INDEX_HINT`, `DESIGN_SYSTEM_HINT`

Lightweight pointers that help agents navigate: where decisions/links are recorded, the top-level code
map, the doc-base index, and (for UI work) the design-system entry point.

> **Prompt:** "Give me concise values for these AGENTS.md hints by reading the repo: `CODE_LAYOUT_HINT`
> (top-level folder map + where features live), `DOC_INDEX_HINT` (entry point into the doc base),
> `TRACEABILITY_LOCATION` (where we record decisions/ticket links), and `DESIGN_SYSTEM_HINT` (the
> component/design-system entry point, or 'N/A' if no UI)."

---

## After filling

- Re-read `AGENTS.md` end to end — there should be no `<<TODO>>` left that matters for your first task.
- Anything still genuinely undecided: leave a clear `<<TODO>>` and resolve it when the first relevant
  task hits it. The pipeline surfaces missing context loudly rather than guessing.
- Start work: `/tms-ticket <your first ticket>`.

See also: [getting started](01-getting-started.md) · [configuration reference](02-configuration.md) ·
[methodology](00-methodology.md).
