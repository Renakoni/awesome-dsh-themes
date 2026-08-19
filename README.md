<h1 align="center">DSH Appearance Catalog</h1>

<p align="center">
  <sub><b>简体中文</b> · <a href="README.en.md">English</a></sub>
</p>

<p align="center">
  <em>DeepSeek Harness 主题合集</em>
</p>

<p align="center">
  <a href="https://github.com/Renakoni/dsh-desk"><img src="https://img.shields.io/badge/DeepSeek-Harness-4c8492?style=flat-square" alt="DeepSeek Harness"></a>
  &nbsp;
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-4c566a?style=flat-square" alt="License: MIT"></a>
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
本项目已收录 **132** 个主题，主题详情整理在单独的主题页中：
<!-- theme-count:end -->

### [查看全部主题 →](THEMES.md)

## 收录主题

发现了还没收录的主题？

你只需要准备：

- 主题对应的仓库或链接；
- 如果有合适的 DSH 界面预览图，可以一起提供。

没有预览图时，收录脚本会使用 GitHub 仓库卡片。

之后，对你的 AI 说：

```text
把这个 DSH 主题[对应的主题仓库或链接]收录到 https://github.com/Renakoni/dsh-appearance-catalog：

请检查上游仓库，找到真正的主题包目录、package.json 中的 name、version 和 dsh.client，确认主题的 rowId、预览图、许可证和兼容性；如果是 monorepo，请找到具体的主题包子目录。commit SHA 由收录脚本自动获取，不需要手动填写。

然后按照 CONTRIBUTING.md 创建一个 entries/<theme-id>/theme.yml。一个 PR 只处理一个主题，不要修改 data/catalog.json、THEMES.md、THEMES.en.md 或 previews/ 下的生成文件。

完成后运行 npm ci、npm run check 和 npm run sources:check -- --entry <theme-id>，提交 PR，并把检查结果和 PR 链接发给我。
```

也可以手动提交，字段示例和检查命令都在 [`CONTRIBUTING.md`](CONTRIBUTING.md) 中。

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
