# Manual setup — finish onboarding with your AI agent

tms-pipeline is a discipline for AI agents: it takes one already-defined task from a ticket to
reviewed code, keeping the agent's working memory clean at every step. So the agents know the rules
of *your* project, it keeps a settings file called `AGENTS.md`. This page is about filling in the few
fields in that file that can't be worked out from the code on their own.

First time here? Start with the overview: [getting started](01-getting-started.md) ·
[configuration reference](02-configuration.md) · [methodology](00-methodology.md).

## Where the blank fields come from

Onboarding tms-pipeline is split into two halves, on purpose:

1. **The installer** (`npx tms-pipeline` or `/plugin install`) — a terminal program that drops the
   skills into your project and writes a starter `AGENTS.md`. A skill is a command like
   `/tms-research` that you give the agent to run one step of the work. The installer never asks you
   about your project, so it leaves almost every field in `AGENTS.md` marked `<<TODO>>` — these are
   deliberate placeholders, not things it forgot.
2. **Agent-driven setup** (the `/tms-init` skill, run inside Claude Code or Codex) — reads your
   repository and fills in most of `AGENTS.md` for you, asking only about the things it couldn't work
   out from the code.

This page is the final step before launch: a handful of `AGENTS.md` fields that need human judgement
and are best settled in a short conversation with an agent reading the code alongside you. `/tms-init`
leaves these marked `<<TODO>>`. Work through the ones that apply to your project — each comes with a
ready prompt for the agent.

> How to use a prompt: open your project in Claude Code or Codex (you need only one of the two
> tools), paste the prompt, let the agent read the code and propose a value, then confirm or correct
> it. Put the agreed value into `AGENTS.md` — replace the matching `<<TODO: …>>` marker.

---

## 1. `AUDIENCE_PROFILE` — who reads the output

Sets the tone and level of detail every pipeline stage writes at (a non-technical product owner vs a
senior engineer).

> **Prompt:** "Look at who actually reads this project's task documents and reviews — am I a solo
> engineer, a team with product managers, an agency reporting to a client? Propose a one-line
> `AUDIENCE_PROFILE` and explain the tone it sets for the research, design, and review output."

## 2. `PROJECT_ONE_LINER` — what it is and the stack

Baseline context so the research and design stages don't start blind.

> **Prompt:** "Read the README, the package manifest, and the entry points. Draft a one- or
> two-sentence `PROJECT_ONE_LINER`: what the product is, who it's for, and the core stack. Facts
> only."

## 3. `PROFILE_C_TRIGGERS` — when a task needs risk handling and deeper review

Every piece of work (a wave) gets a risk profile. In Codex, ordinary stage 04 work usually stays with the
main agent and explicit self-check roles; the independent quality backstop is stage 04b, where a fresh
reviewer checks the actual diff. Here you define what makes a task high-risk **in your domain**, so the
pipeline knows when to use Profile R/C and make 04b more demanding.

> **Prompt:** "Based on this codebase, list the concrete conditions that should turn on Profile R/C risk
> handling and deeper 04b review — for example: touches authentication/authorization, payments, users'
> private data (PII), separation between tenants, migrations, public API contracts, money math. Give me a
> short list tailored to what this project actually has, not generic advice."

## 4. `PERSISTENCE_AND_TENANCY` — data model and isolation rules

How data is stored and how it's kept separate between tenants (separate customers in one shared
system; a single-user app has none) or users — the rules design must never break.

> **Prompt:** "Inspect the data layer (schemas, ORM models, queries) and the authorization/session
> code. Describe the persistence model and the isolation rules: how rows are tied to a user or an
> organization, what must always be filtered, what would be a data-leak bug (for example, one
> customer accidentally seeing another's rows). Summarize this as `PERSISTENCE_AND_TENANCY`."

## 5. `MIGRATION_POLICY` — how schema and data changes ship

So the implementation stage knows the safe way to change the database schema: in what order, with what
backward compatibility, and what checks before merge.

> **Prompt:** "Find how database and schema migrations are written and deployed here (tools, folders,
> CI steps — that is, the server that builds the project and runs the tests automatically). State the
> project's `MIGRATION_POLICY`: ordering rules, backward-compatibility expectations, and what's
> forbidden. For example: can you drop a column outright (a destructive drop), or do you first ship
> code that stops using it and drop it only in the next deploy?"

## 6. `LAUNCH_STAGE_MAPPING` and `LAUNCH_PLAYBOOK_LOCATION` — pre-launch manual actions

Some pre-launch steps can't be done in code — a person does them by hand (flip a flag, run a migration
on production, tell the team). These two fields set where such steps are recorded and how the pipeline
stages point to them, so anything found mid-task doesn't get lost.

> **Prompt:** "Do we have a launch checklist or playbook — a list of manual actions to do before
> shipping? If yes, where is it, and how should the pipeline stages route manual pre-launch actions
> into it? If not, propose a minimal `LAUNCH_PLAYBOOK_LOCATION` and a 'stage → manual action'
> mapping."

## 7. Pointers to where things live in the repo: `CODE_LAYOUT_HINT`, `DOC_INDEX_HINT`, `TRACEABILITY_LOCATION`, `DESIGN_SYSTEM_HINT`

Four short pointers that help agents find their way around the repo faster. Each is one line:

- `CODE_LAYOUT_HINT` — a map of the top-level folders and where features live.
- `DOC_INDEX_HINT` — the entry point into your documentation base (a docs tree, a wiki, or an Obsidian
  vault).
- `TRACEABILITY_LOCATION` — where decisions and ticket links are recorded.
- `DESIGN_SYSTEM_HINT` — the entry point into your components or design system (or "N/A" if there's no
  UI).

> **Prompt:** "Read the repo and give me concise one-line values for these AGENTS.md pointers:
> `CODE_LAYOUT_HINT` (top-level folder map + where features live), `DOC_INDEX_HINT` (the entry point
> into the documentation base), `TRACEABILITY_LOCATION` (where we record decisions and ticket links),
> and `DESIGN_SYSTEM_HINT` (the entry point into the components/design system, or 'N/A' if there's no
> UI)."

---

## Once it's filled in

- Re-read `AGENTS.md` end to end — no `<<TODO>>` should be left that matters for your first task.
- If something genuinely isn't decided yet, leave an explicit `<<TODO>>` and settle it when the first
  relevant task reaches it. The pipeline writes any missing context straight into its report.
- Start work: run the `/tms-ticket <your first ticket>` skill — it opens the first task and starts the
  first pipeline stage.

See also: [getting started](01-getting-started.md) · [configuration reference](02-configuration.md) ·
[methodology](00-methodology.md).
