#!/usr/bin/env node
/**
 * Toggle code-agent-config.json enabled flag. Run from repository root.
 * Usage: node .cursor/hooks/toggle.mjs on|off|status
 */
import fs from "fs";
import path from "path";

const root = process.cwd();
const configPath = path.join(root, ".cursor", "code-agent-config.json");

const defaultConfig = {
  enabled: false,
  agent_md_path: "Agent.md",
  code_agent_path: ".cursor/code-agent.md",
};

function load() {
  if (!fs.existsSync(configPath)) {
    return { ...defaultConfig };
  }
  try {
    const data = JSON.parse(fs.readFileSync(configPath, "utf8"));
    return { ...defaultConfig, ...data };
  } catch {
    return { ...defaultConfig };
  }
}

function save(config) {
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(
    configPath,
    JSON.stringify(config, null, 2) + "\n",
    "utf8"
  );
}

const cmd = process.argv[2];

if (cmd === "on") {
  const c = load();
  c.enabled = true;
  save(c);
  console.log("Code Agent 模式：已开启（新会话将自动注入 code-agent.md + Agent.md）");
} else if (cmd === "off") {
  const c = load();
  c.enabled = false;
  save(c);
  console.log("Code Agent 模式：已关闭");
} else if (cmd === "status") {
  const c = load();
  console.log(
    c.enabled
      ? "Code Agent 模式：开启"
      : "Code Agent 模式：关闭"
  );
} else {
  console.error("用法: node .cursor/hooks/toggle.mjs on|off|status");
  process.exit(1);
}
