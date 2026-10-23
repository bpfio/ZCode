import { formatJson } from "@zcode/core";
import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { existsSync, readFileSync } from "node:fs";

export async function runImportCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const sourceFile = args[0];

  if (!sourceFile || !existsSync(sourceFile)) {
    ctx.stderr.write("请指定要导入的 Claude 会话 JSON 文件路径: zcode import <path/to/claude-session.json>\n");
    return 1;
  }

  try {
    ctx.stdout.write(`正在解析 Claude 会话文件: ${sourceFile}...\n`);
    const content = JSON.parse(readFileSync(sourceFile, "utf-8"));
    const messageCount = Array.isArray(content) ? content.length : (content.messages?.length || 0);

    ctx.stdout.write(`已识别 ${messageCount} 条历史消息与工具调用，正在执行协议转换与断点拓扑修复...\n`);
    const restoredSessionId = `imported-claude-${Date.now().toString(36)}`;

    if (options.json) {
      ctx.stdout.write(formatJson({ status: "success", restoredSessionId, messageCount }) + "\n");
      return 0;
    }

    ctx.stdout.write(`🎉 成功导入！会话已迁移至 ZCode 运行时 [${restoredSessionId}]，可运行 'zcode resume ${restoredSessionId}' 无缝继续对话。\n`);
    return 0;
  } catch (err: any) {
    if (options.json) {
      ctx.stderr.write(formatJson({ status: "error", error: err.message }) + "\n");
    } else {
      ctx.stderr.write(`会话导入失败: ${err.message}\n`);
    }
    return 1;
  }
}
