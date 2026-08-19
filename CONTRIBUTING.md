# 收录主题

<p><b>简体中文</b> · <a href="CONTRIBUTING.en.md">English</a></p>

最简单的方式，是把 README 中的[收录话术](README.md#收录主题)和主题仓库地址一起发给 AI。

想自己提交的话，新建 `entries/<theme-id>/theme.yml`，目录名和 `id` 保持一致。一个 Pull Request 只处理一个主题。

```yaml
id: example.theme
name:
  zh: 示例主题
  en: Example Theme
author: example-author
description: A short description of the appearance.
package: dsh-example-theme
rowId: example-theme
version: 1.0.0
source:
  kind: external
  repository: https://github.com/example/dsh-example-theme
  commit: 0123456789abcdef0123456789abcdef01234567
tags:
  - token-theme
modes:
  - light
compatibility:
  dsh: ">=0.1.0-rc.6 <0.2.0"
  platform:
    - web
screenshots:
  - https://raw.githubusercontent.com/example/dsh-example-theme/0123456789abcdef0123456789abcdef01234567/preview.png
license:
  code: MIT
  commercialUse: true
```

主题仓库必须公开，并固定到完整的 40 位 commit SHA。`package`、`version` 和 `rowId` 需要与该 commit 中的主题包一致；如果主题位于 monorepo 中，在 `source` 下增加 `subpath`。

截图可以使用固定到该 commit 的 HTTPS 地址，也可以放在条目目录中。许可证和兼容性没有可靠信息时不要猜，先在 PR 中说明。

不要修改这些生成文件：

```text
data/catalog.json
THEMES.md
THEMES.en.md
previews/
```

提交前运行：

```powershell
npm ci
npm run check
npm run sources:check -- --entry <theme-id>
```

目录的 Stars 和预览图会在条目合并后自动更新。
