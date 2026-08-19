import { existsSync } from "node:fs";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const entriesDir = join(root, "entries");
const checkOnly = process.argv.includes("--check");

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function repositoryLabel(repository) {
  return repository.replace(/^https:\/\/github\.com\//, "").replace(/\/$/, "");
}

const entries = [];
for (const directory of (await readdir(entriesDir, { withFileTypes: true })).filter(item => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
  const entry = parse(await readFile(join(entriesDir, directory.name, "theme.yml"), "utf8"));
  const repository = entry.source.repository ?? entry.homepage;
  if (!repository) throw new Error(`${entry.id}: theme list requires an upstream repository or homepage`);
  const preview = existsSync(join(root, "previews", `${entry.id}.webp`))
    ? `previews/${entry.id}.webp`
    : entry.screenshots[0];
  if (!preview) throw new Error(`${entry.id}: theme list requires a preview`);
  entries.push({
    name: entry.name,
    repository,
    preview
  });
}

function render({ language, title, intro, name, preview, upstream, back, alternate }) {
  const rows = entries.map(entry => {
    const displayName = escapeCell(entry.name[language] || entry.name.en || entry.name.zh);
    const repository = escapeCell(entry.repository);
    const label = escapeCell(repositoryLabel(entry.repository));
    const image = `<img src="${escapeAttribute(entry.preview)}" alt="${escapeAttribute(entry.name[language] || entry.name.en || entry.name.zh)}" width="320">`;
    return `| [${displayName}](${repository}) | ${image} | [${label}](${repository}) |`;
  });
  return [
    `# ${title}`,
    "",
    `${back} · ${alternate}`,
    "",
    intro.replace("{count}", String(entries.length)),
    "",
    `| ${name} | ${preview} | ${upstream} |`,
    "| --- | --- | --- |",
    ...rows,
    ""
  ].join("\n");
}

const outputs = new Map([
  ["THEMES.md", render({
    language: "zh",
    title: "DSH 主题",
    intro: "共收录 {count} 个主题。此页面由 `entries/` 自动生成。",
    name: "名称",
    preview: "预览",
    upstream: "上游",
    back: "[返回 README](README.md)",
    alternate: "[English](THEMES.en.md)"
  })],
  ["THEMES.en.md", render({
    language: "en",
    title: "DSH Themes",
    intro: "{count} themes are listed. This page is generated from `entries/`.",
    name: "Name",
    preview: "Preview",
    upstream: "Upstream",
    back: "[Back to README](README.en.md)",
    alternate: "[简体中文](THEMES.md)"
  })]
]);

const countBlocks = new Map([
  ["README.md", `<!-- theme-count:start -->\n本项目已收录 **${entries.length}** 个主题，主题详情整理在单独的主题页中：\n<!-- theme-count:end -->`],
  ["README.en.md", `<!-- theme-count:start -->\nThis project currently lists **${entries.length}** themes. Details are collected on a separate page:\n<!-- theme-count:end -->`]
]);

for (const [file, content] of outputs) {
  const path = join(root, file);
  if (checkOnly) {
    const current = existsSync(path) ? await readFile(path, "utf8") : "";
    if (current !== content) throw new Error(`${file} is out of date; run npm run themes`);
  } else {
    await writeFile(path, content);
  }
}

for (const [file, block] of countBlocks) {
  const path = join(root, file);
  const current = await readFile(path, "utf8");
  const next = current.replace(/<!-- theme-count:start -->[\s\S]*?<!-- theme-count:end -->/, block);
  if (next === current && !current.includes(block)) throw new Error(`${file}: theme count markers are missing`);
  if (checkOnly) {
    if (next !== current) throw new Error(`${file} has an outdated theme count; run npm run themes`);
  } else {
    await writeFile(path, next);
  }
}

console.log(`${checkOnly ? "checked" : "generated"} ${entries.length} themes in THEMES.md and THEMES.en.md`);
