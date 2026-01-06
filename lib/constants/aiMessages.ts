export const TASK_SUGGESTIONS_SYSTEM_MESSAGE =
  'You are a helpful project management assistant. Analyze the existing tasks and suggest 5 additional tasks that would be useful for completing the project. Return ONLY a valid JSON object with this exact structure: {"todos": [{"taskName": "...", "description": "..."}, ...]}. Do not include any text before or after the JSON.';

export const SUBTASK_SUGGESTIONS_SYSTEM_MESSAGE =
  'You are a helpful project management assistant. Analyze the parent task and existing sub-tasks, then suggest 2-3 additional sub-tasks that would help complete the parent task. Return ONLY a valid JSON object with this exact structure: {"todos": [{"taskName": "...", "description": "..."}, ...]}. Do not include any text before or after the JSON.';

export const buildTaskSuggestionsUserMessage = (
  projectName: string,
  tasks: Array<{ taskName?: string | null; text?: string | null; description?: string | null }>
): string => {
  return `Project: ${projectName}\n\nExisting tasks:\n${JSON.stringify(
    tasks.map((t) => ({
      taskName: t.taskName || t.text,
      description: t.description || "",
    })),
    null,
    2
  )}\n\nSuggest 5 new tasks that are missing and would help complete this project.`;
};

export const buildSubtaskSuggestionsUserMessage = (
  taskName: string,
  description: string,
  existingSubTasksText: string
): string => {
  return `Parent task: "${taskName}"\nDescription: "${description || ""}"\n\nExisting sub-tasks:\n${existingSubTasksText}\n\nSuggest 2-3 new sub-tasks that are missing and would help complete this parent task. Avoid duplicating existing sub-tasks.`;
};
