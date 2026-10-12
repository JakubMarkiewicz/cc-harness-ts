import type OpenAI from "openai";
import type { Tool } from "../types";
import { getSkillContent } from "../skills/utils";

const definition: OpenAI.ChatCompletionTool = {
  type: "function",
  function: {
    name: "Skill",
    description: "Load a skill's instructions into the conversation",
    parameters: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", description: "The name of the skill to use" },
        args: {
          type: "string",
          description: "Optional arguments for the skill",
        },
      },
    },
  },
};

type Parameters = {
  name: string;
  args: string;
};

function parseArgs(args: string): Parameters {
  return JSON.parse(args);
}

async function executor(exArgs: string) {
  const { name, args } = parseArgs(exArgs);
  const cmd = `/${name} ${args}`;

  const skillContent = await getSkillContent(cmd);

  return skillContent.join("\n\n");
}

export const SKILL_TOOL = {
  definition,
  executor,
} satisfies Tool;
