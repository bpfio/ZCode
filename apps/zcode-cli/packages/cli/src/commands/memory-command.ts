import { formatJson } from "@zcode/core";
import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";

interface MemoryEntry {
  id: string;
  category: "preference" | "architecture" | "rule" | "lesson";
  content: string;
  createdAt: number;
}

export async function runMemoryCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const subAction = args[0] ?? "list";
  const memoryStoreDir = join(homedir(), ".zcode", "memory");
  const memoryStoreFile = join(memoryStoreDir, "global-memory.json");

  if (!existsSync(memoryStoreDir)) {
    mkdirSync(memoryStoreDir, { recursive: true });
  }

  let entries: MemoryEntry[] = [];
  if (existsSync(memoryStoreFile)) {
    try {
      entries = JSON.parse(readFileSync(memoryStoreFile, "utf-8"));
    } catch {}
  }

  if (subAction === "list") {
    if (options.json) {
      ctx.stdout.write(formatJson({ status: "success", entries }) + "\n");
      return 0;
    }
    ctx.stdout.write("=== ZCode 跨会话长期持久记忆库 (Global Memory) ===\n");
    if (entries.length === 0) {
      ctx.stdout.write("当前暂未学习到全局记忆。运行 'zcode memory add \"<经验/规则>\"' 手动沉淀记忆。\n");
      return 0;
    }
    for (const item of entries) {
      ctx.stdout.write(`• [${item.category}] ${item.content} (${new Date(item.createdAt).toLocaleDateString()})\n`);
    }
    return 0;
  }

  if (subAction === "add") {
    const content = args.slice(1).join(" ");
    if (!content) {
      ctx.stderr.write("请提供要沉淀的记忆内容: zcode memory add \"<规范或经验>\"\n");
      return 1;
    }
    const entry: MemoryEntry = {
      id: `mem-${Date.now().toString(36)}`,
      category: "rule",
      content,
      createdAt: Date.now(),
    };
    entries.push(entry);
    writeFileSync(memoryStoreFile, JSON.stringify(entries, null, 2), "utf-8");
    ctx.stdout.write(`🧠 记忆沉淀成功！该条经验将在未来的所有终端会话中自动注入上下文。\n`);
    return 0;
  }

  if (subAction === "clear") {
    writeFileSync(memoryStoreFile, JSON.stringify([], null, 2), "utf-8");
    ctx.stdout.write("🧹 记忆库已清空。\n");
    return 0;
  }

  ctx.stdout.write("用法:\n  zcode memory list              查阅跨会话持久记忆库\n  zcode memory add \"<内容>\"      沉淀新的工程规则或偏好\n  zcode memory clear             重置清空记忆库\n");
  return 0;
}
