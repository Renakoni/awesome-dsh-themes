<h1 align="center">DSH Appearance Catalog</h1>

<p align="center">
  <sub><b>简体中文</b> · <a href="README.en.md">English</a></sub>
</p>

<p align="center">
  <em>DSH 主题、皮肤和外观包的社区目录。</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/DeepSeek-Harness-4c8492?style=flat-square" alt="DeepSeek Harness">
  &nbsp;
  <img src="https://img.shields.io/badge/Node.js-22%2B-4c8492?style=flat-square" alt="Node.js 22 or newer">
  &nbsp;
  <img src="https://img.shields.io/badge/License-MIT-4c566a?style=flat-square" alt="License: MIT">
</p>

<p align="center">
  <a href="#简介">简介</a> ·
  <a href="#目录结构">目录结构</a> ·
  <a href="#添加条目">添加条目</a> ·
  <a href="#检查">检查</a>
</p>

## 简介

这里收集 [DeepSeek Harness（DSH）](https://github.com/deepseek-ai/deepseek-harness) 社区制作的主题、皮肤、壁纸、字体和其他外观包。

每个条目都记录了包名、版本、兼容性、截图、许可证和来源 commit。外部包必须指向公开的 GitHub 仓库，并固定到一个完整的 40 位 commit SHA，这样条目不会因为上游仓库更新而悄悄改变。

这个仓库主要负责整理和归档。具体包怎么安装、怎么配置，请以包自己的仓库和文档为准。

## 目录结构

| 路径 | 内容 | 维护方式 |
| --- | --- | --- |
| `entries/<theme-id>/theme.yml` | 一个外观包的条目 | 手工维护 |
| `data/catalog.json` | 由条目生成的目录文件 | 自动生成 |
| `previews/<theme-id>.webp` | 列表预览图 | 自动生成 |
| `themes/<theme-id>/` | 少量明确打包进本仓库的包 | 仅在条目引用时使用 |
| `data/schema.json` | 条目格式定义 | 手工维护 |

提交和修改时，以 `entries/` 里的 YAML 为准。不要在普通条目 PR 里直接编辑 `data/catalog.json` 或 `previews/`。

## 浏览目录

可以直接查看 [`data/catalog.json`](data/catalog.json)，也可以打开某个 `entries/*/theme.yml` 查看详细信息。截图、标签、Stars 和 review 字段主要用于浏览和维护参考。

目录中的条目会经过格式和来源检查，但这不等于安全审计，也不代表维护者为第三方代码背书。安装前请自行查看固定 commit、构建脚本、许可证和上游仓库的维护情况。

## 添加条目

一个 PR 只添加或修改一个 `entries/<theme-id>/` 目录。

1. Fork 本仓库并创建分支。
2. 新增 `entries/<theme-id>/theme.yml`，并让目录名与 `id` 完全一致。
3. 按 [`CONTRIBUTING.md`](CONTRIBUTING.md) 中的示例填写条目。
4. 不要手工修改生成文件。
5. 提交 PR 前运行：

   ```powershell
   npm ci
   npm run check
   npm run sources:check -- --entry <theme-id>
   ```

### 条目要求

- 外部包必须使用公开 GitHub 仓库和完整的 40 位小写 commit SHA。
- `package` 和 `version` 必须与该 commit 中的 `package.json` 一致。
- `package.json` 必须声明 DSH client 入口。
- 截图必须是可访问的图片，每张不超过 10 MB。
- `license.code` 和 `commercialUse` 要与包的实际授权条件一致。
- 只有确实需要把包存放在本仓库时，才使用 `source.kind: bundled`。

合并后，自动化任务会生成目录文件和预览图。维护者可能会因范围、来源、兼容性或许可证问题要求修改条目。

## 检查

```powershell
npm run catalog          # 生成 data/catalog.json
npm run previews         # 生成 previews/*.webp
npm run catalog:check    # 离线检查，不写文件
npm run sources:check    # 检查外部包和截图
npm test                 # 运行测试
```

需要 Node.js 22 或更高版本。

## 许可证

本仓库的目录工具和元数据以 [MIT License](LICENSE) 发布。目录中的每个包仍然使用自己的许可证，并可能有额外的署名要求；使用或再分发前请查看对应条目和原作者仓库。

---

<p align="center"><sub><em>DSH appearance packages, collected in one place.</em></sub></p>
