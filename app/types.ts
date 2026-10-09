import type OpenAI from "openai";

export enum ToolEnum {
  Read = "Read",
  Write = "Write",
  Bash = "Bash",
}

export type Tool = {
  definition: OpenAI.ChatCompletionTool;
  executor: (args: string) => Promise<string | void>;
};

export type Skill = {
  name: string;
  description: string;
  content: string;
};
