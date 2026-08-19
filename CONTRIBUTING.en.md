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

The theme repository must be public. Do not add `source.commit` when submitting a theme; the catalog scripts resolve the upstream default branch and record the full commit SHA. `package`, `version`, and `rowId` must match the theme package. Add `subpath` under `source` when the theme is inside a monorepo.

Screenshots may use HTTPS URLs or files stored in the entry directory. GitHub images from the same upstream repository are pinned to the current commit by the scripts. If no suitable screenshot exists, omit `screenshots`; the build scripts will use the GitHub repository card. Do not guess the license or compatibility when the upstream repository does not provide reliable information; explain the gap in the pull request.

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

After an entry is merged, a bot checks the upstream default branch once a day. Any new commit is followed, whether or not a Release or version change exists, and a synchronization PR updates the commit SHA, version, update time, previews, and Stars.
