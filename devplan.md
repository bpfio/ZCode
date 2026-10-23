# ZCode CLI 增强发行版开发计划书 (DevPlan)

> **项目名称**：`@clid/zcode` (ZCode CLI Enhanced Distribution)  
> **代码仓库**：[https://github.com/bpfio/zcode-cli](https://github.com/bpfio/zcode-cli) (Monorepo 基底: [https://github.com/bpfio/ZCode](https://github.com/bpfio/ZCode))  
> **制定时间**：2026-10-23  
> **架构准则**：专注纯粹的代码研发、终端工程与智谱生态；彻底剔除电脑控制类（Computer Use / CUA）模块。

---

## 总体架构设计与设计哲学

ZCode 是由智谱 AI 与开源社区共同演进的 AI 编程工作台。其核心优势在于深度整合了 BigModel / Z.ai 的 Coding Plan 算力基座与智能体协议。在官方发布体系中，大量高价值能力分散在 Monorepo 的不同 packages 和内部 services 中，未在 CLI 暴露子命令或未打通运行闭环。

本开发计划旨在将这些“沉睡”的硬核能力全部激活，打造一个无遗漏、原汁原味、体验极致的 AI 终端工作台。

```mermaid
flowchart TD
    subgraph CLI [ZCode CLI 入口层 (@clid/zcode)]
        CMD["zcode 命令调度中心"]
        TUI["Ink 终端交互界面"]
        WEB["zcode --web 浏览器工作区"]
        DAEMON["zcode server 守护服务"]
    end

    subgraph Phase1 [第一阶段：智谱生态权益与算力体系]
        P1_1["zcode reset (五小时/周额度重置卡)"]
        P1_2["zcode speedup (极速卡专网推理加速)"]
        P1_3["zcode claim (活动免费积分/计划申领)"]
        P1_4["zcode quota / credits (用量与积分看板)"]
        P1_5["zcode idle queue (闲时免费算力调度)"]
        P1_6["zcode offers (营销空投与礼包触达)"]
        P1_7["Ultra 专网透明加速路由"]
        P1_8["zcode sync (云端漫游同步四件套)"]
        P1_9["zcode team (企业团队订阅管理)"]
        P1_10["zcode share (会话静态分享)"]
    end

    subgraph Phase2 [第二阶段：原生性能与单二进制分发]
        P2_1["Native ripgrep / bfs 预编译套件打包"]
        P2_2["Node 24 SEA 单文件免依赖打包"]
        P2_3["GitHub Actions 多平台 Releases 流水线"]
    end

    subgraph Phase3 [第三阶段：高级工程方法论与自动化]
        P3_1["Superpowers 顶级编程心法插件"]
        P3_2["zcode cron (自动化定时与周期任务)"]
        P3_3["zcode memory (长短期跨会话记忆)"]
        P3_4["zcode import (Claude 历史会话迁移)"]
        P3_5["zcode doctor (脱敏诊断与日志归档)"]
        P3_6["Bots 自动化机器人与 Webhook 调度"]
        P3_7["Gen-UI 动态表单交互 (Ink + React)"]
        P3_8["多媒体终端渲染与预览"]
    end

    subgraph Phase4 [第四阶段：沙箱隔离与扩展套件]
        P4_1["Git Worktree 隔离沙箱 (WorktreeIsolationPort)"]
        P4_2["Server Supervisor 后台常驻守护系统"]
        P4_3["Node REPL Host 实时交互沙箱"]
        P4_4["Dev Docs 本地离线技术手册"]
        P4_5["Remote Projects SSH 隧道开发"]
        P4_6["Browser Use 无头浏览器控制插件"]
        P4_7["Office Runtime (Word/Excel/PPT/PDF)"]
        P4_8["移动端双模拟器控制套件 (Android/iOS)"]
    end

    CMD --> Phase1
    CMD --> Phase3
    CMD --> Phase4
    CLI --> Phase2
```

---

## 阶段推进里程碑与任务清单 (29 项全量规划)

### 阶段一：智谱生态权益与算力体系（优先级：P0 ~ P1）

#### TASK-01: 智谱额度重置卡管理与一键核销 (`zcode reset`)
- **源码定位**：`packages/shared/src/coding-plan-reset.ts`、`packages/services/src/usage-stats/providers/bigmodelUsageQuotaProvider.ts`、`docs/coding-plan-quota-reset-ui.md`
- **核心接口**：
  - `GET /api/v1/coding-plan/reset/status`
  - `POST /api/v1/coding-plan/reset/opportunity`
  - `POST /api/v1/coding-plan/reset/use`
- **实现方案**：
  1. 在 `apps/zcode-cli/packages/cli/src/commands/` 封装 `reset.ts` 子命令；
  2. 实现 `zcode reset status`：显示可用五小时卡（`FIVE_HOUR`）与周卡（`WEEK`）数量及过期时间；
  3. 实现 `zcode reset use`：当模型提示 1308 额度耗尽时，直接向服务端触发资格校验并一键核销，瞬间恢复 100% 额度。
- **验收标准**：模拟额度耗尽时执行 `zcode reset` 成功清零等待并完成对账。

#### TASK-02: 极速卡专网推理加速 (`zcode speedup` / `zcode boost`)
- **源码定位**：`packages/services/src/highspeed/highspeedCardService.ts`
- **核心接口**：`POST /api/v1/highspeed/draw` 与健康探测
- **实现方案**：在推理 Turn 发起前注入双 JWT（ZCode JWT + Coding Plan Auth），调度智谱专用推理专网通道，大幅降低 TTFT。
- **验收标准**：通过加速通道调用模型，首字延迟降低 30% 以上。

#### TASK-03: 智谱官方赠送免费积分/福利一键申领 (`zcode claim`)
- **源码定位**：`packages/services/src/coding-plan-subscription/bigmodelCodingPlanSubscriptionProvider.ts`
- **核心接口**：`GET /api/v1/zcode-plan/billing/preview`、`POST /api/v1/zcode-plan/billing/claim`
- **实现方案**：自动拉取所有开放的赠送计划（新手礼包、活动额度），一键批量申领入账。
- **验收标准**：新绑定账号执行 `zcode claim` 自动入账免费额度。

#### TASK-04: 智谱 Coding Plan 积分与用量实时看板 (`zcode quota` / `zcode credits`)
- **源码定位**：`docs/bigmodel-coding-plan-usage-quota.md`、`packages/services/src/usage-stats/`
- **核心接口**：`GET /api/monitor/usage/quota/limit`、`/api/monitor/credit-usage/usage-detail`
- **实现方案**：终端彩色进度条展示 5 小时与周额度水位、各模型/工具积分消耗明细及日均折算。
- **验收标准**：执行 `zcode quota` 准确打印当前账户配额与消耗曲线。

#### TASK-05: 闲时无人值守算力排队调度 (`zcode idle queue`)
- **源码定位**：`packages/services/src/session/offPeak*`、`apps/zcode-cli/packages/core/src/tool/handlers/off-peak.ts`
- **核心接口**：`/api/v1/off-peak/ticket/*`、`/api/v1/off-peak/anthropic/v1/messages`
- **实现方案**：接入 `account:bigmodel-offpeak-idle-plan`，不扣减付费 Token，支持 3105 排队退避与 3102 自动换票续跑。
- **验收标准**：深夜提交批次任务，任务在闲时队列自动跑完并生成报告。

#### TASK-06: 官方活动空投与福利 Banner 触达 (`zcode offers`)
- **源码定位**：`packages/services/src/marketing-touch/marketingTouchService.ts`
- **核心接口**：`GET /api/v1/marketing/touch`、`POST /api/v1/marketing/touch/action`
- **实现方案**：终端启动时异步检查活动空投，提供一键领取交互。
- **验收标准**：在有活动时终端弹出提示并支持一键兑换。

#### TASK-07: 官方 Ultra 专网透明加速路由
- **源码定位**：`apps/zcode-cli/packages/adapters/src/model/endpoint-routing-edition/`
- **核心接口**：`GET /api/v1/agent/configs`、`/api/v1/ultra-zai/anthropic/v1/messages`
- **实现方案**：装配动态 Provider 路由端口，自动将 Anthropic 协议请求透明代理至智谱专网节点。
- **验收标准**：无需用户配置代理，请求自动走专网专线。

#### TASK-08: 云端全维度漫游同步四件套 (`zcode sync`)
- **源码定位**：`packages/services/src/{mcp-sync,plugin-sync,settings-sync,skill-sync}`
- **实现方案**：支持跨开发机双向同步个人 MCP 服务配置、插件安装列表、自定义 Skills 与全局配置。
- **验收标准**：在新机器执行 `zcode sync pull` 即可无缝还原整套开发环境。

#### TASK-09: 企业版团队订阅与项目额度管理 (`zcode team`)
- **源码定位**：`packages/services/src/coding-plan-subscription/`
- **核心接口**：`/api/biz/subscription/enterprise/v2/*`
- **实现方案**：支持企业租户登录、多项目权限隔离、团队成员配额配额审计。
- **验收标准**：团队管理员可在终端查询团队剩余席位与项目 Token 分配。

#### TASK-10: 会话永久云端静态分享 (`zcode share`)
- **源码定位**：`packages/services/src/conversation-share/`、`packages/web-share/`
- **核心接口**：`POST /api/v1/shares`
- **实现方案**：将 CLI/TUI 排查轨迹与工具输出静态导出，上传云端生成永久 Web 展示页面。
- **验收标准**：执行 `zcode share` 打印出的公网 URL 能够完整查看会话。

---

### 阶段二：底层原生加速与独立二进制分发（优先级：P1）

#### TASK-11: Native Search Tools 原生 C/Rust 检索套件打包
- **源码定位**：`scripts/package-native-search-tools.mjs`
- **实现方案**：将预编译的 `ripgrep 14.1.1`、`bfs 4.1.1`、`ugrep 7.8.4` 随 `@clid/zcode` 一同分发，彻底摆脱系统环境依赖。
- **验收标准**：在无 ripgrep 的纯净容器中，CLI 文件搜索与文本匹配耗时仍 ≤50ms。

#### TASK-12: SEA (Single Executable Application) 单二进制构建
- **源码定位**：`apps/zcode-cli/packages/cli/scripts/build-sea.mjs`
- **实现方案**：基于 Node.js 24 原生 SEA 机制，打包生成单个可执行文件 `zcode-linux-x64`（免装 Node.js/npm）。
- **验收标准**：单文件放置于干净的 Linux 环境下直接执行 `./zcode` 正常拉起 TUI。

#### TASK-13: GitHub Releases 资产自动化流水线
- **源码定位**：`.github/workflows/cli-distribution.yml`
- **实现方案**：配置 Release 自动触发，打包多平台二进制并上传到 GitHub Releases 附件。
- **验收标准**：Tag push 后 GitHub Release 页面自动挂载跨平台安装包。

---

### 阶段三：高级工程方法论、自动化与持久化（优先级：P1）

#### TASK-14: Superpowers 顶级编程心法与工程方法论插件
- **源码定位**：`apps/zcode-cli/packages/superpowers-plugin/`
- **实现方案**：在官方插件注册表中将 `superpowers-plugin` 设为默认激活，为 Agent 注入 TDD 红绿循环、两阶段审查、架构构思与完工核验技能。
- **验收标准**：在新任务中 Agent 自动调用 `test-driven-development` 与 `verification-before-completion` 规范。

#### TASK-15: Cron 自动化定时与周期性无人值守任务 (`zcode cron`)
- **源码定位**：`packages/services/src/session/automationCron.ts`、`packages/shared/src/automation-types.ts`
- **实现方案**：基于 5 位 Cron 表达式定时唤醒 Agent 执行指定 Prompt，SQLite 持久化任务计划。
- **验收标准**：配置每小时一次的巡检任务，Cron 调度器准时触发执行。

#### TASK-16: 长短期跨会话持久记忆系统 (`zcode memory`)
- **源码定位**：`packages/services/src/memory/memoryService.ts`、`apps/zcode-cli/docs/usage/11-memory.md`
- **实现方案**：建立跨会话记忆存储，自动提取项目技术栈、命名规则与历史避坑经验并注入新会话。
- **验收标准**：在会话 A 中声明的代码规范，在会话 B 中自动生效。

#### TASK-17: Claude 历史会话无缝导入与修复 (`zcode import --from claude`)
- **源码定位**：`packages/services/src/zcode-session/importedClaudeSessionRepair.ts`
- **实现方案**：解析 Claude Code / Desktop 会话 JSON，自动补全协议差异与中断节点。
- **验收标准**：导入 Claude 历史项目记录，能在 ZCode CLI 中无缝继续对话。

#### TASK-18: 离线隐私脱敏诊断与日志归档 (`zcode doctor`)
- **源码定位**：`packages/services/src/feedback/compactLogArchive.ts`
- **实现方案**：正则脱敏敏感 Token、私有路径与密码，自动归档最近日志为单个压缩包。
- **验收标准**：执行 `zcode doctor --export` 输出脱敏安全的诊断文件。

#### TASK-19: Bots 自动化机器人与 Webhook 调度中心
- **源码定位**：`packages/services/src/bots/`、`packages/services/src/bot-project-runtime/`
- **实现方案**：挂载 Webhook HTTP 接收端，监听 GitHub PR、飞书与企业微信通知并唤醒 Agent 编写代码。
- **验收标准**：向 Webhook 投递 issue 事件，Agent 自动拉分支并提交 fix commit。

#### TASK-20: 生成式 UI 动态表单交互 (Gen-UI)
- **源码定位**：`packages/services/src/gen-ui/`、`packages/ui/`
- **实现方案**：终端采用 Ink 多选列表降级交互，`zcode --web` 呈现原生 React 富组件。
- **验收标准**：模型下发动态表单时，终端与 Web 端均能顺畅完成表单填写与提交。

#### TASK-21: 多媒体终端渲染与预览
- **源码定位**：`packages/services/src/media-preview/`、`packages/shared/src/zcode-media-policy.ts`
- **实现方案**：兼容 Kitty/iTerm2 图形协议在字符终端内联渲染图片，Web 模式直接输出高分图表。
- **验收标准**：Agent 生成的架构图在终端或浏览器中即时可见。

---

### 阶段四：沙箱隔离、运行时服务与扩展套件（优先级：P2）

#### TASK-22: Dynamic Workflow Git Worktree 隔离沙箱
- **源码定位**：`apps/zcode-cli/packages/dynamic-workflow/src/runtime/script-workflow-runtime.ts:283`
- **实现方案**：补全 `WorktreeIsolationPort`，为子 Agent 自动创建 `git worktree add -d` 独立目录，任务结束自动回收。
- **验收标准**：子工作流修改代码完全隔离在单独工作树，主分支代码 0 污染。

#### TASK-23: Server Supervisor 后台常驻守护系统 (`zcode server`)
- **源码定位**：`packages/zcode-server-cli/`
- **实现方案**：在 CLI 入口分流服务管理指令（`status`、`stop`、`restart`、`running-tasks`）。
- **验收标准**：后台常驻 Agent，通过 `zcode server status` 查阅实时任务心跳。

#### TASK-24: Node REPL Host 实时交互沙箱 (`zcode repl`)
- **源码定位**：`apps/zcode-cli/packages/node-repl-host/`
- **实现方案**：独立运行受限的 Node.js 沙箱进程，支持交互式执行 TypeScript/JavaScript 代码片段。
- **验收标准**：在终端通过 `zcode repl` 即时执行脚本并查阅变量状态。

#### TASK-25: Dev Docs 本地离线技术手册 (`zcode docs`)
- **源码定位**：`apps/dev-docs/`
- **实现方案**：编译 VitePress 静态手册，内置轻量 HTTP 服务器提供离线查阅。
- **验收标准**：执行 `zcode docs` 自动打开本地浏览器查阅完整的 ZCode 架构手册。

#### TASK-26: Remote Projects SSH 隧道开发 (`zcode remote`)
- **源码定位**：`packages/services/src/remote-projects/`
- **实现方案**：跨节点建立 SSH 隧道，将远程服务器工作区投影到本地 CLI 会话。
- **验收标准**：本地终端直连远程云主机并执行代码编辑与测试。

#### TASK-27: Browser Use 无头浏览器控制插件
- **源码定位**：`apps/zcode-cli/packages/browser-use-plugin/`
- **实现方案**：作为官方插件打包分发，提供页面渲染、DOM 树提取与 Web 自动化回归能力。
- **验收标准**：Agent 成功驱动无头浏览器完成网页操作与截图。

#### TASK-28: Office Runtime 富文本与文档处理套件
- **源码定位**：`apps/zcode-cli/packages/office-runtime/` 与 Word/Excel/PPT/PDF 插件
- **实现方案**：编译 Office 运行时资产，使 CLI 具备处理 DOCX、XLSX、PPTX 和 PDF 的能力。
- **验收标准**：终端能够无缝提取并解析 Office 文档内容。

#### TASK-29: 移动端双模拟器控制套件
- **源码定位**：`android-emulator-plugin` 与 `ios-simulator-plugin`
- **实现方案**：集成 ADB 与 Xcode Simulator 接口，支持移动端测试自动化。
- **验收标准**：Agent 能够启动模拟器并执行应用测试。

---

## 质量保障与安全红线

1. **零凭据泄漏**：所有 API 鉴权信息由操作系统凭据管理器或安全环境变量持有，严禁硬编码在任何日志或导出文件中；
2. **单一事实源（SSOT）**：所有开发计划、架构决策与排查台账同步录入研发中枢 **Logbook**（项目：`zcode-cli`）；
3. **方案先行原则**：破坏性改动与对外发布前必须经过完整审查与测试闭环。
