import OpenAI from "openai";
import { executeTool, getAllTools } from "./utils";
import type { ChatCompletionMessageParam } from "openai/resources";
import { getSkillContent, getSkillsSystemPrompt } from "./skills/utils";

async function main() {
  const [, , flag, prompt] = process.argv;
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseURL =
    process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  if (flag !== "-p" || !prompt) {
    throw new Error("error: -p flag is required");
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  const skillsPrompt = await getSkillsSystemPrompt();
  const userPrompt = prompt.startsWith("/")
    ? await getSkillContent(prompt.slice(1))
    : prompt;

  const messages: ChatCompletionMessageParam[] = [
    skillsPrompt,
    { role: "user", content: userPrompt },
  ];

  while (true) {
    const response = await client.chat.completions.create({
      model: "anthropic/claude-haiku-5.5",
      messages,
      tools: getAllTools(),
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("no choices in response");
    }

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
}

main();
