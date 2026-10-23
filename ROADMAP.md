# ZCode CLI 增强装配路线图 (Roadmap)

本项目是基于官方 ZCode 深度定制与增强的终端 AI 编程工作台（包含 TUI 终端、`zcode --web` 浏览器工作区、Daemon 守护进程与 Agent 运行时），由 `@clid/zcode` 分发。

> **架构原则（用户裁决 2026-10-23）**：
> 专注纯粹的代码、架构与终端工程体验；**彻底剔除电脑控制类（Computer Use / CUA）模块**，杜绝引入任何桌面键鼠劫持与窗口接管依赖。

本路线图系统记录了从 ZCode 源码库中挖掘、待装配激活的 **29 项核心功能模块**，作为后续迭代推进的单一事实源（SSOT）。

---

## 阶段一：智谱生态权益与算力体系（优先落地）

- [ ] **1. 智谱额度重置卡管理与一键核销 (`zcode reset`)**
  - **模块定位**：`packages/shared/src/coding-plan-reset.ts`、`packages/services/src/usage-stats/` 与 `docs/coding-plan-quota-reset-ui.md`
  - **核心机制**：对接 `GET /api/v1/coding-plan/reset/status`、`POST /opportunity` 与 `POST /use`
  - **终端价值**：支持五小时（`FIVE_HOUR`）与周额度（`WEEK`）重置卡；额度耗尽（1308 错误）时，一键触发领卡并核销，瞬间恢复 100% 满血复活！
- [ ] **2. 极速卡专网推理加速 (`zcode speedup` / `zcode boost`)**
  - **模块定位**：`packages/services/src/highspeed/highspeedCardService.ts`
  - **核心机制**：对接 `POST /api/v1/highspeed/draw` 与健康检查，双 JWT 鉴权注入
  - **终端价值**：在 Agent 推理轮次（Turn）开始前注入加速专网通道，大幅降低 TTFT（首字延迟）与并发排队等待。
- [ ] **3. 智谱官方赠送免费积分/福利一键申领 (`zcode claim`)**
  - **模块定位**：`packages/services/src/coding-plan-subscription/bigmodelCodingPlanSubscriptionProvider.ts`
  - **核心机制**：对接 `GET /api/v1/zcode-plan/billing/preview` 与 `POST /api/v1/zcode-plan/billing/claim`
  - **终端价值**：终端直接查询并一键领取智谱官方赠送的新手福利、活动积分包与 Coding Plan 算力。
- [ ] **4. 智谱 Coding Plan 积分与用量实时看板 (`zcode quota` / `zcode credits`)**
  - **模块定位**：`docs/bigmodel-coding-plan-usage-quota.md` 与 `packages/services/src/usage-stats/`
  - **核心机制**：对接 `GET https://bigmodel.cn/api/monitor/usage/quota/limit` 与 `/api/monitor/credit-usage/usage-detail`
  - **终端价值**：彩色终端展示 5 小时 Prompt 额度池、周额度池、累计积分消耗、模型/工具细项与日均积分。
- [ ] **5. 闲时无人值守算力排队调度 (`zcode idle queue`)**
  - **模块定位**：`packages/services/src/session/offPeak*` 与 `apps/zcode-cli/packages/core/src/tool/handlers/off-peak.ts`
  - **核心机制**：对接 `POST /api/v1/off-peak/ticket` 取号，使用 `account:bigmodel-offpeak-idle-plan` 专属闲时模型
  - **终端价值**：不扣减付费 Token/积分，提交长周期任务至官方闲时低峰队列，3105 自动退避，3102 自动重取新票续跑。
- [ ] **6. 官方活动空投与福利 Banner 触达 (`zcode offers`)**
  - **模块定位**：`packages/services/src/marketing-touch/marketingTouchService.ts`
  - **核心机制**：对接 `GET /api/v1/marketing/touch` 与 `POST /api/v1/marketing/touch/action`
  - **终端价值**：自动接收最新限时空投（如周末领 Token、积分补贴），终端一键确认兑换。
- [ ] **7. 官方 Ultra 专网透明加速路由**
  - **模块定位**：`apps/zcode-cli/.../official-coding-plan-gateway.ts`
  - **核心机制**：动态拉取 `GET /api/v1/agent/configs`，透明路由 Anthropic 请求至官方专网。
- [ ] **8. 云端跨设备漫游同步四件套 (`zcode sync`)**
  - **模块定位**：`packages/services/src/{mcp-sync,plugin-sync,settings-sync,skill-sync}`
  - **核心机制**：打通云端同步协议，支持个人与团队配置漫游
  - **终端价值**：在不同机器、服务器之间双向同步 MCP 服务、已装插件、自定义技能与用户偏好。
- [ ] **9. 企业版团队订阅与项目额度管理 (`zcode team`)**
  - **模块定位**：`packages/services/src/coding-plan-subscription/`
  - **核心机制**：对接 `/api/biz/subscription/enterprise/v2/*`
  - **终端价值**：支持团队多项目租户隔离、企业组织授权与配额查询。
- [ ] **10. 会话永久云端静态分享 (`zcode share`)**
  - **模块定位**：`packages/services/src/conversation-share/` 与 `packages/web-share/`
  - **核心机制**：对接 `POST /api/v1/shares` 与静态会话导出器
  - **终端价值**：将 CLI/TUI 排查会话一键上传并生成美观的 Web 永久分享链接。

---

## 阶段二：底层原生加速与免依赖独立二进制

- [ ] **11. Native Search Tools 原生 C/Rust 检索套件打包**
  - **模块定位**：`scripts/package-native-search-tools.mjs`
  - **核心机制**：将预编译的 `ripgrep 14.1.1`、`bfs 4.1.1`、`ugrep 7.8.4` 编入发布包
  - **终端价值**：百兆大型 Monorepo 文件索引与正则匹配速度从数秒提升至 50ms。
- [x] **12. SEA (Single Executable Application) 单二进制构建**
  - **模块定位**：`apps/zcode-cli/packages/cli/scripts/build-sea.mjs`
  - **核心机制**：基于 Node.js 24 原生 SEA 特性，将 Node 运行时、V8 字节码、TUI 和 Agent 打包为单一二进制
  - **终端价值**：免装 Node.js / npm，单文件 `zcode-linux-x64`（268MB）直接放入系统路径运行。
- [ ] **13. GitHub Releases 资产自动化发布流水线**
  - **模块定位**：`.github/workflows/cli-distribution.yml`
  - **核心机制**：CI 自动化打包多平台 SEA 二进制并作为 Release 附件发布。

---

## 阶段三：高级工程方法论、自动化与持久化

- [ ] **14. Superpowers 顶级编程心法与工程方法论插件**
  - **模块定位**：`apps/zcode-cli/packages/superpowers-plugin/`
  - **核心机制**：内置 Brainstorming、严格 TDD 红绿循环、两阶段 Subagent 审查、系统化 Debug 与完工核验
  - **终端价值**：赋予 Agent 顶级工程师规范，杜绝信口开河与无测试盲目写代码。
- [ ] **15. Cron 自动化定时与周期性无人值守任务 (`zcode cron`)**
  - **模块定位**：`packages/services/src/session/automationCron.ts` 与 `packages/shared/src/automation-types.ts`
  - **核心机制**：支持标准 5 位 Cron 表达式定时调度，SQLite 持久化与 Agent 唤醒执行
  - **终端价值**：支持每日凌晨自动代码审查、跑集成测试、每日构建或定时巡检。
- [ ] **16. 长短期跨会话持久记忆系统 (`zcode memory`)**
  - **模块定位**：`packages/services/src/memory/memoryService.ts` 与 `apps/zcode-cli/docs/usage/11-memory.md`
  - **核心机制**：跨会话维护用户开发偏好、项目架构规则、技术选型决策与历史避坑清单
  - **终端价值**：免除每次开启会话重复灌输背景知识的困扰，越用越聪明。
- [ ] **17. Claude 历史会话无缝导入与修复 (`zcode import --from claude`)**
  - **模块定位**：`packages/services/src/zcode-session/importedClaudeSessionRepair.ts`
  - **核心机制**：一键导入 Claude Code、Claude Desktop 历史排查记录，自动修复协议断点
  - **终端价值**：平滑承接既有 Claude 用户生态，历史记录不丢失。
- [ ] **18. 离线诊断与隐私脱敏日志归档 (`zcode doctor`)**
  - **模块定位**：`packages/services/src/feedback/compactLogArchive.ts`
  - **核心机制**：自动清洗鉴权 Token、敏感密码与私有路径，打包生成排障归档
  - **终端价值**：遇到问题一键生成诊断报告，保障排错安全。
- [ ] **19. Bots 自动化机器人与 Webhook 调度中心**
  - **模块定位**：`packages/services/src/bots/` 与 `packages/services/src/bot-project-runtime/`
  - **核心机制**：将 CLI 实例挂载为 Webhook 接收端（GitHub PR / 飞书 / 企业微信）
  - **终端价值**：收到 issue 或 PR 时自动唤醒 Agent 编写代码并提交修复。
- [ ] **20. 生成式 UI 动态表单交互 (Gen-UI)**
  - **模块定位**：`packages/services/src/gen-ui/` 与 `packages/ui/`
  - **核心机制**：TUI 降级为 Ink 多选列表，`zcode --web` 呈现原生 React 富交互表单
  - **终端价值**：大模型可在会话中直接吐出表单、选择器让用户交互确认。
- [ ] **21. 多媒体终端渲染与预览 (Media Preview)**
  - **模块定位**：`packages/services/src/media-preview/` 与 `packages/shared/src/zcode-media-policy.ts`
  - **核心机制**：Kitty / iTerm2 图形协议支持与 Web 模式图片直出
  - **终端价值**：在终端直接查看 Agent 生成或抓取的流程图、架构图与界面截图。

---

## 阶段四：沙箱隔离、运行时服务与扩展套件

- [ ] **22. Dynamic Workflow Git Worktree 隔离沙箱**
  - **模块定位**：`apps/zcode-cli/packages/dynamic-workflow/src/runtime/script-workflow-runtime.ts`
  - **核心机制**：补全 `WorktreeIsolationPort` 契约，自动创建 `git worktree add -d <sandbox-path>`
  - **终端价值**：多任务/子 Agent 在完全独立的 Git 工作树中运行代码修改与验证，不污染用户主开发分支。
- [ ] **23. Server Supervisor 后台常驻守护系统 (`zcode server`)**
  - **模块定位**：`packages/zcode-server-cli/` 与 `apps/zcode-cli/bin/runner.mjs`
  - **核心机制**：在入口分流实现服务生命周期管理
  - **终端价值**：提供 `zcode server status / stop / restart / running-tasks` 守护命令。
- [ ] **24. Node REPL Host 实时交互沙箱 (`zcode repl`)**
  - **模块定位**：`apps/zcode-cli/packages/node-repl-host/`
  - **核心机制**：暴露独立 MCP 宿主与 REPL 会话
  - **终端价值**：大模型可在隔离沙箱中即时执行 TypeScript/JavaScript 代码并读取变量上下文。
- [ ] **25. Dev Docs 本地离线技术手册 (`zcode docs`)**
  - **模块定位**：`apps/dev-docs/`
  - **核心机制**：编译 VitePress 并提供轻量内嵌 HTTP 服务
  - **终端价值**：离线查阅 ZCode CLI 架构文档、插件开发手册与协议规范。
- [ ] **26. Remote Projects SSH 隧道开发 (`zcode remote`)**
  - **模块定位**：`packages/services/src/remote-projects/`
  - **核心机制**：跨机器 SSH 隧道将远程工作区目录无缝投影至本地 CLI。
- [ ] **27. Browser Use 无头浏览器控制插件**
  - **模块定位**：`apps/zcode-cli/packages/browser-use-plugin/`
  - **核心机制**：默认集成至 CLI，提供 DOM 解析、截屏与自动化测试。
- [ ] **28. Office Runtime 富文本与文档处理套件**
  - **模块定位**：`office-runtime` + `documents` / `spreadsheets` / `presentations` / `pdf`
  - **核心机制**：编译 Office 运行时并集成至 CLI，支持 Word/Excel/PPT/PDF 深度交互。
- [ ] **29. 移动端双模拟器控制套件**
  - **模块定位**：`android-emulator-plugin` 与 `ios-simulator-plugin`
  - **核心机制**：提供 ADB 与 Xcode Simulator 移动端自动化真机/模拟器测试。
