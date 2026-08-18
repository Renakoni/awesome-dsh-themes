# Contributing a theme

Create `entries/<theme-id>/theme.yml` and change no generated files. The directory name and `id` must match.

Example external entry:

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

The catalog workflow fetches the current Stars count for the declared original repository. A bundled theme has no original repository and therefore displays `-` for Stars.
