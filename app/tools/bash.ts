import { exec } from "node:child_process";
import util from "node:util";

import type OpenAI from "openai";
import type { Tool } from "../types";
import z from "zod";

const definition: OpenAI.ChatCompletionTool = {
  type: "function",
  function: {
    name: "Bash",
    description: "Execute a shell command",
    parameters: {
      type: "object",
      required: ["command"],
      properties: {
        command: {
          type: "string",
          description: "The command to execute",
        },
      },
    },
  },
};

const Parameters = z.object({
  command: z.string().min(1, { error: "Command is required" }),
});

async function executor(args: string) {
  const { command } = Parameters.parse(args);

  const { stdout, stderr } = await util.promisify(exec)(command, {
    cwd: "./",
  });

  return stdout ?? stderr;
}

export const BASH_TOOL = {
  definition,
  executor,
} satisfies Tool;
