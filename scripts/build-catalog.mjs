import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv/dist/2020.js";
import { parse } from "yaml";
import { themeScreenshots } from "./theme-screenshots.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const entriesDir = join(root, "entries");
const outputFile = join(root, "data", "catalog.json");
const schemaFile = join(root, "data", "schema.json");
const previewDir = join(root, "previews");
const catalogRepository = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).catalog?.repository;
if (typeof catalogRepository !== "string" || !/^[^/]+\/[^/]+$/.test(catalogRepository)) throw new Error("package.json catalog.repository is invalid");
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
    fail(file, `invalid local screenshot path: ${String(value)}`);
  }
  return value;
}

function catalogScreenshotUrl(value, file) {
  const relativePath = localScreenshotPath(value, file);
  const image = join(dirname(file), relativePath);
  if (!existsSync(image)) fail(file, `catalog screenshot is missing: ${relativePath}`);
  return `https://raw.githubusercontent.com/${catalogRepository}/main/entries/${file.split(/[\\/]/).at(-2)}/${relativePath}`;
}

function requireValid(value, file) {
  if (!validate(value)) {
    const details = (validate.errors ?? []).map(error => `${error.instancePath || "/"} ${error.message}`).join("; ");
    fail(file, details);
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
    .map(item => join(entriesDir, item.name, "theme.yml"))
    .filter(existsSync);
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
  const repositoryUrl = source.repository;
  const old = previousById.get(value.id);
  const commit = source.commit ?? old?.install?.commit ?? (checkOnly && offline ? "0000000000000000000000000000000000000000" : null);
  if (!commit) fail(file, "source commit is unresolved; run npm run sources:sync");
  const resolvedValue = { ...value, source: { ...source, commit } };
  const target = `github:${repositorySlug(source.repository)}#${commit}${source.subpath ? `&path:${source.subpath}` : ""}`;
  const generatedPreview = existsSync(join(previewDir, `${value.id}.webp`));
  const generatedPreviewUrl = `https://raw.githubusercontent.com/${catalogRepository}/main/previews/${value.id}.webp`;
  const sourceScreenshots = value.screenshots?.length > 0
    ? themeScreenshots(resolvedValue)
    : generatedPreview ? [generatedPreviewUrl] : themeScreenshots(resolvedValue);
  const screenshots = sourceScreenshots.map(screenshot => /^https:\/\//.test(screenshot)
    ? screenshot
    : catalogScreenshotUrl(screenshot, file));

  if (!/^[0-9a-f]{40}$/.test(commit)) fail(file, "source commit must be a 40-character lowercase SHA");
  if (screenshots.length === 0) fail(file, "at least one screenshot URL is required for the first catalog version");
  const stars = await githubStars(source.repository, old?.stars);

  themes.push({
    id: value.id,
    name: value.name,
    author: value.author,
    description: value.description,
    repositoryUrl,
    packageName: value.package,
    rowId: value.rowId,
    install: { target, commit, version: value.version },
    tags: value.tags,
    modes: value.modes,
    compatibility: value.compatibility,
    screenshots,
    ...(generatedPreview
      ? { listScreenshot: generatedPreviewUrl }
      : {}),
    ...(value.review ? {
      review: value.screenshots?.length > 0
        ? value.review
        : { ...value.review, preview: "repository-card" }
    } : {}),
    license: value.license,
    stars,
    ...(value.updatedAt ? { updatedAt: value.updatedAt } : {})
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
