<h1 align="center">DSH Appearance Catalog</h1>

<p align="center">
  <sub><b>简体中文</b> · <a href="README.en.md">English</a></sub>
</p>

<p align="center">
  <em>DeepSeek Harness 主题合集</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/DeepSeek-Harness-4c8492?style=flat-square" alt="DeepSeek Harness">
  &nbsp;
  <img src="https://img.shields.io/badge/License-MIT-4c566a?style=flat-square" alt="License: MIT">
</p>

<p align="center">
  <a href="THEMES.md"><b>浏览全部主题</b></a> ·
  <a href="#收录主题">收录主题</a> ·
  <a href="#仓库结构">仓库结构</a>
</p>

这是一个 DeepSeek Harness 主题归档库。

它是 DSH Desk 主题列表的上游数据源，也可以作为一个独立的主题合集浏览。

## 浏览主题

主题名称、预览图和原仓库都整理在单独的主题页中：

### [查看全部主题 →](THEMES.md)

## 收录主题

一个 Pull Request 只添加或修改一个主题。

1. 新建 `entries/<theme-id>/theme.yml`，目录名与 `id` 保持一致。
2. 按照 [`CONTRIBUTING.md`](CONTRIBUTING.md) 中的示例填写主题信息。
3. 不要修改 `data/catalog.json`、`THEMES.md`、`THEMES.en.md` 和 `previews/` 中的生成文件。
4. 提交前运行：

   ```powershell
   npm ci
   npm run check
   npm run sources:check -- --entry <theme-id>
   ```

主题必须来自公开的 GitHub 仓库，并固定到完整的 40 位 commit SHA。主题的包名、版本、截图和许可证需要与该 commit 中的内容一致。

## 仓库结构

- [`THEMES.md`](THEMES.md)：主题列表，包含名称、预览和上游仓库。
- `entries/<theme-id>/theme.yml`：每个主题的元数据。
- `previews/<theme-id>.webp`：主题列表使用的预览图。
- `data/catalog.json`：提供给 DSH Desk 的目录数据。
- `data/schema.json`：主题条目的格式定义。
- `scripts/`：目录生成和检查脚本。

`THEMES.md`、`THEMES.en.md`、`previews/` 和 `data/catalog.json` 会在条目合并后自动更新。

## 许可证

本仓库以 [MIT License](LICENSE) 发布。主题仍由各自作者维护，并使用各自的许可证。
