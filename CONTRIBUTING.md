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
tags:
  - token-theme
modes:
  - light
compatibility:
  dsh: ">=0.1.0-rc.6 <0.2.0"
  platform:
    - web
screenshots:
  - https://raw.githubusercontent.com/example/dsh-example-theme/main/preview.png
license:
  code: MIT
  commercialUse: true
```

主题仓库必须公开。提交时不需要填写 `source.commit`，收录脚本会读取上游默认分支并记录完整的 commit SHA。`package`、`version` 和 `rowId` 需要与主题包一致；如果主题位于 monorepo 中，在 `source` 下增加 `subpath`。

截图可以使用 HTTPS 地址，也可以放在条目目录中；同一上游仓库中的 GitHub 图片会由脚本固定到当前 commit。没有合适的截图时，可以省略 `screenshots`，生成脚本会使用 GitHub 仓库卡片。许可证和兼容性没有可靠信息时不要猜，先在 PR 中说明。

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

条目合并后，机器人每 12 小时检查一次上游默认分支。只要出现新提交，无论 Release 或版本号是否变化，都会更新 commit SHA、版本、更新时间、预览图和 Stars；检查全部通过后，同步 PR 会自动合并。
