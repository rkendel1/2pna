import "server-only";

import {
  actions,
  artifacts,
  attentions,
  contextSnapshots,
  decisions,
  durableEvents,
  evaluations,
  evidenceRecords,
  interactions,
  intents,
  organizations,
  outcomes,
  people,
  plans,
  relationships,
  requirements,
  workItems,
} from "@/src/lib/feltdb";
import type {
  Action,
  Attention,
  ContextSnapshot,
  Decision,
  DecisionChoice,
  DurableEvent,
  Evaluation,
  Evidence,
  HumanAttentionState,
  Interaction,
  Intent,
  LifecycleState,
  Organization,
  Outcome,
  Person,
  Plan,
  Relationship,
  Requirement,
  SituationDetail,
  SituationSummary,
  Work,
} from "@/src/lib/model";

type SeedBundle = {
  people: Person[];
  organizations: Organization[];
  relationships: Relationship[];
  attentions: Attention[];
  contexts: ContextSnapshot[];
  interactions: Interaction[];
  intents: Intent[];
  plans: Plan[];
  requirements: Requirement[];
  work: Work[];
  artifacts: import("@/src/lib/model").Artifact[];
  evidence: Evidence[];
  evaluations: Evaluation[];
  decisions: Decision[];
  actions: Action[];
  outcomes: Outcome[];
  events: DurableEvent[];
};

const decisionLabels: Record<DecisionChoice, string> = {
  present_proposal: "Present Proposal",
  request_changes: "Request Changes",
  defer: "Defer",
};

let seedPromise: Promise<void> | null = null;

const isoHoursAgo = (hoursAgo: number) =>
  new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

const parseList = (value?: string) =>
  value ? (JSON.parse(value) as string[]) : [];

const serializeList = (value: string[]) => JSON.stringify(value);

async function ensureSeedData() {
  if (!seedPromise) {
    seedPromise = (async () => {
      if ((await attentions.count()) > 0) {
        return;
      }

      const seed = buildSeedData();

      for (const record of seed.people) await people.put(record, record.id);
      for (const record of seed.organizations)
        await organizations.put(record, record.id);
      for (const record of seed.relationships)
        await relationships.put(record, record.id);
      for (const record of seed.attentions)
        await attentions.put(record, record.id);
      for (const record of seed.contexts)
        await contextSnapshots.put(record, record.id);
      for (const record of seed.interactions)
        await interactions.put(record, record.id);
      for (const record of seed.intents) await intents.put(record, record.id);
      for (const record of seed.plans) await plans.put(record, record.id);
      for (const record of seed.requirements)
        await requirements.put(record, record.id);
      for (const record of seed.work) await workItems.put(record, record.id);
      for (const record of seed.artifacts)
        await artifacts.put(record, record.id);
      for (const record of seed.evidence)
        await evidenceRecords.put(record, record.id);
      for (const record of seed.evaluations)
        await evaluations.put(record, record.id);
      for (const record of seed.decisions)
        await decisions.put(record, record.id);
      for (const record of seed.actions) await actions.put(record, record.id);
      for (const record of seed.outcomes) await outcomes.put(record, record.id);
      for (const record of seed.events)
        await durableEvents.put(record, record.id);
    })();
  }

  await seedPromise;
}

function buildSeedData(): SeedBundle {
  const pJane: Person = {
    id: "person-jane-smith",
    name: "Jane Smith",
    title: "Office Manager",
    email: "jane@abcmedical.example",
    created_at: isoHoursAgo(96),
  };
  const pOmar: Person = {
    id: "person-omar-hale",
    name: "Omar Hale",
    title: "Operations Lead",
    email: "omar@ridgeway.example",
    created_at: isoHoursAgo(74),
  };
  const pKira: Person = {
    id: "person-kira-chen",
    name: "Kira Chen",
    title: "Revenue Ops",
    email: "kira@northern.example",
    created_at: isoHoursAgo(30),
  };
  const orgAbc: Organization = {
    id: "org-abc-medical",
    name: "ABC Medical",
    industry: "Medical",
    location: "Providence, RI",
    created_at: isoHoursAgo(96),
  };
  const orgRidgeway: Organization = {
    id: "org-ridgeway",
    name: "Ridgeway Manufacturing",
    industry: "Manufacturing",
    location: "Hartford, CT",
    created_at: isoHoursAgo(74),
  };
  const orgNorthern: Organization = {
    id: "org-northern-light",
    name: "Northern Light Services",
    industry: "Professional Services",
    location: "Boston, MA",
    created_at: isoHoursAgo(30),
  };

  const attentionNew: Attention = {
    id: "attention-new-call",
    type: "outbound_call",
    source: "dialer",
    subject: "New outbound call with Jane Smith",
    raw_data:
      "Outbound call connected. Need to resolve the person, organization, and intent.",
    occurred_at: isoHoursAgo(1),
    status: "open",
    person: pJane.id,
    organization: orgAbc.id,
  };
  const attentionPreparing: Attention = {
    id: "attention-preparing-insurance",
    type: "outbound_call",
    source: "phone",
    subject: "Prepare commercial insurance proposal for ABC Medical",
    raw_data:
      "Jane Smith requested GL/PL, Property, and Workers' Compensation coverage.",
    occurred_at: isoHoursAgo(6),
    status: "open",
    person: pJane.id,
    organization: orgAbc.id,
  };
  const attentionReady: Attention = {
    id: "attention-ready-refund",
    type: "billing_email",
    source: "email",
    subject: "Verify duplicate charge for Ridgeway Manufacturing",
    raw_data: "Customer reports two matching charges on the same day.",
    occurred_at: isoHoursAgo(10),
    status: "open",
    person: pOmar.id,
    organization: orgRidgeway.id,
  };
  const attentionDecision: Attention = {
    id: "attention-decision-proposal",
    type: "sales_followup",
    source: "calendar",
    subject: "Present renewal proposal to Northern Light Services",
    raw_data: "Proposal package completed and scheduled for human review.",
    occurred_at: isoHoursAgo(14),
    status: "open",
    person: pKira.id,
    organization: orgNorthern.id,
  };
  const attentionDone: Attention = {
    id: "attention-done-renewal",
    type: "renewal",
    source: "crm",
    subject: "Complete renewal bind for Harbor Logistics",
    raw_data:
      "Customer approved renewal and bind instructions were executed.",
    occurred_at: isoHoursAgo(22),
    status: "closed",
  };
  const attentionBlocked: Attention = {
    id: "attention-blocked-payroll",
    type: "quote_request",
    source: "web_form",
    subject:
      "Complete workers' compensation submission for Ridgeway Manufacturing",
    raw_data:
      "Coverage request cannot advance without payroll detail by class code.",
    occurred_at: isoHoursAgo(5),
    status: "open",
    person: pOmar.id,
    organization: orgRidgeway.id,
  };

  const contexts: ContextSnapshot[] = [
    {
      id: "context-new-call",
      attention: attentionNew.id,
      status: "pending",
      summary: "Attention received. Context resolution has not completed.",
      known: serializeList(["Caller identity suspected: Jane Smith"]),
      inferred: serializeList([
        "Likely related to commercial insurance outreach",
      ]),
      unknown: serializeList([
        "Organization match confirmation",
        "Intent confirmation",
        "Coverage scope",
      ]),
      previous_interactions: 0,
      created_at: isoHoursAgo(1),
      updated_at: isoHoursAgo(1),
    },
    {
      id: "context-preparing-insurance",
      attention: attentionPreparing.id,
      status: "resolved",
      summary:
        "Prospect resolved with existing relationship history and underwriting facts.",
      known: serializeList([
        "Jane Smith is the office manager",
        "ABC Medical is a prospect",
        "Industry: Medical",
        "Location: Providence, RI",
      ]),
      inferred: serializeList([
        "Workers' compensation coverage needed for expansion",
      ]),
      unknown: serializeList(["Workers' compensation quote response"]),
      previous_interactions: 3,
      created_at: isoHoursAgo(6),
      updated_at: isoHoursAgo(5),
    },
    {
      id: "context-ready-refund",
      attention: attentionReady.id,
      status: "resolved",
      summary:
        "Customer, account history, and duplicate transaction context resolved.",
      known: serializeList([
        "Active customer account located",
        "Two matching charges found",
        "No previous refund on file",
      ]),
      inferred: serializeList([
        "Refund package should be staged for scheduled review",
      ]),
      unknown: serializeList([]),
      previous_interactions: 4,
      created_at: isoHoursAgo(10),
      updated_at: isoHoursAgo(9),
    },
    {
      id: "context-decision-proposal",
      attention: attentionDecision.id,
      status: "resolved",
      summary:
        "Proposal package assembled with complete context and previous meeting history.",
      known: serializeList([
        "Existing customer",
        "Decision maker confirmed",
        "Renewal proposal assembled",
      ]),
      inferred: serializeList(["Present proposal in next review meeting"]),
      unknown: serializeList([]),
      previous_interactions: 7,
      created_at: isoHoursAgo(14),
      updated_at: isoHoursAgo(13),
    },
    {
      id: "context-done-renewal",
      attention: attentionDone.id,
      status: "resolved",
      summary:
        "Renewal bind completed with durable outcome already recorded.",
      known: serializeList(["Approval recorded", "Carrier bind confirmed"]),
      inferred: serializeList([]),
      unknown: serializeList([]),
      previous_interactions: 11,
      created_at: isoHoursAgo(22),
      updated_at: isoHoursAgo(20),
    },
    {
      id: "context-blocked-payroll",
      attention: attentionBlocked.id,
      status: "resolved",
      summary:
        "Customer and requested coverage are known, but payroll by class code is missing.",
      known: serializeList([
        "Ridgeway Manufacturing account resolved",
        "WC coverage requested",
        "Property and GL/PL facts already verified",
      ]),
      inferred: serializeList([
        "Carrier appetite remains acceptable if payroll is confirmed",
      ]),
      unknown: serializeList([
        "Payroll by class code",
        "Owner/officer inclusion decision",
      ]),
      previous_interactions: 5,
      created_at: isoHoursAgo(5),
      updated_at: isoHoursAgo(4),
    },
  ];

  const intentPreparing: Intent = {
    id: "intent-preparing-insurance",
    attention: attentionPreparing.id,
    type: "obtain_insurance_quotes",
    description:
      "Prepare a complete insurance proposal across GL/PL, Property, and WC.",
    confidence: 0.98,
    source: "confirmed",
    status: "confirmed",
    created_at: isoHoursAgo(6),
    updated_at: isoHoursAgo(6),
  };
  const intentReady: Intent = {
    id: "intent-ready-refund",
    attention: attentionReady.id,
    type: "resolve_duplicate_charge",
    description:
      "Determine whether the customer experienced a duplicate charge and package the answer.",
    confidence: 0.97,
    source: "explicit",
    status: "confirmed",
    created_at: isoHoursAgo(10),
    updated_at: isoHoursAgo(9),
  };
  const intentDecision: Intent = {
    id: "intent-decision-proposal",
    attention: attentionDecision.id,
    type: "present_renewal_proposal",
    description: "Present the assembled renewal package for approval.",
    confidence: 0.99,
    source: "confirmed",
    status: "confirmed",
    created_at: isoHoursAgo(14),
    updated_at: isoHoursAgo(13),
  };
  const intentDone: Intent = {
    id: "intent-done-renewal",
    attention: attentionDone.id,
    type: "bind_policy",
    description: "Bind the approved renewal policy.",
    confidence: 1,
    source: "confirmed",
    status: "confirmed",
    created_at: isoHoursAgo(22),
    updated_at: isoHoursAgo(21),
  };
  const intentBlocked: Intent = {
    id: "intent-blocked-payroll",
    attention: attentionBlocked.id,
    type: "prepare_wc_submission",
    description: "Complete the workers' compensation submission package.",
    confidence: 0.95,
    source: "confirmed",
    status: "confirmed",
    created_at: isoHoursAgo(5),
    updated_at: isoHoursAgo(4),
  };

  const planPreparing: Plan = {
    id: "plan-preparing-insurance",
    attention: attentionPreparing.id,
    intent: intentPreparing.id,
    objective: "Prepare a complete insurance proposal for ABC Medical.",
    status: "active",
    created_at: isoHoursAgo(6),
    updated_at: isoHoursAgo(2),
  };
  const planReady: Plan = {
    id: "plan-ready-refund",
    attention: attentionReady.id,
    intent: intentReady.id,
    objective:
      "Package the duplicate-charge finding and refund recommendation.",
    status: "ready",
    created_at: isoHoursAgo(10),
    updated_at: isoHoursAgo(8),
  };
  const planDecision: Plan = {
    id: "plan-decision-proposal",
    attention: attentionDecision.id,
    intent: intentDecision.id,
    objective:
      "Present the completed renewal proposal with evidence and recommended actions.",
    status: "ready",
    created_at: isoHoursAgo(14),
    updated_at: isoHoursAgo(12),
  };
  const planDone: Plan = {
    id: "plan-done-renewal",
    attention: attentionDone.id,
    intent: intentDone.id,
    objective: "Bind the approved renewal and record the result.",
    status: "completed",
    created_at: isoHoursAgo(22),
    updated_at: isoHoursAgo(18),
  };
  const planBlocked: Plan = {
    id: "plan-blocked-payroll",
    attention: attentionBlocked.id,
    intent: intentBlocked.id,
    objective: "Complete the workers' compensation submission package.",
    status: "active",
    created_at: isoHoursAgo(5),
    updated_at: isoHoursAgo(4),
  };

  const requirementsFor = (
    planId: string,
    items: Array<[string, string, boolean, string[]]>,
  ): Requirement[] =>
    items.map(([id, description, satisfied, evidenceIds]) => ({
      id,
      plan: planId,
      type: "evidentiary",
      description,
      required: true,
      satisfied,
      evidence_ids: serializeList(evidenceIds),
      created_at: isoHoursAgo(6),
      updated_at: isoHoursAgo(2),
    }));

  const allRequirements = [
    ...requirementsFor(planPreparing.id, [
      ["req-prep-company", "Company identity verified", true, ["ev-prep-company"]],
      ["req-prep-contact", "Contact identity confirmed", true, ["ev-prep-contact"]],
      ["req-prep-gl", "GL/PL quote received", true, ["ev-prep-gl"]],
      ["req-prep-property", "Property quote received", true, ["ev-prep-property"]],
      ["req-prep-wc", "Workers' compensation quote received", false, []],
      ["req-prep-proposal", "Proposal artifacts assembled", true, ["ev-prep-proposal"]],
    ]),
    ...requirementsFor(planReady.id, [
      ["req-ready-account", "Customer account verified", true, ["ev-ready-account"]],
      ["req-ready-charges", "Duplicate charges confirmed", true, ["ev-ready-charge-a", "ev-ready-charge-b"]],
      ["req-ready-eligibility", "Refund eligibility established", true, ["ev-ready-eligibility"]],
    ]),
    ...requirementsFor(planDecision.id, [
      ["req-decision-package", "Proposal package assembled", true, ["ev-decision-package"]],
      ["req-decision-premium", "Annual premium calculated", true, ["ev-decision-premium"]],
      ["req-decision-risks", "Risks and uncertainties summarized", true, ["ev-decision-risks"]],
    ]),
    ...requirementsFor(planDone.id, [
      ["req-done-approval", "Approval recorded", true, ["ev-done-approval"]],
      ["req-done-bind", "Carrier bind confirmed", true, ["ev-done-bind"]],
    ]),
    ...requirementsFor(planBlocked.id, [
      ["req-blocked-identity", "Company identity verified", true, ["ev-blocked-identity"]],
      ["req-blocked-payroll", "Payroll by class code received", false, []],
      ["req-blocked-officer", "Owner/officer inclusion confirmed", false, []],
    ]),
  ];

  const allWork: Work[] = [
    {
      id: "work-prep-retrieve-wc",
      plan: planPreparing.id,
      requirement: "req-prep-wc",
      type: "retrieve_carrier_quote",
      actor: "integration",
      status: "waiting",
      input: "Retrieve the last outstanding workers' compensation quote.",
      output: "Awaiting carrier response.",
      provenance: "Carrier API request #wc-8842",
      started_at: isoHoursAgo(4),
    },
    {
      id: "work-prep-premium-qc",
      plan: planPreparing.id,
      requirement: "req-prep-proposal",
      type: "quality_check",
      actor: "agent",
      status: "running",
      input: "Verify assembled proposal once final quote lands.",
      output: "Standing by for final pricing.",
      provenance: "SituationCoordinator",
      started_at: isoHoursAgo(2),
    },
    {
      id: "work-blocked-request-payroll",
      plan: planBlocked.id,
      requirement: "req-blocked-payroll",
      type: "request_customer_information",
      actor: "system",
      status: "blocked",
      input: "Request payroll by class code.",
      output: "Email sent. No response received.",
      provenance: "Outbound request email sent 3 times.",
      started_at: isoHoursAgo(4),
      blocking_reason:
        "Workers' compensation quote cannot be requested without payroll allocation by class code.",
      attempted_automation:
        "ID8 checked historical submissions, payroll reports, and carrier portals, then sent reminder emails and a portal request.",
      required_human_input:
        "Upload or provide payroll by class code and confirm whether owners should be included.",
    },
    {
      id: "work-blocked-review-submission",
      plan: planBlocked.id,
      requirement: "req-blocked-officer",
      type: "submit_wc_application",
      actor: "integration",
      status: "waiting",
      input:
        "Submit once payroll and owner/officer selection are confirmed.",
      output: "Blocked by missing underwriting input.",
      provenance: "Carrier connection staged",
      started_at: isoHoursAgo(2),
    },
  ];

  const allEvidence: Evidence[] = [
    {
      id: "ev-prep-company",
      attention: attentionPreparing.id,
      requirement: "req-prep-company",
      type: "company_verified",
      subject: "ABC Medical",
      value: "Company identity verified in CRM and state filings.",
      source: "crm",
      provenance: "Observed in internal CRM record CRM-441",
      confidence: 1,
      created_at: isoHoursAgo(5),
    },
    {
      id: "ev-prep-contact",
      attention: attentionPreparing.id,
      requirement: "req-prep-contact",
      type: "contact_confirmed",
      subject: "Jane Smith",
      value: "Office manager and proposal contact confirmed.",
      source: "call",
      provenance: "Supplied by the contact during outbound call transcript",
      confidence: 1,
      created_at: isoHoursAgo(5),
    },
    {
      id: "ev-prep-gl",
      attention: attentionPreparing.id,
      requirement: "req-prep-gl",
      type: "quote_received",
      subject: "General Liability / Professional Liability",
      value: "$18,000 annual premium",
      source: "carrier",
      provenance: "Observed from carrier quote API response",
      confidence: 1,
      created_at: isoHoursAgo(3),
    },
    {
      id: "ev-prep-property",
      attention: attentionPreparing.id,
      requirement: "req-prep-property",
      type: "quote_received",
      subject: "Property",
      value: "$9,800 annual premium",
      source: "carrier",
      provenance: "Observed from property quote PDF extraction",
      confidence: 0.99,
      created_at: isoHoursAgo(3),
    },
    {
      id: "ev-prep-proposal",
      attention: attentionPreparing.id,
      requirement: "req-prep-proposal",
      type: "artifact_assembled",
      subject: "Proposal draft",
      value: "Proposal deck assembled pending final WC quote.",
      source: "system",
      provenance: "Calculated from proposal compiler output",
      confidence: 0.96,
      created_at: isoHoursAgo(2),
    },
    {
      id: "ev-ready-account",
      attention: attentionReady.id,
      requirement: "req-ready-account",
      type: "account_verified",
      subject: "Ridgeway Manufacturing",
      value: "Account, contacts, and billing history resolved.",
      source: "billing_system",
      provenance: "Observed in authoritative billing system",
      confidence: 1,
      created_at: isoHoursAgo(9),
    },
    {
      id: "ev-ready-charge-a",
      attention: attentionReady.id,
      requirement: "req-ready-charges",
      type: "charge_detected",
      subject: "Transaction A",
      value: "$1,240 on 2026-09-16",
      source: "billing_system",
      provenance: "Observed in payment ledger",
      confidence: 1,
      created_at: isoHoursAgo(9),
    },
    {
      id: "ev-ready-charge-b",
      attention: attentionReady.id,
      requirement: "req-ready-charges",
      type: "charge_detected",
      subject: "Transaction B",
      value: "$1,240 on 2026-09-16",
      source: "billing_system",
      provenance: "Observed in payment ledger",
      confidence: 1,
      created_at: isoHoursAgo(9),
    },
    {
      id: "ev-ready-eligibility",
      attention: attentionReady.id,
      requirement: "req-ready-eligibility",
      type: "eligibility_established",
      subject: "Refund eligibility",
      value:
        "Customer eligible for refund under duplicate-charge policy.",
      source: "policy_engine",
      provenance: "Calculated from billing and policy rules",
      confidence: 0.98,
      created_at: isoHoursAgo(8),
    },
    {
      id: "ev-decision-package",
      attention: attentionDecision.id,
      requirement: "req-decision-package",
      type: "proposal_ready",
      subject: "Renewal package",
      value: "All requested coverages and options assembled.",
      source: "system",
      provenance:
        "Compiled from underwriting packet and quote artifacts",
      confidence: 1,
      created_at: isoHoursAgo(12),
    },
    {
      id: "ev-decision-premium",
      attention: attentionDecision.id,
      requirement: "req-decision-premium",
      type: "premium_calculated",
      subject: "Annual premium",
      value: "$42,000 annual premium",
      source: "pricing_engine",
      provenance: "Calculated from final carrier quote bundle",
      confidence: 1,
      created_at: isoHoursAgo(12),
    },
    {
      id: "ev-decision-risks",
      attention: attentionDecision.id,
      requirement: "req-decision-risks",
      type: "risk_summary",
      subject: "Open uncertainty",
      value:
        "WC deductible tradeoff remains the only material discussion point.",
      source: "agent",
      provenance:
        "Inferred by SituationCoordinator from quote comparison",
      confidence: 0.86,
      created_at: isoHoursAgo(12),
    },
    {
      id: "ev-done-approval",
      attention: attentionDone.id,
      requirement: "req-done-approval",
      type: "approval_recorded",
      subject: "Customer approval",
      value: "Customer approved renewal via signed confirmation.",
      source: "email",
      provenance: "Supplied by the customer in signed approval email",
      confidence: 1,
      created_at: isoHoursAgo(19),
    },
    {
      id: "ev-done-bind",
      attention: attentionDone.id,
      requirement: "req-done-bind",
      type: "bind_confirmed",
      subject: "Carrier bind",
      value: "Coverage bound and confirmed by carrier.",
      source: "carrier",
      provenance: "Observed in carrier bind confirmation",
      confidence: 1,
      created_at: isoHoursAgo(18),
    },
    {
      id: "ev-blocked-identity",
      attention: attentionBlocked.id,
      requirement: "req-blocked-identity",
      type: "company_verified",
      subject: "Ridgeway Manufacturing",
      value: "Company identity verified.",
      source: "crm",
      provenance: "Observed in internal CRM",
      confidence: 1,
      created_at: isoHoursAgo(4),
    },
  ];

  const allEvaluations: Evaluation[] = [
    {
      id: "evaluation-preparing",
      plan: planPreparing.id,
      attention: attentionPreparing.id,
      status: "not-ready",
      satisfied_requirements: serializeList([
        "Company identity verified",
        "Contact identity confirmed",
        "GL/PL quote received",
        "Property quote received",
        "Proposal artifacts assembled",
      ]),
      missing_requirements: serializeList([
        "Workers' compensation quote received",
      ]),
      rationale:
        "Waiting on one carrier quote; ID8 can continue autonomously.",
      evidence_ids: serializeList([
        "ev-prep-company",
        "ev-prep-contact",
        "ev-prep-gl",
        "ev-prep-property",
        "ev-prep-proposal",
      ]),
      evaluated_at: isoHoursAgo(2),
    },
    {
      id: "evaluation-ready",
      plan: planReady.id,
      attention: attentionReady.id,
      status: "ready",
      satisfied_requirements: serializeList([
        "Customer account verified",
        "Duplicate charges confirmed",
        "Refund eligibility established",
      ]),
      missing_requirements: serializeList([]),
      rationale:
        "Evidence is complete; package is ready for scheduled inspection.",
      evidence_ids: serializeList([
        "ev-ready-account",
        "ev-ready-charge-a",
        "ev-ready-charge-b",
        "ev-ready-eligibility",
      ]),
      evaluated_at: isoHoursAgo(8),
    },
    {
      id: "evaluation-decision",
      plan: planDecision.id,
      attention: attentionDecision.id,
      status: "ready",
      satisfied_requirements: serializeList([
        "Proposal package assembled",
        "Annual premium calculated",
        "Risks and uncertainties summarized",
      ]),
      missing_requirements: serializeList([]),
      rationale:
        "Complete decision package is prepared and needs human judgment.",
      evidence_ids: serializeList([
        "ev-decision-package",
        "ev-decision-premium",
        "ev-decision-risks",
      ]),
      evaluated_at: isoHoursAgo(12),
    },
    {
      id: "evaluation-done",
      plan: planDone.id,
      attention: attentionDone.id,
      status: "ready",
      satisfied_requirements: serializeList([
        "Approval recorded",
        "Carrier bind confirmed",
      ]),
      missing_requirements: serializeList([]),
      rationale:
        "Decision completed, action executed, and outcome recorded.",
      evidence_ids: serializeList(["ev-done-approval", "ev-done-bind"]),
      evaluated_at: isoHoursAgo(18),
    },
    {
      id: "evaluation-blocked",
      plan: planBlocked.id,
      attention: attentionBlocked.id,
      status: "not-ready",
      satisfied_requirements: serializeList(["Company identity verified"]),
      missing_requirements: serializeList([
        "Payroll by class code received",
        "Owner/officer inclusion confirmed",
      ]),
      rationale:
        "Progress cannot continue autonomously until the customer supplies missing underwriting input.",
      evidence_ids: serializeList(["ev-blocked-identity"]),
      evaluated_at: isoHoursAgo(2),
    },
  ];

  const allDecisions: Decision[] = [
    {
      id: "decision-proposal",
      attention: attentionDecision.id,
      plan: planDecision.id,
      title: "Present renewal proposal",
      summary:
        "All evidence is complete. Human judgment is required to select the next action.",
      requires_human_judgment: true,
      available_actions: serializeList(Object.keys(decisionLabels)),
      status: "ready",
      created_at: isoHoursAgo(12),
      updated_at: isoHoursAgo(12),
    },
    {
      id: "decision-done",
      attention: attentionDone.id,
      plan: planDone.id,
      title: "Bind approved policy",
      summary:
        "Customer approval received and bind instructions executed.",
      requires_human_judgment: true,
      available_actions: serializeList(["present_proposal"]),
      status: "completed",
      selected_action: "present_proposal",
      decided_at: isoHoursAgo(18),
      created_at: isoHoursAgo(19),
      updated_at: isoHoursAgo(18),
    },
  ];

  const allActions: Action[] = [
    {
      id: "action-done-bind",
      attention: attentionDone.id,
      decision: "decision-done",
      type: "bind_policy",
      parameters: serializeList([
        "policy=renewal",
        "carrier=Harbor Mutual",
      ]),
      status: "completed",
      result: "Carrier confirmed bind instructions.",
      executed_at: isoHoursAgo(18),
    },
  ];

  const allOutcomes: Outcome[] = [
    {
      id: "outcome-done-bind",
      attention: attentionDone.id,
      action: "action-done-bind",
      summary:
        "Renewal bound successfully and confirmation stored for follow-up.",
      created_at: isoHoursAgo(17),
      generates_new_attention: false,
    },
  ];

  const allEvents: DurableEvent[] = [
    attentionNew,
    attentionPreparing,
    attentionReady,
    attentionDecision,
    attentionDone,
    attentionBlocked,
  ].map((attention) => ({
    id: `event-${attention.id}-attention`,
    attention: attention.id,
    type: "attention.created",
    detail: attention.raw_data,
    stage: "attention",
    created_at: attention.occurred_at,
  }));

  allEvents.push(
    {
      id: "event-preparing-context",
      attention: attentionPreparing.id,
      type: "context.resolved",
      detail:
        "Existing relationship, prospect history, and underwriting context resolved.",
      stage: "context",
      created_at: isoHoursAgo(6),
    },
    {
      id: "event-preparing-plan",
      attention: attentionPreparing.id,
      type: "plan.created",
      detail: "Insurance proposal plan created.",
      stage: "plan",
      created_at: isoHoursAgo(5),
    },
    {
      id: "event-preparing-work",
      attention: attentionPreparing.id,
      type: "work.started",
      detail: "Carrier quote retrieval and proposal QC are active.",
      stage: "work",
      created_at: isoHoursAgo(4),
    },
    {
      id: "event-preparing-eval",
      attention: attentionPreparing.id,
      type: "evaluation.completed",
      detail: "Still waiting on workers' compensation quote.",
      stage: "evaluation",
      created_at: isoHoursAgo(2),
    },
    {
      id: "event-ready-evaluation",
      attention: attentionReady.id,
      type: "evaluation.completed",
      detail: "Duplicate charge package is complete and ready.",
      stage: "evaluation",
      created_at: isoHoursAgo(8),
    },
    {
      id: "event-decision-created",
      attention: attentionDecision.id,
      type: "decision.created",
      detail: "Decision package assembled for proposal presentation.",
      stage: "decision",
      created_at: isoHoursAgo(12),
    },
    {
      id: "event-done-outcome",
      attention: attentionDone.id,
      type: "outcome.created",
      detail: "Bind outcome recorded.",
      stage: "outcome",
      created_at: isoHoursAgo(17),
    },
    {
      id: "event-blocked-exception",
      attention: attentionBlocked.id,
      type: "work.failed",
      detail:
        "Autonomous progress paused while waiting for payroll by class code.",
      stage: "work",
      created_at: isoHoursAgo(2),
    },
  );

  return {
    people: [pJane, pOmar, pKira],
    organizations: [orgAbc, orgRidgeway, orgNorthern],
    relationships: [
      {
        id: "relationship-jane-abc",
        person: pJane.id,
        organization: orgAbc.id,
        type: "prospect",
        summary: "Prospect relationship with three previous interactions.",
        created_at: isoHoursAgo(96),
      },
      {
        id: "relationship-omar-ridgeway",
        person: pOmar.id,
        organization: orgRidgeway.id,
        type: "customer",
        summary: "Active customer relationship with billing history.",
        created_at: isoHoursAgo(74),
      },
      {
        id: "relationship-kira-northern",
        person: pKira.id,
        organization: orgNorthern.id,
        type: "customer",
        summary:
          "Existing customer relationship with annual renewal cycle.",
        created_at: isoHoursAgo(30),
      },
    ],
    attentions: [
      attentionNew,
      attentionPreparing,
      attentionReady,
      attentionDecision,
      attentionDone,
      attentionBlocked,
    ],
    contexts,
    interactions: [
      {
        id: "interaction-preparing-1",
        attention: attentionPreparing.id,
        channel: "call",
        summary:
          "Customer confirmed requested coverages and timeline.",
        occurred_at: isoHoursAgo(6),
      },
      {
        id: "interaction-ready-1",
        attention: attentionReady.id,
        channel: "email",
        summary:
          "Customer reported duplicate charge and requested review.",
        occurred_at: isoHoursAgo(10),
      },
      {
        id: "interaction-decision-1",
        attention: attentionDecision.id,
        channel: "meeting",
        summary:
          "Review meeting scheduled once proposal package is complete.",
        occurred_at: isoHoursAgo(14),
      },
    ],
    intents: [
      intentPreparing,
      intentReady,
      intentDecision,
      intentDone,
      intentBlocked,
    ],
    plans: [
      planPreparing,
      planReady,
      planDecision,
      planDone,
      planBlocked,
    ],
    requirements: allRequirements,
    work: allWork,
    artifacts: [
      {
        id: "artifact-preparing-proposal",
        attention: attentionPreparing.id,
        type: "proposal_draft",
        title: "ABC Medical proposal draft",
        source: "system",
        raw_content:
          "Draft proposal deck awaiting the WC quote page.",
        created_at: isoHoursAgo(2),
      },
      {
        id: "artifact-decision-deck",
        attention: attentionDecision.id,
        type: "proposal_pdf",
        title: "Northern Light renewal package",
        source: "system",
        raw_content:
          "Complete proposal package with premium, options, and risks.",
        created_at: isoHoursAgo(12),
      },
    ],
    evidence: allEvidence,
    evaluations: allEvaluations,
    decisions: allDecisions,
    actions: allActions,
    outcomes: allOutcomes,
    events: allEvents,
  };
}

function latestStage(detail: {
  context?: ContextSnapshot;
  intent?: Intent;
  plan?: Plan;
  work: Work[];
  evidence: Evidence[];
  evaluation?: Evaluation;
  decision?: Decision;
  actions: Action[];
  outcomes: Outcome[];
}): LifecycleState {
  if (detail.outcomes.length > 0) return "outcome";
  if (detail.actions.length > 0) return "action";
  if (detail.decision) return "decision";
  if (detail.evaluation) return "evaluation";
  if (detail.evidence.length > 0) return "evidence";
  if (detail.work.length > 0) return "work";
  if (detail.plan) return "plan";
  if (detail.intent) return "intent";
  if (detail.context?.status === "resolved") return "context";
  return "attention";
}

function deriveAttentionState(detail: {
  context?: ContextSnapshot;
  intent?: Intent;
  plan?: Plan;
  work: Work[];
  evaluation?: Evaluation;
  decision?: Decision;
  outcomes: Outcome[];
}): HumanAttentionState {
  if (detail.outcomes.length > 0) return "done";
  if (detail.work.some((item) => item.status === "blocked")) return "blocked";
  if (!detail.context || detail.context.status !== "resolved" || !detail.intent) {
    return "new";
  }
  if (!detail.plan || !detail.evaluation) return "preparing";
  if (
    detail.evaluation.status === "ready" &&
    detail.decision?.requires_human_judgment &&
    detail.decision.status !== "completed"
  ) {
    return "decision";
  }
  if (detail.evaluation.status === "ready") return "ready";
  return "preparing";
}

function buildSummary(detail: Omit<SituationDetail, keyof SituationSummary>): SituationSummary {
  const missingRequirements = detail.requirements.filter((item) => !item.satisfied);
  const activeWork = detail.work.filter((item) =>
    ["queued", "running", "waiting", "blocked"].includes(item.status),
  );
  const blocked = detail.work.find((item) => item.status === "blocked");
  const state = deriveAttentionState(detail);

  return {
    id: detail.attention.id,
    subject: detail.attention.subject,
    objective:
      detail.plan?.objective ?? "Resolve context and determine the objective.",
    attentionState: state,
    lifecycleState: latestStage(detail),
    intentLabel: detail.intent?.description ?? "Intent still being resolved",
    organizationName: detail.organization?.name ?? "Unresolved organization",
    personName: detail.person?.name,
    missingRequirementsCount: missingRequirements.length,
    evidenceCount: detail.evidence.length,
    activeWorkSummary: activeWork.length ? `${activeWork.length} active` : "none",
    statusReason:
      state === "new"
        ? "ID8 is still resolving context and intent before planning work."
        : state === "preparing"
          ? `Autonomous work is still in progress. Missing: ${missingRequirements.map((item) => item.description).join(", ")}.`
          : state === "ready"
            ? "Evaluation is complete and the package is ready for the next meaningful review."
            : state === "decision"
              ? "A complete situation package is available and human judgment is required."
              : state === "blocked"
                ? blocked?.blocking_reason ?? "Autonomous progress is blocked."
                : "Decision, action, and outcome have all been recorded.",
    blockedExplanation: blocked?.required_human_input,
  };
}

async function loadBase(attentionId: string) {
  await ensureSeedData();
  const [attention, allContexts, allIntents, allPlans, allRequirements, allWork, allEvidence] =
    await Promise.all([
      attentions.get(attentionId),
      contextSnapshots.find({ attention: attentionId }),
      intents.find({ attention: attentionId }),
      plans.find({ attention: attentionId }),
      requirements.all(),
      workItems.all(),
      evidenceRecords.find({ attention: attentionId }),
    ]);
  if (!attention) return null;

  const plan = (allPlans as Plan[])[0];
  return {
    attention: attention as Attention,
    context: (allContexts as ContextSnapshot[])[0],
    intent: (allIntents as Intent[])[0],
    plan,
    requirements: plan
      ? (allRequirements as Requirement[]).filter((record) => record.plan === plan.id)
      : [],
    work: plan ? (allWork as Work[]).filter((record) => record.plan === plan.id) : [],
    evidence: allEvidence as Evidence[],
  };
}

async function putEvent(event: DurableEvent) {
  await durableEvents.put(event, event.id);
}

async function upsertEvaluation(attentionId: string, planId: string) {
  const [planRequirements, relatedEvidence] = await Promise.all([
    requirements.find({ plan: planId }),
    evidenceRecords.find({ attention: attentionId }),
  ]);

  const planRequirementIds = new Set(
    (planRequirements as Requirement[]).map((item) => item.id),
  );
  const missing = (planRequirements as Requirement[])
    .filter((item) => !item.satisfied)
    .map((item) => item.description);
  const satisfied = (planRequirements as Requirement[])
    .filter((item) => item.satisfied)
    .map((item) => item.description);
  const now = new Date().toISOString();

  const evaluation: Evaluation = {
    id: `evaluation-${attentionId}`,
    plan: planId,
    attention: attentionId,
    status: missing.length === 0 ? "ready" : "not-ready",
    satisfied_requirements: serializeList(satisfied),
    missing_requirements: serializeList(missing),
    rationale:
      missing.length === 0
        ? "All required evidence is present."
        : `Still missing: ${missing.join(", ")}.`,
    evidence_ids: serializeList(
      (relatedEvidence as Evidence[])
        .filter((item) => planRequirementIds.has(item.requirement))
        .map((item) => item.id),
    ),
    evaluated_at: now,
  };

  await evaluations.put(evaluation, evaluation.id);
  await putEvent({
    id: `event-evaluation-${attentionId}-${Date.now()}`,
    attention: attentionId,
    type: "evaluation.completed",
    detail: evaluation.rationale,
    stage: "evaluation",
    created_at: now,
  });

  return evaluation;
}

async function loadDetail(attentionId: string): Promise<SituationDetail | null> {
  const base = await loadBase(attentionId);
  if (!base) return null;

  const [evaluationList, decisionList, actionList, outcomeList, interactionList, timelineList, artifactList] =
    await Promise.all([
      evaluations.find({ attention: attentionId }),
      decisions.find({ attention: attentionId }),
      actions.find({ attention: attentionId }),
      outcomes.find({ attention: attentionId }),
      interactions.find({ attention: attentionId }),
      durableEvents.find({ attention: attentionId }),
      artifacts.find({ attention: attentionId }),
    ]);

  const [person, organization, relationship] = await Promise.all([
    base.attention.person ? people.get(base.attention.person) : undefined,
    base.attention.organization
      ? organizations.get(base.attention.organization)
      : undefined,
    base.attention.person && base.attention.organization
      ? (
          await relationships.find({
            person: base.attention.person,
            organization: base.attention.organization,
          })
        )[0]
      : undefined,
  ]);

  const detailBase = {
    attention: base.attention,
    context: base.context,
    intent: base.intent,
    plan: base.plan,
    relationship: relationship as Relationship | undefined,
    requirements: base.requirements,
    work: base.work,
    evidence: base.evidence,
    artifacts: artifactList as import("@/src/lib/model").Artifact[],
    evaluation: (evaluationList as Evaluation[]).sort((a, b) =>
      b.evaluated_at.localeCompare(a.evaluated_at),
    )[0],
    decision: (decisionList as Decision[]).sort((a, b) =>
      b.updated_at.localeCompare(a.updated_at),
    )[0],
    actions: actionList as Action[],
    outcomes: outcomeList as Outcome[],
    interactions: interactionList as Interaction[],
    timeline: (timelineList as DurableEvent[]).sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    ),
    person: person as Person | undefined,
    organization: organization as Organization | undefined,
  };

  return { ...detailBase, ...buildSummary(detailBase) };
}

export async function getBoard() {
  await ensureSeedData();
  const allAttentions = (await attentions.all()) as Attention[];
  const details = (
    await Promise.all(allAttentions.map((attention) => loadDetail(attention.id)))
  )
    .filter(Boolean)
    .sort((left, right) =>
      right!.attention.occurred_at.localeCompare(left!.attention.occurred_at),
    ) as SituationDetail[];

  const columns: Record<HumanAttentionState, SituationSummary[]> = {
    new: [],
    preparing: [],
    ready: [],
    decision: [],
    blocked: [],
    done: [],
  };

  for (const detail of details) {
    columns[detail.attentionState].push(buildSummary(detail));
  }

  return {
    columns,
    metrics: {
      total: details.length,
      activeWork: details.reduce(
        (total, detail) =>
          total +
          detail.work.filter((item) =>
            ["queued", "running", "waiting", "blocked"].includes(item.status),
          ).length,
        0,
      ),
      decisionReady: columns.ready.length + columns.decision.length,
    },
  };
}

export async function getSituation(attentionId: string) {
  return loadDetail(attentionId);
}

export async function continueAutonomousWork(attentionId: string) {
  const detail = await loadDetail(attentionId);
  if (!detail?.plan || detail.attentionState === "blocked") return;

  const now = new Date().toISOString();
  const waitingWork = detail.work.find((item) => item.status === "waiting");
  if (!waitingWork) return;

  if (attentionId === "attention-preparing-insurance") {
    const requirement = detail.requirements.find((item) => item.id === "req-prep-wc");
    if (!requirement) return;

    const evidenceId = "ev-prep-wc";
    await evidenceRecords.put(
      {
        id: evidenceId,
        attention: attentionId,
        requirement: requirement.id,
        type: "quote_received",
        subject: "Workers' Compensation",
        value: "$14,200 annual premium",
        source: "carrier",
        provenance: "Observed from carrier quote delivery",
        confidence: 1,
        created_at: now,
      },
      evidenceId,
    );
    await requirements.put(
      {
        ...requirement,
        satisfied: true,
        evidence_ids: serializeList([evidenceId]),
        updated_at: now,
      },
      requirement.id,
    );
    await workItems.put(
      {
        ...waitingWork,
        status: "completed",
        output: "Workers' compensation quote retrieved.",
        completed_at: now,
      },
      waitingWork.id,
    );
    if (detail.context) {
      await contextSnapshots.put(
        {
          ...detail.context,
          known: serializeList([
            ...parseList(detail.context.known),
            "Workers' compensation quote received",
          ]),
          unknown: serializeList(
            parseList(detail.context.unknown).filter(
              (item) => item !== "Workers' compensation quote response",
            ),
          ),
          updated_at: now,
        },
        detail.context.id,
      );
    }
    await putEvent({
      id: `event-work-complete-${attentionId}`,
      attention: attentionId,
      type: "work.completed",
      detail: "Workers' compensation quote retrieved autonomously.",
      stage: "work",
      created_at: now,
    });
  }

  if (attentionId === "attention-blocked-payroll") {
    await workItems.put(
      {
        ...waitingWork,
        status: "completed",
        output: "Workers' compensation submission sent to carrier.",
        completed_at: now,
      },
      waitingWork.id,
    );
    await putEvent({
      id: `event-work-complete-${attentionId}`,
      attention: attentionId,
      type: "work.completed",
      detail: "Submission sent after blocked information was supplied.",
      stage: "work",
      created_at: now,
    });
  }

  await upsertEvaluation(attentionId, detail.plan.id);
}

export async function provideBlockedInput(attentionId: string) {
  const detail = await loadDetail(attentionId);
  if (!detail?.plan || attentionId !== "attention-blocked-payroll") return;

  const payrollRequirement = detail.requirements.find(
    (item) => item.id === "req-blocked-payroll",
  );
  const officerRequirement = detail.requirements.find(
    (item) => item.id === "req-blocked-officer",
  );
  const blockedWork = detail.work.find((item) => item.status === "blocked");
  if (!payrollRequirement || !officerRequirement || !blockedWork) return;

  const now = new Date().toISOString();
  const payrollEvidence: Evidence = {
    id: "ev-blocked-payroll",
    attention: attentionId,
    requirement: payrollRequirement.id,
    type: "payroll_received",
    subject: "Payroll by class code",
    value: "Payroll allocation uploaded by customer.",
    source: "customer_portal",
    provenance: "Supplied by customer through upload portal",
    confidence: 1,
    created_at: now,
  };
  const officerEvidence: Evidence = {
    id: "ev-blocked-officer",
    attention: attentionId,
    requirement: officerRequirement.id,
    type: "officer_selection_confirmed",
    subject: "Owner/officer inclusion",
    value: "Owners excluded from workers' compensation coverage.",
    source: "customer_portal",
    provenance: "Supplied by customer through underwriting questionnaire",
    confidence: 1,
    created_at: now,
  };

  await evidenceRecords.put(payrollEvidence, payrollEvidence.id);
  await evidenceRecords.put(officerEvidence, officerEvidence.id);
  await requirements.put(
    {
      ...payrollRequirement,
      satisfied: true,
      evidence_ids: serializeList([payrollEvidence.id]),
      updated_at: now,
    },
    payrollRequirement.id,
  );
  await requirements.put(
    {
      ...officerRequirement,
      satisfied: true,
      evidence_ids: serializeList([officerEvidence.id]),
      updated_at: now,
    },
    officerRequirement.id,
  );
  await workItems.put(
    {
      ...blockedWork,
      status: "completed",
      output: "Customer supplied missing underwriting details.",
      completed_at: now,
    },
    blockedWork.id,
  );
  if (detail.context) {
    await contextSnapshots.put(
      {
        ...detail.context,
        known: serializeList([
          ...parseList(detail.context.known),
          "Payroll by class code received",
          "Owner/officer inclusion confirmed",
        ]),
        unknown: serializeList([]),
        updated_at: now,
      },
      detail.context.id,
    );
  }
  await putEvent({
    id: `event-unblocked-${attentionId}`,
    attention: attentionId,
    type: "evidence.created",
    detail:
      "Customer supplied payroll by class code and owner/officer selection.",
    stage: "evidence",
    created_at: now,
  });

  await upsertEvaluation(attentionId, detail.plan.id);
}

export async function completeDecision(
  attentionId: string,
  decisionType: DecisionChoice,
) {
  const detail = await loadDetail(attentionId);
  if (!detail?.decision || detail.decision.status !== "ready") return;

  const now = new Date().toISOString();
  const actionId = `action-${attentionId}-${decisionType}`;
  const outcomeId = `outcome-${attentionId}-${decisionType}`;

  await decisions.put(
    {
      ...detail.decision,
      status: "completed",
      selected_action: decisionType,
      decided_at: now,
      updated_at: now,
    },
    detail.decision.id,
  );
  await actions.put(
    {
      id: actionId,
      attention: attentionId,
      decision: detail.decision.id,
      type: decisionType,
      parameters: serializeList([`label=${decisionLabels[decisionType]}`]),
      status: "completed",
      result: `${decisionLabels[decisionType]} executed.`,
      executed_at: now,
    },
    actionId,
  );
  await outcomes.put(
    {
      id: outcomeId,
      attention: attentionId,
      action: actionId,
      summary:
        decisionType === "present_proposal"
          ? "Proposal delivered to the customer with a completed decision trail."
          : decisionType === "request_changes"
            ? "Revision request sent and tracked as the next follow-up outcome."
            : "Decision deferred and follow-up timing recorded.",
      created_at: now,
      generates_new_attention: decisionType === "request_changes",
    },
    outcomeId,
  );
  await putEvent({
    id: `event-decision-made-${attentionId}`,
    attention: attentionId,
    type: "decision.made",
    detail: `${decisionLabels[decisionType]} selected.`,
    stage: "decision",
    created_at: now,
  });
  await putEvent({
    id: `event-outcome-${attentionId}`,
    attention: attentionId,
    type: "outcome.created",
    detail: `${decisionLabels[decisionType]} outcome recorded.`,
    stage: "outcome",
    created_at: now,
  });
}

export function getHumanAttentionRules() {
  return [
    "NEW: Attention exists while context or intent is still unresolved.",
    "PREPARING: Plan exists and ID8 can continue autonomously while work or evidence is incomplete.",
    "READY: Evaluation is READY and the package is complete, but no immediate human decision is required.",
    "DECISION: Evaluation is READY and human judgment is explicitly required.",
    "BLOCKED: Autonomous progress cannot continue; the card must state what is missing and what human input is needed.",
    "DONE: Decision made, action completed, and outcome recorded.",
  ];
}

export function labelForDecision(choice: string) {
  return decisionLabels[choice as DecisionChoice] ?? choice;
}

export function listFromField(value?: string) {
  return parseList(value);
}
