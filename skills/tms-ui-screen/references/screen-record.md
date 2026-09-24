# Screen record

Use this template inside the existing screen register or the owning task artifact. Do not create a separate file per screen if the project already has a register (`AGENTS.md` → *UI And Design*).

Write the record in the project's output language (`AGENTS.md` → *Operating Standard*); translate the field names below if it is not English.

```markdown
### <surface id> — <human-readable name>

- Mode: `polish | redesign | concept`
- Role: `<the product's roles, e.g. admin | manager | member | customer | operator | public>`
- Surface package: `<top-level route + required sub-screens>`
- In scope: `<exact list>`
- Out of scope: `<exact list>`
- User job: `<what the person must finish>`
- Entry: `<real entry path>`
- Exit: `<real exit path>`
- Primary action: `<one main action>`
- Approved peers: `<two closest accepted screens>`
- QA route: `<stable URL>`
- QA data: `prototype | demo | real API`
- Visual status: `pending | concept_approved | fixed | accepted`
- Integration status: `prototype | real_component_demo_data | real_route_real_api`
- Release status: `worktree | committed | deployed`
- Gap status: `none | <ticket ids> | manual_gate`
- Decision log:
  - `<date>: <the owner's decision and its literal meaning>`
- Backend coverage:
  - `primary`: `<contracts>`
  - `secondary`: `<contracts>`
  - `disclosure`: `<contracts>`
  - `hidden_technical`: `<contracts>`
  - `missing_contract`: `<gaps>`
- Required states: `<loading / empty / error / populated / in-progress / success>`
- Acceptance evidence: `<screenshots, viewports, review verdict, fingerprint>`
- Production path: `<none | release path | ticket id>`
```

## Status rules

- Set `concept_approved` only after the owner's explicit decision on the first interactive slice.
- Set `fixed` after full implementation, self-QA and a fresh independent PASS.
- Set `accepted` only after the owner's manual visual acceptance.
- Do not change `release_status` just because local code exists.
- If QA uses production components with demo data, state `real_component_demo_data`, not `real_route_real_api`.
- After any visual edit to an accepted screen, move it back `accepted -> fixed`.

## Acceptance snapshot

Keep the minimal evidence set:

- the stable QA route;
- narrow and wide screenshots;
- the exact list of accepted sub-screens;
- the owner's key decisions;
- check commands and their results;
- the fresh independent review;
- a repository fingerprint, if the project has a canonical helper;
- the production parity ticket or an explicit `none`.
