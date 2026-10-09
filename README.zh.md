# dsh-cited（中文）

**在 DeepSeek Harness 里使用 Cited。** 检索你的 [Cited](https://katalis.dev) 安装中的文档，并基于文档作答，附上编号引用。

完整英文说明见 [README.md](README.md)。

## 安装

在 DeepSeek Harness 中打开 **Plugins → Add plugin**，粘贴：

```
github:RonnieGex/dsh-cited
```

仓库内含已编译并纳入版本管理的 `lib/`，安装时不会编译，也不需要 `allowBuilds`。插件卡片 **Cited** 会显示包的描述。

## 配置

在卡片里填写两个字段：

- `url`：你的 Cited 安装地址，例如 `https://cited.example.com`。插件会请求 `<url>/api/mcp`。
- `token`：该安装的 `CITED_MCP_TOKEN`，标记为机密。
- `timeoutMs`：单次调用的超时时间，默认 30 秒。

未配置时，工具会返回明确指出缺失字段的错误，不会破坏 Harness。没有 `CITED_MCP_TOKEN` 的安装会关闭该端点：生成一个长随机值启动它，并把同一个值填给插件。

## 两个工具

- `cited_search { query, limit? (1..8) }`：返回匹配的文档片段（文档、章节、位置、正文），并编号供模型以 `[1]` 引用。它绝不调用语言模型。
- `cited_ask { question, sessionId? }`：返回带引用的回答；文档中没有答案时返回诚实的拒答。

## 安全

令牌只作为 `Authorization: Bearer` 发送到你配置的 `url`。它不会写入日志或工具结果，任何错误信息（`401`、`403`、`404`、超时或无法连接）都不会包含它。

## 已验证的范围

在 Windows、Node v24.11.0 上，针对从源码构建的 DeepSeek Harness 与在 3231 端口本地运行的 Cited 验证：单元测试通过、在临时 `DSH_HOME` 中隔离安装、`--dump-config` 出现 `# == dsh-cited` 层、插件卡片可见、`cited_search` 返回 `samples/` 中的片段。`cited_ask` 返回诚实拒答，因为该测试安装没有配置对话模型。其他情况未经验证。

## 许可

Apache-2.0，见 `LICENSE` 与 `NOTICE`。Built by Katalis。
