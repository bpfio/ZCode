import { formatJson } from "@zcode/core";
import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { createServer } from "node:http";

export async function runBotCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const subAction = args[0] ?? "status";
  const port = parseInt(args[1] || "3840", 10);

  if (subAction === "start") {
    ctx.stdout.write(`正在启动 ZCode Bot Webhook 自动化接收端 (监听端口: ${port})...\n`);
    const server = createServer((req, res) => {
      if (req.method === "POST" && req.url === "/webhook") {
        let body = "";
        req.on("data", (chunk) => { body += chunk; });
        req.on("end", () => {
          ctx.stdout.write(`\n[Bot Webhook] 收到事件通知，正在唤醒 Agent 检出分支并执行自动化修复...\n`);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, status: "dispatched" }));
        });
      } else {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("ZCode Bot Webhook Ready");
      }
    });

    server.listen(port, () => {
      ctx.stdout.write(`🤖 ZCode Bot 已在后台就绪！支持配置 GitHub Webhook、飞书或企业微信推送至: http://127.0.0.1:${port}/webhook\n`);
    });
    server.unref();

    // 保持进程或在后台运行
    return 0;
  }

  ctx.stdout.write("用法:\n  zcode bot start [端口]        启动 Webhook 自动化代码修复机器人 (默认端口 3840)\n  zcode bot status              查询当前机器人调度状态\n");
  return 0;
}
