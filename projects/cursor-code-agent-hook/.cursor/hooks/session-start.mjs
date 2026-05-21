#!/usr/bin/env node
/**
 * Cursor sessionStart hook: inject Code Agent prompt + Agent.md when enabled.
 * Stdout must be a single JSON object. Cursor expects snake_case: additional_context.
 */
import fs from "fs";
import path from "path";

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function emit(additional_context) {
  process.stdout.write(
    JSON.stringify({ additional_context: additional_context ?? "" })
  );
}

async function main() {
  let payload = {};
  try {
    payload = JSON.parse((await readStdin()) || "{}");
  } catch {
    payload = {};
  }

  const roots = payload.workspace_roots;
  const root =
    Array.isArray(roots) && roots.length > 0 ? roots[0] : process.cwd();

  const configPath = path.join(root, ".cursor", "code-agent-config.json");
  const config = readJsonFile(configPath);

  if (!config || config.enabled !== true) {
    emit("");
    return;
  }

  const agentRel = config.agent_md_path || "Agent.md";
  const codeRel = config.code_agent_path || ".cursor/code-agent.md";

  const agentPath = path.join(root, agentRel);
  const codePath = path.join(root, codeRel);

  const parts = [];
  if (fs.existsSync(codePath)) {
    parts.push(
      "# Code Agent 提示词\n\n" + fs.readFileSync(codePath, "utf8")
    );
  }
  if (fs.existsSync(agentPath)) {
    parts.push(
      "# Agent.md（项目上下文）\n\n" + fs.readFileSync(agentPath, "utf8")
    );
  }

  if (parts.length === 0) {
    emit(
      "[code-agent-mode] 已开启但未读取到任何文件。请检查 code-agent-config.json 中的 agent_md_path / code_agent_path 是否存在对应文件。"
    );
    return;
  }

  emit(parts.join("\n\n---\n\n"));
}

main().catch(() => {
  emit("");
});
