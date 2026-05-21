#!/usr/bin/env node

/**
 * My First MCP Server
 *
 * 一个练习用的 MCP Server，提供文件扫描与统计分析工具。
 * 核心价值：一次扫描返回结构化的统计报告（数量、大小、目录分布、Top 大文件），
 * 这是简单的 CLI 命令无法一步做到的。
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execSync } from "node:child_process";
import * as os from "node:os";
import * as fs from "node:fs";
import * as path from "node:path";

// ============================================================
// 创建 MCP Server 实例
// ============================================================
const server = new McpServer({
  name: "my-first-mcp-server",
  version: "2.0.0",
});

// ============================================================
// 类型定义
// ============================================================
interface FileInfo {
  path: string;
  size: number;       // 字节
  directory: string;  // 所在目录
}

// ============================================================
// 辅助函数
// ============================================================

/** 用 find 命令搜索文件，返回路径列表 */
function findFiles(directory: string, extension: string): string[] {
  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  try {
    const cmd = `find "${directory}" -type f -name "*${ext}" -not -path "*/.*" -not -path "*/Library/*" 2>/dev/null`;
    const result = execSync(cmd, {
      encoding: "utf-8",
      timeout: 60_000,
      maxBuffer: 10 * 1024 * 1024,
    });
    return result.trim().split("\n").filter((line) => line.length > 0);
  } catch {
    return [];
  }
}

/** 获取文件详细信息（大小等） */
function getFileInfo(filePath: string): FileInfo | null {
  try {
    const stat = fs.statSync(filePath);
    return {
      path: filePath,
      size: stat.size,
      directory: path.dirname(filePath),
    };
  } catch {
    return null;
  }
}

/** 字节数格式化为可读字符串 */
function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(1)} ${units[i]}`;
}

// ============================================================
// Tool: 文件扫描统计报告
// ============================================================
server.tool(
  "scan_files_report",
  // ----- 描述是关键：写清楚独特价值，让模型优先选择这个工具 -----
  "【文件扫描统计报告】扫描指定目录下某种扩展名的所有文件，一次性返回完整的结构化分析报告，包含：" +
    "① 文件总数 ② 总大小 ③ 平均大小 ④ 按目录分组的分布统计 ⑤ 最大的 N 个文件排行。" +
    "当用户询问「有多少 .dmg 文件」「统计 PDF 数量」「哪些 .zip 文件最大」「文件分布在哪些目录」等问题时，必须使用此工具。" +
    "这个工具比手动执行 find/ls 命令更全面，一次调用即可获得完整的统计视图。",
  {
    directory: z
      .string()
      .default(os.homedir())
      .describe("要搜索的根目录路径，默认为用户主目录"),
    extension: z
      .string()
      .describe('要扫描的文件扩展名，例如 "dmg"、"pdf"、"zip"、"md"（带不带点号都行）'),
    top_n: z
      .number()
      .default(10)
      .describe("大文件排行榜展示数量，默认 10"),
  },
  async ({ directory, extension, top_n }) => {
    const dir = directory || os.homedir();
    const topN = top_n || 10;
    const ext = extension.startsWith(".") ? extension : `.${extension}`;

    // Step 1: 搜索文件
    const filePaths = findFiles(dir, extension);

    if (filePaths.length === 0) {
      return {
        content: [{
          type: "text",
          text: `在 ${dir} 目录下未找到任何 ${ext} 文件。\n（注：已排除隐藏目录和 Library 目录）`,
        }],
      };
    }

    // Step 2: 收集文件详情
    const files: FileInfo[] = [];
    for (const fp of filePaths) {
      const info = getFileInfo(fp);
      if (info) files.push(info);
    }

    // Step 3: 基础统计
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const avgSize = files.length > 0 ? totalSize / files.length : 0;

    // Step 4: 按目录分组统计
    const dirMap = new Map<string, { count: number; size: number }>();
    for (const f of files) {
      const entry = dirMap.get(f.directory) || { count: 0, size: 0 };
      entry.count += 1;
      entry.size += f.size;
      dirMap.set(f.directory, entry);
    }
    // 按数量降序排列
    const dirStats = [...dirMap.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 15); // 最多展示 15 个目录

    // Step 5: 大文件排行
    const topFiles = [...files]
      .sort((a, b) => b.size - a.size)
      .slice(0, topN);

    // Step 6: 组装报告
    let report = "";
    report += `📊 文件扫描报告：${ext} 文件\n`;
    report += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    report += `搜索目录：${dir}\n`;
    report += `\n`;

    report += `📈 基础统计\n`;
    report += `  文件总数：${files.length} 个\n`;
    report += `  总大小：${formatSize(totalSize)}\n`;
    report += `  平均大小：${formatSize(avgSize)}\n`;
    report += `\n`;

    report += `📂 目录分布（Top ${Math.min(dirStats.length, 15)}）\n`;
    for (const [dirPath, stat] of dirStats) {
      // 将绝对路径缩短为相对路径展示
      const displayPath = dirPath.replace(dir, "~");
      report += `  ${displayPath}\n`;
      report += `    ${stat.count} 个文件, 共 ${formatSize(stat.size)}\n`;
    }
    report += `\n`;

    report += `🏆 大文件 Top ${Math.min(topFiles.length, topN)}\n`;
    for (let i = 0; i < topFiles.length; i++) {
      const f = topFiles[i];
      const displayPath = f.path.replace(dir, "~");
      report += `  ${i + 1}. ${formatSize(f.size).padStart(10)}  ${displayPath}\n`;
    }

    return {
      content: [{ type: "text", text: report }],
    };
  }
);

// ============================================================
// 启动 Server
// ============================================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("✅ my-first-mcp-server v2.0 已启动，等待客户端连接...");
}

main().catch((error) => {
  console.error("❌ Server 启动失败:", error);
  process.exit(1);
});
