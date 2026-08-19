import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { parse } from "yaml";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const entriesDir = join(root, "entries");
const previewDir = join(root, "previews");
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const WIDTH = 960;
const HEIGHT = 540;

async function sourceBuffer(entry, file) {
  const source = entry.screenshots[0];
  if (!/^https:\/\//.test(source)) {
    const path = entry.source.kind === "bundled"
      ? join(root, entry.source.path, source)
      : join(dirname(file), source);
    if (!existsSync(path)) throw new Error(`${file}: screenshot not found: ${path}`);
    return readFile(path);
  }
  const response = await fetch(source, {
    headers: { accept: "image/*", "user-agent": "dsh-appearance-catalog-preview" },
    signal: AbortSignal.timeout(30_000)
  });
  if (!response.ok) throw new Error(`${file}: screenshot returned HTTP ${response.status}`);
  const declared = Number(response.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_SOURCE_BYTES) throw new Error(`${file}: screenshot exceeds 12 MB`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_SOURCE_BYTES) throw new Error(`${file}: screenshot exceeds 12 MB`);
  return buffer;
}

await mkdir(previewDir, { recursive: true });
const files = (await readdir(entriesDir, { withFileTypes: true }))
  .filter(item => item.isDirectory())
  .map(item => join(entriesDir, item.name, "theme.yml"))
  .sort();

for (const file of files) {
  const entry = parse(await readFile(file, "utf8"));
  const input = await sourceBuffer(entry, file);
  const image = sharp(input, { limitInputPixels: 50_000_000 }).rotate();
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) throw new Error(`${file}: screenshot dimensions are unavailable`);
  const output = await image
    .resize({ width: WIDTH, height: HEIGHT, fit: "cover", position: "centre", kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.45 })
    .webp({ quality: 90, alphaQuality: 100, smartSubsample: false, effort: 6 })
    .toBuffer();
  await writeFile(join(previewDir, `${entry.id}.webp`), output);
  console.log(`${entry.id}: ${metadata.width}x${metadata.height} -> ${WIDTH}x${HEIGHT} (${output.length} bytes)`);
}
