import type OpenAI from "openai";

export enum ToolEnum {
  Read = "Read",
  Write = "Write",
  Bash = "Bash",
  Skill = "Skill",
}

export type Tool = {
  definition: OpenAI.ChatCompletionTool;
  executor: (args: string) => Promise<string | void>;
};

export type Skill = {
  name: string;
  description: string;
  context: string | null;
  content: string;
};
