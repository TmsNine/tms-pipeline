# Under the hood: a walkthrough of every stage

> tms-pipeline is a discipline for AI agents: it takes one already-defined task from a ticket to
> reviewed code, keeping the agent's context clean at every step. A task moves through staged checkpoints:
> the core 00-06 path, 02b gap audit, and 04b loop review. Only one stage writes code (04,
> implementation); the others each produce a text document (`.md`). Most of the pipeline is thinking on
> paper, not generating code.
>
> This page shows what actually happens at each stage: which agents work, on which models, what they take
> in and hand back, and — above all — **where you fit in**. If the README answers "why", this page
> answers "how it actually works".
>
> **First time here?** Read the [README](../README.md) and the [methodology overview](00-methodology.md)
> first: this page assumes you already grasp the general idea and walks through each stage in detail.
> Russian version — [04-stages-deep-dive.ru.md](04-stages-deep-dive.ru.md).

## Where all of this runs

You work with an agent in an ordinary chat inside your AI tool — either **Claude Code** or **Codex**
(the two programs that can run tms-pipeline; you need only one of the two, your choice). You type commands
like `/tms-ticket` or `/tms-research` straight into that chat. A command like this is called a **skill** —
a command you give the agent to make it do one step of the work. The documents produced at each stage
(`00_ticket.md`, `01_research.md`, and so on) the agent files away itself, into the task folder inside
your repository — the same place your code lives. You see them as ordinary files and can read and edit
them by hand.

## How to read this page

A few ideas you will meet in every section. First, the agent's memory, because the whole pipeline is built
around it.

- **The context window is the agent's working memory.** It is everything the agent can see and hold at
  once: your request, the files it has read, its earlier answers. The window is limited in size, and the
  more clutter it holds, the worse the agent reasons — it loses the early instructions and starts to get
  confused. So the pipeline tries to give each agent only what that step needs, and nothing more.
- **The main agent (the lead).** The agent in your chat — the one you talk to. It makes the decisions,
  pulls the result together, and judges what is correct. In Codex, stage 04 usually stays with this main
  agent; the discipline comes from explicit self-check roles plus the independent 04b review.
- **Role agents (subagents).** Separate agents the lead can start for narrow evidence gathering,
  challenge, or independent review. Each has its own clean context window: it sees only its brief, not the
  whole conversation.
- **Risk profile (M / E / R / C).** How risky a wave is and therefore how much help or independent review
  it needs. M is bounded mono work, E allows evidence lookup, R requires focused independent review, and C
  allows the full classic multi-agent implementation for maximum-risk work.
- **You check every step (human in the loop).** The core idea: after each stage the agent stops, and you
  review the result before going on. You don't hand off the work wholesale — you steer the agent.

> The specific model names in the skills can change. The stable principle is the split of work: cheap
> models can gather evidence; high-judgement work and independent review use stronger reasoning.
> Current Sol/Terra/Luna table: [model routing](06-model-routing.md).

---

## Stage 00 — Ticket (`/tms-ticket`)

- **Purpose.** Pin down exactly what we're doing: the driver (what the task is for — which pain or goal it
  closes), the scope (what's in the task and what's deliberately left out), and the acceptance criteria.
  And confirm the task is genuinely ready to work on.
- **Who works.** A single lead, no subordinates. It reads the project's `AGENTS.md` — your project's
  settings file, which tells the agent your rules: where the task folders are, where the backlog (the list
  of future tasks) is, and which language to write in.
- **Input → Output.** The task description from the backlog → an `00_ticket.md` file in the task folder.
- **What the agent does.** Checks the preconditions (the task is in the backlog and it's the right one;
  the sources are linked), writes a short ticket index, and **classifies the task mode** — how heavy the
  rest of the process will be. There are three modes: `Direct` (cosmetic work, a small edit),
  `Investigation` (the cause of the bug is still unclear, so you have to dig first), or `TDD-first` (real
  behavior or logic is changing — that kind of work goes through TDD: first a test that fails, then code
  until the test goes green).
- **Where you check.** You confirm that the task and its scope are understood correctly. If not, you fix
  it right here, while nothing has been built yet.
- **When to go on.** After your OK — on to `01_research`. The next stage starts in a clean context window:
  the lead opens it with an empty memory, so the noise from the ticket discussion doesn't get in the way
  of the research.

---

## Stage 01 — Research (`/tms-research`)

- **Purpose.** Narrow a huge codebase down to the facts that matter for this particular task. Don't spend
  tokens on "the whole project", and don't carry information noise into the later stages.
- **Who works.** This is where a team of agents first appears:
  - **the lead on a strong reasoning model** decides what to look for and where;
  - **4 subordinate collector agents on a cheap evidence model** work in
    parallel. Each one covers a different corner of the code, so that together they cover the task from
    every side without overlapping:
    - one follows the **execution path top to bottom** — how a request travels through the system from
      input to result;
    - the second looks at the **neighboring code** — what sits nearby and what the task will connect to;
    - the third gathers the **product documents** — descriptions of what the product does and why;
    - the fourth digs up **prior work and history** — recent tickets, the git change history, similar
      solutions already shipped;
  - then **the lead re-checks** the findings itself.
- **Input → Output.** `00_ticket.md` → an `01_research.md` file with facts, links to specific
  `file:line` locations, and a confidence note on each item.
- **What the agent does.** The collectors **only gather and quote** — they don't design, don't advise,
  don't write the final document. The lead opens the cited spots in the code and makes sure what was
  reported is really there; it catches contradictions between what the different collectors found; if gaps
  remain, it sends at most 2 more targeted follow-up queries. The key rule: the document describes the
  system as it is now, **with no judgments and no proposals to rework anything** — that is the job of later
  stages.
- **Where you check.** If the research turned up real forks in the product or in operations (for example:
  should deleted records show up in the history? how do we count an active user?), the agent runs an
  **interview right in the chat** — one question at a time, in plain language, with its own recommendation
  — before design begins. Questions you didn't answer are not written into the document.
- **When to go on.** Once the picture is whole and re-checked — on to `02_design`.

---

## Stage 02 — Design (`/tms-design`)

- **Purpose.** Design the solution and review it **before the first line of code**. Fixing a mistake in
  the design text is many times cheaper than rewriting finished code.
- **Who works.** The lead. It builds on the facts from `01_research.md` and your project's standards from
  `AGENTS.md`.
- **Input → Output.** `01_research.md` + the project standards → an `02_design.md` file. This is the
  **design contract** — the change agreed up front, which the finished code is later checked against. Its
  essence is the **minimal sufficient change at the owning layer**. The "owning layer" is the place in the
  code where the problem belongs at its source, not the first handy spot where you can patch it. For
  example, if data arrives corrupted, fix it where it is created, not by scrubbing it in the ten places it
  later turns up.
- **What the agent does.** Describes what changes and where, which parts of the system it affects, and how
  it fits with the approaches already used in the project. The goal is the smallest coherent change that
  actually solves the task, with no extra layers or abstractions.
- **Where you check.** This is one of the main moments where you look with your own eyes: do you agree
  with the approach? Did the agent pick a poor solution (the classic example — making a heavy operation
  synchronous, so the user waits for it to finish, when it could have run in the background)? Edits go into
  the text — by hand or with clarifying prompts.
- **When to go on.** Once the design satisfies you — on to `02b_gap_audit`.

---

## Stage 02b — Gap audit (`/tms-gap-audit`)

- **Purpose.** Take one look at the finished design with **fresh, skeptical eyes** — deliberately hunting
  for holes in it, and from a different angle than the one it was written with — to catch problems before
  code.
- **Who works.** A separate auditor agent. It is given a specific angle to check from — not a vague "look
  closely" but a particular theme to hunt holes under. The themes rotate from run to run: security,
  concurrent access, ease of use, running it in production, data integrity, privacy. Over a few runs the
  design gets looked at from every side.
- **Input → Output.** `02_design.md` → an `02b_gap_audit.md` file with a list of the holes found, sorted
  by severity.
- **What the agent does.** It puts each hole it finds into exactly one class (with rules against inflating
  the severity):
  - **A — blocker** (data loss, a security hole, a privacy violation, anything that blocks launch) → fixed
    right in `02_design.md` before the plan;
  - **B — incident** (a serious but recoverable problem on a running production system) → fixed in the
    design or passed to the plan with a note;
  - **C — small polish** → into the backlog as a separate bundle, not as a priority;
  - **D — theoretical** → into the backlog only if the fix is obvious and cheap, otherwise dropped with a
    one-line reason.
  There are **stopping criteria** so the audit doesn't turn into endless rework: at most 2 passes, and the
  second only if the first found at least one Class A blocker.
- **Where you check.** You look at the list of holes and decide whether you agree with the classification
  and with how the blockers were folded back into the design.
- **When to go on.** Once the blockers are resolved — on to `03_delivery_plan`. For very small tasks this
  stage can be skipped (marked "skipped per minimal-surface exception" — meaning the change is too small
  to justify a full audit). An empty placeholder `02b_gap_audit.md` is still created, so the task folder
  has the full set of stages.

---

## Stage 03 — Delivery plan (`/tms-plan`)

- **Purpose.** Split the approved design into **waves** — small, self-contained slices of the task, each
  of which can be coded and proven with tests on its own. The agent handles small slices
  better than one huge task whole.
- **Who works.** The lead.
- **Input → Output.** `02_design.md` (with the blockers folded in) → an `03_delivery_plan.md` file: a list
  of waves, and **each wave has its own risk profile M/E/R/C** with the reason for the choice.
- **What the agent does.** Divides the work into finished units, notes for each which files will be
  created or changed, what the main agent must self-check in 04, and how deep 04b must be. It also writes
  one canonical append-only risk ledger with stable R-IDs, invariants, proof, owner layer, failure signal,
  owning wave, and the adjacent search map. Each wave references its owning R-IDs.
- **Where you check.** You check whether the agent invented anything extra: is the plan split logically,
  did entities, files, or layers appear that weren't in the approved design? (Agents sometimes confidently
  write in things the task doesn't actually contain — that's what to catch.)
- **When to go on.** After your approval — on to `04_implementation`.

---

## Stage 04 — Implementation (`/tms-implement`)

- **Purpose.** Write the code per the approved plan while keeping the implementation context small enough
  to reason about.
- **Who works.** In Codex, the main agent normally implements and performs explicit role self-checks. In
  Claude, M stays with the lead, E uses one bounded Architect/evidence pass plus Tester, R always dispatches
  Developer/Tester/Reviewer plus the triggered Architect/Security roles, and C uses the full set. One integration
  owner remains responsible for each wave.
- **Input → Output.** `03_delivery_plan.md` → code in the repository + an `04_implementation.md` file (a
  log of the waves).
- **What the main agent does (one wave).** It reads the plan for the current wave only → implements the
  smallest coherent change → runs targeted tests/checks → verifies architecture, contracts, security,
  privacy, money, and launch implications when relevant → records what passed and what 04b must
  stress-test. On Profile R/C waves it also performs a bounded risk-surface sweep, checks the invariant
  table adversarially, and writes a compact 04b handoff as an orchestrator-only author risk map. Stage 04b
  audits it and derives a sanitized neutral brief for the independent reviewer; author findings, fixes,
  searches, and remediation history are not forwarded. The next wave starts only after the current wave
  is locally coherent.
- **Where you check.** The lead shows you the result wave by wave. At the end the code **does not move on
  by itself**. Stage 04 does not commit: the task-owned package stays in the worktree for independent
  04b, stage-05 testing, and one closing commit after successful 06.
- **When to go on.** After all the waves have passed — on to `04b_loop_review`.

Why stage 04 works this way. Multi-agent implementation is expensive because every role has to rebuild
enough context to act. Bounded M/E work preserves one implementation thread; Claude buys real proving-role
separation for R/C, where the failure cost justifies it. In every profile, 04b still inspects the finished
diff independently.

---

## Stage 04b — Loop review (`/tms-loop-review`)

- **Purpose.** Independently review the implementation diff before the test report, fix confirmed
  findings, and make the review evidence durable. This is the quality backstop for the cheaper default 04.
- **Who works.** The lead plus fresh independent reviewer subagents. The reviewer context is kept separate
  from the implementation context so it can inspect the diff without inheriting the implementer's
  assumptions.
- **Input → Output.** `02_design.md`, `03_delivery_plan.md`, `04_implementation.md`, and the resolved
  implementation diff → `04b_loop_review.md`.
- **What the loop does.** Normally it resolves the uncommitted task-owned worktree scope left by stage
  04. Committed or mixed ranges are accepted only for legacy tasks or explicitly requested standalone
  reviews. Then the orchestrator audits the 04b handoff instead of trusting it and derives a sanitized
  neutral reviewer brief from the contract, current scope/fingerprint, invariants, and surfaces. The
  independent reviewer never receives author findings/fixes or remediation history. The loop then
  runs a bounded review/fix/re-review loop until validation is green and the latest independent reviewer
  either scores the result high enough or reports no actionable findings. The depth scales by risk: small
  tasks get a narrow diff review, ordinary features get fix + re-review, and risk-heavy work gets the
  classic iterative loop with broad first-reviewer coverage. If the loop exposes repeated blocker-like
  defects, it automatically switches to a separately recorded repeat-04 remediation cycle in the same
  session, then starts a fresh 04b attempt with a new reviewer.
- **Where you check.** You read the fixes, rejected/deferred findings, validation results, and final
  acceptance signal. If the stage was skipped, the file must say why and where that review debt is tracked.
- **When to go on.** Only after a normalized `PASS` — on to `05_test_report`. 04b never commits:
  accepted fixes remain in the task-owned package for 05/06 and the one closing commit after 06.

---

## Stage 05 — Test report (`/tms-test`)

- **Purpose.** Make sure the task is really solved — not just "the tests are green", but that the thing
  the user sees actually works.
- **Who works.** The lead.
- **Input → Output.** The implementation → an `05_test_report.md` file.
- **What the agent does.** Checks two levels. **The main thing** — the user-visible behavior: does the
  feature itself work if you launch the product and try it. **On top of that** — the technical checks:
  tests, types, linter, build. If the user's scenario is broken, it doesn't count as success, even when
  all the technical checks pass.
- **Where you check.** You look at whether the main thing is genuinely covered, not swapped out for the
  "green checkmarks" of the technical checks.
- **When to go on.** On to `06_review_gate`.

---

## Stage 06 — Review gate (`/tms-review`)

- **Purpose.** The final reconciliation: does the result match the design contract you approved.
- **Who works.** The lead (in the reviewer role), plus the final **human** review and your CI.
- **Input → Output.** The implementation + `02_design.md` → an `06_review_gate.md` file with a verdict:
  **go** (safe to merge) / **conditional_go** (you can, but do the listed conditions first) / **no-go**
  (you can't).
- **What the agent does.** Matches what was done against the design and the acceptance criteria, checks
  the 04b status and validation evidence, and writes out the discrepancies and conditions. If 04b already
  accepted the implementation, 06 does not repeat a full 04b-style code review; it verifies design
  conformance and launch readiness. If `conditional_go` is the verdict, the conditions go into the launch
  playbook (a separate list of mandatory manual steps to do before shipping) — so they don't get lost.
- **Closing commit.** On `go` or `conditional_go`, the agent creates exactly one task-scoped commit
  containing all repo-local task changes from 00 through 06. External backlog/status and launch entries
  are updated and reread first but do not enter Git. Ambiguous dirty ownership forbids the commit.
- **Where you check.** This is the last human gate: you read the verdict, run your own CI/CD, and make the
  final decision on merging.
- **When to go on.** The task is closed. Everything found along the way but not done now is already sorted
  into the backlog and the launch playbook — under the strict "nothing gets lost" rule: no problem found
  should ever drop out of sight.

---

## In short: where the subagents work and where you work

| Stage | Agent team | Models | Your control point |
|---|---|---|---|
| 00 Ticket | one lead | strong enough for scope judgement | Confirm the task and scope |
| 01 Research | lead + up to 4 collectors | Terra lead + Terra evidence collectors; Sol for risky judgement | Answer the interview (if asked) |
| 02 Design | one lead | strong design/reasoning model | **Review and correct the design** |
| 02b Audit | auditor (separate checking angle) | strong risk-judgement model | Sign off on the classes of the holes found |
| 03 Plan | one lead | cheaper planning tier unless risk ambiguity remains | Check whether the agent invented anything extra |
| 04 Implementation | Codex main-agent by default; Claude M inline, E bounded help, R/C proving roles | strong implementation owner + profile-scaled evidence/judgement roles | Review the implementation log and what 04b must stress-test |
| 04b Loop review | lead + independent reviewers | strong independent review model; deeper tier for security/privacy/payment/data risks | Check the review evidence and fixes |
| 05 Test | one lead | cheap validation/reporting tier unless failures need diagnosis | Make sure the user-visible part works |
| 06 Review gate | lead + you | strong judgement model + human | **Final review and merge decision** |

> Beyond the delivery stages there are separate skills for working with the codebase (a four-stage audit
> and maintenance refactoring). As a reminder: a skill is a command like `/tms-research` that
> you give the agent to run one step. There is also the `/tms-new` skill — it helps you sort a new product
> into its starter documents one time (a one-off initial setup, not one of the delivery stages above). How
> all these skills are built is described in the skills themselves and in the
> [methodology](00-methodology.md).
</content>
</invoke>
