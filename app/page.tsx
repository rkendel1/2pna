import Link from "next/link";
import { getBoard } from "@/src/lib/id8";

export const dynamic = "force-dynamic";

const COLUMN_ORDER = [
  "new",
  "preparing",
  "blocked",
  "ready",
  "decision",
  "done",
] as const;

const COLUMN_COPY: Record<(typeof COLUMN_ORDER)[number], string> = {
  new: "Incoming situations that are still being understood.",
  preparing: "ID8 is actively researching, coordinating, and collecting evidence.",
  blocked:
    "Exceptions only. These items explain what is missing, what was attempted, and the exact human input still required.",
  ready: "Preparation is complete and the situation package is ready for inspection.",
  decision: "Human judgment is required now.",
  done: "Decision, action, and outcome are all recorded.",
};

export default async function Home() {
  const board = await getBoard();

  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">ID8 · HUMAN ATTENTION &amp; DECISION READINESS</p>
          <h1>Software prepares the situation. Humans deliver the judgment.</h1>
          <p className="hero-copy">
            The board below is a projection of durable Attention → Context →
            Intent → Plan → Work → Evidence → Evaluation → Decision → Action →
            Outcome state. Cards are never moved manually.
          </p>
        </div>
        <div className="hero-panel">
          <span className="panel-kicker">showcase principles</span>
          <ul className="mini-list">
            <li>Kanban is a human-attention projection, not workflow state.</li>
            <li>Agents perform work, but ID8 owns plans, evidence, and decisions.</li>
            <li>Every meaningful transition is recorded as a durable event.</li>
          </ul>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Total situations</span>
          <strong>{board.metrics.total}</strong>
        </article>
        <article className="stat-card">
          <span>Autonomous work active</span>
          <strong>{board.metrics.activeWork}</strong>
        </article>
        <article className="stat-card">
          <span>Decision ready</span>
          <strong>{board.metrics.decisionReady}</strong>
        </article>
        <article className="stat-card warning">
          <span>Blocked exceptions</span>
          <strong>{board.columns.blocked.length}</strong>
        </article>
      </section>

      <section className="explanation-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">execution lifecycle</p>
              <h2>Authoritative system state</h2>
            </div>
          </div>
          <p className="panel-copy">
            Attention → Context → Intent → Plan → Work → Evidence → Evaluation →
            Decision → Action → Outcome
          </p>
        </article>
        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">user projection</p>
              <h2>Where does attention belong now?</h2>
            </div>
          </div>
          <p className="panel-copy">
            New → Preparing → Ready → Decision → Done, with Blocked reserved for
            exceptions that cannot progress autonomously.
          </p>
        </article>
      </section>

      <section className="board">
        {COLUMN_ORDER.map((column) => (
          <section
            className={`column ${column === "blocked" ? "blocked-column" : ""}`}
            key={column}
          >
            <header className="column-header">
              <div>
                <p className="column-label">{column}</p>
                <h2>{column.toUpperCase()}</h2>
              </div>
              <span>{board.columns[column].length}</span>
            </header>
            <p className="column-copy">{COLUMN_COPY[column]}</p>
            <div className="column-stack">
              {board.columns[column].map((situation) => (
                <Link
                  className="card"
                  href={`/situations/${situation.id}`}
                  key={situation.id}
                >
                  <div className="card-topline">
                    <span className={`badge badge-${situation.attentionState}`}>
                      {situation.attentionState}
                    </span>
                    <span className="subtle">{situation.lifecycleState}</span>
                  </div>
                  <h3>{situation.subject}</h3>
                  <p className="card-meta">
                    {situation.organizationName}
                    {situation.personName ? ` · ${situation.personName}` : ""}
                  </p>
                  <p className="card-copy">{situation.objective}</p>
                  <dl className="card-grid">
                    <div>
                      <dt>Intent</dt>
                      <dd>{situation.intentLabel}</dd>
                    </div>
                    <div>
                      <dt>Missing</dt>
                      <dd>{situation.missingRequirementsCount}</dd>
                    </div>
                    <div>
                      <dt>Evidence</dt>
                      <dd>{situation.evidenceCount}</dd>
                    </div>
                    <div>
                      <dt>Work</dt>
                      <dd>{situation.activeWorkSummary}</dd>
                    </div>
                  </dl>
                  <p className="reason">{situation.statusReason}</p>
                  {column === "blocked" && situation.blockedExplanation ? (
                    <p className="reason">{situation.blockedExplanation}</p>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
