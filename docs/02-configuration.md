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
> cases: when you want to configure something by hand, and for the values the installer deliberately
> leaves blank (marked `<<TODO>>`, a placeholder waiting on your decision). The Russian version is
> [02-configuration.ru.md](02-configuration.ru.md).

## About the tools: Claude Code and Codex

tms-pipeline runs on top of an AI tool: the program where you talk to the agent. Two are supported,
**Claude Code** and **Codex**. You only need one of them, so pick the one you already use. The `AGENTS.md`
file is shared by both; Claude Code additionally reads its own `.claude/CLAUDE.md`. The differences
between the tools are gathered below, in [Codex parity](#codex).

## Where settings live: AGENTS.md and CLAUDE.md

The agents don't hard-code your project's specifics — they read them on the fly from two settings files:

- **`AGENTS.md`** (in the repo root) is your project's main settings file: where tasks live, what language
  to write output in, your rules. This file is shared by both AI tools (Claude Code and Codex).
- **`.claude/CLAUDE.md`** holds rules specific to one of the tools, Claude Code. In particular, the rules
  for the mob: a group of role agents that write code together (during the implementation stage). This
  file pulls in `AGENTS.md` with the line `@./AGENTS.md`, so everything you wrote in `AGENTS.md` applies
  here too.

Start from the templates `templates/AGENTS.template.md` and `templates/CLAUDE.template.md`. In each one,
replace every `{{PLACEHOLDER}}` with your value and remove the `<!-- -->` / `« »` guidance notes (the
installer does this for you if you run it).

## Values the installer asks for

The installer works these out with short questions and fills them in for you. The right-hand column says
what each one affects.

| Placeholder | What it does |
|---|---|
| `OUTPUT_LANGUAGE` | The language of everything the user reads (reports, documents). |
| `AUDIENCE_PROFILE` | Who reads the output — this sets how much explanation to give (for example, a non-technical owner vs a senior engineer). |
| `PROJECT_ONE_LINER` | What the project is and what stack it's built on. |
| `TASK_FOLDER_PATTERN` | Where per-task folders live (for example, `docs/<TICKET-ID>/`). |
| `DOC_BASE_PATH` | The path to your documentation base (a docs tree, a wiki, or an Obsidian vault). |
| `BACKLOG_LOCATION` | The backlog file — the list of tasks treated as the main one. |
| `TICKET_ID_FORMAT` | The format of a task ID, for example `PROJ-123`. |
| `TEST_CMD` / `TYPECHECK_CMD` / `LINT_CMD` / `BUILD_CMD` | Your commands for checking code: tests, type check, linter, build. |
| `LAUNCH_PLAYBOOK_LOCATION` | Where you track the manual actions to do before launch (the launch playbook). |

## Values you fill in by hand (the installer leaves these as `<<TODO>>`)

The installer doesn't guess these. They need your decision, and they are the ones it matters most to get
right. In their place the installer leaves the marker `<<TODO>>` (a placeholder) so you notice it and
fill it in.

- **`PROFILE_C_TRIGGERS`** is the list of your riskiest code: the parts where it's easy to break something
  important, so a task that touches them needs Profile R/C handling and a deeper independent 04b review.
  The placeholder name is kept for compatibility with older templates, but the meaning is risk and review
  depth, not "always run every checker during implementation." List the items below that apply to you,
  plus the exact paths to the modules where they live:
  - sign-in and authorization: who the user is and what they're allowed to do;
  - separation by tenant (a tenant is a separate customer in a shared system; a single-user app has
    none, so skip this one) and working out who is currently signed in;
  - the trust boundary: the places where data arrives from outside and must be validated;
  - secrets and signing;
  - payment;
  - paths where PII travels: a user's private details (name, email, phone).

  This list is what tunes the checks to *your* set of risks: for the code you list here, the agents will
  know that stronger checking is needed.
- **`PERSISTENCE_AND_TENANCY`** is how your data is stored, and how the system works out who the current
  user or tenant is, so it doesn't mix up one party's data with another's.
- **`MIGRATION_POLICY`** is how you make and record changes to the database schema (if you have no
  database, delete this field).
- **`LAUNCH_STAGE_MAPPING`** is which kind of manual action should go into which section of your launch
  playbook.
- **`TRACEABILITY_LOCATION`**, **`CODE_LAYOUT_HINT`**, **`DOC_INDEX_HINT`**, **`DESIGN_SYSTEM_HINT`** are
  optional hints that help the agent find its way around your project (the last one is the path to your
  design system or component library for UI projects). Delete any that don't apply to you.

> Not sure what to put? Don't guess on your own — ask your agent (Claude Code or Codex) to read your code
> and propose the values, then confirm or correct them.

## How serious a found problem is: Class A/B/C/D

At one stage of the pipeline (the gap audit), another agent looks for holes in the finished design with
fresh, skeptical eyes, before any code is written. Each hole it finds goes into one of four classes by
how serious it is: A (blocker), B (recoverable failure), C (small polish), D (theoretical). The rules for
what counts as which class live in `AGENTS.md`, with sensible defaults.

Adjust the Class A examples to your own set of risks. For example, a private internal tool might drop the
compliance wording, while a multi-tenant SaaS (where one system holds many customers' data) should keep
any data leak between tenants as Class A.

<a name="codex"></a>
## Codex parity

Here are the differences between Codex and Claude Code. If you use only one tool, read this section only
when you switch to the other.

- Codex reads `AGENTS.md` directly, so there's no need to pull it in separately.
- The plugin manifest file (it tells the tool which skills and commands exist) lives at
  `.codex-plugin/plugin.json` for Codex and at `.claude-plugin/plugin.json` for Claude Code.
- Skills in both tools use `SKILL.md`, but this repo keeps two trees: `skills/` for Claude Code and
  `codex-skills/` for Codex. They carry the same methodology, but they are not byte-for-byte identical:
  Codex uses numbered stage names and Codex-native wording.
- The biggest workflow difference is stage 04. Claude Code may use the classic multi-agent mob
  implementation. Codex defaults to mono/main-agent implementation with explicit role self-checks, then
  relies on the independent `04b_loop_review` stage as the quality backstop.
- The wave profile in Codex is a risk/review-depth signal, not simply a list of subagents to launch while
  coding. Bounded work can stay main-agent-only in 04; risk-heavy work gets deeper 04b; maximum-risk work
  may still use the full classic multi-agent implementation when the operator deliberately chooses it.
- Tool-native role agents use separate trees: Claude Markdown roles live in `agents/`; Codex TOML roles
  live in `codex-agents/`. The shared `tms_*` role intent stays aligned even though the file formats and
  model controls differ.

### Installing the skills and agents for Codex

Codex has no command like `/plugin install`, so the files need to go into `~/.codex` either by hand or
semi-automatically:

- **Semi-automatically:** run `npx tms-pipeline`, answer "yes" to the question "Do you use Codex?" and
  agree to the copy. The installer then copies `codex-skills/` → `~/.codex/skills/` and `codex-agents/` →
  `~/.codex/agents/`. If you don't use Codex, the installer leaves the `~/.codex` directory alone.
- **By hand:** `cp -R codex-skills/* ~/.codex/skills/ && cp -R codex-agents/* ~/.codex/agents/`.

The installer preserves existing project templates, skills, commands, and agent-role files. Pass
`--force` only when you intentionally want the packaged versions to replace local customizations.

For stage-by-stage model choices, see [model routing](06-model-routing.md).

`AGENTS.md` stays in the project root either way (the installer writes it), and Codex reads it directly.
