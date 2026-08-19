<h1 align="center">DSH Appearance Catalog</h1>

<p align="center">
  <sub><a href="README.md">简体中文</a> · <b>English</b></sub>
</p>

<p align="center">
  <em>A collection of themes for DeepSeek Harness</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/DeepSeek-Harness-4c8492?style=flat-square" alt="DeepSeek Harness">
  &nbsp;
  <img src="https://img.shields.io/badge/License-MIT-4c566a?style=flat-square" alt="License: MIT">
</p>

<p align="center">
  <a href="THEMES.en.md"><b>Browse all themes</b></a> ·
  <a href="#adding-a-theme">Add a theme</a> ·
  <a href="#repository-layout">Repository layout</a>
</p>

This is an archive of themes made for DeepSeek Harness.

It supplies the theme list used by [DSH Desk](https://github.com/Renakoni/dsh-desk) and also works as a standalone theme collection.

## Browse themes

<!-- theme-count:start -->
This project currently lists **134** themes. Details are collected on a separate page:
<!-- theme-count:end -->

### [Browse all themes →](THEMES.en.md)

## Adding a theme

Found a theme that is missing? Tell your AI:

```text
Add this DSH theme to https://github.com/Renakoni/dsh-appearance-catalog:
https://github.com/put-the-theme-repository-here

Inspect the upstream repository first. Confirm the actual theme package directory, name / version / dsh.client in package.json, rowId, the complete 40-character commit SHA, preview images, license, and compatibility. If it is a monorepo, find the theme package subdirectory.

Follow CONTRIBUTING.en.md and create one entries/<theme-id>/theme.yml. Keep the PR to one theme. Do not edit generated files under data/catalog.json, THEMES.md, THEMES.en.md, or previews/. Do not guess anything you cannot verify; tell me if the repository is not a DSH theme.

Run npm ci, npm run check, and npm run sources:check -- --entry <theme-id>, open the PR, then send me the check results and PR link.
```

For a manual submission, see [`CONTRIBUTING.en.md`](CONTRIBUTING.en.md) for the entry example and checks.

## Repository layout

```text
.
├── entries/
│   └── <theme-id>/
│       └── theme.yml
├── previews/
├── data/
│   ├── catalog.json
│   └── schema.json
├── scripts/
├── THEMES.md
└── THEMES.en.md
```

## License

This repository is released under the [MIT License](LICENSE). Each theme remains maintained and licensed by its respective author.
