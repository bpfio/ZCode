# ZCode CLI 增强装配路线图 (Roadmap)

本项目是基于官方 ZCode 深度定制与增强的终端 AI 编程工作台（包含 TUI 终端、`zcode --web` 浏览器工作区、Daemon 守护进程与 Agent 运行时），由 `@clid/zcode` 分发。

本路线图系统记录了从 ZCode 源码库中挖掘、待装配激活的 **16 大核心功能模块**，作为后续迭代推进的单一事实源（SSOT）。

---

## 阶段一：智谱生态权益与闲时免费算力（优先落地）

- [ ] **1. 智谱官方赠送免费积分/福利一键申领 (`zcode claim`)**
  - **模块定位**：`packages/services/src/coding-plan-subscription/bigmodelCodingPlanSubscriptionProvider.ts`
  - **核心机制**：对接 `GET /api/v1/zcode-plan/billing/preview` 与 `POST /api/v1/zcode-plan/billing/claim`
  - **终端价值**：终端直接查询并一键领取智谱官方赠送的新手福利、活动积分包与 Coding Plan 算力。
- [ ] **2. 智谱 Coding Plan 积分与用量实时看板 (`zcode quota` / `zcode credits`)**
  - **模块定位**：`docs/bigmodel-coding-plan-usage-quota.md` 与 `packages/services/src/usage-stats/`
  - **核心机制**：对接 `GET https://bigmodel.cn/api/monitor/usage/quota/limit` 与 `/api/monitor/credit-usage/usage-detail`
  - **终端价值**：彩色终端展示 5 小时 Prompt 额度池、MCP 月额度池、累计积分消耗与日均积分。
- [ ] **3. 闲时无人值守算力排队调度 (`zcode idle queue`)**
  - **模块定位**：`packages/services/src/session/offPeak*` 与 `apps/zcode-cli/packages/core/src/tool/handlers/off-peak.ts`
  - **核心机制**：对接 `POST /api/v1/off-peak/ticket` 取号，使用 `account:bigmodel-offpeak-idle-plan` 专属闲时模型
  - **终端价值**：不扣减付费 Token/积分，提交长周期任务至官方闲时低峰队列，3105 自动退避，3102 自动重取新票续跑。
- [ ] **4. 官方活动空投与福利 Banner 触达 (`zcode offers`)**
  - **模块定位**：`packages/services/src/marketing-touch/marketingTouchService.ts`
  - **核心机制**：对接 `GET /api/v1/marketing/touch` 与 `POST /api/v1/marketing/touch/action`
  - **终端价值**：自动接收最新限时空投（如周末领 Token、积分补贴），终端一键确认兑换。

---

## 阶段二：底层原生加速与免依赖独立二进制

- [ ] **5. Native Search Tools 原生 C/Rust 检索套件打包**
  - **模块定位**：`scripts/build-native-search-tools.mjs` 与 `apps/zcode-cli/dependencies/native-search`
  - **核心机制**：将预编译的 `ripgrep 14.1.1`、`bfs 4.1.1`、`ugrep 7.8.4` 编入 `agent/dependencies/`
  - **终端价值**：百兆大型 Monorepo 文件索引与正则匹配速度从数秒提升至 50ms。
- [x] **6. SEA (Single Executable Application) 单二进制构建**
  - **模块定位**：`apps/zcode-cli/packages/cli/scripts/build-sea.mjs`
  - **核心机制**：基于 Node.js 24 原生 SEA 特性，将 Node 运行时、V8 字节码、TUI 和 Agent 打包为单一二进制
  - **终端价值**：免装 Node.js / npm，单文件 `zcode-linux-x64`（268MB）直接放入系统路径运行。
- [ ] **7. GitHub Releases 资产自动化发布流水线**
  - **模块定位**：`.github/workflows/build-and-publish.yml`
  - **核心机制**：CI 自动上传 `zcode-linux-x64`、`zcode-3.16.x.tar.gz` 和 `sha256.txt` 到 GitHub Releases
  - **终端价值**：支持一键 `curl -fsSL ... | sh` 极速安装。

---

## 阶段三：守护进程与高级工作流沙箱

- [ ] **8. Server Supervisor 守护进程全生命周期命令**
  - **模块定位**：`packages/zcode-server-cli/src/cli.ts`
  - **核心机制**：接入 `server-cli.js` 统一接管后台服务生命周期
  - **终端价值**：终端原生支持 `zcode serve --daemon`、`zcode status`、`zcode restart`、`zcode stop`、`zcode running-tasks`。
- [ ] **9. Dynamic Workflow Git Worktree 隔离沙箱实现**
  - **模块定位**：`apps/zcode-cli/packages/bootstrap/src/app/script-workflow-runtime.ts:283`
  - **核心机制**：补全 `isolation: "worktree"` 逻辑，自动创建临时 `.worktrees/<branch>`，无变更自动清理，有变更保留分支。

---

## 阶段四：设备仿真与专业文档多模态套件

- [ ] **10. 移动端仿真器插件默认启用 (Android / iOS)**
  - **模块定位**：`apps/zcode-cli/packages/android-emulator-plugin` 与 `ios-simulator-plugin`
  - **核心机制**：修改默认配置表，激活 AVD / `xcrun simctl` 集成
  - **终端价值**：Agent 可直接在终端拉起、部署、截屏与调试移动端应用。
- [ ] **11. Office Runtime 完整独立资源编译**
  - **模块定位**：`apps/zcode-cli/packages/office-runtime/scripts/build.mjs`
  - **核心机制**：编译生成包含 `@extend-ai/react-xlsx`、`docx-preview`、`pdfjs-dist`、`@aiden0z/pptx-renderer` 的独立 UI 包
  - **终端价值**：终端/Web 侧边栏支持对 Word、Excel、PPT、PDF 的原生预览与解析。
- [ ] **12. Node REPL Host 交互沙箱增强 (`zcode repl`)**
  - **模块定位**：`apps/zcode-cli/packages/node-repl-host`
  - **核心机制**：保留内存状态的长寿命交互式 Node.js 沙箱环境。

---

## 阶段五：开发者工具、离线手册与诊断大屏

- [ ] **13. Dev Docs 本地离线技术手册门户 (`zcode docs`)**
  - **模块定位**：`apps/dev-docs`
  - **核心机制**：编译 VitePress 静态门户并集成至静态文件服务
  - **终端价值**：离线快速查阅 ZCode 所有内部架构规范、插件体系与提示词指引。
- [ ] **14. 静态会话脱敏分享导出 (`zcode export --share`)**
  - **模块定位**：`packages/web-share` 与 `packages/share-ui`
  - **核心机制**：将终端会话渲染为自包含单 HTML 离线报告。
- [ ] **15. E2E Report 测试与轨迹大屏 (`zcode report`)**
  - **模块定位**：`packages/e2e-report`
  - **核心机制**：测试报告与 Agent 决策时间线回放大屏。
- [ ] **16. 远程主机 SSH 隧道连接 (`zcode remote connect`)**
  - **模块定位**：`packages/services/src/remote-projects` 与 `packages/zcode-server-cli`
  - **核心机制**：跨网络 SSH 远程工作区打洞与环境探活。
