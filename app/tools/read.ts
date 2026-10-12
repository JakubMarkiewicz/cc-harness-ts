import type OpenAI from "openai";
import { ToolEnum, type Tool } from "../types";
import z from "zod";

const definition: OpenAI.ChatCompletionTool = {
  type: "function",
  function: {
    name: ToolEnum.Read,
    description: "Read and return the contents of a file",
    parameters: {
      required: ["file_path"],
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "The path to the file to read",
        },
      },
    },
  },
};

const Parameters = z.object({
  file_path: z.string().min(1, { error: "file_path is required" }),
});

async function executor(args: string) {
  const { file_path } = Parameters.parse(JSON.parse(args));

  const file = Bun.file(file_path);
  const fileContent = await file.text();

  return fileContent;
}

export const READ_TOOL = {
  definition,
  executor,
} satisfies Tool;
