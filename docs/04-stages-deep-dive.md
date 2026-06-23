# Under the hood: a walkthrough of every stage

> This page shows what actually happens in each of the pipeline's eight stages: which agents work, on
> which models, what they take as input and produce as output, and — above all — **where you fit in**.
> If the README answers "why", this page answers "how exactly it's built".
> Russian version — [04-stages-deep-dive.ru.md](04-stages-deep-dive.ru.md).

## How to read this page

A few concepts you'll meet in every section:

- **The lead.** The main agent in your chat — the one you talk to. On a strong model (Opus). It makes
  decisions, synthesizes the result, and judges what's correct. During implementation the lead **does not
  write code itself**; it hands the work out to a team.
- **Subagents.** Separate agents the lead spins up for a specific, narrow task. Often on cheaper models
  (Sonnet, sometimes Haiku) — this saves money and tokens where the full power isn't needed. Each subagent
  has its own clean context window: it sees only its brief, not the whole conversation.
- **Escort profile (A / B / C).** How "heavy" a team of reviewers to bring to a piece of work. A is the
  minimum (developer + tester + reviewer), B adds an architect, C adds a security engineer. By default the
  cheapest profile the rules allow is chosen.
- **Human in the loop.** The core idea: after each stage the agent stops, and you review the result before
  moving on. You don't hand off the work wholesale — you steer the agent.

> The specific model names (Opus / Sonnet / Haiku) are the current defaults in the skills; they can be
> changed. What matters is not the model brand but the principle: the expensive model thinks and verifies,
> the cheap ones gather facts.

---

## Stage 00 — Ticket (`/tms-ticket`)

- **Purpose.** Pin down exactly what we're doing: the driver (why the task exists), the scope (what's in
  and what's out), the acceptance criteria. And confirm the task is genuinely ready to work on.
- **Who works.** A single lead, no subagents. Reads the project's `AGENTS.md` to learn your conventions
  (where the task folders are, where the backlog is, which language to write in).
- **Input → Output.** The task description from the backlog → an `00_ticket.md` file in the task folder.
- **What the agent does.** Checks preconditions (the task is in the backlog and it's the right one; the
  sources are linked), writes a short ticket index, and **classifies the task mode**: `Direct` (cosmetic),
  `Investigation` (cause of the bug unclear), or `TDD-first` (real behavior/logic). The mode determines
  how heavy the rest of the process will be.
- **Where your check is.** You confirm that the task and its scope are understood correctly. If not, you
  fix it right here, while nothing has been built.
- **When to advance.** After your OK — on to `01_research` in a clean context window.

---

## Stage 01 — Research (`/tms-research`)

- **Purpose.** Narrow a huge codebase down to the facts that matter for this particular task. Don't spend
  tokens on "the whole project" and don't carry information noise into the later stages.
- **Who works.** This is where a team first appears:
  - **the lead (Opus)** formulates what to look for and where;
  - **4 parallel collector subagents on a cheap model (Sonnet; Haiku for simple file searches)** — each
    combs its own "axis": the vertical execution path, horizontal siblings, product & lifecycle docs,
    and prior art & history (recent tickets, git log, similar implementations);
  - then **the lead re-verifies** the findings itself.
- **Input → Output.** `00_ticket.md` → an `01_research.md` file with facts, links to specific
  `file:line` locations, and a confidence note on each item.
- **What the agent does.** The collectors **only gather and cite** — they don't design, don't advise,
  don't write the document. The lead opens the cited locations in the code and confirms that what was
  reported is actually there; catches contradictions between axes; on gaps it fires off at most 2 more
  targeted follow-up queries. The key rule: the document describes the system "as-is", **with no AI
  opinions and no refactor advice**.
- **Where your check is.** If the research surfaced real product/operational forks, the agent asks you an
  **interview right in the chat** (one question at a time, in plain language, with a recommendation) —
  before design. Unanswered questions are not written into the document.
- **When to advance.** Once the picture is coherent and re-verified — on to `02_design`.

---

## Stage 02 — Design (`/tms-design`)

- **Purpose.** Design the solution and review it **before the first line of code**. Fixing a mistake in
  the design text is many times cheaper than rewriting finished code.
- **Who works.** The lead. It leans on the facts from `01_research.md` and your project's standards from
  `AGENTS.md`.
- **Input → Output.** `01_research.md` + the project standards → an `02_design.md` file — **the single
  design contract**: the minimal sufficient change at the "owning" layer, not the first patch that comes
  to hand.
- **What the agent does.** Describes what changes and where, which contracts are touched, and how it fits
  with the existing patterns. The goal is the smallest coherent change that actually solves the task,
  without extra layers and abstractions.
- **Where your check is.** This is one of the main moments where you look with your own eyes: do you agree
  with the approach? Did the agent pick a suboptimal solution (the classic example — a synchronous heavy
  operation where an asynchronous one is needed)? Edits go into the text — by hand or with clarifying
  prompts.
- **When to advance.** Once the design satisfies you — on to `02b_gap_audit`.

---

## Stage 02b — Gap audit (`/tms-gap-audit`)

- **Purpose.** Take one look at the design with **fresh, distrustful eyes** — from a different lens than
  the one it was written with — and catch the holes before code.
- **Who works.** An auditor agent given a **different reasoning lens** than the design's author had (in
  rotation: security / concurrency / UX / ops / data integrity / privacy).
- **Input → Output.** `02_design.md` → an `02b_gap_audit.md` file with a list of gaps sorted by severity.
- **What the agent does.** Classifies each gap into exactly one category (with anti-inflation rules):
  - **A — blocker** (data loss, a security hole, a privacy violation, blocks launch) → fixed right in
    `02_design.md` before the plan;
  - **B — incident** (a recoverable production problem) → fixed in the design or passed to the plan with a
    note;
  - **C — polish** → into the backlog as a separate bundle, not as a priority;
  - **D — theoretical** → into the backlog only if the fix is obvious and cheap, otherwise dropped with a
    one-line reason.
  There are **stopping criteria** so the audit doesn't turn into an endless redesign: at most 2 passes,
  and the second only if the first found at least one Class A.
- **Where your check is.** You look at the list of gaps and decide whether you agree with the
  classification and with how the blockers were folded back into the design.
- **When to advance.** Once the blockers are resolved — on to `03_delivery_plan`. (For small tasks the
  stage can be marked "skipped per minimal-surface exception" — the file is still created.)

---

## Stage 03 — Delivery plan (`/tms-plan`)

- **Purpose.** Split the approved design into small, independent "waves", each of which can be coded,
  covered with tests, and committed separately.
- **Who works.** The lead.
- **Input → Output.** `02_design.md` (with blockers folded in) → an `03_delivery_plan.md` file: a list of
  waves, and **each wave has its own escort profile A/B/C** plus the reason for the choice.
- **What the agent does.** Divides the work into finished units, notes for each which files will be
  created or changed, and how risky it is (hence the profile).
- **Where your check is.** You check the plan for "hallucinations": is it split logically, did the agent
  invent extra entities or layers that the design didn't call for?
- **When to advance.** After your approval — on to `04_implementation`.

---

## Stage 04 — Implementation (`/tms-implement`)

- **Purpose.** Write the code per the approved plan, with multi-level automatic checks at every step.
- **Who works.** A full team (a "mob"). **The lead does not write code itself** — it hands out tasks and
  watches the quality gates. For each wave it spins up:
  - **a developer** — writes the code;
  - **a tester** — builds the project, runs the tests, types, linter;
  - **an architect** (on profiles B/C) — makes sure the code hasn't drifted from the design;
  - **a security engineer** (on profile C) — looks for vulnerabilities, leaks, injections;
  - **a reviewer** — checks against the plan and the acceptance criteria.
- **Input → Output.** `03_delivery_plan.md` → code in the repository + an `04_implementation.md` file (a
  log of the waves).
- **What the agent does (one wave).** The lead determines the profile → launches the developer →
  **in parallel** spins up the reviewers for that profile → the wave passes only if **all** the checks are
  green. If something fails — a separate agent fixes exactly those findings, and only the failed checks
  re-run. You move to the next wave only after all the current wave's checks have passed. Thanks to this
  division, each agent's context window never overflows.
- **Where your check is.** The lead shows the result wave by wave. At the end the code **does not move on
  by itself**: the commit is created without any AI attribution (a licensing constraint) and **is not
  pushed automatically** — the branch waits for your review and a CI run.
- **When to advance.** After all the waves have passed — on to `05_test_report`.

---

## Stage 05 — Test report (`/tms-test`)

- **Purpose.** Make sure the task is actually solved — not just "the tests are green", but that what the
  user sees works.
- **Who works.** The lead.
- **Input → Output.** The implementation → an `05_test_report.md` file.
- **What the agent does.** Checks the **primary signal** (the user-visible runtime behavior) and the
  **secondary signals** (tests, types, linter, build). Green tests with a broken user scenario don't count
  as success.
- **Where your check is.** You look at whether the primary signal is genuinely covered, not substituted by
  "green checkmarks".
- **When to advance.** On to `06_review_gate`.

---

## Stage 06 — Review gate (`/tms-review`)

- **Purpose.** The final reconciliation: does the result match the design contract you approved.
- **Who works.** The lead (in the reviewer role), plus — the final **human** review and your CI.
- **Input → Output.** The implementation + `02_design.md` → an `06_review_gate.md` file with a verdict:
  **go** (proceed) / **conditional_go** (proceed if conditions are met) / **no-go** (don't).
- **What the agent does.** Matches what was done against the design and the acceptance criteria, records
  discrepancies and conditions. If `conditional_go` is issued — the conditions go into the launch playbook
  as mandatory manual steps, so they don't get lost.
- **Where your check is.** This is the last human gate: you read the verdict, run your CI/CD, and make the
  final merge decision.
- **When to advance.** The task is closed; the findings made along the way are already sorted into the
  backlog and the launch playbook (under the hard "nothing gets lost" rule).

---

## In short: where subagents work and where you work

| Stage | Agent team | Models | Your control point |
|---|---|---|---|
| 00 Ticket | one lead | Opus | Confirm the task and scope |
| 01 Research | lead + 4 collectors | Opus + Sonnet/Haiku | Answer the interview (if asked) |
| 02 Design | one lead | Opus | **Review and correct the design** |
| 02b Audit | auditor (different lens) | Opus | Sign off on the gap classes |
| 03 Plan | one lead | Opus | Check the breakdown for "hallucinations" |
| 04 Implementation | mob: Dev + Tester + Architect/Security + Reviewer | Opus (lead) + subagents | Review the result; the final commit waits for you |
| 05 Test | one lead | Opus | Make sure the primary signal is covered |
| 06 Review gate | lead + you | Opus + human | **Final review and merge decision** |

> Beyond the eight stages there are separate skills for working with the codebase (the four-stage audit,
> maintenance refactoring, the review loop) and the `/tms-new` skill for a one-time bootstrap of a new
> product. Their internals are described in the skills themselves and in the
> [methodology](00-methodology.md).
