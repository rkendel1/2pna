# ID8

ID8 is a Next.js showcase for a decision-readiness engine backed by FeltDB.

## Stack

- Next.js app router
- React
- `@feltdb/core@0.11.1` using the Node runtime
- Authoritative schema in `/home/runner/work/2pna/2pna/feltdb.flow`

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Showcase behavior

- The home page renders the human-attention kanban: `NEW → PREPARING → READY → DECISION → DONE`, with `BLOCKED` as an exception surface.
- Situation state is derived from durable lifecycle data, not from kanban-column writes.
- Detail pages expose context, intent, plan requirements, work, evidence, evaluation, decisions, actions, outcomes, and durable events.
- The sample situations demonstrate automatic progression:
  - `PREPARING → READY` through autonomous work completion
  - `BLOCKED → PREPARING/READY` after required human input
  - `DECISION → DONE` after a human action is taken