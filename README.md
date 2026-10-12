# claude-code-typescript

A minimal coding agent built in TypeScript for the [CodeCrafters "Build your own Claude Code" challenge](https://app.codecrafters.io/users/JakubMarkiewicz?r=2qF) — a ~200-line CLI that can chat with an LLM, call tools, read/write files, and load skills.

[![progress-banner](https://backend.codecrafters.io/progress/claude-code/5faea99a-8f80-47e7-8efb-7aaa224357c7)](https://app.codecrafters.io/users/JakubMarkiewicz?r=2qF)

## How it works

The agent is a simple loop:

1. Send the conversation (system prompt + skills) to an LLM via OpenRouter.
2. If the model responds with a tool call, execute it and append the result to the conversation.
3. If it responds with plain text, print it and stop.

Built with [Bun](https://bun.sh), the OpenAI SDK (pointed at OpenRouter), and Zod for tool argument validation.

```
app/
├── main.ts      # CLI entrypoint: `bun run app/main.ts "<prompt>"`
├── loop.ts      # agent loop — LLM calls + tool execution
├── env.ts       # environment config (OpenRouter key, model, base URL)
├── types.ts
├── utils.ts     # client setup, tool dispatch
├── tools/       # tools the agent can call
│   ├── bash.ts  #   run shell commands
│   ├── read.ts  #   read files
│   ├── write.ts #   write files
│   └── skill.ts #   load skill files
└── skills/      # skill discovery & prompt building
```

## Setup

1. Install [Bun](https://bun.sh) if you don't have it.
2. Install dependencies:

   ```bash
   bun install
   ```

3. Set the required environment variables:

   | Variable | Description | Default |
   |---|---|---|
   | `OPENROUTER_API_KEY` | Your OpenRouter API key (**required**) | — |
   | `OPENROUTER_MODEL` | Model identifier on OpenRouter | `anthropic/claude-haiku-5.5` |
   | `OPENROUTER_BASE_URL` | OpenAI-compatible API base URL | `https://openrouter.ai/api/v1` |

## Usage

```bash
bun run app/main.ts "Explain what this repo does"
```

The agent will answer directly, or use its tools (`bash`, `read`, `write`, `skill`) to inspect and modify files before answering.

## CodeCrafters

This repo is a starter for the [CodeCrafters claude-code challenge](https://codecrafters.io). Tests are run via `your_program.sh` using the CodeCrafters CLI:

```bash
codecrafters test
```
