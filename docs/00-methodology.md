# The tms-pipeline methodology

> Deep dive. For a quick overview see the [README](../README.md); Russian readers see
> [00-methodology.ru.md](00-methodology.ru.md).

tms-pipeline is a discipline for AI agents that write code (Claude Code, Codex, and compatible tools —
you need only one of them). It takes a single already-defined task from a ticket to reviewed code that is
ready to merge into your main branch, keeping the agent's working memory clean at every step. In other
words, it is a process for getting a task to finished code — not a magic button.

So it is **not** a project generator and it does **not** invent features for you: deciding *what* to build
stays with you. For more on those boundaries, see "What this is / is NOT" in the [README](../README.md).

A few terms will be useful throughout this document:

- A **skill** is a command like `/tms-01-research` that you give the agent to run one step of the work.
  The delivery pipeline is eight stage skills, `tms-00-ticket` → `tms-06-gate`, plus one orchestrator,
  `tms-run`, that carries a task through them.
- The agent's **context window** is its working memory: everything it can see and hold at once. That
  memory is limited, and the more clutter in it, the worse the answer.
- Your **documentation base** is where lasting knowledge about your product lives — a docs tree under
  `docs`, a wiki, or a notes vault.
- The **owner** is you: the person who decides what the product does. The **lead** is whoever runs the
  pipeline on your behalf — in practice the chat where `tms-run` is running.

---

## 1. The core principle: context engineering

Generic prompts ("build this feature, no bugs") do not work. When everything is dumped into one big
prompt, the agent gets confused: it loses the early instructions, stops holding the whole picture, and
ends up writing tangled code with bugs — sometimes with security holes.

The fix is **strict decomposition**: break the work into stages so that the output of each stage becomes
the **narrow, noise-free input** for the next. Quality depends on how clean the context is that the agent
gets at each step — not on how "smart" the model is on its own.

Two rules carry the whole pipeline:

- **One fresh context per stage.** Each stage starts from its input document and the ticket — never from
  the previous conversation. A stage that inherits the reasoning of the one before it inherits its blind
  spots. The one deliberate exception is the plan (stage 03): it is written by the design agent, resumed
  after your approval, because that agent already holds the code it read. The plan gets its independence
  from a cold reader instead (section 4).
- **The brief carries addresses, not opinions.** The orchestrator hands each stage the task ID, the
  working copy, the skill to run and the paths of its input documents — never its own reading of the
  problem, a suspected cause or a proposed fix. An agent handed a hypothesis hands it back confirmed.

---

## 2. The delivery stages

There are eight stages. Each one runs in its own fresh context and produces exactly one document in the
task folder (`docs/<TASK-ID>/`, or wherever you set `TASK_FOLDER_PATTERN`). Only stage 04 writes product
code; 04b may make review fixes against the actual diff. **Most of the pipeline is thinking on paper.**

| # | Stage | Skill | Output | Who stops |
|---|-------|-------|--------|-----------|
| 00 | Ticket | `/tms-00-ticket` | `00_ticket.md` | — only you decide that a task exists |
| 01 | Research | `/tms-01-research` | `01_research.md` | — |
| 02 | Design | `/tms-02-design` | `02_design.md` | **You read and approve it** (stop 1) |
| 03 | Plan | `/tms-03-plan` | `03_plan.md` | **The lead signs it**, with a date |
| 04 | Implementation | `/tms-04-implement` (a screen: `/tms-ui-screen`) | code + `04_implementation.md` | — |
| 04b | Code review | `/tms-04b-review` | `04b_review.md` | — |
| 05 | Test report | `/tms-05-test` | `05_test_report.md` | — |
| 06 | Gate | `/tms-06-gate` | `06_review_gate.md` | **You decide** (stop 2) |

`/tms-run <TASK-ID>` runs the chain for you: it prepares the working copy once, dispatches each stage as
its own subagent, collects the document, checks that its required sections are filled, and stops at the
checkpoints. You can also run any single stage by hand; it then writes its document and stops.

There is no brainstorm stage. Deciding *what* to build is your job; the pipeline starts once a task
exists. For a brand-new product there is a one-time bootstrap, `/tms-new`, that interviews you and lays
down a starting documentation set.

→ What goes into each stage, what comes out and which failure it prevents — in
[04-stages-deep-dive.md](04-stages-deep-dive.md).

---

## 3. Two owner stops and the lead's signature

You are asked twice, and only twice:

1. **After design (02).** This is the cheapest place to change your mind: fixing a paragraph costs a
   sentence, fixing shipped code costs a rewrite. Design is mandatory for every task, even a one-line fix
   — a task that looks trivial is exactly where an unplanned tool or a wrong layer sneaks in.
2. **At the gate (06).** You decide: `go`, "fix first" or "not now".

Between them, **the lead signs the plan (03)**, with its date. You do not review plans: the plan is a
technical document, and the lead reads its file-by-file list before any code is written.

Two refinements keep you from being asked too much or too little:

- **Product forks come to you at design, before a solution is picked.** When two defensible choices
  change what a person using the product sees, can do or must recover from, the design stage asks you one
  question at a time — with an everyday scenario, plain options and a recommendation. Internal
  architecture is the agent's own call and never becomes your question.
- **The lead may sign `conditional_go` at the gate** when only execution is left — a live check, a
  rollout, a runbook step — naming the launch-playbook document that closes it. The gate still comes to
  you when there is a product fork, an irreversible or outward-facing action, a risk to users' data or
  money, a `no_go`, or the task needs work from you. Only a human ever writes `go`.

Silence is never approval. No agent approves on your behalf or runs the next stage "to save time" while
waiting.

---

## 4. One executor, decomposed along seams

Stage 04 is carried by **one executor for the whole plan** — the stage agent itself, phase by phase, test
first. It does not hand phases out to developer subagents. Two reasons:

- **Coordinators cost more than the workers they coordinate.** A lead that "does not write code" re-reads
  the plan, the briefs and every report on every step, and re-reading context is where most of the spend
  goes.
- **A defect between two individually correct phases is invisible inside either of them.** A task can
  lose its entire user-visible outcome because the question "which phase sends the value the next step
  depends on" belonged to no phase. One executor holds both ends of every seam by construction.

Delegation stays for work that is genuinely bulk and independent: many items of an enumerable set in
research, fan-out search, running checks, the occasional mechanical rename across dozens of files.

The plan makes the single executor safe with four checkable devices:

- **File Ownership is a hard boundary.** The plan lists every file stage 04 may create or change,
  including tests, fixtures, migrations and any tooling. A file that is not on the list is not written —
  and neither is a tool, script or generator that is not on it. If implementation finds it needs one, it
  stops and asks. A two-minute question instead of a review round.
- **Decompose along seams, not along files.** File Ownership says what a phase writes; a **seam** is what
  one phase assumes another will do. The plan's seam table names every hop of the path traced in research
  and the phase that owns it. A hop owned by no phase is a defect of the plan. The executor, the reviewers
  and the end-to-end pass all check the same list.
- **Read the consumer, never the producer.** Before signing, the lead reads one file end to end: the one
  that *receives* what the task produces — the caller, the entry point, the screen. Producers are covered
  by their own phase's tests; the consumer is where an assumption lands with nobody checking it.
- **Every phase has an exact RED-test specification.** The plan is finished when each phase's first test
  could be written from the plan alone and its only reason to fail is that the product code does not exist
  yet. Any other reason exposes a missing definition or a contradiction — fixed in the plan, before code.
  A fresh reader who did not write the plan checks it against itself before the lead signs.

When the task touches a security trigger (authentication, roles, tenant scope, money, personal data and
the like — listed in `AGENTS.md` → *Security Triggers*), stage 04 runs **one** security pass over the
assembled diff, plus at most one re-check of what it made the executor change. There are no per-phase
escorts.

A change to a **screen** does not go through `tms-04-implement`: for it, stage 04 is `tms-ui-screen`, the
one skill that opens the design system and the accepted screens.

---

## 5. What happens to a finding

A reviewer has no cost function: it is rewarded for finding, never for shipping, so there is always one
more edge case. Limiting passes alone does not fix that; defining what a finding *does* fixes it.

In stage 04b **a finding blocks only when it has both** a path that reaches it on the current code and a
consequence a person using the product observes — wrong data, a lost message, a refused action, money or
access going astray. Blocking findings are fixed in the review loop, with no question to you.

Every other finding takes exactly one route, chosen by the review stage itself — never handed to you as a
list to sort:

| Kind | Route |
|---|---|
| Reproducible, the fix is small and inside File Ownership | **Fixed now** |
| Real and will get in the way of ordinary work soon, but does not block this task | **Backlog proposal** — one line at the gate; you answer yes or no |
| Matters only when a named, noticeable event happens | **One row in the trigger register**, with that event as its trigger |
| Preference, style, no concrete risk | **Dropped**, with the reason written down |

Nothing is left unrouted, and nothing becomes a launch blocker merely by being written down. The same
spirit covers the closure: human-only steps (migrations, environment, live checks) go to the launch
playbook with exact commands and a failure cue; approved follow-ups go to the backlog. Nothing
discovered gets lost, and nothing slips into the current task unasked.

---

## 6. A positive stopping rule at the gate

A review loop that ends "because reviewers stopped finding things" has learned something about the
reviewers, not about the work. So the loops have explicit ends, and the gate demands positive proof:

- **04b** runs up to **five** fresh, independent, read-only reviewer passes and stops earlier on
  **stagnation** — two consecutive passes with no change to product files and only repeated, rejected or
  non-blocking comments. One pass always walks the whole path end to end and is briefed to **prove it
  works**: it either quotes the line that supplies each value at each hop, or names the hop where it
  breaks. A screen also gets a visual pass beside the accepted baselines. Reaching the limit never sends
  the task back to design.
- **05** runs every validation row of the plan, records both the exit code and whether the expected
  marker appeared, and names what was not run instead of omitting it.
- **06** starts by naming the run that shows the task's own outcome happening — the command, the click,
  the log line and what it returned. If there is none, the condition that would produce it *is* the
  `conditional_go`, written at the top of the page. "Reviewers find nothing more" is not proof.

Delivery review has no numeric grade and no reviewer verdict. The only decision is the gate, and it
belongs to you (or, for `conditional_go` only, to the lead).

---

## 7. Model and effort are pinned per role

You never switch model or effort by hand. In Claude Code every stage agent and role agent pins its own
model, by full model ID, and its effort:

| Agent | Tier | Effort | Used for |
|---|---|---|---|
| `tms-stage` | top | medium | 01, 04, 04b |
| `tms-stage-deep` | top | high | 02, then 03 (resumed) |
| `tms-stage-light` | cheaper | medium | 05, 06 |
| `tms-reviewer`, `tms-security`, `tms-architect` | top | high | review passes, security |
| `tms-developer` | top | medium | bounded fixes |
| `tms-explorer` | cheaper | medium | research fan-out |
| `tms-tester` | cheaper | low | named checks |

Stages are always dispatched by their named agent type — never as a general-purpose agent, which silently
inherits whatever the chat runs on, and never pinned by a short alias, which can resolve to different
models over time. Effort, not a weaker model, is the first lever: medium for routine stages, high where
judgement is the product. Codex has no stage agents — there stages run on the session default — but its
role agents pin model and reasoning effort the same way. Exact model IDs and how to change them:
[06-model-routing.md](06-model-routing.md).

---

## 8. The audit pipeline is a separate thing

The eight stages deliver **one task**. Auditing a **whole codebase** for accumulated defects and debt is a
different job with a different shape, and it has its own four skills: `tms-audit-scope` →
`tms-audit-sweep` → `tms-audit-triage` → `tms-audit-backlog` (in Codex: `tms-90-audit-scope` …
`tms-93-audit-backlog`). The audit freezes a snapshot, sweeps it zone by zone with a finder and a
skeptic, classifies findings on its own A/B/C/D rubric, stops for you after triage, and ends by mapping
each approved finding into the backlog. Those classes belong to the audit only; delivery review has none.

Two refactoring skills sit beside it, outside the delivery chain: `tms-care-refactoring` (a small,
behaviour-preserving maintenance refactor, where "no changes needed" is a valid result) and
`tms-ui-refactoring` (moving visual styling into reusable components). Details in
[04-stages-deep-dive.md](04-stages-deep-dive.md).

---

## 9. Why this beats a single mega-prompt

- **Each step sees only what it needs.** The design agent reads the research, not the whole repository;
  the reviewer reads the diff, not the implementer's reasoning.
- **Mistakes are caught where they are cheapest.** A wrong layer is a sentence at design, a missing
  contract is a line in the plan, a broken seam is a quoted line in 04b — not a production incident.
- **You are asked at the two moments that matter** and nowhere else, with plain questions and a
  recommendation.
- **Scope cannot grow silently.** File Ownership turns "while I'm here" into a question.
- **The pipeline stops on evidence**, not on reviewer fatigue.

Next: [01-getting-started.md](01-getting-started.md) to install it, and
[02-configuration.md](02-configuration.md) for the project config the skills read (a starter lives in
[templates/AGENTS.template.md](../templates/AGENTS.template.md)).
