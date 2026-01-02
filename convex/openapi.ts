import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const AI_PROVIDER = (process.env.AI_PROVIDER || "groq") as
  | "groq"
  | "huggingface"
  | "openai"
  | "ollama";

async function callGroq(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  console.log("apiKey", apiKey);
  if (!apiKey) throw new Error("GROQ_API_KEY is not defined");

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`Groq Error: ${msg}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callHuggingFace(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) throw new Error("HUGGINGFACE_API_KEY is not defined");

  // Konwertuj messages na format dla Hugging Face
  const prompt = messages
    .map(
      (m) =>
        `${m.role === "system" ? "System" : m.role === "user" ? "User" : "Assistant"}: ${m.content}`
    )
    .join("\n\n");

  const response = await fetch(
    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          return_full_text: false,
          max_new_tokens: 500,
        },
      }),
    }
  );

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`HuggingFace Error: ${msg}`);
  }

  const data = await response.json();
  return data[0]?.generated_text || "";
}

async function callOllama(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama2", // lub "mistral", "codellama"
      messages,
      stream: false,
      format: "json",
    }),
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`Ollama Error: ${msg}`);
  }

  const data = await response.json();
  return data.message.content;
}

async function callOpenAI(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const apiKey = process.env.OPEN_AI_KEY;
  if (!apiKey) throw new Error("OPEN_AI_KEY is not defined");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(`OpenAI Error: ${msg}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Uniwersalna funkcja wywołująca odpowiedni provider
async function callAI(
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  switch (AI_PROVIDER) {
    case "groq":
      return await callGroq(messages);
    case "huggingface":
      return await callHuggingFace(messages);
    case "ollama":
      return await callOllama(messages);
    case "openai":
    default:
      return await callOpenAI(messages);
  }
}

export const suggestMissingItemsWithAi = action({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, { projectId }) => {
    //retrieve tasks for the user
    const tasks = await ctx.runQuery(api.tasks.getTasksByProjectId, {
      projectId,
    });

    // Query project - wyciągnij z tasks lub użyj pustego stringa
    // TODO: Dodaj getProjectByProjectId do public API w project.ts
    const projectName = tasks[0]?.projectId ? "" : ""; // Tymczasowo pusty

    const messages = [
      {
        role: "system",
        content:
          "I'm a project manager and I need help identifying missing to-do items. I have a list of existing tasks in JSON format, containing objects with 'taskName' and 'description' properties. I also have a good understanding of the project scope. Can you help me identify 5 additional to-do items for the project with projectName that are not yet included in this list? Please provide these missing items in a separate JSON array with the key 'todos' containing objects with 'taskName' and 'description' properties. Ensure there are no duplicates between the existing list and the new suggestions.",
      },
      {
        role: "user",
        content: JSON.stringify({
          todos: tasks,
          projectName,
        }),
      },
    ];

    try {
      const messageContent = await callAI(messages);

      //create the tasks
      if (messageContent) {
        const items = JSON.parse(messageContent)?.todos ?? [];
        const AI_LABEL_ID = "k57exc6xrw3ar5e1nmab4vnbjs6v1m4p";

        for (let i = 0; i < items.length; i++) {
          const { taskName, description } = items[i];
          const embedding = await getEmbeddingsWithAI(taskName);
          await ctx.runMutation(api.tasks.createTask, {
            taskName,
            description,
            priority: 1,
            dueDate: new Date().getTime(),
            projectId,
            labelId: AI_LABEL_ID as Id<"labels">,
            embedding,
          });
        }
      }
    } catch (err) {
      console.error("Error calling AI:", err);
      throw err;
    }
  },
});

export const suggestMissingSubItemsWithAi = action({
  args: {
    projectId: v.id("projects"),
    parentId: v.id("tasks"),
    taskName: v.string(),
    description: v.string(),
  },
  handler: async (ctx, { projectId, taskName, description }) => {
    //retrieve sub tasks for the user
    // TODO: Dodaj query function getSubTasksByParentId do tasks.ts
    const subTasks: Array<{ taskName: string; description?: string }> = [];

    // TODO: Dodaj query function getProjectByProjectId do API
    const projectName = "";

    const messages = [
      {
        role: "system",
        content:
          "I'm a project manager and I need help identifying missing sub tasks for a parent todo. I have a list of existing sub tasks in JSON format, containing objects with 'taskName' and 'description' properties. I also have a good understanding of the project scope. Can you help me identify 2 additional sub tasks that are not yet included in this list? Please provide these missing items in a separate JSON array with the key 'todos' containing objects with 'taskName' and 'description' properties. Ensure there are no duplicates between the existing list and the new suggestions.",
      },
      {
        role: "user",
        content: JSON.stringify({
          todos: subTasks,
          projectName,
          parentTodo: { taskName, description },
        }),
      },
    ];

    try {
      const messageContent = await callAI(messages);

      //create the sub tasks
      if (messageContent) {
        const items = JSON.parse(messageContent)?.todos ?? [];
        const AI_LABEL_ID = "k57exc6xrw3ar5e1nmab4vnbjs6v1m4p";

        for (let i = 0; i < items.length; i++) {
          const { taskName: subTaskName, description: subDescription } =
            items[i];
          const embedding = await getEmbeddingsWithAI(subTaskName);
          await ctx.runMutation(api.tasks.createTask, {
            taskName: subTaskName,
            description: subDescription,
            priority: 1,
            dueDate: new Date().getTime(),
            projectId,
            labelId: AI_LABEL_ID as Id<"labels">,
            embedding,
          });
        }
      }
    } catch (err) {
      console.error("Error calling AI:", err);
      throw err;
    }
  },
});

// Embeddings z Hugging Face (open source, darmowe)
async function getEmbeddingsHuggingFace(searchText: string): Promise<number[]> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    console.warn("HUGGINGFACE_API_KEY is not defined, returning empty embedding");
    // Zwróć pusty wektor o wymaganej długości (1536 wymiarów)
    return new Array(1536).fill(0);
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ inputs: searchText }),
      }
    );

    if (!response.ok) {
      const msg = await response.text();
      console.warn(`HuggingFace Embeddings Error: ${msg}, returning empty embedding`);
      // Zwróć pusty wektor zamiast rzucać błąd
      return new Array(1536).fill(0);
    }

    const data = await response.json();
    const vector = data[0]; // 384 wymiary

    // Mapuj do 1536 wymiarów (wymagane przez schema) przez powielenie i normalizację
    // Lub użyj innego modelu z większą liczbą wymiarów
    const expandedVector = new Array(1536).fill(0);
    for (let i = 0; i < 1536; i++) {
      expandedVector[i] = vector[i % vector.length] * (1536 / vector.length);
    }

    return expandedVector;
  } catch (error) {
    console.warn(`Error generating HuggingFace embedding: ${error}, returning empty embedding`);
    return new Array(1536).fill(0);
  }
}

// Embeddings z OpenAI (oryginalne)
async function getEmbeddingsOpenAI(searchText: string): Promise<number[]> {
  const apiKey = process.env.OPEN_AI_KEY;
  if (!apiKey) {
    console.warn("OPEN_AI_KEY is not defined, returning empty embedding");
    // Zwróć pusty wektor o wymaganej długości (1536 wymiarów)
    return new Array(1536).fill(0);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: searchText,
        model: "text-embedding-ada-002",
      }),
    });

    if (!response.ok) {
      const msg = await response.text();
      console.warn(`OpenAI Error, ${msg}, returning empty embedding`);
      // Zwróć pusty wektor zamiast rzucać błąd
      return new Array(1536).fill(0);
    }

    const json = await response.json();
    const vector = json["data"][0]["embedding"];

    return vector;
  } catch (error) {
    console.warn(`Error generating OpenAI embedding: ${error}, returning empty embedding`);
    return new Array(1536).fill(0);
  }
}

export const getEmbeddingsWithAI = async (
  searchText: string
): Promise<number[]> => {
  // Użyj Hugging Face dla embeddings jeśli provider to groq/huggingface
  if (AI_PROVIDER === "groq" || AI_PROVIDER === "huggingface") {
    return await getEmbeddingsHuggingFace(searchText);
  }

  // Fallback do OpenAI
  return await getEmbeddingsOpenAI(searchText);
};
