import { exec } from "node:child_process";
import util from "node:util";

import type OpenAI from "openai";
import type { Tool } from "../types";

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

type Parameters = {
  command: string;
};

function parseArgs(args: string): Parameters {
  return JSON.parse(args);
}

async function executor(args: string) {
  const { command } = parseArgs(args);

  const { stdout, stderr } = await util.promisify(exec)(command, {
    cwd: "./",
  });

  return stdout ?? stderr;
}

export const BASH_TOOL = {
  definition,
  executor,
} satisfies Tool;
