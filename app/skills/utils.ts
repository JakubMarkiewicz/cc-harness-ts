import { readdir, readFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Skill } from "../types";
import { open } from "node:fs/promises";
import type { ChatCompletionMessageParam } from "openai/resources";
import { existsSync } from "node:fs";

const CLAUDE_PATH = ".claude";
const SKILLS_PATH = join(CLAUDE_PATH, "skills");

async function assertSkillsDirExists() {
  const skillsPathExists = existsSync(SKILLS_PATH);
  if (!skillsPathExists) {
    await mkdir(CLAUDE_PATH);
    await mkdir(SKILLS_PATH);
  }
}

export async function getSkills(): Promise<Map<string, Skill>> {
  await assertSkillsDirExists();

  const skillNames = await readdir(SKILLS_PATH);
  const skills = await parseSkills(skillNames);

  return skills;
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

  const meta = { name, description: "" };
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

  return { name: meta.name, description: meta.description, content };
}

export async function getSkillsSystemPrompt(): Promise<ChatCompletionMessageParam> {
  const skills = await getSkills();

  let skillsPrompt = "";

  for (const [key, value] of skills) {
    skillsPrompt += `- ${key}: ${value.description}\n`;
  }

  return {
    role: "system",
    content: `You have access to the following skills:\n\n${skillsPrompt}`,
  };
}

export async function getSkillContent(skillCmd: string): Promise<string> {
  const [skillName, ...skillArgs] = skillCmd.split(" ");
  const skills = await getSkills();

  const skill = skills.get(skillName);
  if (!skill) {
    throw new Error(`Invalid skill: ${skillName}`);
  }

  if (skillArgs.length > 0) {
    return insertSkillArgs(skill.content, skillArgs);
  }

  return skill.content;
}

function insertSkillArgs(content: string, skillArgs: string[]): string {
  const parts = content.replaceAll("\n", " \n ").split(" ");

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (!part.startsWith("$")) {
      continue;
    }

    if (part.startsWith("$ARGUMENTS")) {
      const idxMatch = part.match(/\$ARGUMNETS\[(\d+)\]/);

      if (idxMatch?.at(1)) {
        parts[i] = idxMatch.at(1) as string;
        continue;
      }

      parts[i] = skillArgs.join(" ");
      continue;
    }

    if (part.match(/\$\d+/g)) {
      const argIdx = Number(part.slice(1));
      console.log({ part, argIdx, skillArgs });
      parts[i] = skillArgs[argIdx];
    }
  }

  return parts.join(" ");
}
