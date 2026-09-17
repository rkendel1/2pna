import Link from "next/link";
import { notFound } from "next/navigation";
import { advanceSituation, decideSituation, unblockSituation } from "@/app/actions";
import {
  getHumanAttentionRules,
  getSituation,
  labelForDecision,
  listFromField,
} from "@/src/lib/id8";

export const dynamic = "force-dynamic";

export default async function SituationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const situation = await getSituation(id);

  if (!situation) notFound();

  const contextKnown = listFromField(situation.context?.known);
  const contextInferred = listFromField(situation.context?.inferred);
  const contextUnknown = listFromField(situation.context?.unknown);
  const satisfied = listFromField(situation.evaluation?.satisfied_requirements);
  const missing = listFromField(situation.evaluation?.missing_requirements);
  const availableActions = listFromField(situation.decision?.available_actions);

  return (
    <main className="detail-shell">
      <Link className="detail-back" href="/">
        ← Back to board
      </Link>

      <section className="detail-hero">
        <div className="detail-title-row">
          <div>
            <p className="eyebrow">situation detail</p>
            <h1 className="detail-title">{situation.subject}</h1>
            <p className="detail-copy">
              {situation.organizationName}
              {situation.personName ? ` · ${situation.personName}` : ""}
              {situation.relationship ? ` · ${situation.relationship.type}` : ""}
            </p>
          </div>
          <span className={`badge badge-${situation.attentionState}`}>
            {situation.attentionState}
          </span>
        </div>

        <div className="detail-stat-grid">
          <dl className="detail-stat">
            <dt className="subtle">Lifecycle stage</dt>
            <dd>{situation.lifecycleState}</dd>
          </dl>
          <dl className="detail-stat">
            <dt className="subtle">Objective</dt>
            <dd>{situation.objective}</dd>
          </dl>
          <dl className="detail-stat">
            <dt className="subtle">Current evaluation</dt>
            <dd>{situation.evaluation?.status ?? "pending"}</dd>
          </dl>
        </div>
      </section>

      <section className="detail-grid">
        <div className="detail-sections">
          <article className="panel detail-section">
            <p className="eyebrow">context</p>
            <h2>What ID8 already knows</h2>
            <p className="detail-copy">
              {situation.context?.summary ?? "Context has not been resolved yet."}
            </p>
            <ul className="detail-list">
              {contextKnown.map((item) => (
                <li key={item}>
                  <strong>Known:</strong> {item}
                </li>
              ))}
              {contextInferred.map((item) => (
                <li key={item}>
                  <strong>Inferred:</strong> {item}
                </li>
              ))}
              {contextUnknown.map((item) => (
                <li key={item}>
                  <strong>Unknown:</strong> {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="panel detail-section">
            <p className="eyebrow">intent + plan</p>
            <h2>Outcome being pursued</h2>
            <p className="detail-copy">
              {situation.intent?.description ?? "Intent still being resolved."}
            </p>
            <ul className="requirement-list">
              {situation.requirements.map((requirement) => (
                <li className="requirement-item" key={requirement.id}>
                  <div className="requirement-header">
                    <strong>{requirement.description}</strong>
                    <span
                      className={`badge ${
                        requirement.satisfied ? "badge-ready" : "badge-new"
                      }`}
                    >
                      {requirement.satisfied ? "satisfied" : "missing"}
                    </span>
                  </div>
                  <p className="requirement-meta">
                    {requirement.type} · evidence ids:{" "}
                    {listFromField(requirement.evidence_ids).join(", ") || "none"}
                  </p>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel detail-section">
            <p className="eyebrow">evidence + evaluation</p>
            <h2>Is this situation ready to advance?</h2>
            <p className="detail-copy">
              {situation.evaluation?.rationale ?? "Evaluation has not run yet."}
            </p>
            <div className="detail-grid">
              <div className="panel">
                <p className="panel-kicker">satisfied requirements</p>
                <ul className="detail-list">
                  {satisfied.length ? satisfied.map((item) => <li key={item}>{item}</li>) : <li>None yet.</li>}
                </ul>
              </div>
              <div className="panel">
                <p className="panel-kicker">missing requirements</p>
                <ul className="detail-list">
                  {missing.length ? missing.map((item) => <li key={item}>{item}</li>) : <li>Nothing missing.</li>}
                </ul>
              </div>
            </div>
            <table className="detail-table">
              <thead>
                <tr>
                  <th>Evidence</th>
                  <th>Value</th>
                  <th>Provenance</th>
                </tr>
              </thead>
              <tbody>
                {situation.evidence.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <strong>{record.subject}</strong>
                      <div className="subtle">{record.type}</div>
                    </td>
                    <td>{record.value}</td>
                    <td>{record.provenance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="panel detail-section">
            <p className="eyebrow">work</p>
            <h2>Authorized work underway</h2>
            {situation.work.length ? (
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>Work</th>
                    <th>Status</th>
                    <th>Actor</th>
                    <th>Output</th>
                  </tr>
                </thead>
                <tbody>
                  {situation.work.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.type}</strong>
                        <div className="subtle">{item.input}</div>
                      </td>
                      <td>{item.status}</td>
                      <td>{item.actor}</td>
                      <td>{item.output}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <h3>No active work</h3>
                <p className="empty-copy">
                  This situation is currently driven by evaluation or completed action history.
                </p>
              </div>
            )}
          </article>
        </div>

        <div className="detail-side-grid">
          <article className="action-form">
            <p className="eyebrow">decision surface</p>
            <h3>{situation.decision?.title ?? "No immediate human decision required"}</h3>
            <p className="detail-copy">
              {situation.decision?.summary ??
                "This situation is ready for review, but ID8 does not yet require explicit human judgment."}
            </p>

            {situation.attentionState === "preparing" ? (
              <form action={advanceSituation} className="action-stack">
                <input name="attentionId" type="hidden" value={situation.id} />
                <p className="metric-note">
                  Trigger the next autonomous step to show the PREPARING → READY automatic progression.
                </p>
                <button className="action-button" type="submit">
                  Continue Autonomous Work
                </button>
              </form>
            ) : null}

            {situation.attentionState === "blocked" ? (
              <form action={unblockSituation} className="action-stack">
                <input name="attentionId" type="hidden" value={situation.id} />
                <p className="metric-note">{situation.blockedExplanation}</p>
                <button className="action-button" type="submit">
                  Provide Required Human Input
                </button>
              </form>
            ) : null}

            {situation.attentionState === "decision" && availableActions.length ? (
              <div className="action-stack">
                <p className="metric-note">
                  When a card reaches DECISION, the human should not need to reconstruct the situation.
                </p>
                {availableActions.map((choice) => (
                  <form action={decideSituation} key={choice}>
                    <input name="attentionId" type="hidden" value={situation.id} />
                    <input name="decision" type="hidden" value={choice} />
                    <button className="action-button" type="submit">
                      {labelForDecision(choice)}
                    </button>
                  </form>
                ))}
              </div>
            ) : null}
          </article>

          <article className="panel">
            <p className="eyebrow">human attention rules</p>
            <h2>Projection logic</h2>
            <ul className="detail-list">
              {getHumanAttentionRules().map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </article>

          <article className="timeline">
            <p className="eyebrow">timeline</p>
            <h2>Durable events</h2>
            <ul className="timeline-list">
              {situation.timeline.map((event) => (
                <li key={event.id}>
                  <strong>{event.type}</strong>
                  <div className="timeline-meta">
                    {new Date(event.created_at).toLocaleString()} · {event.stage}
                  </div>
                  <p className="reason">{event.detail}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="panel">
            <p className="eyebrow">outcomes</p>
            <h2>Recorded results</h2>
            {situation.outcomes.length ? (
              <ul className="detail-list">
                {situation.outcomes.map((outcome) => (
                  <li key={outcome.id}>{outcome.summary}</li>
                ))}
              </ul>
            ) : (
              <p className="detail-copy">No outcome has been recorded yet.</p>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
