import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { parse } from "yaml";
import {
  isGitHubRepositoryCard,
  renderRepositoryCard,
  shouldPreserveRepositoryCardPreview,
  themeScreenshots
} from "./theme-screenshots.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const entriesDir = join(root, "entries");
const previewDir = join(root, "previews");
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const WIDTH = 960;
const HEIGHT = 540;
const entryIndex = process.argv.indexOf("--entry");
const requestedEntry = entryIndex >= 0 ? process.argv[entryIndex + 1] : undefined;

async function repositoryMetadata(entry) {
  const slug = entry.source.repository.replace(/^https:\/\/github\.com\//, "").replace(/\/$/, "");
  try {
    const response = await fetch(`https://api.github.com/repos/${slug}`, {
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "awesome-dsh-themes-preview",
        ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
      },
      signal: AbortSignal.timeout(15_000)
    });
    if (response.ok) return await response.json();
  } catch { /* The repository slug is enough for the local fallback card. */ }
  return { full_name: slug, name: slug.split("/").at(-1), description: "DeepSeek Harness theme" };
}

async function localRepositoryCard(entry) {
  const repository = await repositoryMetadata(entry);
  return renderRepositoryCard(entry.source, repository);
}

async function sourceBuffer(entry, file) {
  const source = themeScreenshots(entry)[0];
  if (!/^https:\/\//.test(source)) {
    const path = join(dirname(file), source);
    if (!existsSync(path)) throw new Error(`${file}: screenshot not found: ${path}`);
    return readFile(path);
  }
  let response;
  try {
    response = await fetch(source, {
      headers: { accept: "image/*", "user-agent": "awesome-dsh-themes-preview" },
      signal: AbortSignal.timeout(30_000)
    });
  } catch (error) {
    if (isGitHubRepositoryCard(source, entry.source)) return localRepositoryCard(entry);
    throw error;
  }
  if (!response.ok) {
    if (isGitHubRepositoryCard(source, entry.source)) return localRepositoryCard(entry);
    throw new Error(`${file}: screenshot returned HTTP ${response.status}`);
  }
  const declared = Number(response.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_SOURCE_BYTES) throw new Error(`${file}: screenshot exceeds 12 MB`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_SOURCE_BYTES) throw new Error(`${file}: screenshot exceeds 12 MB`);
  return buffer;
}

await mkdir(previewDir, { recursive: true });
let files = (await readdir(entriesDir, { withFileTypes: true }))
  .filter(item => item.isDirectory())
  .map(item => join(entriesDir, item.name, "theme.yml"))
  .filter(existsSync)
  .sort();
if (requestedEntry) {
  files = files.filter(file => file.split(/[\\/]/).at(-2) === requestedEntry);
  if (files.length !== 1) throw new Error(`entry not found: ${requestedEntry}`);
}

for (const file of files) {
  const entry = parse(await readFile(file, "utf8"));
  const outputFile = join(previewDir, `${entry.id}.webp`);
  if (shouldPreserveRepositoryCardPreview(entry, existsSync(outputFile))) {
    console.log(`${entry.id}: kept existing repository card`);
    continue;
  }
  const input = await sourceBuffer(entry, file);
  const image = sharp(input, { limitInputPixels: 50_000_000 }).rotate();
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) throw new Error(`${file}: screenshot dimensions are unavailable`);
  const output = await image
    .resize({ width: WIDTH, height: HEIGHT, fit: "cover", position: "centre", kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.45 })
    .webp({ quality: 90, alphaQuality: 100, smartSubsample: false, effort: 6 })
    .toBuffer();
  await writeFile(outputFile, output);
  console.log(`${entry.id}: ${metadata.width}x${metadata.height} -> ${WIDTH}x${HEIGHT} (${output.length} bytes)`);
}
