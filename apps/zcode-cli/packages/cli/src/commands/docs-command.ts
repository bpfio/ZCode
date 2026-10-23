import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { createServer } from "node:http";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export async function runDocsCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const port = parseInt(args[0] || "4180", 10);
  ctx.stdout.write(`正在启动 ZCode 本地离线技术手册服务 (http://127.0.0.1:${port})...\n`);

  const server = createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>ZCode CLI 官方技术手册</title><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; padding: 40px; max-width: 800px; margin: auto; line-height: 1.6;">
          <h1>📖 ZCode CLI 增强发行版官方离线手册</h1>
          <p>欢迎查阅 ZCode CLI 架构、插件开发与智谱大模型 Coding Plan 完整技术文档。</p>
          <ul>
            <li><b>TASK-01</b>: 智谱额度重置卡机制 (zcode reset)</li>
            <li><b>TASK-02</b>: 极速推理专网通道 (zcode speedup)</li>
            <li><b>TASK-14</b>: Superpowers 顶级编程心法与 TDD 规范</li>
            <li><b>TASK-20</b>: Git Worktree 隔离沙箱架构</li>
          </ul>
        </body>
      </html>
    `);
  });

  server.listen(port, () => {
    ctx.stdout.write(`📚 离线手册微服务已就绪！请在浏览器打开: http://127.0.0.1:${port}\n`);
  });
  server.unref();
  return 0;
}
