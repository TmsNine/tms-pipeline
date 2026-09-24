# Model routing for tms-pipeline

> Current as of July 12, 2026. The Russian version is canonical:
> [06-model-routing.ru.md](06-model-routing.ru.md).

This memo answers a practical question: which model and reasoning effort should run each stage so the
pipeline does not buy maximum capability for mechanical work or save money on high-blast-radius
judgement.

OpenAI currently describes **GPT-5.6 Sol** as the flagship for complex reasoning and coding,
**GPT-5.6 Terra** as the intelligence/cost balance, and **GPT-5.6 Luna** as the cost-sensitive,
high-volume option. Source: [official OpenAI model catalog](https://developers.openai.com/api/docs/models).

Model names and availability may vary by Codex host and account. If the runtime cannot prove that a role
or model was selected, the skill must not claim enforcement; record
`actual model = runtime-selected/unknown`.

## Codex recommended route

| Stage / work | Default | Escalate when | Why |
|---|---|---|---|
| 00 Ticket | Luna medium | Terra medium when scope is genuinely disputed | Indexing and classification are bounded. |
| 01 Research — lead | Terra high | Sol high/xhigh for auth, tenant scope, payments, PII, migrations, queues, or lifecycle | The lead judges which facts carry the design. |
| 01 Research — explorers | Terra medium | Terra high for a large cross-module map | Collectors return `path:line` evidence and make no product decision. |
| 02 Design | Sol high | Sol xhigh for R/C; Max only for one unresolved Profile-C decision after a normal strong pass | A design mistake propagates into every later stage. |
| 02b Gap audit | Sol high | Sol xhigh for security/privacy/money/tenant/migration/lifecycle risk | This is independent risk judgement, not checklist execution. |
| 03 Delivery plan | Terra high | Luna medium for obvious M; Sol high for unresolved R/C ambiguity | Planning decomposes an approved design but must not under-classify risk. |
| 04 Implementation M/E | Terra high lead; Luna/Terra bounded helpers | Sol high only when implementation exposes a critical X-ID | Bounded work stays cheap without losing targeted evidence. |
| 04 Implementation R | Terra high Developer/Architect; Luna Validator; Sol high wave Reviewer/Security when triggered | Sol xhigh for a difficult money/security decision | Real role separation catches defects while the wave is still local. |
| 04 Implementation C | Terra high Developer by default; Luna Validator; Sol high/xhigh Architect/Security/wave Reviewer | Sol high Developer only for a difficult C coding branch | Spend strongest judgement on proving roles, not routine code/log collection. |
| 04b Review M/E | Fresh Terra high | A new fresh Terra high after every fix | Context independence matters more than one oversized model call. |
| 04b Review R/C | Sol xhigh risk reviewer + Terra/Sol high integration reviewer on the same fingerprint; fresh Sol high/xhigh final pass | Max only for a genuine unresolved disagreement; never reveal attempt budget or PASS threshold | Orthogonal first-pass coverage is batched before one final confirmation. |
| 05 Test report | Luna medium | Terra high for ambiguous failures; Sol high for R/C diagnosis | Known commands and compact pass/fail reporting are cheap; root-cause judgement is not. |
| 06 Review gate | Terra high for straightforward `go` | Sol high/xhigh for `conditional_go`, `no-go`, R/C, partial validation, or manual gates | A cheap summarizer must not issue the final verdict. |
| Full codebase audit | Terra for zone maps; Terra/Sol finder and skeptic by risk | Ultra only for deliberate non-scoring synthesis of genuinely independent zones | Several independent zones beat one undifferentiated giant context. |

## Claude Code role route

Claude aliases are tool-native defaults, not direct quality equivalents of Sol/Terra/Luna:

| Stage-04 role / profile | Default | Escalation and evidence |
|---|---|---|
| M | Lead implements inline | No coding subagent; record lead model when exposed |
| E | Lead inline; one bounded Architect/evidence pass + Tester | Architect/Tester `sonnet`; strengthen judgement per invocation when needed |
| R | Developer/Tester/Architect/Reviewer `sonnet`; triggered Security `opus` | Record preferred, configured and actual model; unknown stays `runtime-selected/unknown` |
| C | Full role set | Override Architect/Reviewer to the strongest available tier; keep Security on `opus` |

Agent files also set tool allowlists and permission declarations. Claude Code may override model choice
through environment or a per-invocation selection; its documented model precedence is environment →
invocation → agent frontmatter → main conversation. `permissionMode` applies to copied project/user agents
but is ignored for plugin-shipped agents, so plugin runs must record parent/runtime permission evidence.
Never claim enforcement merely because frontmatter contains a value. Source: [official Claude Code subagent documentation](https://code.claude.com/docs/en/sub-agents).

## Hard constraints

- Never use **Fast mode** for pipeline stages.
- Never use **Ultra for scoring review**. Context size does not replace reviewer independence.
- **Max is not a normal default.** It is a targeted escalation for one difficult decision.
- Any code/test/SQL/contract/config change invalidates the previous 04b acceptance; rerun validation and
  use a fresh reviewer on the same final state.
- A cheap evidence agent never makes product, architecture, security, privacy, payment, or final-stage
  decisions.

## When GPT-5.6 is unavailable

Current skill fallbacks are:

- Luna → `gpt-5.4-mini`;
- Terra → `gpt-5.4`;
- Sol → `gpt-5.5`.

These are tms-pipeline fallback rules, not claims of identical quality. When the model family changes,
check the [official catalog](https://developers.openai.com/api/docs/models), then update the Codex skill
model strings and `codex-agents/*.toml`, and update this memo last.

## What matters more than the model name

1. A clean stage input from the previous artifact.
2. Fresh isolated context for design audit and scoring review.
3. An exact task-owned diff and fingerprint.
4. Strong models only where the agent makes a high-blast-radius decision.
5. An honest non-PASS whenever the evidence does not match the final implementation.
