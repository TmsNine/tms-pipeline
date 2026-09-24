# Manual setup — finish onboarding with your AI agent

tms-pipeline is a discipline for AI agents: it takes one already-defined task from a ticket to
reviewed code, keeping the agent's working memory clean at every step. So the agents know the rules
of *your* project, it keeps a settings file called `AGENTS.md`. This page is about filling in the few
fields in that file that can't be worked out from the code on their own.

First time here? Start with the overview: [getting started](01-getting-started.md) ·
[configuration reference](02-configuration.md) · [methodology](00-methodology.md).

## Where the blank fields come from

Onboarding tms-pipeline is split into two halves, on purpose:

1. **The installer** (`npx tms-pipeline`, or `npx github:TmsNine/tms-pipeline` until the npm package is
   published; for Claude Code, alternatively the plugin) — puts the skills and agent roles in place and
   writes a starter `AGENTS.md` into your project. A skill is a command like `/tms-01-research` that you
   give the agent to run one step of the work. The installer never asks you about your project, so it
   leaves almost every field in `AGENTS.md` marked `<<TODO>>` — deliberate placeholders, not things it
   forgot.
2. **Agent-driven setup** (the `/tms-init` skill, run inside Claude Code or Codex) — reads your
   repository and fills in most of `AGENTS.md` for you, asking only about the things it couldn't work
   out from the code.

This page is the final step before the first task: a handful of `AGENTS.md` fields that need human
judgement and are best settled in a short conversation with an agent reading the code alongside you.
`/tms-init` leaves these marked `<<TODO>>`. Work through the ones that apply to your project — each comes
with a ready prompt for the agent.

> How to use a prompt: open your project in Claude Code or Codex (you need only one of the two
> tools), paste the prompt, let the agent read the code and propose a value, then confirm or correct
> it. Put the agreed value into `AGENTS.md` — replace the matching `<<TODO: …>>` marker.

---

## 1. `AUDIENCE_PROFILE` — who reads the output

Sets the tone and level of detail every pipeline stage writes at (a non-technical product owner vs a
senior engineer). `/tms-init` asks this, but it is worth a second look.

> **Prompt:** "Look at who actually reads this project's task documents and reviews — am I a solo
> engineer, a team with product managers, an agency reporting to a client? Propose a one-line
> `AUDIENCE_PROFILE` and explain the tone it sets for the research, design, and review output."

## 2. `PROJECT_ONE_LINER` — what it is and the stack

Baseline context so the research and design stages don't start blind.

> **Prompt:** "Read the README, the package manifest, and the entry points. Draft a one- or
> two-sentence `PROJECT_ONE_LINER`: what the product is, who it's for, and the core stack. Facts
> only."

## 3. `SECURITY_TRIGGERS` — when a change gets a security check

When a task touches anything on this list, stage 04 runs one read-only security review over the finished
change, and stage 04b uses its strongest reviewer. When nothing on the list is touched, there is no
security pass. So the list should name exactly what is dangerous **in your project**, with the paths
where it lives — not generic advice.

> **Prompt:** "Based on this codebase, list the concrete changes that should trigger a security review:
> for example, sign-in and permissions, separation between customers' data (tenants), validation of
> data arriving from outside, secrets and signing keys, audit logs, money (prices, payments, refunds),
> users' private data (PII). For each item that this project actually has, give the exact modules or
> folders where it lives. Format it as a short list for `SECURITY_TRIGGERS`."

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

## 6. `KNOWN_TEST_DEBT_LOCATION` — tests that are already failing

Many projects have a few tests that fail on the main branch for reasons unrelated to the current task.
Without a list of them, the agent either calls every red test a new breakage or starts fixing someone
else's problem. With the list, it checks first: a test on the list is named as known debt; a test not on
the list is this task's breakage. The agent reads the list from the main branch, not from the task
branch.

> **Prompt:** "Run the project's test command on the main branch and list the suites that fail there
> today, with a one-line reason for each if you can tell. Propose where to keep this list (a short file
> next to the backlog is fine) and give me the path for `KNOWN_TEST_DEBT_LOCATION`. If everything is
> green, propose the path for an empty list anyway."

## 7. `TRIGGER_REGISTER_LOCATION` — findings that wait for an event

Code review sometimes finds something that is not a problem today but will become one when a specific
thing happens — "the first bulk import", "a second server", "the first customer in another time zone".
Such findings do not belong in the backlog yet; they go to the trigger register, each with the event that
makes it matter. This field says where that register lives.

> **Prompt:** "Look at our backlog and docs. Propose where to keep a trigger register — a short table of
> findings that matter only when a named event happens, with columns for the finding, the triggering
> event and where it was found. It can be a section of the backlog. Give me the path or section for
> `TRIGGER_REGISTER_LOCATION`."

## 8. `ACCEPTED_SCREENS_LOCATION` — screens you have accepted (UI projects only)

If your product has a user interface, keep a list of the screens you have accepted, each with a
reference image. An accepted screen is the reference: changes to it go through `tms-ui-screen`, start
from it, and are not redone in passing by another task. Skip and delete this field if there is no UI.

> **Prompt:** "Find where this project keeps its screens and any screenshots or design references.
> Propose a register of accepted screens — screen name, where it lives in the code, and a reference
> image — and where to keep it. Give me the path for `ACCEPTED_SCREENS_LOCATION`. Do not mark any screen
> as accepted yourself; list them as candidates for me to confirm."

## 9. `LAUNCH_STAGE_MAPPING` and `LAUNCH_PLAYBOOK_LOCATION` — pre-launch manual actions

Some pre-launch steps can't be done in code — a person does them by hand (flip a flag, run a migration
on production, tell the team). These two fields set where such steps are recorded and which part of the
playbook each kind of step goes to, so anything found mid-task doesn't get lost. The gate (06) also names
the playbook document that closes a `conditional_go`.

> **Prompt:** "Do we have a launch checklist or playbook — a list of manual actions to do before
> shipping? If yes, where is it, and which part of it should each kind of manual action go to
> (migrations and settings, technical checks, live smoke test, owner acceptance, the launch decision)?
> If not, propose a minimal `LAUNCH_PLAYBOOK_LOCATION` and a 'kind of action → document' mapping for
> `LAUNCH_STAGE_MAPPING`."

## 10. Pointers to where things live in the repo: `CODE_LAYOUT_HINT`, `DOC_INDEX_HINT`, `TRACEABILITY_LOCATION`, `DESIGN_SYSTEM_HINT`

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
- Start work: run `/tms-run <your first ticket>` — it carries the task through all eight stages and stops
  for you after the design and at the gate.

See also: [getting started](01-getting-started.md) · [configuration reference](02-configuration.md) ·
[methodology](00-methodology.md).
