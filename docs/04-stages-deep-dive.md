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
- **The main agent (the lead).** The agent in your chat — the one you talk to. It runs on a strong model
  (Opus). It makes the decisions, pulls the result together, and judges what is correct. During
  implementation the lead **writes no code itself**: it hands the work out to subordinate agents and makes
  sure they pass every check.
- **Role agents (subagents).** The subordinate agents the lead starts for one specific, narrow task. Often
  on cheaper models (Sonnet, sometimes Haiku) — this saves money and tokens where the full power isn't
  needed. Each of these agents has its own clean context window: it sees only its own brief, not the whole
  conversation.
- **Escort profile (A / B / C).** How many checking agents to call for one piece of work. A is the minimum
  (developer + tester + reviewer), B adds the architect, C adds security. By default the pipeline picks
  the cheapest profile the rules allow, so a simple task doesn't drag in extra checkers.
- **You check every step (human in the loop).** The core idea: after each stage the agent stops, and you
  review the result before going on. You don't hand off the work wholesale — you steer the agent.

> The specific model names (Opus / Sonnet / Haiku) are the current defaults in the skills; they can be
> changed. The point of the split is money: the strong (and expensive) model is needed where you have to
> reason and check, while gathering facts can go to the cheap models.

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
  - **the lead (Opus)** decides what to look for and where;
  - **4 subordinate collector agents on a cheap model (Sonnet; Haiku for simple file searches)** work in
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
  of which can be coded, covered with tests, and committed on its own. The agent handles small slices
  better than one huge task whole.
- **Who works.** The lead.
- **Input → Output.** `02_design.md` (with the blockers folded in) → an `03_delivery_plan.md` file: a list
  of waves, and **each wave has its own escort profile A/B/C** (how many checkers to call for that wave)
  and the reason for the choice.
- **What the agent does.** Divides the work into finished units, notes for each which files will be
  created or changed, and how risky it is — which is where the escort profile comes from.
- **Where you check.** You check whether the agent invented anything extra: is the plan split logically,
  did entities, files, or layers appear that weren't in the approved design? (Agents sometimes confidently
  write in things the task doesn't actually contain — that's what to catch.)
- **When to go on.** After your approval — on to `04_implementation`.

---

## Stage 04 — Implementation (`/tms-implement`)

- **Purpose.** Write the code per the approved plan, checking it with several agents at every step.
- **Who works.** A group of agents — this is the **mob**: several role agents that work on the code
  together (like pair programming, but with several agents). **The lead writes no code itself** — it hands
  the work out to subordinate agents and holds the gates (checkpoints the work cannot pass until every
  check has passed). For each wave it starts agents in the roles it needs:
  - **the developer** — writes the code;
  - **the tester** — builds the project, runs the tests, the type check, and the linter (the automatic
    code-style check);
  - **the architect** (on profiles B and C) — makes sure the code hasn't drifted from the design;
  - **security** (on profile C) — looks for vulnerabilities, data leaks, injections;
  - **the reviewer** — checks the result against the plan and the acceptance criteria.

  How many roles are actually active depends on the wave's escort profile: A runs three (developer, tester,
  reviewer), B adds the architect, C adds security on top.
- **Input → Output.** `03_delivery_plan.md` → code in the repository + an `04_implementation.md` file (a
  log of the waves).
- **What the team does (one wave).** The lead sets the profile → starts the developer → **in parallel**
  starts the checkers for the profile → the wave passes only if **all** the checks pass. If something
  fails — a separate agent fixes exactly those findings, and only the failed checks are re-run, not
  everything. You move to the next wave only after all of the current one's checks have passed. Because the
  work is split this way, no agent's context window overflows: it holds only its own wave in memory.
- **Where you check.** The lead shows you the result wave by wave. At the end the code **does not move on
  by itself**. A commit is created (a recorded batch of changes in git), but without any mention that an AI
  made it (the license requires this), and that commit is **not pushed to the server automatically**. The
  branch (a separate line of changes in git) waits while you look it over and run **CI** — that is, the
  server builds the project itself and runs all the tests after the code is pushed.
- **When to go on.** After all the waves have passed — on to `04b_loop_review`.

---

## Stage 04b — Loop review (`/tms-loop-review`)

- **Purpose.** Independently review the implementation diff before the test report, fix confirmed
  findings, and make the review evidence durable.
- **Who works.** The lead plus fresh independent reviewer subagents. The reviewer context is kept separate
  from the implementation context so it can inspect the diff without inheriting the implementer's
  assumptions.
- **Input → Output.** `02_design.md`, `03_delivery_plan.md`, `04_implementation.md`, and the resolved
  implementation diff → `04b_loop_review.md`.
- **What the loop does.** First it resolves what to review: uncommitted worktree changes, committed task
  commits, or both. Then it runs a bounded review/fix/re-review loop until validation is green and the
  latest independent reviewer either scores the result high enough or reports no actionable findings.
- **Where you check.** You read the fixes, rejected/deferred findings, validation results, and final
  acceptance signal. If the stage was skipped, the file must say why and where that review debt is tracked.
- **When to go on.** After a PASS or an explicit operator skip — on to `05_test_report`.

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
- **What the agent does.** Matches what was done against the design and the acceptance criteria, and
  writes out the discrepancies and conditions. If `conditional_go` is the verdict, the conditions go into
  the launch playbook (a separate list of mandatory manual steps to do before shipping) — so they don't
  get lost.
- **Where you check.** This is the last human gate: you read the verdict, run your own CI/CD, and make the
  final decision on merging.
- **When to go on.** The task is closed. Everything found along the way but not done now is already sorted
  into the backlog and the launch playbook — under the strict "nothing gets lost" rule: no problem found
  should ever drop out of sight.

---

## In short: where the subagents work and where you work

| Stage | Agent team | Models | Your control point |
|---|---|---|---|
| 00 Ticket | one lead | Opus | Confirm the task and scope |
| 01 Research | lead + 4 collectors | Opus + Sonnet/Haiku | Answer the interview (if asked) |
| 02 Design | one lead | Opus | **Review and correct the design** |
| 02b Audit | auditor (separate checking angle) | Opus | Sign off on the classes of the holes found |
| 03 Plan | one lead | Opus | Check whether the agent invented anything extra |
| 04 Implementation | mob: developer + tester + architect/security + reviewer | Opus (lead) + subordinate agents | Review the result; the final commit waits for you |
| 04b Loop review | lead + independent reviewers | Opus / high-review model | Check the review evidence and fixes |
| 05 Test | one lead | Opus | Make sure the user-visible part works |
| 06 Review gate | lead + you | Opus + human | **Final review and merge decision** |

> Beyond the delivery stages there are separate skills for working with the codebase (a four-stage audit
> and maintenance refactoring). As a reminder: a skill is a command like `/tms-research` that
> you give the agent to run one step. There is also the `/tms-new` skill — it helps you sort a new product
> into its starter documents one time (a one-off initial setup, not one of the delivery stages above). How
> all these skills are built is described in the skills themselves and in the
> [methodology](00-methodology.md).
</content>
</invoke>
