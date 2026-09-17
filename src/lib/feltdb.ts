import "server-only";

import fs from "node:fs";
import path from "node:path";
import { createFeltDB } from "@feltdb/core";
import feltDbConfig from "@/feltdb.config.json";
import type {
  Action,
  Artifact,
  Attention,
  ContextSnapshot,
  Decision,
  DurableEvent,
  Evaluation,
  Evidence,
  Interaction,
  Intent,
  Organization,
  Outcome,
  Person,
  Plan,
  Relationship,
  Requirement,
  Work,
} from "@/src/lib/model";

const dataPath = path.join(process.cwd(), ".feltdb-data");
fs.mkdirSync(dataPath, { recursive: true });

const globalForDb = globalThis as unknown as {
  id8Db?: ReturnType<typeof createFeltDB>;
};

export const db =
  globalForDb.id8Db ??
  createFeltDB({
    namespace: feltDbConfig.namespace,
    mode: "local",
    path: dataPath,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.id8Db = db;
}

export const people = db.collection<Person>("Person");
export const organizations = db.collection<Organization>("Organization");
export const relationships = db.collection<Relationship>("Relationship");
export const attentions = db.collection<Attention>("Attention");
export const contextSnapshots = db.collection<ContextSnapshot>("ContextSnapshot");
export const interactions = db.collection<Interaction>("Interaction");
export const intents = db.collection<Intent>("Intent");
export const plans = db.collection<Plan>("Plan");
export const requirements = db.collection<Requirement>("Requirement");
export const workItems = db.collection<Work>("Work");
export const artifacts = db.collection<Artifact>("Artifact");
export const evidenceRecords = db.collection<Evidence>("Evidence");
export const evaluations = db.collection<Evaluation>("Evaluation");
export const decisions = db.collection<Decision>("Decision");
export const actions = db.collection<Action>("Action");
export const outcomes = db.collection<Outcome>("Outcome");
export const durableEvents = db.collection<DurableEvent>("DurableEvent");
