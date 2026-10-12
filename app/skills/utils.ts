import { readdir, readFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Skill } from "../types";
import { open } from "node:fs/promises";
import type { ChatCompletionMessageParam } from "openai/resources";
import { existsSync } from "node:fs";
import { agentLoop } from "../loop";
import { buildClient } from "../utils";

const CLAUDE_PATH = ".claude";
const SKILLS_PATH = `${CLAUDE_PATH}/skills` as const;

export async function getSkills(): Promise<Map<string, Skill>> {
  await assertSkillsDirExists();

  const skillNames = await readdir(SKILLS_PATH);
  const skills = await parseSkills(skillNames);

  return skills;
}

export async function getSkillsSystemPrompt(): Promise<ChatCompletionMessageParam> {
  const skills = await getSkills();

  let skillsPrompt = "";

  for (const [key, value] of skills) {
    skillsPrompt += `- ${key}: ${value.description}\n`;
  }

  return {
    role: "system",
    content: `You have access to the following skills:\n\n${skillsPrompt}\n\nIf a skill matches the user's request, call the Skill tool with its name and follow the instructions it returns.`,
  };
}

export async function getSkillContent(skillCmd: string): Promise<string[]> {
  const { skills, args } = extractSkillsArgs(skillCmd);

  const skillsContent = [];

  for (const skillName of skills) {
    skillsContent.push(await buildSkill(skillName, args));
  }

  return skillsContent;
}

async function assertSkillsDirExists() {
  const skillsPathExists = existsSync(SKILLS_PATH);
  if (!skillsPathExists) {
    await mkdir(CLAUDE_PATH);
    await mkdir(SKILLS_PATH);
  }
}

async function parseSkills(names: string[]) {
  const skills = new Map<string, Skill>();

  for (const skillName of names) {
    const parsedSkill = await parseSkill(skillName);
    skills.set(skillName, parsedSkill);
  }

  return skills;
}

async function parseSkill(name: string): Promise<Skill> {
  const skillPath = join(SKILLS_PATH, name, "SKILL.md");
  const file = await open(skillPath);
  const skillFile = await readFile(file, { encoding: "utf-8" });

  const lines = skillFile.split("\n");

  const meta: Omit<Skill, "content"> = { name, description: "", context: null };
  let content = "";

  let isMeta = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === "---") {
      isMeta = !isMeta;
      continue;
    }

    if (isMeta) {
      const [key, value] = line.split(":");

      if (!(key in meta)) {
        continue;
      }

      meta[key as keyof typeof meta] = value.trim();
      continue;
    }

    content += line + "\n";
  }

  return { ...meta, content };
}

function extractSkillsArgs(skillCmd: string): {
  skills: string[];
  args: string[];
} {
  const parts = skillCmd.split(" ");
  const skills = [];
  const args = [];

  let isCommand = true;

  for (const part of parts) {
    if (isCommand && part.startsWith("/")) {
      skills.push(part.slice(1));
    } else {
      isCommand = false;
      args.push(part);
    }
  }

  return { skills, args };
}

async function buildSkill(
  skillName: string,
  skillArgs: string[],
): Promise<string> {
  const skillsMap = await getSkills();
  const skill = skillsMap.get(skillName);
  if (!skill) {
    throw new Error(`Invalid skill: ${skillName}`);
  }

  let instruction = "";

  const path = `${SKILLS_PATH}/${skillName}`;
  instruction += `Skill: ${skillName} (located at: ${path})\nPaths in the instructions below are relative to that folder.`;

  const content = insertSkillArgs(skill.content, skillArgs);

  // subagent
  if (skill.context === "fork") {
    const client = buildClient(content);
    return (await agentLoop(client, content)) ?? "";
  }

  return `${instruction}\n\n${content}`;
}

function insertSkillArgs(content: string, skillArgs: string[]): string {
  const replaced = content.replace(
    /(\$ARGUMENTS\[\d+\])|(\$ARGUMENTS)|(\$\d+)/g,
    (value) => {
      if (value === "$ARGUMENTS") {
        return skillArgs.join(" ");
      }
      if (value.startsWith("$ARGUMENTS")) {
        const idxMatch = value.match(/\$ARGUMENTS\[(\d+)\]/);

        if (idxMatch?.at(1)) {
          const idx = Number(idxMatch.at(1));
          return skillArgs[idx];
        }
      }

      const argIdx = Number(value.slice(1));
      return skillArgs[argIdx];
    },
  );

  return replaced;
}
