<h1 align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/readme-banner-dark.png"><img src="docs/images/readme-banner-light.png" alt="在 DeepSeek Harness 中使用 Cited：向自己的文档提问，获得附有来源的答案" width="1280"></picture></h1>

<p align="center">你的文档。你的智能体。可以核查的答案。</p>

[![许可证 Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-171717)](LICENSE)
[![dsh-tools 版本范围](https://img.shields.io/badge/dsh--tools-0.1%20%2F%200.2-171717)](#兼容性)
[![CI](https://github.com/RonnieGex/dsh-cited/actions/workflows/ci.yml/badge.svg)](https://github.com/RonnieGex/dsh-cited/actions/workflows/ci.yml)
![状态：早期开发](https://img.shields.io/badge/status-early%20development-DDF469?labelColor=171717)

[English](README.md) · [Español](README.es.md) · [中文](README.zh.md)

**在 DeepSeek Harness 中使用 Cited。** 两个原生工具让智能体搜索 [Cited](https://github.com/RonnieGex/cited) 实例，并依据文档生成带编号引用的答案。插件通过 `POST /api/mcp` 连接你配置的实例。

**处于早期开发阶段。** 已在无界面环境中验证安装及真实引用答案。尚未验证桌面界面的点击安装，也未验证通过 `cited_ask` 调用真实回答模型。详见注明日期的[兼容性表](#兼容性)。

[工作原理](#工作原理) · [真实答案](#一次真实回答) · [安装](#安装) · [配置](#配置) · [工具](#两个工具) · [令牌](#你的令牌) · [兼容性](#兼容性) · [开发](#开发) · [许可证](#许可证)

## 工作原理

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/how-it-works-dark.png"><img src="docs/images/how-it-works-light.png" alt="粘贴插件链接，配置 url 和 token，向智能体提问并获得带引用的答案" width="1280"></picture>

1. 在 **Plugins → Add plugin** 中粘贴仓库链接。
2. 打开插件配置，填写 **url** 和 **token**。
3. 向智能体提问。`cited_search` 返回编号片段，智能体据此回答并标注 `[1]`。

Cited 负责文档和检索，DeepSeek Harness 负责智能体与此插件。使用这两个原生工具不需要在 `cordis.yml` 中添加 MCP 客户端配置行。

## 一次真实回答

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/images/real-answer-dark.png"><img src="docs/images/real-answer-light.png" alt="真实无界面运行：cited_search 返回 cafe-la-horquilla.md 的 Precios 片段，DeepSeek 回答自行车调校费用为 380 比索 [1]" width="1280"></picture>

**2026-10-09**，在全新的临时 `DSH_HOME` 中从 GitHub 安装插件。DeepSeek 搜索 Cited 的公开示例文档后回答：

> A bicycle tune-up costs 380 pesos [1].

图片排版展示已保存的问题、实际工具调用、文档片段与答案，并非桌面截图。[完整文本](docs/evidence/headless-answer.txt) · [运行记录](docs/evidence/headless-answer.json)。检索使用关键词搜索，没有调用嵌入服务；智能体使用真实 DeepSeek 模型。搜索前后，示例数据库的全部 19 张表保持不变。三种语言共用英文图片，本页完整解释其内容。

## 安装

在 DeepSeek Harness 中打开 **Plugins → Add plugin**，粘贴：

```text
https://github.com/RonnieGex/dsh-cited
```

也可以使用简写：

```text
github:RonnieGex/dsh-cited
```

仓库已包含 `lib/`，安装不需要编译，也不需要 `allowBuilds` 权限。插件管理器会列出 `dsh-cited` 及其说明。本次从 GitHub 进行的无界面安装成功；包管理器提示缺少宿主的 peer 依赖，但运行中的 harness 成功提供了这些依赖。桌面界面路径已记录，尚未实际点击测试。

前提是安装声明版本范围内的 DeepSeek Harness，运行启用 MCP 的 Cited 服务器，并取得其令牌。插件声明 Node `>=22.19`；本次开发与验证使用 Node 24。

## 配置

打开插件配置：

| 字段 | 值 |
|---|---|
| `url` | Cited 地址，例如 `https://cited.example.com`。插件会追加 `/api/mcp`；已有该路径时会保留。 |
| `token` | 服务器的 `CITED_MCP_TOKEN`，标记为秘密字段。 |
| `timeoutMs` | 每次调用的正数超时值，单位毫秒；默认为 **30000**。 |

服务器未设置令牌时，Cited 的 MCP 端点关闭。在本地生成足够长的随机令牌，在 Cited 服务器环境中设置 `CITED_MCP_TOKEN`，并在插件中填写相同值。不要把它放入提示词、截图或 Git。

`url` 和 `token` 初始为空，以便先安装再配置。缺少字段时，调用返回指出该字段的工具错误，不会破坏 harness。填写完毕后，让智能体搜索文档中实际存在的短语。

## 两个工具

| 工具 | 输入 | 结果 |
|---|---|---|
| `cited_search` | `query: string`，可选 `limit?: integer`，范围 **1 到 8**，默认 **5** | `{ passages: [{ n, document, heading, position, excerpt }] }` |
| `cited_ask` | `question: string`，可选 `sessionId?: string` | `{ status, answer, citations }`；状态为 `answered` 或 `refused` |

**先检索，再由智能体回答。** `cited_search` 检索片段，不调用 Cited 的回答模型。每个片段包含来源和引用编号。没有匹配就没有片段，不会凭空生成答案。调用方的智能体模型以及服务器配置的嵌入服务仍可能产生费用。

**让 Cited 撰写答案。** `cited_ask` 调用 Cited 的回答流程，返回附引用的答案或明确拒答。引用包含上表中的片段字段以及重叠文本长度 `lead`。重复使用 `sessionId` 可以在 Cited 中保存对话并保持上下文。这可能消耗服务器的模型预算。此次在线测试服务器没有连接回答模型，因此只验证了错误路径；单元测试覆盖 `answered` 和 `refused` 路径。

## 你的令牌

- 令牌通过 `Authorization: Bearer` 发送到配置的端点，不会添加到工具参数或正常输出中。
- 配置模式将它标记为秘密字段，供 harness 处理。这不等于证明静态存储已加密。请保护配置文件，并对远程服务器使用 HTTPS。
- 传输错误会隐藏配置的令牌和 URL 中的凭据。授权被拒绝、端点关闭、超时及主机不可达都会转换为简短的工具错误。
- 插件不拥有文档数据库。Cited 保存文档以及通过 `cited_ask` 创建的对话。

## 兼容性

声明的 `@deepseek-ai/dsh-tools` peer 版本范围：

```text
>=0.1.6-alpha.2 <0.3.0-0 || >=0.2.0-rc.0 <0.3.0-0
```

版本范围不代表其中每个版本都已测试。下表中的 MCP 客户端直接连接 **Cited**，不经过此原生插件。

| 客户端 | 日期 | 证据与限制 |
|---|---|---|
| DeepSeek Harness 0.1.6-alpha.2，源码 CLI | 2026-10-09 | 本次在隔离 headless 状态中从 GitHub 安装，并由真实 DeepSeek 调用 `cited_search` 回答。[记录](docs/evidence/headless-answer.json)；[gate](evidence/gate.txt)。 |
| DeepSeek Harness 0.2.0-rc.2，内置 CLI | 2026-10-09 | 先前验证：从 GitHub 安装无需编译，并获得真实搜索答案。本次未重跑。[证据来源](docs/evidence/compatibility.md)。 |
| Claude Code → Cited MCP | 2026-10-09 | 先前验证：连接并列出两个工具。不宣称模型实际调用过工具。[来源](docs/evidence/compatibility.md)。 |
| Codex → Cited MCP | 2026-10-09 | 先前验证：连接并列出两个工具。不宣称模型实际调用过工具。[来源](docs/evidence/compatibility.md)。 |
| Cursor → Cited MCP | 2026-10-09 | 仅有文档，尚未测试。[来源](docs/evidence/compatibility.md)。 |

尚未验证：桌面点击安装、通过插件获得真实 `cited_ask` 答案、其他操作系统及远程 HTTPS 部署。本次证据不需要控制桌面应用。

## 开发

使用 **Node 24**。将编译好的 DeepSeek Harness 放在 `../deepseek-harness`，或将 `DSH_INSTALL` 指向其根目录：

```sh
npx -y -p node@24 node scripts/link-host-deps.mjs
npx -y -p node@24 npm test
npx -y -p node@24 node scripts/build.mjs --check
npx -y -p node@24 npm run gate
```

运行 gate 前，将 `CITED_REPO` 指向包含 `scripts/mcp-seed.ts` 和 `.next/` 的已构建 Cited 工作副本，默认是 `../cited`。gate 在 `.tmp/gate` 下创建示例数据和临时 `DSH_HOME`，在 **3231** 端口启动 Cited，安装本地插件，验证插件卡片和工具，并通过 **gitleaks** 扫描 Git 历史。可设置 `CITED_PORT` 使用其他空闲测试端口。它从不使用桌面配置。

`src/` 是源码，`lib/` 是发布文件。修改运行时代码后执行 `npm run build` 更新 `lib/`。本次文档修改保持两个目录不变。

CI 运行可移植的传输、模块、包、工具和文档测试，检查构建一致性并扫描秘密。真实 Loader 组合及集成 gate 需要外部工作副本，在本地运行；CI 不宣称覆盖这些集成。

渲染图片使用 Cited 已有的 Playwright 依赖和已安装的 Chromium。将 `CITED_REPO` 指向该工作副本，渲染器默认使用 `../community-main`：

```sh
npx -y -p node@24 node scripts/render-readme-graphics.mjs
```

渲染从已保存的证据离线生成图片；新的捕获会使用真实模型及 API 密钥。详见[资源与证据指南](docs/readme-assets.md)、[项目手册](docs/project-manual.md)和[贡献规则](CONTRIBUTING.md)。

## 许可证

[Apache-2.0](LICENSE)。重新分发时保留 [NOTICE](NOTICE)。Outfit 使用 [SIL Open Font License](docs/fonts/outfit/OFL.txt)。详见[资源来源](docs/readme-assets.md)。

<p align="center"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/brand/katalis-flame-192.png"><img src="docs/brand/katalis-flame-ink-192.png" alt="" height="48"></picture> <a href="https://katalis.dev">Built by Katalis</a></p>
