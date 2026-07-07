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

- A **skill** is a command like `/tms-research` that you give the agent to run one step of the work. The
  delivery pipeline is a sequence of stage skills, with `04b_loop_review` between implementation and the
  test report.
- The agent's **context window** is its working memory: everything it can see and hold at once. That
  memory is limited, and the more clutter in it, the worse the answer.
- Your **documentation base** is where lasting knowledge about your product lives — a docs tree under
  `docs`, a wiki, or an Obsidian vault.

---

## 1. The core principle: context engineering

Generic prompts ("build this feature, no bugs") do not work. When everything is dumped into one big
prompt, the agent gets confused: it loses the early instructions, stops holding the whole picture, and
ends up writing tangled code with bugs — sometimes with security holes.

The fix is **strict decomposition**: break the work into stages so that the output of each stage becomes
the **narrow, noise-free input** for the next. In practice that means two simple things. At every step
the agent is given exactly the facts it needs right now (and nothing more), and between steps you review
the output before it goes on. Quality depends on how clean the context is that the agent gets at each
step — not on how "smart" the model is on its own.

This idea has a well-known four-phase shape — **Research → Design → Planning → Implementation**. At the
implementation phase the code is worked on not by one agent but by a **mob**: a group of role agents
working together, like pair programming but with several agents. Between pieces of work sit **gates**: the
work does not move on until every check is green. tms-pipeline takes that foundation and hardens it into
staged delivery, adds a design audit that rates how serious each problem is, a way to avoid calling extra
checkers on simple tasks, and explicit rules so work discovered along the way is never lost.

> **You review every step (human in the loop).** This is not an autopilot. At every stage you review the
> agent's output before it proceeds: you don't hand off the work wholesale — you steer the agent and
> verify each step. This rule runs through every stage, from the ticket to the final code review.

---

## 2. The delivery stages

There are nine durable artifacts in the normal chain. Stage 02b (the gap audit) sits between design and
planning; stage 04b (the loop review) sits between implementation and the test report.

It helps to see where the work goes up front: **most of the pipeline is thinking on paper.** Every stage
produces a durable text document (`.md`). The main code change is written in stage 04 (implementation);
stage 04b may make review fixes against the actual diff. By the time the agent sits down to write code,
the design has already been thought through, checked, and agreed in text.

Each stage produces exactly one durable document in the task folder (`docs/<TICKET-ID>/`, or wherever you
set `TASK_FOLDER_PATTERN`). Stages run one at a time; by default the agent stops after each and waits for
your confirmation (you can ask it to run end-to-end).

A few terms from the table below are explained in full later on; briefly: the **task mode** is how heavy a
process this task needs (section 4); the **design contract** is a description of the change agreed up
front that the code is later checked against (section 3.1); a **wave** is a small slice of the task
finished on its own, apart from the rest; the **risk profile** says how much evidence, implementation
support, and independent 04b review the wave needs (section 3.2).

| # | Stage | Skill | Output | What happens |
|---|-------|-------|--------|--------------|
| 00 | Ticket | `/tms-ticket` | `00_ticket.md` | Capture the driver (why we are doing the task at all), the scope, and the acceptance criteria; confirm the task exists in the backlog; classify the task mode (see section 4). |
| 01 | Research | `/tms-research` | `01_research.md` | Narrow the codebase to the facts that matter right now ("as-is"): several agents search in parallel, the lead re-verifies. No opinions, no refactor advice. |
| 02 | Design | `/tms-design` | `02_design.md` | Write the design contract — an agreed description of the minimal sufficient change at the owning layer (the place in the code where the problem is actually fixed at its source). Reviewed by a human before any code. |
| 02b | Gap audit | `/tms-gap-audit` | `02b_gap_audit.md` | One bounded pass in which a different agent looks at the design with fresh, skeptical eyes, hunts for holes, and sorts each one into a severity class. |
| 03 | Delivery plan | `/tms-plan` | `03_delivery_plan.md` | Split the design into small, independently shippable waves; tag each with a risk profile and the required 04/04b checks. |
| 04 | Implementation | `/tms-implement` | code + `04_implementation.md` | Write the code wave by wave. Codex defaults to main-agent implementation with explicit role self-checks; maximum-risk work can still use the full classic mob. |
| 04b | Loop review | `/tms-loop-review` | `04b_loop_review.md` | Resolve the task diff, run an independent review/fix loop, and record the acceptance signal before the test report. |
| 05 | Test report | `/tms-test` | `05_test_report.md` | Validate the primary (user-visible) signal plus secondary signals (tests, types, lint, build). |
| 06 | Review gate | `/tms-review` | `06_review_gate.md` | Check the implementation against the design contract; issue a verdict: go (ship), conditional_go (ship once conditions are met), or no-go (do not ship). |

There is no brainstorm stage and no ideation stage. Deciding *what* to build is your job, done your way;
the pipeline starts once a task exists.

→ A detailed walkthrough of each stage — which agents take part, on which models, and where exactly your
check is — in [docs/04-stages-deep-dive.md](04-stages-deep-dive.md).

### Staged execution
If you start a task by ticket ID, the agent completes only the requested stage, then stops for your
confirmation. It will not jump from research or design straight into code, nor from implementation into
testing or review, without your go-ahead.

### The research interview
After research, if the work surfaces real product or operational choices (for example: whether to release
a feature to everyone at once or in stages; what to do with old data), the agent asks you an interview
**in chat** before design. It phrases the questions for whoever will answer them (that is, for you): with
plain-language options and a recommendation. Unanswered questions are never written silently into the
design as if the decision had already been made.

---

## 3. Three things most agent pipelines don't have

These are the parts worth adopting even if you keep your own stage names.

### 3.1 Severity-rated gap audit (stage 02b)

Most pipelines go design → code → review. tms-pipeline inserts a **gap audit** between design and code: a
separate pass in which a different agent looks at the finished design with fresh, skeptical eyes and hunts
for holes — all of this **before any code is written**. What matters is that this agent looks at the
design from a different angle than its author: each pass picks one angle (security, or concurrency, or UX,
or operations, or data integrity, or privacy) and rotates it from task to task. Every hole it finds is
sorted into exactly one severity class — with explicit rules against inflating severity:

- **A — Blocker:** data loss, a security breach, a privacy or legal violation, duplicate production data,
  an integrity violation, or anything that blocks launch. Fixed inline in the design before planning.
- **B — Incident:** a recoverable production incident (a stuck job, a missed notification, an incomplete
  rollback). Fixed in the design, or passed to the plan with a note on how to handle it.
- **C — Polish:** UX roughness, incomplete localization (i18n), a missing metric or runbook (the
  instructions to follow when something breaks). Captured in the backlog as *bundled* tickets.
- **D — Theoretical:** unlikely, or breaks almost nothing. Backlogged only if the fix is obvious and
  cheap; otherwise dropped with a one-line reason.

So that the audit never turns into endless redesign, it has hard **stopping criteria**:

- at most two passes — and the second only if the first found a Class A;
- a clean pass (no A and no B found) stops the audit;
- if it finds mostly C and D, the audit stops too.

Class A means "breaks launch or leaks data", not "could be nicer." This scale exists precisely to *keep*
the agent from inflating severity.

### 3.2 How the pipeline spends review effort: risk profiles

Calling several implementation agents on every wave is expensive, especially in Codex where each
subagent needs its own clean context. tms-pipeline therefore separates two questions that older agent
flows often mix together:

- **How should the code be written in stage 04?** Usually by the main agent, wave by wave, with explicit
  self-check roles.
- **How deeply must the result be independently reviewed in stage 04b?** That depends on the riskiest
  thing the wave touched.

The wave profile now describes **risk and review depth**, not just "how many subagents to call while
coding":

- **Profile M — Mono / bounded:** the design and plan are clear, the surface is small, tests are
  available, and the blast radius is limited. Stage 04 can stay main-agent-only; 04b still runs a narrow
  independent diff review.
- **Profile E — Evidence-assisted:** the main uncertainty is finding code evidence. A cheap explorer can
  gather paths, symbols, and snippets, but product decisions and architecture judgement stay with the
  main agent.
- **Profile R — Risk review required:** money, roles, tenant scope, PII/privacy, migrations, lifecycle
  state, queues/jobs, messaging/outbox, external integrations, or important user-facing business logic.
  Stage 04 may still be mono/main-agent, but 04b must stress-test the dangerous surface.
- **Profile C — Full classic allowed:** the cost of error is maximal: payment providers, mass messaging
  or free text, privacy retention, high-blast tenant isolation, critical migrations/backfills, complex
  concurrency, webhook/security boundaries, or full-codebase audits. In these cases a full classic
  multi-agent implementation inside stage 04 is allowed if the operator deliberately chooses the heavier
  mode.

The profile is chosen by the **most dangerous touched risk**, not by the average size of the diff. The
goal is not to weaken review; it is to buy quality in the stage where it is most efficient: a focused
implementation in 04, followed by an independent review/fix loop in 04b.

For risky waves, the delivery plan also carries a small handoff seed into implementation: the invariant
that must not break, the proof or test that should show it, the owner layer where the decision belongs,
the failure signal, and the search map for adjacent routes, services, tests, and mocks. This keeps 04 from
forgetting why the wave was risky, and gives 04b something concrete to verify rather than a vague "review
carefully."

### 3.3 Nothing discovered gets lost: capturing follow-ups and launch steps

Work found mid-task usually evaporates in chat. tms-pipeline makes capturing it a hard rule and sets out
up front where each kind goes (the **backlog** is the list of future tasks):

- **A deferred item that could be its own task** (a follow-up) → a new row in the backlog.
- **A documentation mismatch or a gap in the spec** → update the document that counts as the main one on
  that topic, and link to it from the backlog.
- **Manual actions that must be done by hand before launch** (apply a database migration, set an
  environment key, run a check on a live system, observe a deploy order, satisfy any condition from a
  `conditional_go` verdict) → the **launch playbook**: step-by-step instructions written so that even a
  non-engineer can carry them out (exact steps, a copy-pasteable command, a precise pass criterion, a
  precondition).
- **Architecture decisions made along the way** → an ADR, backlinked from the backlog. An **ADR** is a
  short record of an architecture decision: what was decided and why.

And one more discipline that keeps the backlog usable: **bundle, don't shard.** A backlog of dozens of
one-line tickets is an anti-pattern — each such ticket later drags along its own pipeline run, its own
checks, and its own commits. So: trivia goes into the next commit; related items fold into one bundle of
2–7 sub-items by shared surface; and a backlog row is a pointer to the work, not the place where the whole
of the work is written out.

---

## 4. Task modes: process proportional to the task

A common failure of heavyweight processes is running a one-line edit through the whole long procedure.
tms-pipeline avoids this: the first thing it does is classify the **task mode** — that is, how heavy a
process the task actually needs:

- **Direct** — cosmetic, copy, or a local edit that doesn't change the program's behavior → make the
  smallest coherent change and validate it cheaply. For these tasks the gap audit (stage 02b) can be
  skipped: instead of a write-up the file then holds a single line, "skipped per minimal-surface
  exception" — but the blank starter file `02b_gap_audit.md` is still created so the chain of stages
  doesn't break.
- **Investigation** — the cause of the failure is unclear → first reproduce the problem and trace the
  failure path, and only then fix it.
- **TDD-first** — behavior, logic, contracts, sign-in, data storage, or data validation are involved →
  work the **TDD** way: first write a test that fails (because the behavior isn't there yet), then write
  the minimal code until the test turns green. The test is written at the level of the contract or of
  what the user sees.

Feature work defaults to TDD-first; small work stays Direct. The full staged machinery is for
substantial tasks, not for fixing a typo.

---

## 5. How implementation and independent review actually work (stages 04 and 04b)

Stage 04 writes the code. In Codex it defaults to **mono/main-agent implementation**: the main agent
implements the approved plan wave by wave instead of spawning a full coding mob for every wave. This is
not a shortcut around engineering discipline. The main agent must explicitly run the same role checks the
mob made visible:

- **Developer:** implement the smallest coherent change from `03_delivery_plan.md`.
- **Tester:** add or update the highest-value tests and run the narrow changed-surface checks.
- **Architect:** verify owner layer, read/write paths, contracts, schema or migration order, and rollout
  implications.
- **Security / Privacy / Money:** verify tenant scope, role permissions, PII, audit/external effects, and
  money semantics whenever the surface touches them.
- **Reviewer:** compare the diff against `02_design.md` and `03_delivery_plan.md`, looking for missed
  invariants, unsafe fallbacks, races, and missing tests.

The result is written into `04_implementation.md`: stage-04 mode, profile per wave, self-check roles
applied, risks checked, validation, follow-ups, launch actions, and what 04b must independently
stress-test.

For Profile R/C work, stage 04 must do a bounded local risk-surface sweep before handing off: check
directly coupled routes, services, read/write paths, tests, mocks, and risky field reads named by the
plan's handoff seed and by the actual diff. It also runs an adversarial self-review against the invariant
table. That pass is not independent review and must not be presented as acceptance. Its output is an
author risk map for 04b to verify and complete.

Stage 04b is where the pipeline buys independent confidence. It resolves the task diff (worktree,
commits, or both), gives that concrete scope to a fresh read-only reviewer, fixes real findings, validates
again, and repeats until the latest independent review reports no actionable findings or reaches the
acceptance threshold with validation green.

The first 04b step is to distrust the author's handoff enough to audit it: does the claimed file list match
the diff, do the invariants cover the dangerous surfaces, did tests or mocks keep the old contract, and
are there sibling paths that make the same business decision? On risk-heavy work, the first reviewer must
cover all relevant defect classes in one broad pass. If repeated reviews show the implementation is
under-hardened, the loop stops patching around the edges and sends the task back through a focused
stage-04-style remediation pass before restarting fresh 04b.

Why this works. Full multi-agent coding during 04 can be valuable on maximum-risk work, but on ordinary
bounded work it spends a lot of context and tokens before there is a concrete diff to inspect. The updated
pipeline keeps 04 focused and makes 04b mandatory: quality is not removed, it moves to a separate
independent review/fix loop where the reviewer can inspect the actual implementation rather than the
plan. Even small changes get at least a narrow 04b because a small diff can still change billing,
permissions, copy with legal meaning, or state transitions.

Here, too, you review every step: the lead shows you the result of each wave, and finished code does not
move on by itself. Stage 04, 04b, and 06 create task-scoped commits by default when validation is green and
the changed files clearly belong to the task. They never push automatically, never add AI attribution, and
stop instead of guessing when the worktree mixes unrelated changes.

---

## 6. Why this beats a single mega-prompt

- The context window never overflows: each stage and each wave gets only what it needs.
- Mistakes are caught where they are cheapest to fix: a wrong design is corrected in text, before it has
  turned into code.
- The model never has to guess: by implementation time it already has an approved design, a concrete plan,
  and your project's standards.
- The heaviest review effort is spent only where the risk is real.
- Work found along the way and manual launch steps are captured, not lost.

This is a living engineering process: adapt the stage names, the risk triggers, and the prompts to your
team's culture. What matters is the principle: **control the context at every step and put independent
review where it checks the real implementation.**
