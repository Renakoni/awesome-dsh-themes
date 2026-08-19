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

Keep each pull request to one theme.

1. Add `entries/<theme-id>/theme.yml`; the directory name and `id` must match.
2. Fill in the theme information using the example in [`CONTRIBUTING.md`](CONTRIBUTING.md).
3. Do not edit generated files under `data/catalog.json`, `THEMES.md`, `THEMES.en.md`, or `previews/`.
4. Run these checks before opening the pull request:

   ```powershell
   npm ci
   npm run check
   npm run sources:check -- --entry <theme-id>
   ```

Themes must come from public GitHub repositories and use complete 40-character commit SHAs. The package name, version, screenshots, and license must match the contents at that commit.

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
