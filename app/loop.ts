import type OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";
import { getSkillContent, buildAvailableSkillsPrompt } from "./skills/utils";
import { executeTool, getAllTools } from "./utils";
import { ENV } from "./env";

export async function agentLoop(client: OpenAI, prompt: string) {
  const skillsPrompt = await buildAvailableSkillsPrompt();

  const firstMessage = await processFirstMessage(prompt);

  const messages: ChatCompletionMessageParam[] = [
    skillsPrompt,
    ...firstMessage,
  ];

  while (true) {
    const response = await chatCall(client, messages);

    const message = response.choices[0].message;
    const toolCall = message.tool_calls?.[0];

    if (!toolCall) {
      console.log(response.choices[0].message.content);
      break;
    }

    messages.push(message);

    const toolResult = await executeTool(toolCall);
    messages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: toolResult ?? "",
    });
  }

  return messages.at(-1)?.content?.toString();
}

async function chatCall(
  client: OpenAI,
  messages: ChatCompletionMessageParam[],
) {
  const response = await client.chat.completions.create({
    model: ENV.OPENROUTER_MODEL,
    messages,
    tools: getAllTools(),
  });

  if (!response.choices || response.choices.length === 0) {
    throw new Error("no choices in response");
  }

  return response;
}

async function processFirstMessage(
  prompt: string,
): Promise<ChatCompletionMessageParam[]> {
  if (prompt.startsWith("/")) {
    const userPrompts = await getSkillContent(prompt);
    const completionMessages: ChatCompletionMessageParam[] = userPrompts.map(
      (content) => ({ role: "user", content }),
    );

    return completionMessages;
  }

  return [{ role: "user", content: prompt }];
}
