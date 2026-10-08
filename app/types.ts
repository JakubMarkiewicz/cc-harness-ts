import type OpenAI from "openai";

export enum ToolEnum {
  Read = "Read",
}

export type Tool = {
  definition: OpenAI.ChatCompletionTool;
  executor: (args: string) => Promise<void>;
};
