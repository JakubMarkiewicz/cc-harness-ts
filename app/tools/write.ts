import type OpenAI from "openai";
import type { Tool } from "../types";

const definition: OpenAI.ChatCompletionTool = {
  type: "function",
  function: {
    name: "Write",
    description: "Write content to a file",
    parameters: {
      type: "object",
      required: ["file_path", "content"],
      properties: {
        file_path: {
          type: "string",
          description: "The path of the file to write to",
        },
        content: {
          type: "string",
          description: "The content to write to the file",
        },
      },
    },
  },
};

type Parameters = {
  file_path: string;
  content: string;
};

function parseArgs(args: string): Parameters {
  return JSON.parse(args);
}

async function executor(args: string) {
  const { file_path, content } = parseArgs(args);

  const file = Bun.file(file_path);

  await file.write(content);
}

export const WRITE_TOOL = {
  definition,
  executor,
} satisfies Tool;
