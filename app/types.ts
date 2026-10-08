import type OpenAI from "openai";

export enum ToolEnum {
  Read = "Read",
  Write = "Write",
}

export type Tool = {
  definition: OpenAI.ChatCompletionTool;
  executor: (args: string) => Promise<string | void>;
};
