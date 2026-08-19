import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";
import { themeScreenshots } from "./theme-screenshots.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const entriesDir = join(root, "entries");
const catalogFile = join(root, "data", "catalog.json");
const checkOnly = process.argv.includes("--check");

function normalizeText(value) {
  return value.replace(/\r\n?/g, "\n");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function repositoryLabel(repository) {
  return repository.replace(/^https:\/\/github\.com\//, "").replace(/\/$/, "");
}

const catalog = JSON.parse(await readFile(catalogFile, "utf8"));
const catalogById = new Map((catalog.themes ?? []).map(theme => [theme.id, theme]));
const entries = [];

for (const directory of (await readdir(entriesDir, { withFileTypes: true }))
  .filter(item => item.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name))) {
  const entry = parse(await readFile(join(entriesDir, directory.name, "theme.yml"), "utf8"));
  const normalized = catalogById.get(entry.id);
  const repository = entry.source.repository;
  if (!repository) throw new Error(`${entry.id}: theme list requires an upstream repository`);
  const resolvedEntry = entry.source.commit || !normalized?.install?.commit
    ? entry
    : { ...entry, source: { ...entry.source, commit: normalized.install.commit } };
  const preview = existsSync(join(root, "previews", `${entry.id}.webp`))
    ? `previews/${entry.id}.webp`
    : themeScreenshots(resolvedEntry)[0];
  if (!preview) throw new Error(`${entry.id}: theme list requires a preview`);
  entries.push({
    id: entry.id,
    name: entry.name,
    repository,
    preview,
    stars: Number.isInteger(normalized?.stars) ? normalized.stars : null
  });
}

function displayName(entry, language) {
  return entry.name[language] || entry.name.en || entry.name.zh || entry.id;
}

entries.sort((a, b) => {
  const starOrder = (b.stars ?? -1) - (a.stars ?? -1);
  if (starOrder !== 0) return starOrder;
  const nameOrder = displayName(a, "zh").localeCompare(displayName(b, "zh"), "zh", { sensitivity: "base" });
  return nameOrder || a.id.localeCompare(b.id);
});

function render({ language, title, intro, back, alternate, labels }) {
  const lines = [
    `# ${title}`,
    "",
    `${back} · ${alternate}`,
    "",
    intro.replace("{count}", String(entries.length)),
    "",
    "<table width=\"100%\">",
    "<thead>",
    "<tr>",
    `<th width=\"18%\" align=\"center\">${labels.name}</th>`,
    `<th width=\"52%\" align=\"center\">${labels.preview}</th>`,
    `<th width=\"23%\" align=\"center\">${labels.upstream}</th>`,
    `<th width=\"7%\" align=\"center\">${labels.stars}</th>`,
    "</tr>",
    "</thead>",
    "<tbody>"
  ];

  for (const entry of entries) {
    const name = displayName(entry, language);
    const repository = escapeHtml(entry.repository);
    const preview = escapeHtml(entry.preview);
    const label = escapeHtml(repositoryLabel(entry.repository));
    const image = `<img src=\"${preview}\" alt=\"${escapeHtml(name)}\" width=\"260\">`;
    const stars = entry.stars === null ? "-" : entry.stars.toLocaleString("en-US");
    lines.push(
      "<tr>",
      `<td align=\"center\" valign=\"middle\">${escapeHtml(name)}</td>`,
      `<td align=\"center\" valign=\"middle\">${image}</td>`,
      `<td align=\"center\" valign=\"middle\"><a href=\"${repository}\">${label}</a></td>`,
      `<td align=\"center\" valign=\"middle\">${stars}</td>`,
      "</tr>"
    );
  }

  lines.push(
    "</tbody>",
    "</table>",
    ""
  );
  return lines.join("\n");
}

const outputs = new Map([
  ["THEMES.md", render({
    language: "zh",
    title: "DSH 主题",
    intro: "共收录 {count} 个主题。按 Stars 从高到低排序，Stars 相同时按名称排序。",
    back: "[返回 README](README.md)",
    alternate: "[English](THEMES.en.md)",
    labels: { name: "名称", preview: "预览", upstream: "上游", stars: "Stars" }
  })],
  ["THEMES.en.md", render({
    language: "en",
    title: "DSH Themes",
    intro: "{count} themes are listed here. Sorted by Stars, then by name.",
    back: "[Back to README](README.en.md)",
    alternate: "[简体中文](THEMES.md)",
    labels: { name: "Name", preview: "Preview", upstream: "Upstream", stars: "Stars" }
  })]
]);

const countBlocks = new Map([
  ["README.md", `<!-- theme-count:start -->\n本项目已收录 **${entries.length}** 个主题，主题详情整理在单独的主题页中：\n<!-- theme-count:end -->`],
  ["README.en.md", `<!-- theme-count:start -->\nThis project currently lists **${entries.length}** themes. Details are collected on a separate page:\n<!-- theme-count:end -->`]
]);

for (const [file, content] of outputs) {
  const path = join(root, file);
  if (checkOnly) {
    const current = existsSync(path) ? normalizeText(await readFile(path, "utf8")) : "";
    if (current !== content) throw new Error(`${file} is out of date; run npm run themes`);
  } else {
    await writeFile(path, content);
  }
}

for (const [file, block] of countBlocks) {
  const path = join(root, file);
  const current = normalizeText(await readFile(path, "utf8"));
  const next = current.replace(/<!-- theme-count:start -->[\s\S]*?<!-- theme-count:end -->/, block);
  if (next === current && !current.includes(block)) throw new Error(`${file}: theme count markers are missing`);
  if (checkOnly) {
    if (next !== current) throw new Error(`${file} has an outdated theme count; run npm run themes`);
  } else {
    await writeFile(path, next);
  }
}

console.log(`${checkOnly ? "checked" : "generated"} ${entries.length} themes in THEMES.md and THEMES.en.md`);
