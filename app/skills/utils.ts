import { readdir, readFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { Skill } from "../types";
import { open } from "node:fs/promises";
import type { ChatCompletionMessageParam } from "openai/resources";
import { existsSync } from "node:fs";

const CLAUDE_PATH = "./claude";
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

    content += line;
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
