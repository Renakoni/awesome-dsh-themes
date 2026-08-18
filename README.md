# DSH Appearance Catalog

The community-maintained appearance registry for DSH Desk.

This repository contains curated theme metadata and, when a contributor chooses to bundle a theme, a standard DSH client package under `themes/`. It does not contain the DSH Desk UI or the runtime manager. DSH Desk reads the generated `data/catalog.json`; the `dsh-appearance-manager` component in `dsh-desk-plugin` performs lifecycle operations.

## Contribution flow

Submit one theme per pull request under `entries/<theme-id>/theme.yml`. Do not edit `data/catalog.json`; the main branch workflow regenerates it after merge.

External themes must use a public GitHub repository and a complete 40-character commit SHA. Themes without an original repository may be bundled under `themes/<theme-id>` and must include a standard DSH client `package.json`.

GitHub Stars are recorded only for entries with an original repository. Bundled themes without an original repository display `-` in DSH Desk.

All entries remain subject to maintainer review. Passing CI validates structure and packaging metadata; it is not a security certification.
