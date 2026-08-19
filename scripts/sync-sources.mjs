import { appendFile, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "yaml";
import { latestGitHubSource, repositorySlug } from "./github-source.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const entriesDir = join(root, "entries");
const dryRun = process.argv.includes("--dry-run");
const entryIndex = process.argv.indexOf("--entry");
const requestedEntry = entryIndex >= 0 ? process.argv[entryIndex + 1] : undefined;
const VERSION = /^[0-9]+\.[0-9]+\.[0-9]+(?:[-+][0-9A-Za-z.-]+)?$/;

function sameRepository(left, right) {
  return left.toLowerCase() === right.toLowerCase();
}

export function pinScreenshotUrl(url, repository, commit) {
  if (typeof url !== "string" || !/^https:\/\//.test(url)) return url;
  const slug = repositorySlug(repository);
  const raw = /^https:\/\/raw\.githubusercontent\.com\/([^/]+\/[^/]+)\/[^/]+\/(.+)$/.exec(url);
  if (raw && sameRepository(raw[1], slug)) {
    return `https://raw.githubusercontent.com/${raw[1]}/${commit}/${raw[2]}`;
  }
  const card = /^https:\/\/opengraph\.githubassets\.com\/[^/]+\/([^/]+\/[^/]+)\/?$/.exec(url);
  if (card && sameRepository(card[1], slug)) {
    return `https://opengraph.githubassets.com/${commit}/${card[1]}`;
  }
  return url;
}

export function synchronizedEntry(entry, latest) {
  if (latest.manifest?.name !== entry.package) {
    throw new Error(`package name is ${String(latest.manifest?.name)}, expected ${entry.package}`);
  }
  if (!latest.manifest.dsh || typeof latest.manifest.dsh !== "object" || latest.manifest.dsh.client === undefined) {
    throw new Error("package must declare dsh.client");
  }
  if (typeof latest.manifest.version !== "string" || !VERSION.test(latest.manifest.version)) {
    throw new Error(`package version is invalid: ${String(latest.manifest.version)}`);
  }
  const next = structuredClone(entry);
  next.source.commit = latest.commit;
  next.version = latest.manifest.version;
  next.updatedAt = latest.updatedAt;
  if (Array.isArray(next.screenshots)) {
    next.screenshots = next.screenshots.map(url => pinScreenshotUrl(url, next.source.repository, latest.commit));
  }
  return next;
}

function updateDocument(document, next) {
  document.setIn(["source", "commit"], next.source.commit);
  document.set("version", next.version);
  document.set("updatedAt", next.updatedAt);
  if (Array.isArray(next.screenshots)) document.set("screenshots", next.screenshots);
}

async function entryFiles() {
  const files = (await readdir(entriesDir, { withFileTypes: true }))
    .filter(item => item.isDirectory())
    .map(item => join(entriesDir, item.name, "theme.yml"))
    .sort();
  if (!requestedEntry) return files;
  const selected = files.filter(file => file.split(/[\\/]/).at(-2) === requestedEntry);
  if (selected.length !== 1) throw new Error(`entry not found: ${requestedEntry}`);
  return selected;
}

async function resolveEntries(files, concurrency = 8) {
  const results = new Array(files.length);
  let cursor = 0;
  async function worker() {
    while (cursor < files.length) {
      const index = cursor;
      cursor += 1;
      const file = files[index];
      const current = await readFile(file, "utf8");
      const document = parseDocument(current);
      if (document.errors.length > 0) throw new Error(`${relative(root, file)}: invalid YAML`);
      const entry = document.toJS();
      try {
        const latest = await latestGitHubSource(entry.source, {
          token: process.env.GITHUB_TOKEN,
          userAgent: "dsh-appearance-catalog-source-sync"
        });
        results[index] = { file, document, entry, latest };
      } catch (error) {
        results[index] = { file, document, entry, error };
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, () => worker()));
  return results;
}

async function main() {
  const changed = [];
  const skipped = [];
  const unresolved = [];

  for (const result of await resolveEntries(await entryFiles())) {
    const { file, document, entry, latest, error } = result;
    if (!error) {
      if (entry.source.commit === latest.commit) {
        console.log(`${entry.id}: current`);
        continue;
      }
      try {
        const next = synchronizedEntry(entry, latest);
        updateDocument(document, next);
        if (!dryRun) await writeFile(file, document.toString());
        changed.push(entry.id);
        console.log(`${entry.id}: ${entry.source.commit ?? "unresolved"} -> ${next.source.commit} (${entry.version} -> ${next.version})`);
      } catch (validationError) {
        const message = validationError instanceof Error ? validationError.message : String(validationError);
        if (entry.source?.commit) {
          skipped.push(`${entry.id}: ${message}`);
          console.warn(`${entry.id}: kept existing commit (${message})`);
        } else {
          unresolved.push(`${entry.id}: ${message}`);
        }
      }
    } else {
      const message = error instanceof Error ? error.message : String(error);
      if (entry.source?.commit) {
        skipped.push(`${entry.id}: ${message}`);
        console.warn(`${entry.id}: kept existing commit (${message})`);
      } else {
        unresolved.push(`${entry.id}: ${message}`);
      }
    }
  }

  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `changed=${changed.length > 0}\nentries=${changed.join(",")}\n`);
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    const lines = [
      "## Upstream theme sync",
      "",
      `Updated: ${changed.length}`,
      `Kept at the previous commit: ${skipped.length}`,
      ...(skipped.length > 0 ? ["", ...skipped.map(value => `- ${value}`)] : [])
    ];
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `${lines.join("\n")}\n`);
  }
  if (unresolved.length > 0) {
    throw new Error(`new entries could not be resolved:\n${unresolved.join("\n")}`);
  }
  console.log(`${dryRun ? "would update" : "updated"} ${changed.length} theme source${changed.length === 1 ? "" : "s"}; kept ${skipped.length} at the previous commit`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
