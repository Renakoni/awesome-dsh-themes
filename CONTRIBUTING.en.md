# Adding a theme

<p><a href="CONTRIBUTING.md">简体中文</a> · <b>English</b></p>

The easiest route is to send the [submission prompt](README.en.md#adding-a-theme) and the theme repository URL to your AI.

For a manual submission, create `entries/<theme-id>/theme.yml`. The directory name and `id` must match, and each pull request should contain one theme.

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

The theme repository must be public and pinned to a complete 40-character commit SHA. `package`, `version`, and `rowId` must match the theme package at that commit. Add `subpath` under `source` when the theme is inside a monorepo.

Screenshots may use HTTPS URLs pinned to that commit or files stored in the entry directory. If no suitable screenshot exists, omit `screenshots`; the build scripts will use the GitHub repository card. Do not guess the license or compatibility when the upstream repository does not provide reliable information; explain the gap in the pull request.

Do not edit these generated files:

```text
data/catalog.json
THEMES.md
THEMES.en.md
previews/
```

Run before submitting:

```powershell
npm ci
npm run check
npm run sources:check -- --entry <theme-id>
```

Stars and preview images are updated automatically after the entry is merged.
