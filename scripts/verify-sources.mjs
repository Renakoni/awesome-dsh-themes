import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const entriesDir = join(root, "entries");
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const RATE_LIMIT_RETRY_DELAYS_MS = [2_000, 5_000, 10_000];
const IMAGE_EXTENSIONS = /\.(?:apng|avif|bmp|gif|jpe?g|png|svg|tiff?|webp)(?:$|[?#])/i;
const entryIndex = process.argv.indexOf("--entry");
const requestedEntry = entryIndex >= 0 ? process.argv[entryIndex + 1] : undefined;

function fail(file, message) {
  throw new Error(`${relative(root, file)}: ${message}`);
}

function repositorySlug(repository) {
  const match = /^https:\/\/github\.com\/([^/]+\/[^/]+)\/?$/.exec(repository);
  if (!match) throw new Error(`invalid GitHub repository: ${repository}`);
  return match[1];
}

async function request(url, file) {
  for (let attempt = 0; attempt <= RATE_LIMIT_RETRY_DELAYS_MS.length; attempt += 1) {
    let response;
    try {
      response = await fetch(url, {
        headers: { accept: "application/json", "user-agent": "dsh-appearance-catalog-source-check" },
        signal: AbortSignal.timeout(15_000)
      });
    } catch (error) {
      fail(file, `${url} request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (response.ok) return response;
    if (response.status !== 429 || attempt === RATE_LIMIT_RETRY_DELAYS_MS.length) {
      fail(file, `${url} returned HTTP ${response.status}`);
    }
    await response.body?.cancel();
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_RETRY_DELAYS_MS[attempt]));
  }
}

function isImageResponse(url, contentType) {
  return contentType.toLowerCase().startsWith("image/") || IMAGE_EXTENSIONS.test(url);
}

async function entryFiles() {
  if (!existsSync(entriesDir)) return [];
  const files = (await readdir(entriesDir, { withFileTypes: true }))
    .filter(item => item.isDirectory())
    .map(item => join(entriesDir, item.name, "theme.yml"));
  if (!requestedEntry) return files;
  const selected = files.filter(file => file.split(/[\\/]/).at(-2) === requestedEntry);
  if (selected.length !== 1) throw new Error(`entry not found: ${requestedEntry}`);
  return selected;
}

for (const file of (await entryFiles()).sort()) {
  const value = parse(await readFile(file, "utf8"));
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
    if (!/^https:\/\//.test(screenshot)) {
      if (screenshot.split("/").includes("..")) fail(file, `invalid local screenshot path: ${screenshot}`);
      const screenshotPath = join(dirname(file), screenshot);
      if (!existsSync(screenshotPath)) fail(file, `local screenshot is missing: ${screenshot}`);
      continue;
    }
    const response = await request(screenshot, file);
    const length = Number(response.headers.get("content-length") ?? "0");
    const contentType = response.headers.get("content-type") ?? "";
    if (Number.isFinite(length) && length > MAX_IMAGE_BYTES) fail(file, `screenshot is larger than ${MAX_IMAGE_BYTES} bytes: ${screenshot}`);
    if (!isImageResponse(screenshot, contentType)) fail(file, `screenshot is not an image: ${screenshot}`);
    await response.body?.cancel();
  }
  console.log(`verified ${value.id}`);
}

console.log("external source verification passed");
