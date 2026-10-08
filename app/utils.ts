import type OpenAI from "openai";
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
