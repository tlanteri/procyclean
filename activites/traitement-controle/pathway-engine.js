import { getScenario } from "./scenarios.js";

export function getWorkContext(session, participantUid) {
  const participant = session.participants?.[participantUid];
  if (!participant) return null;

  if (session.participationMode === "group") {
    const group = session.groups?.[participant.groupId];
    if (!group) return null;
    return {
      id: group.id,
      path: `groups/${group.id}`,
      unit: group,
      scenarioId: group.scenarioId,
      collective: true,
      canEdit: group.activeDeviceParticipantId === participantUid
    };
  }

  return {
    id: participantUid,
    path: `participants/${participantUid}`,
    unit: participant,
    scenarioId: participant.scenarioId,
    collective: false,
    canEdit: true
  };
}

export function getProgress(context) {
  const scenario = getScenario(context?.scenarioId);
  if (!scenario) return null;

  const completedStepIds = Object.keys(context.unit.answers || {})
    .filter((stepId) => scenario.stepIds.includes(stepId));
  const currentStepId = scenario.stepIds.find(
    (stepId) => !completedStepIds.includes(stepId)
  ) || null;

  return {
    scenario,
    completedStepIds,
    currentStepId,
    completedCount: completedStepIds.length,
    totalCount: scenario.stepIds.length,
    isComplete: currentStepId === null
  };
}

export function normalizeAnswer(choiceIds, multiple = false) {
  const values = (Array.isArray(choiceIds) ? choiceIds : [choiceIds])
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);
  const uniqueValues = [...new Set(values)].sort();
  if (!uniqueValues.length) return null;
  return multiple ? { choiceIds: uniqueValues } : {
    choiceId: uniqueValues[0]
  };
}

export function buildAnswerRecord({
  choiceIds,
  multiple = false,
  participantUid,
  submittedAt
}) {
  const normalized = normalizeAnswer(choiceIds, multiple);
  if (!normalized) return null;
  return {
    ...normalized,
    submittedBy: participantUid,
    submittedAt
  };
}

export function acceptAnswer(currentAnswer, answerRecord) {
  if (currentAnswer != null || answerRecord == null) {
    return undefined;
  }
  return answerRecord;
}

export function buildProgressUpdate(context, progress) {
  if (!context || !progress) return null;
  return {
    currentStepId: progress.currentStepId,
    progress: progress.totalCount
      ? progress.completedCount / progress.totalCount
      : 0,
    status: progress.isComplete ? "scenario-completed" : "playing"
  };
}
