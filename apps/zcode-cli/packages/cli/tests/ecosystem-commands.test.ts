import assert from "node:assert/strict";
import test from "node:test";
import { run } from "../src/run.js";
import type { RunContext } from "@zcode/shared-types";

type CapturedWriteStream = NodeJS.WriteStream & {
  output: () => string;
};

const createWriteStream = (): CapturedWriteStream => {
  let output = "";
  return {
    output: () => output,
    write: (chunk: string | Uint8Array, encodingOrCallback?: any, callback?: any): boolean => {
      output += typeof chunk === "string" ? chunk : chunk.toString();
      const cb = typeof encodingOrCallback === "function" ? encodingOrCallback : callback;
      cb?.();
      return true;
    },
  } as CapturedWriteStream;
};

const createContext = (argv: string[]): RunContext & {
  stderr: CapturedWriteStream;
  stdout: CapturedWriteStream;
} => ({
  argv,
  stderr: createWriteStream(),
  stdin: { isTTY: false } as NodeJS.ReadStream,
  stdout: createWriteStream(),
});

test("TASK-01: zcode reset status command execution", async () => {
  const ctx = createContext(["reset", "status"]);
  const exitCode = await run(ctx);
  const out = ctx.stdout.output() + ctx.stderr.output();
  assert.ok(exitCode === 0 || exitCode === 1);
  assert.ok(out.includes("重置卡") || out.includes("zcode login"));
});

test("TASK-04: zcode quota command execution", async () => {
  const ctx = createContext(["quota"]);
  const exitCode = await run(ctx);
  const out = ctx.stdout.output() + ctx.stderr.output();
  assert.ok(exitCode === 0 || exitCode === 1);
  assert.ok(out.includes("看板") || out.includes("zcode login"));
});

test("TASK-03: zcode claim list command execution", async () => {
  const ctx = createContext(["claim", "list"]);
  const exitCode = await run(ctx);
  const out = ctx.stdout.output() + ctx.stderr.output();
  assert.ok(exitCode === 0 || exitCode === 1);
  assert.ok(out.includes("福利") || out.includes("zcode login"));
});

test("TASK-02: zcode speedup command execution", async () => {
  const ctx = createContext(["speedup", "draw"]);
  const exitCode = await run(ctx);
  const out = ctx.stdout.output() + ctx.stderr.output();
  assert.ok(exitCode === 0 || exitCode === 1);
  assert.ok(out.includes("专网") || out.includes("zcode login"));
});

test("TASK-05: zcode idle status command execution", async () => {
  const ctx = createContext(["idle", "status"]);
  const exitCode = await run(ctx);
  const out = ctx.stdout.output() + ctx.stderr.output();
  assert.ok(exitCode === 0 || exitCode === 1);
  assert.ok(out.includes("闲时") || out.includes("zcode login"));
});

test("TASK-08: zcode sync status command execution", async () => {
  const ctx = createContext(["sync", "status"]);
  const exitCode = await run(ctx);
  assert.equal(exitCode, 0);
  const out = ctx.stdout.output();
  assert.ok(out.includes("云端漫游同步"));
});

test("TASK-15: zcode cron command execution", async () => {
  const ctx = createContext(["cron", "list"]);
  const exitCode = await run(ctx);
  assert.equal(exitCode, 0);
  const out = ctx.stdout.output();
  assert.ok(out.includes("定时任务"));
});

test("TASK-16: zcode memory command execution", async () => {
  const ctx = createContext(["memory", "list"]);
  const exitCode = await run(ctx);
  assert.equal(exitCode, 0);
  const out = ctx.stdout.output();
  assert.ok(out.includes("记忆"));
});

test("TASK-20: zcode worktree list command execution", async () => {
  const ctx = createContext(["worktree", "list"]);
  const exitCode = await run(ctx);
  assert.equal(exitCode, 0);
  const out = ctx.stdout.output();
  assert.ok(out.includes("Worktree"));
});

test("TASK-21: zcode server status command execution", async () => {
  const ctx = createContext(["server", "status"]);
  const exitCode = await run(ctx);
  assert.equal(exitCode, 0);
  const out = ctx.stdout.output();
  assert.ok(out.includes("Supervisor"));
});

test("TASK-06: zcode offers list command execution", async () => {
  const ctx = createContext(["offers", "list"]);
  const exitCode = await run(ctx);
  const out = ctx.stdout.output() + ctx.stderr.output();
  assert.ok(exitCode === 0 || exitCode === 1);
  assert.ok(out.includes("营销活动") || out.includes("空投") || out.includes("福利") || out.includes("zcode login"));
});

test("TASK-09: zcode team status command execution", async () => {
  const ctx = createContext(["team", "status"]);
  const exitCode = await run(ctx);
  const out = ctx.stdout.output() + ctx.stderr.output();
  assert.ok(exitCode === 0 || exitCode === 1);
  assert.ok(out.includes("企业") || out.includes("团队") || out.includes("zcode login"));
});

test("TASK-10: zcode share command execution", async () => {
  const ctx = createContext(["share"]);
  const exitCode = await run(ctx);
  const out = ctx.stdout.output() + ctx.stderr.output();
  assert.ok(exitCode === 0 || exitCode === 1);
  assert.ok(out.includes("分享") || out.includes("zcode login"));
});

test("TASK-14: superpowers-plugin registered in official plugin definitions", async () => {
  const { OFFICIAL_PLUGIN_DEFINITIONS } = await import("@zcode/bootstrap");
  const superpowers = OFFICIAL_PLUGIN_DEFINITIONS.find((p) => p.name === "superpowers");
  assert.ok(superpowers, "superpowers plugin should be registered");
  assert.equal(superpowers.defaultEnabled, true);
});

test("TASK-17: zcode import missing file usage execution", async () => {
  const ctx = createContext(["import"]);
  const exitCode = await run(ctx);
  assert.equal(exitCode, 1);
  const out = ctx.stderr.output();
  assert.ok(out.includes("Claude"));
});

test("TASK-19: zcode bot command usage execution", async () => {
  const ctx = createContext(["bot"]);
  const exitCode = await run(ctx);
  assert.equal(exitCode, 0);
  const out = ctx.stdout.output();
  assert.ok(out.includes("Webhook"));
});

test("TASK-23: zcode docs command execution", async () => {
  const ctx = createContext(["docs", "4189"]);
  const exitCode = await run(ctx);
  assert.equal(exitCode, 0);
  const out = ctx.stdout.output();
  assert.ok(out.includes("技术手册") || out.includes("微服务"));
});

test("TASK-24: zcode remote command usage execution", async () => {
  const ctx = createContext(["remote"]);
  const exitCode = await run(ctx);
  assert.equal(exitCode, 0);
  const out = ctx.stdout.output();
  assert.ok(out.includes("SSH"));
});

test("TASK-25: zcode office command usage execution", async () => {
  const ctx = createContext(["office"]);
  const exitCode = await run(ctx);
  assert.equal(exitCode, 0);
  const out = ctx.stdout.output();
  assert.ok(out.includes("office") || out.includes("Office"));
});

test("TASK-30: zcode upgrade command check execution", async () => {
  const ctx = createContext(["upgrade", "check"]);
  const exitCode = await run(ctx);
  assert.equal(exitCode, 0);
  const out = ctx.stdout.output();
  assert.ok(out.includes("升级中心") || out.includes("版本"));
});
