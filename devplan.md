# ZCode CLI 增强发行版开发计划书 (DevPlan 25项黄金精简版)

> **项目名称**：`@clid/zcode` (ZCode CLI Enhanced Distribution)  
> **代码仓库**：[https://github.com/bpfio/zcode-cli](https://github.com/bpfio/zcode-cli) (Monorepo 基底: [https://github.com/bpfio/ZCode](https://github.com/bpfio/ZCode))  
> **更新时间**：2026-10-23  
> **架构准则（用户明确裁决）**：
> 1. 彻底剔除电脑控制类（Computer Use / CUA）模块；
> 2. 彻底剔除移动端独立 App 包装（`packages/android`）；
> 3. 坚决不纳入 4 个重型/平台敏感模块（Gen-UI、多媒体渲染、Browser Use、移动端双模拟器）；
> 4. 100% 聚焦在纯粹的终端代码研发、智谱生态算力与架构工程自动化，打造轻量、坚固、跨平台的黄金发行版。

---

## 总体架构设计与设计哲学

ZCode CLI 是专为开发者打造的终端 AI 编程工作台。其核心优势在于深度整合了 BigModel / Z.ai 的 Coding Plan 算力基座与智能体协议。经过地毯式源码盘点与架构提纯，剔除全部桌面 GUI、浏览器重型运行时与移动端非相关依赖，收敛出 **25 项 100% 适合全平台 CLI 终端运行的硬核能力**。

```mermaid
flowchart TD
    subgraph CLI [ZCode CLI 入口层 (@clid/zcode)]
        CMD["zcode 命令调度中心"]
        TUI["Ink 终端交互界面"]
        WEB["zcode --web 纯净浏览器工作区"]
        DAEMON["zcode server 守护服务"]
    end

    subgraph Phase1 [第一阶段：智谱生态权益与算力体系 (10项)]
        P1_1["TASK-01: zcode reset (五小时/周额度重置卡)"]
        P1_2["TASK-02: zcode speedup (极速卡专网推理加速)"]
        P1_3["TASK-03: zcode claim (活动免费积分/计划申领)"]
        P1_4["TASK-04: zcode quota / credits (用量与积分看板)"]
        P1_5["TASK-05: zcode idle queue (闲时免费算力调度)"]
        P1_6["TASK-06: zcode offers (营销空投与礼包触达)"]
        P1_7["TASK-07: Ultra 专网透明加速路由"]
        P1_8["TASK-08: zcode sync (云端漫游同步四件套)"]
        P1_9["TASK-09: zcode team (企业团队订阅管理)"]
        P1_10["TASK-10: zcode share (会话静态分享)"]
    end

    subgraph Phase2 [第二阶段：原生性能与单二进制分发 (3项)]
        P2_1["TASK-11: Native ripgrep / bfs 预编译套件打包"]
        P2_2["TASK-12: Node 24 SEA 单文件免依赖打包"]
        P2_3["TASK-13: GitHub Releases 多平台自动化流水线"]
    end

    subgraph Phase3 [第三阶段：高级工程方法论与自动化 (6项)]
        P3_1["TASK-14: Superpowers 顶级编程心法插件"]
        P3_2["TASK-15: zcode cron (自动化定时与周期任务)"]
        P3_3["TASK-16: zcode memory (长短期跨会话记忆)"]
        P3_4["TASK-17: zcode import (Claude 历史会话迁移)"]
        P3_5["TASK-18: zcode doctor (脱敏诊断与日志归档)"]
        P3_6["TASK-19: Bots 自动化机器人与 Webhook 调度"]
    end

    subgraph Phase4 [第四阶段：沙箱隔离、守护与文档套件 (6项)]
        P4_1["TASK-20: Git Worktree 隔离沙箱 (WorktreeIsolationPort)"]
        P4_2["TASK-21: Server Supervisor 后台常驻守护系统"]
        P4_3["TASK-22: Node REPL Host 实时交互沙箱"]
        P4_4["TASK-23: Dev Docs 本地离线技术手册"]
        P4_5["TASK-24: Remote Projects SSH 隧道开发"]
        P4_6["TASK-25: Office Runtime (Word/Excel/PPT/PDF 文本提取)"]
    end

    CMD --> Phase1
    CMD --> Phase3
    CMD --> Phase4
    CLI --> Phase2
```

---

## 阶段推进里程碑与任务清单 (25 项黄金全量清单)

### 阶段一：智谱生态权益与算力体系（优先级：P0 ~ P1）

#### TASK-01: 智谱额度重置卡管理与一键核销 (`zcode reset`)
- **优先级**：`P0`
- **源码定位**：`packages/shared/src/coding-plan-reset.ts`、`packages/services/src/usage-stats/providers/bigmodelUsageQuotaProvider.ts`、`docs/coding-plan-quota-reset-ui.md`
- **核心接口**：
  - `GET /api/v1/coding-plan/reset/status`
  - `POST /api/v1/coding-plan/reset/opportunity`
  - `POST /api/v1/coding-plan/reset/use`
- **实现方案**：在 CLI 中封装 `zcode reset`，支持查询当前持有的五小时卡（`FIVE_HOUR`）与周卡（`WEEK`）；在 1308 额度耗尽时一键触发服务端资格判定并核销使用，瞬间恢复 100% 额度。
- **验收标准**：模拟额度耗尽状态下执行 `zcode reset` 成功重置等待并完成状态刷新。

#### TASK-02: 极速卡专网推理加速 (`zcode speedup` / `zcode boost`)
- **优先级**：`P1`
- **源码定位**：`packages/services/src/highspeed/highspeedCardService.ts`
- **核心接口**：`POST /api/v1/highspeed/draw` 与健康探测
- **实现方案**：在推理 Turn 发起前注入双 JWT（ZCode JWT + Coding Plan Auth），调度智谱专用推理专网通道，大幅降低 TTFT。
- **验收标准**：加速通道调用下首字延迟较公网降低 30% 以上。

#### TASK-03: 智谱官方赠送免费积分/福利一键申领 (`zcode claim`)
- **优先级**：`P1`
- **源码定位**：`packages/services/src/coding-plan-subscription/bigmodelCodingPlanSubscriptionProvider.ts`
- **核心接口**：`GET /api/v1/zcode-plan/billing/preview`、`POST /api/v1/zcode-plan/billing/claim`
- **实现方案**：自动拉取所有开放的赠送计划（新手礼包、活动额度），一键批量申领入账。
- **验收标准**：新绑定账号执行 `zcode claim` 自动将免费额度入账。

#### TASK-04: 智谱 Coding Plan 积分与用量实时看板 (`zcode quota` / `zcode credits`)
- **优先级**：`P1`
- **源码定位**：`docs/bigmodel-coding-plan-usage-quota.md`、`packages/services/src/usage-stats/`
- **核心接口**：`GET /api/monitor/usage/quota/limit`、`/api/monitor/credit-usage/usage-detail`
- **实现方案**：终端彩色进度条展示 5 小时与周额度水位、各模型/工具积分消耗明细及日均折算。
- **验收标准**：执行 `zcode quota` 准确打印当前账户配额与消耗曲线。

#### TASK-05: 闲时无人值守算力排队调度 (`zcode idle queue`)
- **优先级**：`P2`
- **源码定位**：`packages/services/src/session/offPeak*`、`apps/zcode-cli/packages/core/src/tool/handlers/off-peak.ts`
- **核心接口**：`/api/v1/off-peak/ticket/*`、`/api/v1/off-peak/anthropic/v1/messages`
- **实现方案**：接入 `account:bigmodel-offpeak-idle-plan`，不扣减付费 Token，支持 3105 排队退避与 3102 自动换票续跑。
- **验收标准**：深夜提交批次任务，任务在闲时队列自动跑完并生成报告。

#### TASK-06: 官方活动空投与福利 Banner 触达 (`zcode offers`)
- **优先级**：`P2`
- **源码定位**：`packages/services/src/marketing-touch/marketingTouchService.ts`
- **核心接口**：`GET /api/v1/marketing/touch`、`POST /api/v1/marketing/touch/action`
- **实现方案**：终端启动时异步检查活动空投，提供一键领取交互。
- **验收标准**：在有活动时终端弹出提示并支持一键兑换。

#### TASK-07: 官方 Ultra 专网透明加速路由
- **优先级**：`P1`
- **源码定位**：`apps/zcode-cli/packages/adapters/src/model/endpoint-routing-edition/`
- **核心接口**：`GET /api/v1/agent/configs`、`/api/v1/ultra-zai/anthropic/v1/messages`
- **实现方案**：装配动态 Provider 路由端口，自动将 Anthropic 协议请求透明代理至智谱专网节点。
- **验收标准**：无需用户配置代理，请求自动走专网专线。

#### TASK-08: 云端全维度漫游同步四件套 (`zcode sync`)
- **优先级**：`P2`
- **源码定位**：`packages/services/src/{mcp-sync,plugin-sync,settings-sync,skill-sync}`
- **实现方案**：支持跨开发机双向同步个人 MCP 服务配置、插件安装列表、自定义 Skills 与全局配置。
- **验收标准**：在新机器执行 `zcode sync pull` 即可无缝还原整套开发环境。

#### TASK-09: 企业版团队订阅与项目额度管理 (`zcode team`)
- **优先级**：`P2`
- **源码定位**：`packages/services/src/coding-plan-subscription/`
- **核心接口**：`/api/biz/subscription/enterprise/v2/*`
- **实现方案**：支持企业租户登录、多项目权限隔离、团队成员配额配额审计。
- **验收标准**：团队管理员可在终端查询团队剩余席位与项目 Token 分配。

#### TASK-10: 会话永久云端静态分享 (`zcode share`)
- **优先级**：`P2`
- **源码定位**：`packages/services/src/conversation-share/`、`packages/web-share/`
- **核心接口**：`POST /api/v1/shares`
- **实现方案**：将 CLI/TUI 排查轨迹与工具输出静态导出，上传云端生成永久 Web 展示页面。
- **验收标准**：执行 `zcode share` 打印出的公网 URL 能够完整查看会话。

---

### 阶段二：底层原生加速与独立二进制分发（优先级：P1）

#### TASK-11: Native Search Tools 原生 C/Rust 检索套件打包
- **优先级**：`P1`
- **源码定位**：`scripts/package-native-search-tools.mjs`
- **实现方案**：将预编译的 `ripgrep 14.1.1`、`bfs 4.1.1`、`ugrep 7.8.4` 随 `@clid/zcode` 一同分发，彻底摆脱系统环境依赖。
- **验收标准**：在无 ripgrep 的纯净容器中，CLI 文件搜索与文本匹配耗时仍 ≤50ms。

#### TASK-12: SEA (Single Executable Application) 单二进制构建
- **优先级**：`P1`
- **源码定位**：`apps/zcode-cli/packages/cli/scripts/build-sea.mjs`
- **实现方案**：基于 Node.js 24 原生 SEA 机制，打包生成单个可执行文件 `zcode-linux-x64`（免装 Node.js/npm）。
- **验收标准**：单文件放置于干净的 Linux 环境下直接执行 `./zcode` 正常拉起 TUI。

#### TASK-13: GitHub Releases 多平台自动化流水线
- **优先级**：`P2`
- **源码定位**：`.github/workflows/build-and-publish.yml`
- **实现方案**：CI 自动化打包多平台 SEA 二进制并作为 Release 附件发布，内置版本预检防重发保护。
- **验收标准**：Tag push 后 GitHub Release 页面自动挂载跨平台安装包且 CI 保持绿色。

---

### 阶段三：高级工程方法论、自动化与持久化（优先级：P1 ~ P2）

#### TASK-14: Superpowers 顶级编程心法与工程方法论插件
- **优先级**：`P1`
- **源码定位**：`apps/zcode-cli/packages/superpowers-plugin/`
- **实现方案**：在官方插件注册表中将 `superpowers-plugin` 设为默认激活，为 Agent 注入 TDD 红绿循环、两阶段审查、架构构思与完工核验技能。
- **验收标准**：在新任务中 Agent 自动调用 `test-driven-development` 与 `verification-before-completion` 规范。

#### TASK-15: Cron 自动化定时与周期性无人值守任务 (`zcode cron`)
- **优先级**：`P2`
- **源码定位**：`packages/services/src/session/automationCron.ts`、`packages/shared/src/automation-types.ts`
- **实现方案**：基于 5 位 Cron 表达式定时唤醒 Agent 执行指定 Prompt，SQLite 持久化任务计划。
- **验收标准**：配置定时巡检任务，Cron 调度器准时触发执行。

#### TASK-16: 长短期跨会话持久记忆系统 (`zcode memory`)
- **优先级**：`P1`
- **源码定位**：`packages/services/src/memory/memoryService.ts`、`apps/zcode-cli/docs/usage/11-memory.md`
- **实现方案**：建立跨会话记忆存储，自动提取项目技术栈、命名规则与历史避坑经验并注入新会话。
- **验收标准**：在会话 A 中声明的代码规范，在会话 B 中自动生效。

#### TASK-17: Claude 历史会话无缝导入与修复 (`zcode import --from claude`)
- **优先级**：`P2`
- **源码定位**：`packages/services/src/zcode-session/importedClaudeSessionRepair.ts`
- **实现方案**：解析 Claude Code / Desktop 会话 JSON，自动补全协议差异与中断节点。
- **验收标准**：导入 Claude 历史项目记录，能在 ZCode CLI 中无缝继续对话。

#### TASK-18: 离线隐私脱敏诊断与日志归档 (`zcode doctor`)
- **优先级**：`P2`
- **源码定位**：`packages/services/src/feedback/compactLogArchive.ts`
- **实现方案**：正则脱敏敏感 Token、私有路径与密码，自动归档最近日志为单个压缩包。
- **验收标准**：执行 `zcode doctor --export` 输出脱敏安全的诊断文件。

#### TASK-19: Bots 自动化机器人与 Webhook 调度中心
- **优先级**：`P2`
- **源码定位**：`packages/services/src/bots/`、`packages/services/src/bot-project-runtime/`
- **实现方案**：挂载 Webhook HTTP 接收端，监听 GitHub PR、飞书与企业微信通知并唤醒 Agent 编写代码。
- **验收标准**：向 Webhook 投递 issue 事件，Agent 自动拉分支并提交 fix commit。

---

### 阶段四：沙箱隔离、守护与文档套件（优先级：P1 ~ P2）

#### TASK-20: Dynamic Workflow Git Worktree 隔离沙箱
- **优先级**：`P1`
- **源码定位**：`apps/zcode-cli/packages/dynamic-workflow/src/runtime/script-workflow-runtime.ts:283`
- **实现方案**：补全 `WorktreeIsolationPort`，为子 Agent 自动创建 `git worktree add -d` 独立目录，任务结束自动回收。
- **验收标准**：子工作流修改代码完全隔离在单独工作树，主分支代码 0 污染。

#### TASK-21: Server Supervisor 后台常驻守护系统 (`zcode server`)
- **优先级**：`P2`
- **源码定位**：`packages/zcode-server-cli/`
- **实现方案**：在 CLI 入口分流服务管理指令（`status`、`stop`、`restart`、`running-tasks`）。
- **验收标准**：后台常驻 Agent，通过 `zcode server status` 查阅实时任务心跳。

#### TASK-22: Node REPL Host 实时交互沙箱 (`zcode repl`)
- **优先级**：`P2`
- **源码定位**：`apps/zcode-cli/packages/node-repl-host/`
- **实现方案**：独立运行受限的 Node.js 沙箱进程，支持交互式执行 TypeScript/JavaScript 代码片段。
- **验收标准**：在终端通过 `zcode repl` 即时执行脚本并查阅变量状态。

#### TASK-23: Dev Docs 本地离线技术手册 (`zcode docs`)
- **优先级**：`P2`
- **源码定位**：`apps/dev-docs/`
- **实现方案**：编译 VitePress 静态手册，内置轻量 HTTP 服务器提供离线查阅。
- **验收标准**：执行 `zcode docs` 自动打开本地浏览器查阅完整的 ZCode 架构手册。

#### TASK-24: Remote Projects SSH 隧道开发 (`zcode remote`)
- **优先级**：`P2`
- **源码定位**：`packages/services/src/remote-projects/`
- **实现方案**：跨节点建立 SSH 隧道，将远程服务器工作区投影到本地 CLI 会话。
- **验收标准**：本地终端直连远程云主机并执行代码编辑与测试。

#### TASK-25: Office Runtime 富文本与文档处理套件
- **优先级**：`P2`
- **源码定位**：`apps/zcode-cli/packages/office-runtime/` 与 Word/Excel/PPT/PDF 插件
- **实现方案**：编译 Office 运行时 MCP 工具资产，使 CLI 具备快速提取并解析 Word、Excel、PPT 和 PDF 纯文本与结构的能力（不引入图形查看器）。
- **验收标准**：终端能够无缝读取并解析各类 Office 格式文档。

---

## 明确不纳入清单（WONTFIX / EXCLUDED，共 6 项）

依照用户明确裁决与极简终端原则，以下 6 项被永久剔除：
1. ❌ **Computer Use 电脑控制系统 (`packages/zcode-cua`)**：官方开源占位，需复杂系统级鼠标键盘截屏驱动，扩大安全攻击面；
2. ❌ **Android 原生移动远程控制 App (`packages/android`)**：纯移动端 Gradle 工程，不适合作为 CLI 命令行载体；
3. ❌ **Gen-UI 动态表单交互**：字符终端无法原生渲染 React 动态富交互表单；
4. ❌ **多媒体终端渲染与预览**：多数 SSH 终端无图形协议支持，强行渲染容易导致满屏乱码；
5. ❌ **Browser Use 无头浏览器插件**：依赖数百兆 Chromium 与数十个 C 动态库，在云服务器或 Docker 中易崩溃；
6. ❌ **移动端双模拟器套件**：iOS 模拟器强绑定 macOS 与 Xcode 跨平台水土不服，Android 模拟器依赖庞大 SDK。
