import type OpenAI from "openai";
import { ToolEnum, type Tool } from "../types";

const definition: OpenAI.ChatCompletionTool = {
  type: "function",
  function: {
    name: ToolEnum.Read,
    description: "Read and return the contents of a file",
    parameters: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "The path to the file to read",
        },
      },
      required: ["file_path"],
    },
  },
};

// TODO: Figure out if it's possible to derive it from
type Parameters = {
  file_path: string;
};

function parseArgs(args: string): Parameters {
  return JSON.parse(args);
}

async function executor(args: string) {
  const { file_path } = parseArgs(args);

  const file = Bun.file(file_path);
  const fileContent = await file.text();

  return fileContent;
}

export const READ_TOOL = {
  definition,
  executor,
} satisfies Tool;
