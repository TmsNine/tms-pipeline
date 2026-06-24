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
  eight stages of the pipeline are eight such skills.
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
eight stages, adds a design audit that rates how serious each problem is, a way to avoid calling extra
checkers on simple tasks, and explicit rules so work discovered along the way is never lost.

> **You review every step (human in the loop).** This is not an autopilot. At every stage you review the
> agent's output before it proceeds: you don't hand off the work wholesale — you steer the agent and
> verify each step. This rule runs through every stage, from the ticket to the final code review.

---

## 2. The eight stages

There are eight stages. They are numbered 00 to 06, but an extra stage, 02b (the gap audit), sits between
02 and 03 — which is why it is eight, not seven.

It helps to see where the work goes up front: **most of the pipeline is thinking on paper.** Seven of the
eight stages produce a text document (`.md`); only one — stage 04 (implementation) — writes the actual
code. By the time the agent sits down to write code, the design has already been thought through, checked,
and agreed in text.

Each stage produces exactly one durable document in the task folder (`docs/<TICKET-ID>/`, or wherever you
set `TASK_FOLDER_PATTERN`). Stages run one at a time; by default the agent stops after each and waits for
your confirmation (you can ask it to run end-to-end).

A few terms from the table below are explained in full later on; briefly: the **task mode** is how heavy a
process this task needs (section 4); the **design contract** is a description of the change agreed up
front that the code is later checked against (section 3.1); a **wave** is a small slice of the task
finished on its own, apart from the rest; the **escort profile** is how many checking agents to call onto
a wave (section 3.2).

| # | Stage | Skill | Output | What happens |
|---|-------|-------|--------|--------------|
| 00 | Ticket | `/tms-ticket` | `00_ticket.md` | Capture the driver (why we are doing the task at all), the scope, and the acceptance criteria; confirm the task exists in the backlog; classify the task mode (see section 4). |
| 01 | Research | `/tms-research` | `01_research.md` | Narrow the codebase to the facts that matter right now ("as-is"): several agents search in parallel, the lead re-verifies. No opinions, no refactor advice. |
| 02 | Design | `/tms-design` | `02_design.md` | Write the design contract — an agreed description of the minimal sufficient change at the owning layer (the place in the code where the problem is actually fixed at its source). Reviewed by a human before any code. |
| 02b | Gap audit | `/tms-gap-audit` | `02b_gap_audit.md` | One bounded pass in which a different agent looks at the design with fresh, skeptical eyes, hunts for holes, and sorts each one into a severity class. |
| 03 | Delivery plan | `/tms-plan` | `03_delivery_plan.md` | Split the design into small, independently shippable waves; tag each with an escort profile. |
| 04 | Implementation | `/tms-implement` | code + `04_implementation.md` | The mob: the lead hands out the work to a developer agent and checking agents wave by wave, not moving on until every check is green. The only stage where code appears. |
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

### 3.2 How to avoid calling extra checkers: escort profiles

Running a full team of checking agents on every change is expensive. So tms-pipeline sorts each
implementation wave into one of three **escort profiles** — this is simply a decision about how many
checking agents to call — and by default picks the cheapest one the rules allow:

- **Profile A — Minimal** (developer + tester + reviewer): renames, copy and localization (i18n),
  styling, waves that change only tests.
- **Profile B — Standard** (plus an architect): non-trivial business logic, changes to the shape of an
  API, changes to the data schema that don't touch sign-in or the separation between tenants.
- **Profile C — Full** (plus a security agent): anything that touches security-sensitive parts of the
  code. That includes:
  - sign-in and checking who the user is;
  - **tenant separation** (a tenant is one customer in a shared system whose data must not be mixed with
    anyone else's; a single-user app has none);
  - validating data at the **trust boundary** (the spot where data arrives from outside and cannot be
    trusted without a check);
  - secrets and signing, payments, **PII** (a user's private details — name, email, phone);
  - new commands that change data.

Profile C is mandatory for its triggers — you list your project's exact triggers in `AGENTS.md` (the
project settings file the agents read to learn your rules). But C is the *exception*, not the default.
Minimal escort costs roughly 40% of full escort per wave (so the full profile is about 2.5× as
expensive), which makes the choice of profile the main cost lever. "Run full escort to be safe" is
explicitly discouraged here.

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

Feature work defaults to TDD-first; small work stays Direct. The full eight-stage machinery is for
substantial tasks, not for fixing a typo.

---

## 5. How the multi-agent implementation actually runs (stage 04)

At the implementation stage, the main agent in your chat (the lead) does **not** write code itself. Its
job is to hand out the work to subordinate role agents and make sure each piece passes the checks. One
**wave** (a small, self-contained piece from the plan) goes like this:

1. **The lead assesses how risky the wave is** — and picks escort profile A, B, or C (see section 3.2),
   recording the choice.
2. **It starts a developer agent** with a clear brief: what to do, which files to touch, what counts as
   done.
3. **In parallel it starts the checking agents** for that profile: tester — always; architect — on B and
   C; security — on C; reviewer — always.
4. **The wave passes only if every check is green:** the project builds, tests and types pass, the linter
   is clean, the code hasn't drifted from the design, there are no new vulnerabilities, and everything
   matches the plan and the acceptance criteria.
5. **If something fails** — a separate agent fixes exactly those findings, and only the failed checks
   re-run, not everything.
6. **You move to the next wave only after every check on the current wave has passed** (this is the gate:
   a checkpoint the work cannot pass until every check is green).

Why it works this way. Each agent's context window (its working memory) stays clear: the lead holds the
big picture, while each role agent digs deep only into its own wave. And bugs, regressions, and
vulnerabilities get caught *between* waves rather than at the very end, where they're expensive to fix.

Here, too, you review every step: the lead shows you the result of each wave, and finished code does not
move on by itself. The commit is created with no AI attribution of any kind (a licensing requirement) and
is not pushed to the remote automatically — the branch waits for you to review it and run it through **CI**
(a server that builds the project and runs the tests automatically after you push).

---

## 6. Why this beats a single mega-prompt

- The context window never overflows: each stage and each wave gets only what it needs.
- Mistakes are caught where they are cheapest to fix: a wrong design is corrected in text, before it has
  turned into code.
- The model never has to guess: by implementation time it already has an approved design, a concrete plan,
  and your project's standards.
- The heaviest review effort is spent only where the risk is real.
- Work found along the way and manual launch steps are captured, not lost.

This is a living engineering process: adapt the stage names, the escort triggers, and the prompts to your
team's culture. What matters is the principle: **control the context at every step.**
