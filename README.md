```text
████████╗███╗   ███╗███████╗
╚══██╔══╝████╗ ████║██╔════╝
   ██║   ██╔████╔██║███████╗
   ██║   ██║╚██╔╝██║╚════██║
   ██║   ██║ ╚═╝ ██║███████║
   ╚═╝   ╚═╝     ╚═╝╚══════╝
```

# tms-pipeline

**tms-pipeline is a discipline for AI agents: it takes one already-defined task from a ticket to reviewed code, keeping the agent's context clean at every step.**
The work is split into nine durable artifacts. You run each stage as a separate command to the agent (such a command is
called a *skill* here — for example, `/tms-research`). The call at every step stays yours: the agent does
one step, you check it, and only then do you move on (this is the "human in the loop" principle —
a person reviews every step).

🇷🇺 [Читать по-русски](README.ru.md) · 📖 [Full methodology](docs/00-methodology.md) · 🚀 [Getting started](docs/01-getting-started.md)

---

## In short

- **What it is.** A nine-artifact process that takes **one already-defined** task from a ticket to reviewed
  code. The core idea: at each step the agent holds in mind only what it needs right now.
  (The agent has a limited working memory — its *context window*; the more clutter in it, the worse the answer.)
- **The real work is thinking on paper.** All nine durable artifacts are text documents (`.md`). The main
  code change is written alongside 04 (implementation), and 04b may make review fixes against the actual
  diff. You work everything out in text first, and write code only after that.
- **You stay at the center the whole time (a person reviews every step).** This is not "set a task and walk
  away": after each step the agent stops, you check what it did, and only then launch the next one. You
  don't delegate the work wholesale — you steer the agent and verify each step.
- **What it isn't.** It does not generate a product, invent features for you, or act as a "magic button."
- **One command.** `npx tms-pipeline` sets the process up on top of your **existing** repo.
- **See it live.** [A full task run through the staged pipeline →](templates/example-task/ACME-101/) — a synthetic
  task from `00_ticket.md` to `06_review_gate.md`, so you can see each step's format before you start.
- **Under the hood.** [How each step works: which agents, on which models, and why →](docs/04-stages-deep-dive.md)

---

## What this is — and what it is NOT

**It is** a process for taking one task all the way to finished code: it picks up an already-defined task
("we need to do X") and carries it to reviewed code you can merge into the main branch, keeping the AI
agent's working memory (context) clean at every step.

**It is NOT:**

- ❌ a project generator — it does not build an app from nothing;
- ❌ a feature brainstorm — deciding *what* to build is your call, made your way; the process starts once a
  task exists;
- ❌ a magic "build my product" button.

**Prerequisites.** You should already have: a real code repository, a documentation base (a docs tree, a
wiki, or an Obsidian vault — anywhere durable knowledge about your product lives, as long as it's a stable
home for it) and, ideally, a backlog — a list of future tasks. The included blank templates give you a
starting structure, but filling them with real product decisions is your job.

---

## No documentation base yet? Do the one-time setup first

tms-pipeline expects you to already have a documentation base and at least one task in the backlog — it
takes defined tasks to code, it doesn't invent the product. If you're starting from nothing, do this
**one-time initial setup** to reach the starting line. This is a one-off setup activity, not one of the nine stages
of the process and not an automated brainstorm: you define the product; the agent only asks questions and
sorts your answers into documents.

How to tell whether you need this step: **no documentation base or tasks yet → do the setup (below). You
already have them → skip this section** and go straight to Install.

The simplest path is the **`/tms-new`** skill (recall: a *skill* is a command like `/tms-new` that you give
the agent). It runs this setup for you as an interview (one question at a time, each with a recommended
option) and, at the end, creates a starter document set and folder structure. Prefer to do it by hand? Use
the prompt below:

> Let's define the **MVP documentation** for the product **<product>**. The idea is **<core idea>**; the
> goal is **<outcome>**.
> Ask me questions **one at a time**, each with 2–3 concrete options, and **mark the recommended option**.
> I'll answer; when you have no more questions, produce an **initial MVP documentation set** — only what's
> already decided, meant to be filled in further as development progresses.
> Sort every decision from my answers into the folders of the tms-pipeline documentation-base template
> (`00 Governance/`, `02 Product/`, `03 Architecture/`, `04 Delivery/`), and keep the whole codebase and
> documentation **in sync with my vault documentation** as the single source of truth.

What this gives you:

- An **initial MVP documentation set** filled with your decisions, not the agent's guesses. It's a living
  foundation: you grow it as development progresses, not a one-off document.
- Questions **one at a time, with the recommended answer highlighted** — so you can move fast by accepting
  the defaults or pushing back.
- Every result **sorted into the documentation-base template folders** (first copy
  `templates/docs-vault/PROJECT_NAME/` into your documentation base — see
  [docs/03-doc-base.md](docs/03-doc-base.md)) and **kept in sync with it**. This base becomes the main
  document everything else is later checked against.

Once you have this baseline doc set and at least one task in the backlog, run `npx tms-pipeline` and start
the process as usual (below). From then on, the documentation base keeps growing: **after each task is
done, its result and decisions are folded back into the right documents**, so the base always reflects what
was actually built (see [Documentation Discipline](docs/00-methodology.md) and the review gate).

---

## Why it exists: context control

Generic prompts ("build the feature, no bugs") don't scale. When everything is dumped into one prompt — the
description, the chat history, the requirements, past attempts — the agent gets confused, loses the early
instructions, and writes buggy code. The more clutter in its working memory (context), the worse the result.

The fix is to **split the work into steps** and make each step's output a narrow input for the next one,
stripped of everything irrelevant. At each step the agent gets exactly what it needs and is bound by your
project's standards. Quality depends on how clean a context the agent gets at each step.

→ Full reasoning: [docs/00-methodology.md](docs/00-methodology.md).

---

## The pipeline steps

```
00_ticket → 01_research → 02_design → 02b_gap_audit → 03_delivery_plan → 04_implementation → 04b_loop_review → 05_test_report → 06_review_gate
```

```mermaid
flowchart LR
  T["00 ticket"] --> R["01 research"] --> D["02 design"] --> G["02b gap audit"]
  G --> P["03 plan"] --> I["04 implement"] --> L["04b loop review"] --> TE["05 test"] --> RG["06 review gate"]
```

There are nine durable artifacts in the normal chain. Step 02b (the gap audit) sits between design and
planning; step 04b (the loop review) sits between implementation and the test report.

Each step creates one document in the task folder and, by default, stops so you can confirm the move to the
next one. At that stop you read the step's document, review it, and correct it if needed before the agent
goes on (that's exactly how an error is caught in text, not in finished code). There is **no**
brainstorm/ideation step — the process starts once a task exists.

A few terms in the table below appear here for the first time; we gloss them right in the cells and explain
them in full on the next pages:

| Step | Skill | What it does |
|------|-------|--------------|
| 00 Ticket | `/tms-ticket` | Records who is asking for the task and why (the driver), its scope, acceptance criteria, and task mode. |
| 01 Research | `/tms-research` | Narrows the codebase to facts ("how it is now") through a bounded parallel search. |
| 02 Design | `/tms-design` | Writes the design contract — a description of the change agreed up front, which the code is later checked against; the change is the smallest one that does the job, reviewed before any code. |
| 02b Gap audit | `/tms-gap-audit` | One bounded pass where a different agent looks at the design with fresh, skeptical eyes, hunts for holes, and rates each one by severity. |
| 03 Plan | `/tms-plan` | Splits the work into small finished slices — "waves"; for each, it sets a risk profile and the depth of review needed after implementation. |
| 04 Implement | `/tms-implement` | Writes the code wave by wave. In Codex this defaults to one main agent with explicit role self-checks; maximum-risk work can still use the full classic mob. |
| 04b Loop review | `/tms-loop-review` | Independently reviews the implementation diff, fixes actionable findings, and records the review loop before the test report. |
| 05 Test | `/tms-test` | Validates the primary (user-visible) signal + secondary ones. |
| 06 Review gate | `/tms-review` | Checks the result against the design contract and returns a verdict: go (ship), conditional_go (ship once conditions are met), no-go (do not ship). |

→ What exactly happens in each step (which agents, on which models, where your check is) — in the
[under-the-hood step walkthrough](docs/04-stages-deep-dive.md).

Plus extra skills for working on a codebase: a four-step **audit** (`/tms-audit-scope` → `sweep` →
`triage` → `backlog`), maintenance **refactoring** (`/tms-care-refactoring`, `/tms-ui-refactoring`), and an
iterative **review loop** (`/tms-loop-code-review`).

---

## Three things most agent processes don't have

1. **A gap audit that rates how serious each hole is.** Before any code is written, a different agent
   deliberately hunts for holes in the design — and looks at it from a different angle than the one who
   wrote it. Each hole found goes in one class: **A** (blocker), **B** (recoverable failure), **C** (small
   polish), or **D** (theoretical). There are explicit rules against inflating the list and criteria for
   when to stop. A wrong design gets fixed in text, not in code.
2. **Risk profiles that decide where quality is bought.** Each implementation wave gets a risk profile:
   **M** for small bounded work, **E** when cheap evidence gathering is useful, **R** when the touched
   surface needs strong independent review, and **C** when full classic multi-agent implementation is
   deliberately allowed. In Codex, ordinary stage 04 work stays with the main agent and explicit
   self-check roles; the expensive independence moves to 04b, where a fresh reviewer checks the actual
   diff. Risky waves carry a concrete handoff seed from 03 into 04 and 04b: invariants, required proof,
   owner layer, failure signal, and the adjacent surfaces to search. Heavy review only kicks in where it
   pays off; "run everything to be safe" is explicitly discouraged.
3. **Nothing found gets lost.** Deferred items found along the way (follow-ups), documentation drift, and
   manual pre-launch actions are captured by a hard rule. Each finding has a table for where to send it: to
   the backlog (the list of future tasks), to the source document, to the launch playbook (the list of
   manual steps before a rollout), or to an ADR (a short record of an architecture decision: what was
   decided and why). And the backlog itself is kept in order by a "bundle findings, don't shard them" rule.

→ Details: [docs/00-methodology.md](docs/00-methodology.md).

## The process is sized to the task

In heavyweight processes, a one-line change gets buried in needless ceremony. Here the agent first sets the
task mode — **Direct** (cosmetic, a small fix), **Investigation** (the cause of the problem is still
unclear), or **TDD-first** (real behavior changes, so you write a failing test first, then write code until
the test passes). The full heavy machinery only kicks in for substantial work.

---

## Two ways to adopt it

The result is the same — the only difference is how much you do by hand.

- **Turnkey — right for most people.** Run `npx tms-pipeline`, answer a short list of questions (Enter
  accepts the default), and the installer (a terminal program, not an agent) writes `AGENTS.md` and
  installs the skills for you. `AGENTS.md` is your project's settings file, which the agents read to learn
  your rules. Take this path if you want to start working today without digging into how it's built.
- **Manual — if you want control.** Read the methodology, install the skills, and write `AGENTS.md`
  yourself. Take this path if you want to understand every detail and tune the process for your team.

---

## Install

Claude Code and Codex are two AI tools (the programs the agents run inside). The skills and the whole
process work in both; you need only one of the two. The installer asks which tool(s) you use and writes
only what's needed (for example, it won't create `.claude/CLAUDE.md` if you only use Codex).

```bash
# 1) Set the process up ON YOUR existing project (short y/n wizard; asks about Claude/Codex)
npx tms-pipeline
```

```text
# 2a) Claude Code — install the skills + agents. Two ways, pick ONE (to avoid duplicates).
#     Way (a) is handier if you want to update with one command; way (b) is for when you'd rather
#     the files just sit in your ~/.claude.
#   (a) via the plugin marketplace:
/plugin marketplace add TmsNine/tms-pipeline
/plugin install tms-pipeline@tms-pipeline
/reload-plugins
#   (b) or let the installer copy them in: at the "Install the tms-* skills … Choose where" step pick 1
#       (Claude Code) → skills/agents/commands land in ~/.claude, then restart Claude Code.

# 2b) Codex — reads AGENTS.md natively. Codex has no /plugin install equivalent, so its skills/agents
#     go in ~/.codex. At the same installer step pick 2 (Codex) and it copies them. By hand:
#       cp -R codex-skills/* ~/.codex/skills/ && cp -R agents/* ~/.codex/agents/
#     More: docs/02-configuration.md#codex
```

> The installer installs only what you select: answer "no" to Claude Code and no `.claude/CLAUDE.md` is
> created; the "Choose where" step (1 Claude / 2 Codex / 3 both / 0 skip) decides where the skills land.

---

## Tutorial — how to actually use it

### Step 1 — Onboard your project

Run `npx tms-pipeline` (or `/tms-init` inside Claude Code) and answer the short list of questions (Enter
accepts each default). The installer writes a filled `AGENTS.md` and `.claude/CLAUDE.md` into your project,
and can copy the blank templates for the process documents and the documentation base.

### Step 2 — One-time configuration

Open the generated `AGENTS.md` and:

- resolve the `<<TODO: ...>>` markers (these are intentional placeholders in the settings file that you
  fill in for your project) — first of all **`PROFILE_C_TRIGGERS`** (which parts of the code should trigger
  Profile R/C risk handling and deeper 04b review) and your access model: does the system have separate
  customers whose data must not be mixed (tenants), and how it determines who is in front of the system;
- if you copied the blank documentation-base templates, **rename the `PROJECT_NAME` folder** to your
  project's name and put the path in `DOC_BASE_PATH`.

> **Not sure what to put in a `<<TODO>>`?** Don't guess alone: ask your AI agent (Claude Code or Codex) to
> read your code and propose values, then confirm or correct them. This is the intended way to fill in the
> configuration — it's by design.

→ Reference: [docs/02-configuration.md](docs/02-configuration.md).

### Step 3 — Run one task through the process

Pick a task from your backlog and walk all the steps. The agent does one step and stops for your OK:

```text
/tms-ticket    ACME-123     → writes 00_ticket.md    (driver, scope, acceptance, task mode)
/tms-research  ACME-123     → writes 01_research.md   (the facts; may interview you)
/tms-design    ACME-123     → writes 02_design.md     (the design contract — you review it)
/tms-gap-audit ACME-123     → writes 02b_gap_audit.md (A/B/C/D gaps; Class A fixed into the design)
/tms-plan      ACME-123     → writes 03_delivery_plan.md (waves + risk profiles)
/tms-implement ACME-123     → writes 04_implementation.md (implementation log + self-checks)
/tms-loop-review ACME-123   → writes 04b_loop_review.md (independent review/fix loop)
/tms-test      ACME-123     → writes 05_test_report.md (primary + secondary signals)
/tms-review    ACME-123     → writes 06_review_gate.md (go / conditional_go / no-go)
```

After each step a file appears in the task folder (`docs/ACME-123/`). Read it, confirm or correct it, then
run the next step.

> **Start each step in a clean context window** (that is, clear the agent's working memory before you run
> it). This is the whole idea of context control: the next step should get only the previous step's
> document, not the accumulated noise of the conversation. Each skill reminds you of this at the end.
> Before running the next step:
> **Claude Code** → `/clear`; **Codex** → `/clear` (or `/new`). Then run the next `/tms-*` command.

Ask the agent to "run it end to end" only for small tasks, where keeping one context is cheaper than the
gain from clearing it.

### Step 4 — Where things land

- Code changes: in your repo, committed (no AI listed as the author, and not pushed to the server
  automatically). The code stays on a separate branch and waits while you review it and CI runs — the
  automatic build and tests on the server.
- Deferred items found along the way (follow-ups): new backlog rows, grouped into bundles.
- Manual pre-launch steps: your launch playbook.

### FAQ

- **Do I need both Claude Code and Codex?** No — either one works. Skills are portable; Codex reads
  `AGENTS.md` natively.
- **Can I skip steps?** For small tasks, yes: the task mode (Direct/Investigation) trims the process, and
  the gap audit can be skipped for very small changes — the file is marked "skipped per minimal-surface
  exception", but the empty placeholder file is still created.
- **The design came out wrong — what do I do?** That's exactly the point of steps 02/02b: fix it in the
  text and re-run. It's cheap while no code exists yet.
- **Will it invent features for me?** No. Bring your own task; the process takes it to code.

---

## Repository layout

```
skills/        Claude Code tms-* skills (setup + process + audit + refactoring)
codex-skills/  Codex tms-* skills with Codex-native names and instructions
agents/        5 mob roles (developer, tester, architect, security, reviewer)
commands/      the /tms-init onboarding command
installer/     the core config engine + the `npx tms-pipeline` installer
templates/     AGENTS/CLAUDE templates, process document forms, blank documentation-base templates, an example task
docs/          methodology + getting started + configuration + documentation base + the under-the-hood step walkthrough
```

---

## Sources & credits

This project synthesizes and builds on the work of others:

- **The core single-task methodology** — adapted from the video
  ["Why AI generates garbage — and how to make it write decent code"](https://youtu.be/7oRBHxMvWxQ)
  by **Dmitry Bereznitsky (Дмитрий Березницкий)**, which lays out the context-control approach and the
  four-phase process (research → design → planning → implementation) with a team of agents (a mob) and
  quality gates that the work cannot pass until every check is green.
- **The four-step codebase audit** (`/tms-audit-scope` → `sweep` → `triage` → `backlog`) — adapted from
  ideas by [di.sukharev](https://www.instagram.com/di.sukharev/) and turned into skills here.
- **The `AGENTS.md` canon** — parts draw on the `AGENTS.md` format and conventions by **Boris Cherny**.

Everything else (the extension to nine durable artifacts, the gap audit with severity ratings, the risk
profiles and 04b review loop, the capture of follow-ups and manual pre-launch actions, and the packaging
itself) is original to this project.

## License

[Apache-2.0](LICENSE). Free to use and adapt. Treat the process as a living thing — change the step names,
the risk triggers, and the prompts to fit your team's culture; what matters is the principle: control the
context at every step and put independent review where it checks the real result.
