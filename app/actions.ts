"use server";

import { revalidatePath } from "next/cache";
import {
  completeDecision,
  continueAutonomousWork,
  provideBlockedInput,
} from "@/src/lib/id8";
import type { DecisionChoice } from "@/src/lib/model";

const refresh = (attentionId: string) => {
  revalidatePath("/");
  revalidatePath(`/situations/${attentionId}`);
};

export async function advanceSituation(formData: FormData) {
  const attentionId = String(formData.get("attentionId") ?? "");
  await continueAutonomousWork(attentionId);
  refresh(attentionId);
}

export async function unblockSituation(formData: FormData) {
  const attentionId = String(formData.get("attentionId") ?? "");
  await provideBlockedInput(attentionId);
  refresh(attentionId);
}

export async function decideSituation(formData: FormData) {
  const attentionId = String(formData.get("attentionId") ?? "");
  const decision = String(formData.get("decision") ?? "") as DecisionChoice;
  await completeDecision(attentionId, decision);
  refresh(attentionId);
}
