import { env } from "@/lib/env";

type ResponseOutput = {
  output_text?: string;
};

export function isLlmEnabled(): boolean {
  return Boolean(env.OPENAI_API_KEY);
}

export async function generateJson<T>(input: { system: string; prompt: string; temperature?: number }): Promise<T | null> {
  if (!env.OPENAI_API_KEY) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      input: [
        { role: "system", content: input.system },
        { role: "user", content: input.prompt }
      ],
      text: { format: { type: "json_object" } },
      temperature: input.temperature ?? 0.2
    })
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as ResponseOutput;
  if (!data.output_text) return null;

  try {
    return JSON.parse(data.output_text) as T;
  } catch {
    return null;
  }
}

export async function generateText(input: { system: string; prompt: string; temperature?: number }): Promise<string | null> {
  if (!env.OPENAI_API_KEY) return null;

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      input: [
        { role: "system", content: input.system },
        { role: "user", content: input.prompt }
      ],
      temperature: input.temperature ?? 0.4
    })
  });

  if (!response.ok) return null;

  const data = (await response.json()) as ResponseOutput;
  return data.output_text ?? null;
}
