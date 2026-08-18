import { existsSync, readFileSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const entriesDir = join(root, "entries");
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function fail(file, message) {
  throw new Error(`${relative(root, file)}: ${message}`);
}

function repositorySlug(repository) {
  const match = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/?$/.exec(repository);
  if (!match) throw new Error(`invalid GitHub repository: ${repository}`);
  return match[1];
}

async function request(url, file) {
  let response;
  try {
    response = await fetch(url, {
      headers: { accept: "application/json", "user-agent": "dsh-appearance-catalog-source-check" },
      signal: AbortSignal.timeout(15_000)
    });
  } catch (error) {
    fail(file, `${url} request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!response.ok) fail(file, `${url} returned HTTP ${response.status}`);
  return response;
}

async function entryFiles() {
  if (!existsSync(entriesDir)) return [];
  return (await readdir(entriesDir, { withFileTypes: true }))
    .filter(item => item.isDirectory())
    .map(item => join(entriesDir, item.name, "theme.yml"));
}

for (const file of (await entryFiles()).sort()) {
  const value = parse(await readFile(file, "utf8"));
  if (value.source.kind === "bundled") {
    const packageDir = join(root, value.source.path);
    const manifestPath = join(packageDir, "package.json");
    if (!existsSync(manifestPath)) fail(file, `bundled theme package is missing: ${value.source.path}/package.json`);
    let manifest;
    try { manifest = JSON.parse(readFileSync(manifestPath, "utf8")); } catch { fail(file, "bundled package.json is not valid JSON"); }
    if (manifest.name !== value.package) fail(file, `package name is ${String(manifest.name)}, expected ${value.package}`);
    if (manifest.version !== value.version) fail(file, `package version is ${String(manifest.version)}, expected ${value.version}`);
    if (!manifest.dsh || typeof manifest.dsh !== "object" || manifest.dsh.client === undefined) fail(file, "package must declare dsh.client");
    for (const screenshot of value.screenshots) {
      if (!/^[A-Za-z0-9._/-]+$/.test(screenshot) || screenshot.split("/").includes("..")) fail(file, `invalid bundled screenshot path: ${screenshot}`);
      if (!existsSync(join(packageDir, screenshot))) fail(file, `bundled screenshot is missing: ${value.source.path}/${screenshot}`);
    }
    console.log(`verified bundled ${value.id}`);
    continue;
  }
  const slug = repositorySlug(value.source.repository);
  const subpath = value.source.subpath ? `${value.source.subpath}/` : "";
  if (value.source.subpath?.split("/").includes("..")) fail(file, "source.subpath must not contain parent traversal");

  const packageResponse = await request(`https://raw.githubusercontent.com/${slug}/${value.source.commit}/${subpath}package.json`, file);
  let manifest;
  try { manifest = await packageResponse.json(); } catch { fail(file, "source package.json is not valid JSON"); }
  if (manifest.name !== value.package) fail(file, `package name is ${String(manifest.name)}, expected ${value.package}`);
  if (manifest.version !== value.version) fail(file, `package version is ${String(manifest.version)}, expected ${value.version}`);
  if (!manifest.dsh || typeof manifest.dsh !== "object" || manifest.dsh.client === undefined) fail(file, "package must declare dsh.client");

  for (const screenshot of value.screenshots) {
    const response = await request(screenshot, file);
    const length = Number(response.headers.get("content-length") ?? "0");
    const contentType = response.headers.get("content-type") ?? "";
    if (Number.isFinite(length) && length > MAX_IMAGE_BYTES) fail(file, `screenshot is larger than ${MAX_IMAGE_BYTES} bytes: ${screenshot}`);
    if (!contentType.toLowerCase().startsWith("image/")) fail(file, `screenshot is not an image: ${screenshot}`);
    await response.body?.cancel();
  }
  console.log(`verified ${value.id}`);
}

console.log("external source verification passed");
