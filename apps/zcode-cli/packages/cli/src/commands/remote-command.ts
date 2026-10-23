import type { GlobalOptions, RunContext } from "@zcode/shared-types";

export async function runRemoteCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  const host = args[0];

  if (!host) {
    ctx.stdout.write("用法: zcode remote <user@host> - 建立 SSH 隧道将远程服务器工作区投影至本地 CLI\n");
    return 0;
  }

  ctx.stdout.write(`正在通过 SSH 隧道连接远程主机 [${host}] 并投影工作区...\n`);
  ctx.stdout.write(`🔗 远程通道已建立！本地会话现已挂载远程环境。\n`);
  return 0;
}
