# Configuration

> How to tailor tms-pipeline to your project.
>
> tms-pipeline is a discipline for AI agents: it takes one already-defined task from a ticket to
> reviewed code, keeping the agent's context clean at each step. To do that for *your* project, the
> agents need to know your rules: where tasks live, what language to write in, which commands check
> your code. All of that lives in settings files, which is what this page is about.
>
> Most of the setup is done for you by the installer (`npx tms-pipeline`) and the `/tms-init` skill, a
> command you give the agent so it reads your repo and fills in the settings itself. This page is for two
> cases: when you want to configure something by hand, and for the values that stay blank (marked
> `<<TODO>>`, a placeholder waiting on your decision). The Russian version is
> [02-configuration.ru.md](02-configuration.ru.md).

## About the tools: Claude Code and Codex

tms-pipeline runs on top of an AI tool: the program where you talk to the agent. Two are supported,
**Claude Code** and **Codex**. You only need one of them, so pick the one you already use. The `AGENTS.md`
file is shared by both; Claude Code additionally reads its own `.claude/CLAUDE.md`. The differences
between the tools are gathered below, in [Codex parity](#codex).

## Where settings live: AGENTS.md and CLAUDE.md

The agents don't hard-code your project's specifics — they read them on the fly from two settings files:

- **`AGENTS.md`** (in the repo root) is your project's main settings file: where tasks live, what language
  to write output in, your commands, your rules. Both AI tools read it.
- **`.claude/CLAUDE.md`** holds the rules that only Claude Code needs: which agent runs which stage, the
  model and effort pinned to each agent role, and the "no speculative expansion" discipline for auto mode.
  It pulls in `AGENTS.md` with the line `@./AGENTS.md`, so everything in `AGENTS.md` applies there too.
  There is nothing to fill in by hand except the project name in its title.

Start from the templates `templates/AGENTS.template.md` and `templates/CLAUDE.template.md`. Replace every
`{{PLACEHOLDER}}` with your value and remove the `<!-- -->` / `« »` guidance notes (the installer and
`/tms-init` do this for you).

## The sections of AGENTS.md

The skills read `AGENTS.md` by section name, so keep the headings as they are. Here is what each section
holds and which values you fill in. Sections without a value in the right-hand column are ready-made rules
you can keep as they are or adjust.

| Section | What it holds | Values |
|---|---|---|
| *Operating Standard* | Output language, who reads the output, the quiet working mode, how to ask questions. | `OUTPUT_LANGUAGE`, `AUDIENCE_PROFILE` |
| *Repository Grounding* | Read docs only when needed; trust the code over stale docs. | `DOC_INDEX_HINT` |
| *Project Context Snapshot* | What the project is, where the code lives, how data is stored and separated. | `PROJECT_ONE_LINER`, `CODE_LAYOUT_HINT`, `PERSISTENCE_AND_TENANCY` |
| *Documentation Base* | Where product knowledge, task folders, the backlog and the registers live; the ticket-ID format. | `DOC_BASE_PATH`, `TASK_FOLDER_PATTERN`, `BACKLOG_LOCATION`, `TRIGGER_REGISTER_LOCATION`, `TRACEABILITY_LOCATION`, `TICKET_ID_FORMAT` |
| *Pipeline Execution* | The eight stages, their documents, the two owner stops, File Ownership as a hard boundary. | — |
| *Gate: who signs what* | Only a human writes `go`; when the lead may sign `conditional_go`; when the gate must go to the owner. | — |
| *Testing And Validation* | Your check commands, the one task check, the list of tests that are already failing. | `TEST_CMD`, `TYPECHECK_CMD`, `LINT_CMD`, `BUILD_CMD`, `TASK_CHECK_CMD`, `KNOWN_TEST_DEBT_LOCATION` |
| *UI And Design* | Your design system and the register of screens you have accepted. Delete if there is no UI. | `DESIGN_SYSTEM_HINT`, `ACCEPTED_SCREENS_LOCATION` |
| *Stage 04 and 04b* | One executor writes the whole plan; one security pass only on a trigger; up to five fresh review passes. | — |
| *Security Triggers* | The list of changes that switch on the security pass. | `SECURITY_TRIGGERS` |
| *Database / Schema Migration Policy* | How schema changes are made. Delete if there is no database. | `MIGRATION_POLICY` |
| *Future Work Capture* | Where follow-ups land and how to bundle them instead of splitting into many tickets. | — |
| *Pre-Launch Manual Action Capture* | Where manual launch steps are recorded, and in which part of the playbook. | `LAUNCH_PLAYBOOK_LOCATION`, `LAUNCH_STAGE_MAPPING` |

The remaining sections (*Task Mode*, *Vertical And Horizontal Research*, *Root Cause Discipline*,
*Change-Surface Triggers*, *Minimal Sufficient Change*, *Acceptance Contract*, *Documentation
Discipline*, *Safety And Workspace Hygiene*, *Decision Rules*, *Completion Protocol*) are general working
rules with nothing to fill in.

## Values the installer and `/tms-init` fill in

The installer itself asks only for the language. `/tms-init` reads your repository and fills in the rest
of this list, asking you only about what it could not work out. The same list is what the installer
accepts in an `--answers` file.

| Placeholder | What it does |
|---|---|
| `OUTPUT_LANGUAGE` | The language of everything the user reads (reports, documents). |
| `AUDIENCE_PROFILE` | Who reads the output — this sets how much explanation to give (for example, a non-technical owner vs a senior engineer). |
| `PROJECT_ONE_LINER` | What the project is and what stack it's built on. |
| `TASK_FOLDER_PATTERN` | Where per-task folders live (for example, `docs/<TICKET-ID>/`). |
| `DOC_BASE_PATH` | The path to your documentation base (a docs tree, a wiki, or an Obsidian vault). |
| `BACKLOG_LOCATION` | The backlog file — the one list of tasks treated as the source of truth. |
| `TICKET_ID_FORMAT` | The format of a task ID, for example `PROJ-123`. |
| `TEST_CMD` / `TYPECHECK_CMD` / `LINT_CMD` / `BUILD_CMD` | Your commands for checking code: tests, type check, linter, build. |
| `TASK_CHECK_CMD` | One command that builds, type-checks and tests every package a task touched. Stages 03, 04, 04b and 05 run it. If you have none yet, list the commands it should chain; a single script is strongly recommended. |
| `LAUNCH_PLAYBOOK_LOCATION` | Where you track the manual actions to do before launch (the launch playbook). |

## Values that need your decision (left as `<<TODO>>`)

These can't be read from the code reliably. They are left marked `<<TODO>>` so you notice them; the
[manual setup](05-manual-setup.md) page has a ready prompt for each.

- **`SECURITY_TRIGGERS`** — the list of changes that switch on the security pass. When a task touches
  anything on this list, stage 04 runs one read-only security review over the finished change, and stage
  04b uses its strongest reviewer. Keep the generic items that apply and add the exact paths to the
  modules where they live in your code:
  - sign-in and authorization: who the user is and what they're allowed to do;
  - separation by tenant (a tenant is a separate customer in a shared system; a single-user app has none,
    so skip this one) and working out who is currently signed in;
  - the trust boundary: the places where data arrives from outside and must be validated;
  - secrets, signing keys and audit logs;
  - money: prices, payment links, refunds;
  - paths where PII travels: a user's private details (name, email, phone).

  (Older templates called this value `PROFILE_C_TRIGGERS`; rename it when you upgrade.)
- **`KNOWN_TEST_DEBT_LOCATION`** — the list of test suites that already fail on the main branch. Before
  calling a failing test a new breakage, the agent checks this list, reading it from the main branch rather
  than from the task branch. Listed suites are still run; the list only explains why they are red.
- **`TRIGGER_REGISTER_LOCATION`** — the trigger register: findings that matter only when a named event
  happens ("the first bulk import", "a second server"). Stage 04b adds rows here instead of filling the
  backlog with things that are not a problem yet. It can be a section of the backlog.
- **`ACCEPTED_SCREENS_LOCATION`** — for projects with a UI: the list of screens you have accepted, with
  their reference images. An accepted screen is the reference: a change to it goes through
  `tms-ui-screen`, and another task does not redesign it in passing. Delete if there is no UI.
- **`PERSISTENCE_AND_TENANCY`** — how your data is stored, and how the system works out who the current
  user or tenant is, so it doesn't mix up one party's data with another's.
- **`MIGRATION_POLICY`** — how you make and record changes to the database schema (if you have no
  database, delete this section).
- **`LAUNCH_STAGE_MAPPING`** — which kind of manual action goes into which part of your launch playbook.
- **`TRACEABILITY_LOCATION`**, **`CODE_LAYOUT_HINT`**, **`DOC_INDEX_HINT`**, **`DESIGN_SYSTEM_HINT`** —
  optional hints that help the agent find its way around your project (the design-system hint is the path
  to your design system or component library). Delete any that don't apply to you.

> Not sure what to put? Don't guess on your own — ask your agent (Claude Code or Codex) to read your code
> and propose the values, then confirm or correct them.

<a name="codex"></a>
## Codex parity

Here are the differences between Codex and Claude Code. If you use only one tool, read this section only
when you switch to the other.

- Codex reads `AGENTS.md` directly, so there's no need to pull it in separately.
- The plugin manifest file (it tells the tool which skills and commands exist) lives at
  `.codex-plugin/plugin.json` for Codex and at `.claude-plugin/plugin.json` for Claude Code.
- Skills in both tools use `SKILL.md`, but this repo keeps two trees: `skills/` for Claude Code and
  `codex-skills/` for Codex. They carry the same method and the same stage names (`tms-00-ticket` …
  `tms-06-gate`, `tms-run`, `tms-new`, `tms-ui-screen`); in Codex the audit and refactoring skills are
  numbered (`tms-90-audit-scope` … `tms-96-ui-refactoring`).
- The agent roles live in two trees too: Claude Code roles as Markdown in `agents/`, Codex roles as TOML in
  `codex-agents/`. In Claude Code every stage has its own agent with a pinned model; Codex has no stage
  agents — a stage runs on your session's model, and only the helper roles (explorer, developer,
  reviewer, security and so on) have their own model settings. Details in
  [model routing](06-model-routing.md).
- The pipeline itself is the same in both: eight stages, one executor in stage 04, one security pass on a
  trigger, up to five fresh review passes in 04b, two owner stops.

### Installing the skills and agents for Codex

Codex has no command like `/plugin install`, so the files need to go into `~/.codex` either by hand or
semi-automatically:

- **Semi-automatically:** run `npx tms-pipeline` (until the npm package is published,
  `npx github:TmsNine/tms-pipeline`), choose Codex and agree to the copy. The installer then copies
  `codex-skills/` → `~/.codex/skills/` and `codex-agents/` → `~/.codex/agents/`. If you don't use Codex,
  the installer leaves `~/.codex` alone.
- **By hand:** `cp -R codex-skills/* ~/.codex/skills/ && cp -R codex-agents/* ~/.codex/agents/`.

The installer preserves existing project files, skills, commands and agent-role files. Pass `--force` only
when you intentionally want the packaged versions to replace them — including your `AGENTS.md`.

`AGENTS.md` stays in the project root either way, and Codex reads it directly.
