export const cleanAIResponse = (content: string): string => {
  let cleaned = content.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/```json\n?/g, "").replace(/```\n?/g, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/```\n?/g, "");
  }
  return cleaned;
};

export const parseAIResponse = (
  response: string
): Array<{ taskName: string; description: string }> => {
  const cleanedContent = cleanAIResponse(response);
  const parsed = JSON.parse(cleanedContent);
  return parsed?.todos ?? [];
};

export const callAI = async (
  messages: Array<{ role: string; content: string }>
): Promise<Array<{ taskName: string; description: string }>> => {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      useJsonFormat: true,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to call AI");
  }

  const data = await response.json();
  return parseAIResponse(data.response);
};
