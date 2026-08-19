<h1 align="center">DSH Appearance Catalog</h1>

<p align="center">
  <sub><b>简体中文</b> · English</sub>
</p>

<p align="center">
  <em>DeepSeek Harness 外观主题的社区归档与可复现索引</em>
</p>

<p align="center">
  <sub>A community archive and reproducible index of appearance packages for DeepSeek Harness.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/DeepSeek-Harness-4c8492?style=flat-square" alt="DeepSeek Harness">
  &nbsp;
  <img src="https://img.shields.io/badge/Node.js-22%2B-4c8492?style=flat-square" alt="Node.js 22 or newer">
  &nbsp;
  <img src="https://img.shields.io/badge/License-MIT-4c566a?style=flat-square" alt="License: MIT">
</p>

<p align="center">
  <a href="#项目是什么">项目是什么</a> ·
  <a href="#浏览归档">浏览归档</a> ·
  <a href="#提交条目">提交条目</a> ·
  <a href="#安全边界">安全边界</a>
</p>

> [!NOTE]
> **这不是 DSH 的实现仓库，也不是安装器。** 本项目维护的是外观包的元数据、来源和预览；可安装代码默认保留在原作者仓库中。只有明确标记为 bundled 的包才会随本仓库保存。
>
> **This is not the DSH implementation or an installer.** It records package metadata, provenance, and previews. Installable code stays in the original author's repository unless an entry explicitly uses `bundled`.

## 项目是什么

这是一个面向 [DeepSeek Harness（DSH）](https://github.com/deepseek-ai/deepseek-harness) 的社区外观归档。收录范围包括主题、皮肤、壁纸、字体，以及其他以界面呈现为主的 DSH 客户端包。

仓库的核心价值是让每个条目都能被追溯和复现：外部包使用公开 GitHub 仓库和完整的 40 位 commit SHA 固定来源，避免上游后续改动悄悄改变归档内容。

**English.** DSH Appearance Catalog is a community-maintained archive for themes, skins, wallpapers, fonts, and other appearance-oriented DSH client packages. Every external entry is pinned to a public GitHub repository and a complete 40-character commit SHA, so its metadata and installation target remain reproducible.

## 仓库结构

| 路径 | 作用 | 是否手工维护 |
| --- | --- | --- |
| `entries/<theme-id>/theme.yml` | 一个外观包的声明、版本、来源、兼容性、截图和许可证 | **是，唯一事实来源** |
| `data/catalog.json` | 由条目归一化生成的机器可读目录 | 否 |
| `previews/<theme-id>.webp` | 由首张截图生成的列表预览图 | 否 |
| `themes/<theme-id>/` | 可选的 bundled 包文件 | 仅在条目引用时维护 |
| `data/schema.json` | 条目格式与字段约束 | 是 |
| `scripts/` | 目录生成、预览生成和来源检查脚本 | 是 |

**English.** `entries/` contains the authoritative records. `data/catalog.json` and `previews/` are generated artifacts. `themes/` is reserved for packages intentionally bundled in this repository.

## 浏览归档

从 [`data/catalog.json`](data/catalog.json) 查看规范化目录，或直接打开任意 `entries/*/theme.yml`，了解它的来源、版本、兼容性、截图、标签和许可证。安装时请遵循原包仓库的说明；本仓库不替代原作者的发布文档。

Stars 和 review 字段只用于发现和维护参考。通过结构校验不代表包经过安全认证，也不代表维护者为其背书。

**English.** Browse the normalized index in [`data/catalog.json`](data/catalog.json), or inspect an individual entry for its source, version, compatibility, screenshots, tags, and license. Follow the original package repository for installation instructions. Stars and review fields are informational, not endorsements or security certifications.

## 提交条目

每个 Pull Request 只提交一个 `entries/<theme-id>/` 目录。推荐流程如下：

1. Fork 本仓库并创建分支。
2. 新增 `entries/<theme-id>/theme.yml`，目录名必须与 `id` 完全一致。
3. 参考 [`CONTRIBUTING.md`](CONTRIBUTING.md) 中的完整示例填写字段。
4. 不要手工修改 `data/catalog.json` 或 `previews/`。
5. 在提交 PR 前运行本地检查：

   ```powershell
   npm ci
   npm run check
   npm run sources:check -- --entry <theme-id>
   ```

合并后，自动化流程会重新生成目录和预览。CI 会检查 schema、ID/package/rowId 唯一性、包清单、截图地址、许可证字段和来源固定点。

**English.** Keep one `entries/<theme-id>/` directory per pull request. Add the YAML record, leave generated files untouched, and run the commands above before opening the PR. CI validates the schema, uniqueness constraints, package manifest, screenshots, license fields, and immutable source pin. The post-merge workflow regenerates the catalog and previews.

### 条目与打包规则

- 外部条目必须指向公开 GitHub 仓库，并使用不可变的 40 位小写 commit SHA。
- `package` 和 `version` 必须与该 commit 中的 `package.json` 一致。
- 包必须在 `package.json` 中声明 DSH client 入口。
- 每张截图必须是可访问图片，大小不超过 10 MB。
- `license.code` 和 `commercialUse` 必须真实反映被收录包的授权条件。
- 只有确实要把包保存到本仓库时，才使用 `source.kind: bundled`；bundled 包仍需合法清单和可解析的仓库 commit。

**English.** External entries must use public GitHub repositories and immutable SHAs. Package metadata, DSH client declarations, screenshots, and license fields are checked against the pinned source. Use `bundled` only for packages intentionally stored under `themes/`.

## 生成与校验

提交的 YAML 是唯一事实来源：

```powershell
npm run catalog          # 生成 data/catalog.json
npm run previews         # 生成 previews/*.webp
npm run catalog:check    # 离线校验，不写文件
npm run sources:check    # 校验外部包和截图
npm test                 # 运行仓库测试
```

Node.js 22 或更高版本是必需的。定时任务会刷新生成文件和 GitHub Stars；条目 PR 不应直接提交这些生成结果。

**English.** The YAML entries are authoritative. `npm run catalog` normalizes them into `data/catalog.json`; `npm run previews` creates fixed-size WebP previews from the first screenshot. Node.js 22 or newer is required.

## 安全边界

收录不等于安全审计、质量保证或维护者推荐。安装 DSH 客户端包会在用户机器上运行第三方代码；安装前请检查固定 commit、权限、构建脚本、许可证和上游维护状态。发现过期、失效或可疑条目时，请提交 Issue/PR，不要直接改生成文件。

**English.** Listing a package is not a security audit, quality guarantee, or endorsement. Installing a DSH client package executes third-party code on the user's machine. Review the pinned source, permissions, build steps, license, and upstream maintenance before installation.

## 许可证

本仓库的目录工具和元数据以 [MIT License](LICENSE) 发布。每个被收录的包仍保留自己的许可证和署名要求；再分发前请同时查看条目和原作者仓库。

**English.** The catalog tooling and metadata are released under the [MIT License](LICENSE). Each listed package keeps its own license and attribution requirements.

---

<p align="center"><sub><em>Discoverable, traceable, reproducible DSH appearance packages.</em></sub></p>
