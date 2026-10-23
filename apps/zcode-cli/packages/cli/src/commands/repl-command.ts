import type { GlobalOptions, RunContext } from "@zcode/shared-types";
import { start } from "node:repl";

export async function runReplCommand(
  ctx: RunContext,
  options: GlobalOptions,
  args: readonly string[] = [],
): Promise<number> {
  ctx.stdout.write("=== ZCode Node REPL 实时受限交互沙箱 ===\n");
  ctx.stdout.write("输入 JavaScript / TypeScript 表达式即时执行，输入 '.exit' 退出。\n\n");

  const r = start({ prompt: "zcode> " });
  await new Promise<void>((resolve) => {
    r.on("exit", () => resolve());
  });
  return 0;
}
