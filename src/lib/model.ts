export type LifecycleState =
  | "attention"
  | "context"
  | "intent"
  | "plan"
  | "work"
  | "evidence"
  | "evaluation"
  | "decision"
  | "action"
  | "outcome";

export type HumanAttentionState =
  | "new"
  | "preparing"
  | "ready"
  | "decision"
  | "blocked"
  | "done";

export type WorkState =
  | "queued"
  | "running"
  | "waiting"
  | "completed"
  | "failed"
  | "blocked"
  | "cancelled";

export interface Person {
  id: string;
  name: string;
  title: string;
  email: string;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  location: string;
  created_at: string;
}

export interface Relationship {
  id: string;
  person: string;
  organization: string;
  type: string;
  summary: string;
  created_at: string;
}

export interface Attention {
  id: string;
  type: string;
  source: string;
  subject: string;
  raw_data: string;
  occurred_at: string;
  status: string;
  person?: string;
  organization?: string;
}

export interface ContextSnapshot {
  id: string;
  attention: string;
  status: "pending" | "resolved";
  summary: string;
  known: string;
  inferred: string;
  unknown: string;
  previous_interactions: number;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  attention: string;
  channel: string;
  summary: string;
  occurred_at: string;
}

export interface Intent {
  id: string;
  attention: string;
  type: string;
  description: string;
  confidence: number;
  source: "explicit" | "inferred" | "confirmed" | "rejected";
  status: "pending" | "explicit" | "inferred" | "confirmed" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  attention: string;
  intent: string;
  objective: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Requirement {
  id: string;
  plan: string;
  type: string;
  description: string;
  required: boolean;
  satisfied: boolean;
  evidence_ids: string;
  created_at: string;
  updated_at: string;
}

export interface Work {
  id: string;
  plan: string;
  requirement: string;
  type: string;
  actor: string;
  status: WorkState;
  input: string;
  output: string;
  provenance: string;
  started_at?: string;
  completed_at?: string;
  blocking_reason?: string;
  attempted_automation?: string;
  required_human_input?: string;
}

export interface Artifact {
  id: string;
  attention: string;
  type: string;
  title: string;
  source: string;
  raw_content: string;
  created_at: string;
}

export interface Evidence {
  id: string;
  attention: string;
  requirement: string;
  type: string;
  subject: string;
  value: string;
  source: string;
  provenance: string;
  confidence: number;
  artifact?: string;
  created_at: string;
}

export interface Evaluation {
  id: string;
  plan: string;
  attention: string;
  status: "ready" | "not-ready";
  satisfied_requirements: string;
  missing_requirements: string;
  rationale: string;
  evidence_ids: string;
  evaluated_at: string;
}

export type DecisionChoice = "present_proposal" | "request_changes" | "defer";

export interface Decision {
  id: string;
  attention: string;
  plan: string;
  title: string;
  summary: string;
  requires_human_judgment: boolean;
  available_actions: string;
  status: "pending" | "ready" | "completed";
  selected_action?: DecisionChoice;
  decided_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: string;
  decision: string;
  attention: string;
  type: string;
  parameters: string;
  status: "pending" | "completed";
  result: string;
  executed_at?: string;
}

export interface Outcome {
  id: string;
  attention: string;
  action: string;
  summary: string;
  created_at: string;
  generates_new_attention: boolean;
}

export interface DurableEvent {
  id: string;
  attention: string;
  type: string;
  detail: string;
  stage: LifecycleState;
  created_at: string;
}

export interface SituationSummary {
  id: string;
  subject: string;
  objective: string;
  attentionState: HumanAttentionState;
  lifecycleState: LifecycleState;
  intentLabel: string;
  organizationName: string;
  personName?: string;
  missingRequirementsCount: number;
  evidenceCount: number;
  activeWorkSummary: string;
  statusReason: string;
  blockedExplanation?: string;
}

export interface SituationDetail extends SituationSummary {
  attention: Attention;
  context?: ContextSnapshot;
  intent?: Intent;
  plan?: Plan;
  relationship?: Relationship;
  requirements: Requirement[];
  work: Work[];
  evidence: Evidence[];
  artifacts: Artifact[];
  evaluation?: Evaluation;
  decision?: Decision;
  actions: Action[];
  outcomes: Outcome[];
  interactions: Interaction[];
  timeline: DurableEvent[];
  person?: Person;
  organization?: Organization;
}
