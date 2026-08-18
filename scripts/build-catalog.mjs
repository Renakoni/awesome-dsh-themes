import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv/dist/2020.js";
import { parse } from "yaml";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const entriesDir = join(root, "entries");
const outputFile = join(root, "data", "catalog.json");
const schemaFile = join(root, "data", "schema.json");
const checkOnly = process.argv.includes("--check");
const offline = process.argv.includes("--offline");

const schema = JSON.parse(readFileSync(schemaFile, "utf8"));
const validate = new Ajv({ allErrors: true, strict: false }).compile(schema);

function errorText(error) {
  return error instanceof Error ? error.message : String(error);
}

function fail(file, message) {
  throw new Error(`${relative(root, file)}: ${message}`);
}

function repositorySlug(repository) {
  const match = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/?$/.exec(repository);
  if (!match) throw new Error(`invalid GitHub repository: ${repository}`);
  return match[1];
}

function localScreenshotPath(value, file) {
  if (typeof value !== "string" || !/^[A-Za-z0-9._/-]+$/.test(value) || value.split("/").includes("..")) {
    fail(file, `invalid bundled screenshot path: ${String(value)}`);
  }
  return value;
}

function requireValid(value, file) {
  if (!validate(value)) {
    const details = (validate.errors ?? []).map(error => `${error.instancePath || "/"} ${error.message}`).join("; ");
    fail(file, details);
  }
}

function gitPathCommit(path) {
  try {
    return execFileSync("git", ["rev-list", "-1", "HEAD", "--", path], { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

async function githubStars(repository, fallback) {
  if (offline || !process.env.GITHUB_TOKEN) return fallback ?? null;
  try {
    const response = await fetch(`https://api.github.com/repos/${repositorySlug(repository)}`, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "dsh-appearance-catalog",
        authorization: `Bearer ${process.env.GITHUB_TOKEN}`
      },
      signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) return fallback ?? null;
    const value = await response.json();
    return Number.isInteger(value.stargazers_count) && value.stargazers_count >= 0
      ? value.stargazers_count
      : fallback ?? null;
  } catch {
    return fallback ?? null;
  }
}

async function entryFiles() {
  if (!existsSync(entriesDir)) return [];
  return (await readdir(entriesDir, { withFileTypes: true }))
    .filter(item => item.isDirectory())
    .map(item => join(entriesDir, item.name, "theme.yml"));
}

function readPrevious() {
  try { return JSON.parse(readFileSync(outputFile, "utf8")); } catch { return null; }
}

const previous = readPrevious();
const previousById = new Map((previous?.themes ?? []).map(theme => [theme.id, theme]));
const ids = new Set();
const packages = new Set();
const rows = new Set();
const themes = [];

for (const file of (await entryFiles()).sort()) {
  const idFromPath = file.split(/[\\/]/).at(-2);
  let value;
  try { value = parse(await readFile(file, "utf8")); } catch (error) { fail(file, `invalid YAML: ${errorText(error)}`); }
  if (idFromPath !== value?.id) fail(file, `directory name must match id (${idFromPath})`);
  requireValid(value, file);
  if (ids.has(value.id)) fail(file, `duplicate id: ${value.id}`);
  if (packages.has(value.package)) fail(file, `duplicate package: ${value.package}`);
  if (rows.has(value.rowId)) fail(file, `duplicate rowId: ${value.rowId}`);
  ids.add(value.id);
  packages.add(value.package);
  rows.add(value.rowId);

  const source = value.source;
  let repositoryUrl = null;
  let commit;
  let target;
  let screenshots;
  if (source.kind === "external") {
    repositoryUrl = source.repository;
    commit = source.commit;
    target = `github:${repositorySlug(source.repository)}#${commit}${source.subpath ? `&path:${source.subpath}` : ""}`;
    screenshots = value.screenshots;
  } else {
    const packageDir = join(root, source.path);
    if (!existsSync(join(packageDir, "package.json"))) fail(file, `bundled theme package is missing: ${source.path}/package.json`);
    if ((source.repository === undefined) !== (source.commit === undefined)) {
      fail(file, "bundled source repository and commit must be provided together");
    }
    commit = gitPathCommit(source.path);
    if (!/^[0-9a-f]{40}$/.test(commit)) fail(file, `cannot resolve a commit for bundled theme path: ${source.path}`);
    const catalogRepository = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).catalog?.repository;
    if (typeof catalogRepository !== "string" || !/^[^/]+\/[^/]+$/.test(catalogRepository)) fail(file, "package.json catalog.repository is invalid");
    target = `github:${catalogRepository}#${commit}&path:${source.path}`;
    repositoryUrl = source.repository ?? null;
    screenshots = value.screenshots.map(value => {
      const relativePath = localScreenshotPath(value, file);
      const image = join(packageDir, relativePath);
      if (!existsSync(image)) fail(file, `bundled screenshot is missing: ${source.path}/${relativePath}`);
      return `https://raw.githubusercontent.com/${catalogRepository}/${commit}/${source.path}/${relativePath}`;
    });
  }

  if (!/^[0-9a-f]{40}$/.test(commit)) fail(file, "source commit must be a 40-character lowercase SHA");
  if (screenshots.length === 0) fail(file, "at least one screenshot URL is required for the first catalog version");
  const old = previousById.get(value.id);
  const stars = source.kind === "external"
    ? await githubStars(source.repository, old?.stars)
    : source.repository ? await githubStars(source.repository, old?.stars) : null;

  themes.push({
    id: value.id,
    name: value.name,
    author: value.author,
    description: value.description,
    ...(value.homepage ? { homepage: value.homepage } : {}),
    repositoryUrl,
    packageName: value.package,
    rowId: value.rowId,
    version: value.version,
    source,
    install: { target, commit, version: value.version },
    tags: value.tags,
    modes: value.modes,
    compatibility: value.compatibility,
    screenshots,
    license: value.license,
    stars
  });
}

themes.sort((a, b) => a.id.localeCompare(b.id));
const comparable = JSON.stringify({ schemaVersion: 1, generatedAt: "", themes });
const oldComparable = previous ? JSON.stringify({ schemaVersion: 1, generatedAt: "", themes: previous.themes ?? [] }) : "";
const generatedAt = previous && comparable === oldComparable
  ? previous.generatedAt
  : new Date().toISOString();
const catalog = { schemaVersion: 1, generatedAt, themes };

if (!checkOnly) {
  await mkdir(join(root, "data"), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(catalog, null, 2)}\n`);
}

console.log(`validated ${themes.length} theme entr${themes.length === 1 ? "y" : "ies"}${checkOnly ? " (catalog not written)" : " and generated data/catalog.json"}`);
