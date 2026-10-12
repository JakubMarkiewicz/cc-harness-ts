import type OpenAI from "openai";
import type { Tool } from "../types";
import z from "zod";

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

const Parameters = z.object({
  file_path: z.string().min(1, { error: "file_path is required" }),
  content: z.string().min(1, { error: "content is required" }),
});

async function executor(args: string) {
  const { file_path, content } = Parameters.parse(JSON.parse(args));

  const file = Bun.file(file_path);

  await file.write(content);
}

export const WRITE_TOOL = {
  definition,
  executor,
} satisfies Tool;
