# <Your Project> — Claude Code Context

@./AGENTS.md

---

**Everything above this line is imported from `AGENTS.md` — the single shared canon read by both Claude
Code (via this import) and Codex (natively).** Edit shared rules there, not here. This file holds ONLY
the Claude-Code-specific rules.

The `/tms-*` skills are invocation shortcuts for each pipeline stage; they carry the same methodology and
read project specifics from `AGENTS.md`. Stage `04_implementation` follows the Mandatory Multi-Agent
Execution rule below whether invoked via `/tms-implement` or directly.

---

## Implementation Phase — Mandatory Multi-Agent Execution

When executing stage `04_implementation` for any backlog item, **always use the multi-agent "mob
programming" approach**. The lead (the main conversation) does NOT write code directly — it orchestrates
parallel subagents via the `Agent` tool and enforces quality gates between waves of the already-approved
delivery plan.

**This rule is scoped strictly to the execution of `04_implementation`.** It does NOT apply to earlier
stages (`02_design`, `03_delivery_plan`, etc.) — those are normal lead work and must not trigger the
code-writing dispatch defined here.

**One explicit exception:** stage `01_research` may run a bounded, read-only **search fan-out** as
defined in the `tms-research` skill — cheap-tier gatherer sub-agents collecting code/doc evidence in
parallel, with the top-tier lead verifying and synthesizing. This is gathering, not the code-writing mob:
sub-agents never edit source, the lead never delegates the design/interview judgement. It is the only
earlier-stage multi-agent pattern permitted.

### Agent Team (delegate via `Agent` tool)
1. **Backend / Frontend Developer** — writes the code per the wave brief.
2. **Tester/Builder** — compiles, runs tests, lint, typecheck; reports green/red.
3. **Architect** — verifies code matches `02_design.md` / `03_delivery_plan.md`, no drift.
4. **Security Specialist** — scans for vulnerabilities (auth, input validation, tenant scoping, secret
   leakage).
5. **Reviewer** — verifies plan compliance and acceptance criteria from `03_delivery_plan.md`.

The lead writes briefs, dispatches subagents, collects results, and decides gate pass/fail. The lead
never edits source code itself during this stage.

### Wave Profile — Minimal Escort By Default, Full Escort On Triggers

**The lead MUST classify every wave into one of three escort profiles before dispatching agents.** The
default is the smallest profile that still satisfies the trigger rules. Spend the heaviest review effort
(Architect + Security) only where it adds signal. Record the chosen profile and trigger reason as a
one-line note at the top of each wave section in `04_implementation.md`
(e.g. `Escort: full — touches auth and tenant-scoping`).

#### Profile A — Minimal (Dev + Tester + Reviewer)
**Use when** the wave only: renames/moves/non-behavioural refactor; adjusts copy, i18n, comments;
updates UI styling/layout (no new data flow); adds tests/fixtures without touching production paths;
writes the final report / closeout wave. Skip Architect and Security.

#### Profile B — Standard (Dev + Tester + Architect + Reviewer)
**Use when** the wave: introduces or modifies non-trivial business logic/services/workflows; changes API
request/response shapes or adds endpoints; changes UI behaviour with new data flow; changes the schema or
migrations **without** touching auth/tenant scope. Skip Security.

#### Profile C — Full (Dev + Tester + Architect + Security + Reviewer)
**Use when ANY Profile-C trigger from `AGENTS.md` applies — these are non-negotiable.** (Auth/authz,
tenant-scoping/identity resolution, trust-boundary input validation, secrets/signing/webhook verify,
payments, PII/cross-tenant, new mutating command surfaces, and your project's listed module paths.)
Full escort is the **only** correct choice for these triggers, even if the wave is otherwise small.

#### Escalation
If a Standard or Minimal wave surfaces something that hits a Profile C trigger mid-wave, the lead MUST
escalate: spawn the missing Security (and Architect, if Minimal) agent before passing the gate. Do not
rationalise a downgrade.

### Quality Gates (wave-by-wave)
The delivery plan (`03_delivery_plan.md`) is divided into waves. For each wave:
1. Determine the wave's escort profile (A/B/C). Record it and the trigger reason in `04_implementation.md`.
2. Dispatch the Developer agent with the wave brief (scope, files, acceptance).
3. After code is produced, dispatch the proving roles for the chosen profile **in parallel**:
   - Profile A: Tester + Reviewer
   - Profile B: Tester + Architect + Reviewer
   - Profile C: Tester + Architect + Security + Reviewer
4. Collect all results. A wave **passes** only if every spawned check returns green:
   - Tester: ✅ build green, tests green, types green, lint green
   - Architect (B/C): ✅ no design drift
   - Security (C): ✅ no new vulnerabilities introduced
   - Reviewer: ✅ matches plan + acceptance criteria
5. If any gate fails: spawn a focused fix agent with the specific findings, re-run failed gates only.
6. Only after all gates pass: proceed to the next wave.

### Context Budget Discipline
- Keep the lead's context lean: hand off full file reads and code generation to subagents.
- If a wave is too large, break it into smaller sub-waves before dispatching.
- **Choosing the wave profile (A/B/C) is the primary cost lever.** Minimal escort costs roughly 40% of
  full escort per wave — default to the smallest profile the trigger rules allow, never run full escort
  "to be safe".
- Target: lead retains ≥20% headroom, each worker agent retains a healthy margin.

### Closing the Stage (mandatory)
After all waves pass their gates, before the turn ends:
- **Follow-up capture** and **Pre-Launch Manual Action capture** per the rules in `AGENTS.md`.
  Follow-ups left only in `04_implementation.md` are lost.
- Create the commit(s) per the commit rules in `AGENTS.md` (no AI attribution; do not push automatically).

### Triggers
**Only the execution of stage `04_implementation` triggers this rule.** ("do 04 for <ticket>",
"execute 04_implementation", "implement <ticket>" when `03_delivery_plan.md` is approved.)
**Not triggers** (normal single-agent lead work): writing/revising any pre-implementation artifact;
discussing/refining the plan; estimations, scoping, research. Skip the multi-agent flow only if the user
explicitly says "implement inline" or "no subagents".

---

## Auto Mode Discipline — No Speculative Expansion

When the user runs Claude Code in **auto mode** (Bypass Permissions), the lead MUST behave with the same
scoping discipline as in edit-automatically mode. Auto mode removes the permission prompt; it does NOT
grant license to widen scope. The dominant waste pattern in auto mode is silent scope inflation.

### Forbidden in auto mode
- **No exploratory subagents beyond the wave's escort profile.** Escalate only on explicit Profile C
  triggers.
- **No speculative `bash` / `grep` / `read` / file listing** "just to be safe". Every shell or file read
  must be tied to the current step's deliverable.
- **No parallel side-investigations** off the main line. One hypothesis at a time; if a second seems
  worth pursuing, stop and surface it to the user.
- **No "while I'm here" cleanup/refactor/doc edits** discovered in passing. Capture as a follow-up.
- **No retries of a failed approach with a slightly different prompt.** Surface the failure and ask.

### Still allowed (and required) in auto mode
- **Parallel dispatch of proving roles inside a single wave** — mandatory, saves wall-clock, adds no
  tokens vs. sequential.
- **Parallel tool calls in a single message when independent and clearly needed for the same step.**
- **Acting without confirmation on local, reversible work unambiguously inside the current scope** —
  that is the point of auto mode. The discipline is about scope, not asking permission for in-scope edits.

### Heuristic
Before any tool call in auto mode: *"Would I have run this in edit-automatically mode without the user
pushing back?"* If "probably not, I was just being thorough" — don't run it.
