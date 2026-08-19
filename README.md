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

它是 [DSH Desk](https://github.com/Renakoni/dsh-desk) 主题列表的上游数据源，也可以作为一个独立的主题合集浏览。

## 浏览主题

<!-- theme-count:start -->
本项目已收录 **134** 个主题，主题详情整理在单独的主题页中：
<!-- theme-count:end -->

### [查看全部主题 →](THEMES.md)

## 收录主题

发现了还没收录的主题？对你的 AI 说：

```text
把这个 DSH 主题收录到 https://github.com/Renakoni/dsh-appearance-catalog：
https://github.com/在这里填写主题仓库

先检查上游仓库，确认真正的主题包目录、package.json 中的 name / version / dsh.client、rowId、完整的 40 位 commit SHA、预览截图、许可证和兼容性；如果是 monorepo，要找到主题包所在的子目录。

按照 CONTRIBUTING.md 创建一个 entries/<theme-id>/theme.yml。一个 PR 只处理一个主题，不要修改 data/catalog.json、THEMES.md、THEMES.en.md 或 previews/ 下的生成文件。无法确认的信息不要猜；如果它不是 DSH 主题，也直接告诉我。

完成后运行 npm ci、npm run check 和 npm run sources:check -- --entry <theme-id>，提交 PR，并把检查结果和 PR 链接发给我。
```

想自己提交的话，字段示例和检查命令都在 [`CONTRIBUTING.md`](CONTRIBUTING.md) 中。

## 仓库结构

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

## 许可证

本仓库以 [MIT License](LICENSE) 发布。主题仍由各自作者维护，并使用各自的许可证。
