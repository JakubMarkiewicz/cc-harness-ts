import { ToolEnum } from "../types";
import { READ_TOOL } from "./read";
import { WRITE_TOOL } from "./write";

export const Tools = {
  [ToolEnum.Read]: READ_TOOL,
  [ToolEnum.Write]: WRITE_TOOL,
} as const;
