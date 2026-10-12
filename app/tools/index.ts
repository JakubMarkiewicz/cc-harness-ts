import { ToolEnum } from "../types";
import { BASH_TOOL } from "./bash";
import { READ_TOOL } from "./read";
import { SKILL_TOOL } from "./skill";
import { WRITE_TOOL } from "./write";

export const Tools = {
  [ToolEnum.Read]: READ_TOOL,
  [ToolEnum.Write]: WRITE_TOOL,
  [ToolEnum.Bash]: BASH_TOOL,
  [ToolEnum.Skill]: SKILL_TOOL,
} as const;
