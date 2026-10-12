import OpenAI from "openai";
import { Tools } from "./tools";
import type { ToolEnum } from "./types";
import type { ChatCompletionTool } from "openai/resources";

export async function executeTool(
  toolCall: OpenAI.ChatCompletionMessageToolCall,
) {
  if (toolCall.type === "custom") {
    throw new Error("Custom toolcall not supported");
  }
  const name = toolCall.function.name;

  assertFunctionName(name);

  const tool = Tools[name];
  const executor = tool.executor;

  try {
    const res = await executor(toolCall.function.arguments);
    return res;
  } catch (e) {
    throw new Error(`Couldn't run ${name} tool\n ${e}`);
  }
}

function assertFunctionName(name: string): asserts name is ToolEnum {
  if (!(name in Tools)) {
    throw new Error(`Tool: ${name} not suppoorted`);
  }
}

export function getAllTools(): ChatCompletionTool[] {
  const result: ChatCompletionTool[] = [];

  for (const tool in Tools) {
    result.push(Tools[tool as keyof typeof Tools].definition);
  }

  return result;
}

export function buildClient(prompt: string, flag?: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseURL =
    process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  if ((flag && flag !== "-p") || !prompt) {
    throw new Error("error: -p flag is required");
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  return client;
}
