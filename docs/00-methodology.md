# The tms-pipeline methodology

> Deep dive. For a quick overview see the [README](../README.md); Russian readers see
> [README.ru.md](../README.ru.md).

This is a **delivery methodology** for AI coding agents (Claude Code, Codex, and compatible tools). It
governs how an already-defined task travels from a ticket to reviewed, mergeable code. It is **not** a
project generator and it does not invent features for you — see "What this is / is NOT" in the README.

---

## 1. The core principle: context engineering

Generic prompts ("build this feature, no bugs") do not work. As the work grows, a single mega-prompt
accumulates noise, and the model's output degrades into complexity, bugs, and security holes.

The fix is **strict decomposition**: break the work into stages, and make the output of each stage the
**narrow, noise-free context** for the next. At every step the agent receives exactly the information it
needs and is constrained by your project's standards — nothing more. Quality comes not from model magic
but from disciplined context control.

This idea has a well-known four-phase shape — **Research → Design → Planning → Implementation** — with
multi-agent "mob" implementation and quality gates. tms-pipeline takes that foundation and hardens it
into eight stages, adds a severity-rated design audit, a cost model for spawning agents, and explicit
rules so discovered work is never lost.

> **Human in the loop.** This is not an autopilot. At every stage you review the agent's output before it
> proceeds: you don't hand off the work wholesale — you steer the agent and verify each step. This rule
> runs as a through-line across every stage, from the ticket to the final code review.

---

## 2. The eight stages

Each stage produces exactly one durable artifact in the task folder (`docs/<TICKET-ID>/` or wherever you
set `TASK_FOLDER_PATTERN`). Stages run one at a time; by default the agent stops after each for your
confirmation (you can ask it to run end-to-end).

| # | Stage | Skill | Output | What happens |
|---|-------|-------|--------|--------------|
| 00 | Ticket | `/tms-ticket` | `00_ticket.md` | Capture driver, scope, acceptance; confirm the task exists in the backlog; classify task mode. |
| 01 | Research | `/tms-research` | `01_research.md` | Narrow the codebase to the facts that matter right now ("as-is"): several agents search in parallel, the lead re-verifies. No opinions, no refactor advice. |
| 02 | Design | `/tms-design` | `02_design.md` | Author the single design contract — the minimal sufficient change at the owning layer. Reviewed by a human before any code. |
| 02b | Gap audit | `/tms-gap-audit` | `02b_gap_audit.md` | One bounded adversarial pass over the design, from a different reasoning lens, classifying gaps by severity. |
| 03 | Delivery plan | `/tms-plan` | `03_delivery_plan.md` | Split the design into small, independently shippable waves; tag each with an escort profile. |
| 04 | Implementation | `/tms-implement` | `04_implementation.md` | Multi-agent "mob": a lead orchestrates worker + proving agents wave by wave, with quality gates. |
| 05 | Test report | `/tms-test` | `05_test_report.md` | Validate the primary (user-visible) signal plus secondary signals (tests, types, lint, build). |
| 06 | Review gate | `/tms-review` | `06_review_gate.md` | Verify the implementation against the design contract; issue go / conditional_go / no-go. |

There is no brainstorm or ideation stage. Deciding *what* to build is your job, done your way; the
pipeline starts once a task exists.

→ A detailed walkthrough of each stage — which agents take part, on which models, and where exactly your
check is — in [04-stages-deep-dive.md](04-stages-deep-dive.md).

### Staged execution
If you start a task by ticket ID, the agent completes only the requested stage, then stops for
confirmation. It will not skip from research/design straight into coding, nor from implementation into
testing/review, without your go-ahead.

### The research interview
After Research, if the work surfaces real product/operational/scope choices, the agent asks you an
interview **in chat** before Design — phrased for your audience, with plain-language options and a
recommendation. Unanswered questions are never silently written into the design as decisions.

---

## 3. Three things most agent pipelines don't have

These are the parts worth adopting even if you keep your own stage names.

### 3.1 Severity-rated gap audit (stage 02b)

Most pipelines go design → code → review. tms-pipeline inserts a **bounded adversarial audit of the
design itself, before any code**, performed from a different lens than the designer used (rotate:
security / concurrency / UX / ops / data integrity / privacy). Every gap is classified into exactly one
severity — with explicit anti-inflation rules:

- **A — Blocker:** data loss, security breach, privacy/compliance violation, duplicate production data /
  integrity violation, or blocks launch. Fixed inline in the design before planning.
- **B — Incident:** a recoverable production incident (stuck job, missed notification, incomplete
  rollback). Fixed in the design or passed to planning with a handling note.
- **C — Polish:** UX roughness, incomplete i18n, missing metrics/runbook. Captured as *bundled* backlog
  tickets.
- **D — Theoretical:** low probability/blast radius. Backlogged only if the fix is obvious and cheap;
  otherwise dropped with a one-line reason.

And **stopping criteria** so the audit never spirals into redesign: at most two passes (a second only if
the first found a Class A); a clean pass with no A and no B stops; predominantly C/D stops. Class A means
"breaks launch or leaks data", not "could be nicer" — the rubric exists to *prevent* inflation.

### 3.2 A cost model for agents: escort profiles

Spawning a full team of review agents for every change is expensive. tms-pipeline classifies each
implementation wave into one of three **escort profiles**, and defaults to the cheapest one the rules
allow:

- **Profile A — Minimal** (Developer + Tester + Reviewer): renames, copy/i18n, styling, test-only waves.
- **Profile B — Standard** (+ Architect): non-trivial business logic, API shape changes, schema changes
  that don't touch auth/tenancy.
- **Profile C — Full** (+ Security): anything touching auth, tenant-scoping/identity, trust-boundary
  input validation, secrets/signing, payments, PII, or new mutating command surfaces.

Profile C is non-negotiable for its triggers (you list your project's exact triggers in `AGENTS.md`), but
it is the *exception*, not the default. Minimal escort costs roughly 40% of full escort per wave —
choosing the profile is the primary cost lever, and "run full escort to be safe" is explicitly
discouraged.

### 3.3 Nothing discovered gets lost: follow-up & launch capture

Work found mid-task usually evaporates in chat. tms-pipeline makes capture a hard rule with a routing
table:

- **Actionable follow-ups** → a new backlog row.
- **Doc drift / spec gaps** → update the owning source-of-truth doc + cross-reference the backlog.
- **Manual pre-launch actions** (apply a migration, set an env key, run a live smoke, a deploy-ordering
  constraint, any `conditional_go` condition) → a **launch playbook**, written so a non-engineer can
  execute them unaided (exact steps, copy-pasteable command, precise pass criterion, precondition).
- **Late architecture decisions** → an ADR/note, backlinked from the backlog.

And a discipline that keeps the backlog usable: **bundle, don't shard.** A backlog shattered into dozens
of one-line tickets is an anti-pattern (each becomes its own pipeline + review + commits). Trivia goes in
the next commit; related follow-ups fold into one bundle of 2–7 sub-items by shared surface; the backlog
row is an index, not storage.

---

## 4. Task modes: process proportional to the task

A common failure of heavyweight pipelines is drowning a one-line change in ceremony. tms-pipeline avoids
this by classifying every task first:

- **Direct** — cosmetic / copy / local edit, no runtime-behavior change → smallest coherent change, cheap
  validation. (The gap audit can be a single "skipped per minimal-surface exception" line.)
- **Investigation** — root cause unclear → reproduce and trace the failure path before patching.
- **TDD-first** — behavior, logic, contracts, auth, persistence, validation → start from a failing test
  at the contract/user-visible level, then minimal implementation to green.

Feature work defaults to TDD-first; trivial work stays Direct. The full eight-stage machinery is for
substantial tasks, not for fixing a typo.

---

## 5. How the multi-agent implementation actually runs (stage 04)

The main chat agent (the "lead") does **not** write code itself. Its job is to hand out the work to a team
of agents and make sure every piece passes the checks. One "wave" (a small, self-contained slice of the
plan) goes like this:

1. **The lead assesses how risky the wave is** — escort profile A, B, or C — and records the choice.
2. **It dispatches a developer agent** with a clear brief: what to do, which files to touch, what counts
   as done.
3. **In parallel it spins up the proving roles** for that profile: tester — always; architect — on B and
   C; security — on C; reviewer — always.
4. **The wave passes only if every check is green:** the project builds, tests and types pass, the linter
   is clean, the code hasn't drifted from the design, there are no new vulnerabilities, and everything
   matches the plan and the acceptance criteria.
5. **If something fails** — a separate agent fixes exactly those findings, and only the failed checks
   re-run, not everything.
6. **You advance to the next wave only after all the current wave's checks have passed.**

Why this works. Each agent's context window stays lean (the lead holds the big picture, the workers go
deep only on their own wave), and bugs, regressions, and vulnerabilities are caught *between* waves rather
than at the very end, where they're expensive to fix.

And here, too, you're in the loop: the lead shows you the result of each wave, and finished code does not
move on by itself. The commit is created without any AI attribution (a licensing constraint) and is not
pushed automatically — the branch waits for your review and a CI run.

---

## 6. Why this beats a single mega-prompt

- The context window never overflows: each stage and each wave gets only what it needs.
- Mistakes are caught where they are cheapest to fix — a wrong design is corrected in text, not in code.
- The model never has to guess: by implementation time it has an approved design, a concrete plan, and
  your project's standards.
- The heaviest review effort is spent only where risk is real.
- Discovered work and manual launch steps are captured, not lost.

The methodology is a living engineering process — adapt the stage names, the escort triggers, and the
prompts to your team's culture. What matters is the principle: **control the context at every step.**
