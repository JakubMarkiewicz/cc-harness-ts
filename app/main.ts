import { agentLoop } from "./loop";
import { buildClient } from "./utils";

async function main() {
  const [, , flag, prompt] = process.argv;
  const client = buildClient(prompt, flag);

  await agentLoop(client, prompt);
}

main();
