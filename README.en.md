<h1 align="center">DSH Appearance Catalog</h1>

<p align="center">
  <sub><a href="README.md">简体中文</a> · <b>English</b></sub>
</p>

<p align="center">
  <em>A community directory of themes, skins, and appearance packages for DSH.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/DeepSeek-Harness-4c8492?style=flat-square" alt="DeepSeek Harness">
  &nbsp;
  <img src="https://img.shields.io/badge/Node.js-22%2B-4c8492?style=flat-square" alt="Node.js 22 or newer">
  &nbsp;
  <img src="https://img.shields.io/badge/License-MIT-4c566a?style=flat-square" alt="License: MIT">
</p>

<p align="center">
  <a href="#about">About</a> ·
  <a href="#repository-layout">Repository layout</a> ·
  <a href="#adding-an-entry">Adding an entry</a> ·
  <a href="#checks">Checks</a>
</p>

## About

This repository collects themes, skins, wallpapers, fonts, and other appearance packages made for the [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness) community.

Each entry records the package name, version, compatibility, screenshots, license, and source commit. External packages must point to a public GitHub repository and a complete 40-character commit SHA, so an upstream update cannot silently change an existing entry.

This repository is for organizing and archiving packages. For installation and configuration, follow the package's own repository and documentation.

## Repository layout

| Path | Contents | Maintained by |
| --- | --- | --- |
| `entries/<theme-id>/theme.yml` | One package entry | Contributors and maintainers |
| `data/catalog.json` | Catalog generated from the entries | Automation |
| `previews/<theme-id>.webp` | List preview images | Automation |
| `themes/<theme-id>/` | Packages intentionally bundled here | Only when referenced by an entry |
| `data/schema.json` | Entry format definition | Maintainers |

The YAML files under `entries/` are the records to edit. Do not hand-edit `data/catalog.json` or `previews/` in a normal entry pull request.

## Browsing the catalog

Open [`data/catalog.json`](data/catalog.json) for the generated index, or inspect an individual `entries/*/theme.yml` file for its source, version, compatibility, screenshots, tags, and license. Screenshots, tags, Stars, and review fields are there to help with browsing and maintenance.

Entries go through structure and source checks. That is not a security audit and it is not an endorsement of third-party code. Before installing a package, review its pinned commit, build scripts, license, and upstream maintenance.

## Adding an entry

Keep one `entries/<theme-id>/` directory per pull request.

1. Fork the repository and create a branch.
2. Add `entries/<theme-id>/theme.yml`; the directory name and `id` must match.
3. Fill out the entry using the example in [`CONTRIBUTING.md`](CONTRIBUTING.md).
4. Leave generated files untouched.
5. Run these checks before opening the pull request:

   ```powershell
   npm ci
   npm run check
   npm run sources:check -- --entry <theme-id>
   ```

### Entry requirements

- External packages must use a public GitHub repository and a complete 40-character lowercase commit SHA.
- `package` and `version` must match `package.json` at that commit.
- `package.json` must declare a DSH client entry.
- Screenshots must be reachable images no larger than 10 MB each.
- `license.code` and `commercialUse` must match the package's actual terms.
- Use `source.kind: bundled` only when the package is intentionally stored in this repository.

After merge, automation regenerates the catalog and preview images. Maintainers may request changes for scope, source availability, compatibility, or licensing.

## Checks

```powershell
npm run catalog          # generate data/catalog.json
npm run previews         # generate previews/*.webp
npm run catalog:check    # check offline without writing
npm run sources:check    # check external packages and screenshots
npm test                 # run tests
```

Node.js 22 or newer is required.

## License

The catalog tooling and metadata are released under the [MIT License](LICENSE). Each listed package keeps its own license and may have additional attribution requirements; check the entry and the original repository before using or redistributing it.

---

<p align="center"><sub><em>DSH appearance packages, collected in one place.</em></sub></p>
