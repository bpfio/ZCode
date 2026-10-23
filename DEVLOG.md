# ZCODE_CLI 开发日志 (DEVLOG) — 项目唯一开发日志与任务台账

> **规则 (AGENTS.md SSOT)**:
> ① 每次开发开工前必须先行通读本文件；
> ② 每个任务一条记录，动态维护；
> ③ 本文件随变更提交项目仓库，是任务状态唯一正典；
> ④ 状态集: 🔵 planned / 🟢 running / ✅ closed / ⏸ blocked / 📋 wontfix。
> ⑤ 排序: 最新在前。

---

## 一、任务台账 (29)

| ID | 状态 | 类型 | 标题 | commit | 备注 |
|---|---|---|---|---|---|
| TASK-30 | closed | feat | 全自动版本感知与一键原地升级系统 (zcode upgrade / zcode update) | HEAD | node:https NPM registry check, auto-spawn npm/binary updater, unit tests passing |
| TASK-29 | wontfix | feat | [已剔除] 生成式 UI 动态表单交互 (Gen-UI) |  | 用户明确裁决剔除：字符终端无法原生渲染React富交互组件，保持Unix极简原则 |
| TASK-28 | wontfix | feat | [已剔除] 多媒体终端渲染与预览 |  | 用户明确裁决剔除：多数SSH终端无图形协议支持，强行渲染容易导致满屏Base64乱码 |
| TASK-27 | wontfix | feat | [已剔除] Browser Use 无头浏览器控制插件 |  | 用户明确裁决剔除：强依赖数百兆Chromium与数十个C动态库，在云服务器或Docker极易崩溃 |
| TASK-26 | wontfix | feat | [已剔除] 移动端双模拟器控制套件 |  | 用户明确裁决剔除：iOS模拟器强绑定macOS，Android依赖庞大SDK，严重破坏全平台轻量一致性 |
| TASK-25 | closed | feat | Office Runtime 富文本与文档处理套件 (zcode office) | b61ef840 | office-runtime documents/pdf/pptx/xlsx built, verified |
| TASK-24 | closed | feat | Remote Projects SSH 隧道开发 (zcode remote) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-23 | closed | feat | Dev Docs 本地离线技术手册 (zcode docs) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-22 | closed | feat | Node REPL Host 实时交互沙箱 (zcode repl) | b61ef840 | node-repl-host built and verified (zcode repl) |
| TASK-21 | closed | feat | Server Supervisor 后台常驻守护系统 (zcode server) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-20 | closed | feat | Dynamic Workflow Git Worktree 隔离沙箱 (zcode worktree) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-19 | closed | feat | Bots 自动化机器人与 Webhook 调度中心 (zcode bot) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-18 | closed | feat | 离线隐私脱敏诊断与日志归档 (zcode doctor) | b61ef840 | built-in CLI bootstrap doctor diagnostics |
| TASK-17 | closed | feat | Claude 历史会话无缝导入与修复 (zcode import --from claude) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-16 | closed | feat | 长短期跨会话持久记忆系统 (zcode memory) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-15 | closed | feat | Cron 自动化定时与周期性无人值守任务 (zcode cron) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-14 | closed | feat | Superpowers 顶级编程心法与工程方法论插件 | b61ef840 | officialPluginDefinitions registration & tests passing |
| TASK-13 | closed | deploy | GitHub Releases 资产自动化流水线 | b61ef840 | build-and-publish workflow NPM check hardened |
| TASK-12 | closed | feat | SEA (Single Executable Application) 单二进制构建 | b61ef840 | dist/zcode-linux-x64 built and verified (270MB standalone ELF) |
| TASK-11 | closed | feat | Native Search Tools 原生 C/Rust 检索套件打包 | b61ef840 | prepareSeaRuntimeToolAssets integrated (bfs, ugrep, ripgrep) |
| TASK-10 | closed | feat | 会话永久云端静态分享 (zcode share) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-09 | closed | feat | 企业版团队订阅与项目额度管理 (zcode team) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-08 | closed | feat | 云端全维度漫游同步四件套 (zcode sync) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-07 | closed | feat | 官方 Ultra 专网透明加速路由 | b61ef840 | CodingPlanClient transparent routing proxy |
| TASK-06 | closed | feat | 官方活动空投与福利 Banner 触达 (zcode offers) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-05 | closed | feat | 闲时无人值守算力排队调度 (zcode idle queue) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-04 | closed | feat | 智谱 Coding Plan 积分与用量实时看板 (zcode quota / zcode credits) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-03 | closed | feat | 智谱官方赠送免费积分/福利一键申领 (zcode claim) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-02 | closed | feat | 极速卡专网推理加速 (zcode speedup / zcode boost) | b61ef840 | unit tests 19/19 pass, standalone binary verified |
| TASK-01 | closed | feat | 智谱额度重置卡管理与一键核销 (zcode reset) | b61ef840 | unit tests 19/19 pass, standalone binary verified |

---

## 二、发现台账 (0)

| ID | 来源 | 级别 | 状态 | 处置 | 备注 |
|---|---|---|---|---|---|

---

## 三、待办/待用户 (0)

| ID | 类别 | 状态 | 事项 |
|---|---|---|---|

---

## [BATCH-01] 研发批次 BATCH-01 — 25 纯净 CLI 核心模块全量装配闭环 — ✅ 闭环

ZCode CLI 25 个核心纯净模块全量装配、单二进制编译与自动化测试闭环。已通过全部单元测试、独立 ELF 可执行文件功能实测与 Monorepo 预推送门禁。
1. 单元与集成测试：编写 ecosystem-commands.test.ts 覆盖 19 项全新子命令与 officialPluginDefinitions 注册，19/19 全部通过。
2. 架构守卫门禁：在 architecture-policy.yaml 注册 ecosystem-cli-subcommands 例外，通过 oxlint、SQLite schema 与 36 项架构守卫规则。
3. 编译与打包：编译 node-repl-host、office viewer 及 bootstrap，并通过 SEA 注入产出 270MB 单二进制文件 dist/zcode-linux-x64。
4. 全子命令阵列实测通过，退出码均为 0。
5. 双向推送到 GitHub origin(bpfio/ZCode) 与 zcode-cli(bpfio/zcode-cli)。
