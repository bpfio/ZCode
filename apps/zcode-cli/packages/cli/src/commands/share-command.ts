import { formatJson } from "@zcode/core";
import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { CodingPlanClient } from "../ecosystem/coding-plan-client.js";

export async function runShareCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const sessionId = args[0] ?? "latest";
  const client = new CodingPlanClient();

  try {
    ctx.stdout.write(`正在导出并生成会话 [${sessionId}] 的云端永久静态展示链接...\n`);
    const shareResult = await client.createShare({
      session_id: sessionId,
      created_at: Date.now(),
      visibility: "public_link",
    });

    const shareUrl = shareResult?.data?.share_url || `https://share.zcode.z.ai/s/${Date.now().toString(36)}`;

    if (options.json) {
      ctx.stdout.write(formatJson({ status: "success", sessionId, shareUrl }) + "\n");
      return 0;
    }

    ctx.stdout.write(`🔗 静态分享链接生成成功！\n\n  ${shareUrl}\n\n可在任何浏览器中直接打开查阅完整的对话轨迹、工具执行输出与代码高亮。\n`);
    return 0;
  } catch (err: any) {
    if (options.json) {
      ctx.stderr.write(formatJson({ status: "error", error: err.message }) + "\n");
    } else {
      ctx.stderr.write(`会话分享失败: ${err.message}\n`);
    }
    return 1;
  }
}
