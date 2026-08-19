import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { latestGitHubSource } from "../scripts/github-source.mjs";
import {
  githubRepositoryCard,
  isGitHubRepositoryCard,
  renderRepositoryCard,
  shouldPreserveRepositoryCardPreview,
  themeScreenshots
} from "../scripts/theme-screenshots.mjs";
import { pinScreenshotUrl, synchronizedEntry } from "../scripts/sync-sources.mjs";

const source = {
  repository: "https://github.com/example/dsh-theme",
  commit: "0123456789abcdef0123456789abcdef01234567"
};

test("uses the GitHub repository card when screenshots are missing", () => {
  const card = "https://opengraph.githubassets.com/0123456789abcdef0123456789abcdef01234567/example/dsh-theme";
  assert.equal(githubRepositoryCard(source), card);
  assert.equal(isGitHubRepositoryCard(card, source), true);
  assert.equal(isGitHubRepositoryCard(card, { ...source, repository: "https://github.com/example/other" }), false);
  assert.deepEqual(themeScreenshots({ source }), [card]);
  assert.deepEqual(themeScreenshots({ source, screenshots: [] }), [card]);
});

test("keeps submitted screenshots", () => {
  assert.deepEqual(themeScreenshots({ source, screenshots: ["preview.png"] }), ["preview.png"]);
});

test("preserves an existing generated repository card", () => {
  assert.equal(shouldPreserveRepositoryCardPreview({ source }, true), true);
  assert.equal(shouldPreserveRepositoryCardPreview({ source }, false), false);
  assert.equal(shouldPreserveRepositoryCardPreview({ source, screenshots: ["preview.png"] }, true), false);
});

test("pins same-repository screenshots to the synchronized commit", () => {
  const commit = "abcdef0123456789abcdef0123456789abcdef01";
  assert.equal(
    pinScreenshotUrl("https://raw.githubusercontent.com/example/dsh-theme/main/preview.png", source.repository, commit),
    `https://raw.githubusercontent.com/example/dsh-theme/${commit}/preview.png`
  );
  assert.equal(
    pinScreenshotUrl("https://images.example.com/preview.png", source.repository, commit),
    "https://images.example.com/preview.png"
  );
});

test("synchronizes SHA even when the package version is unchanged", () => {
  const entry = {
    package: "dsh-theme",
    version: "1.0.0",
    source: { repository: "https://github.com/example/dsh-theme" },
    screenshots: ["https://opengraph.githubassets.com/old/example/dsh-theme"]
  };
  const latest = {
    commit: "abcdef0123456789abcdef0123456789abcdef01",
    updatedAt: "2026-08-18T12:00:00Z",
    manifest: { name: "dsh-theme", version: "1.0.0", dsh: { client: {} } }
  };
  const result = synchronizedEntry(entry, latest);
  assert.equal(result.source.commit, latest.commit);
  assert.equal(result.version, "1.0.0");
  assert.equal(result.updatedAt, latest.updatedAt);
  assert.equal(result.screenshots[0], `https://opengraph.githubassets.com/${latest.commit}/example/dsh-theme`);
});

test("rejects an upstream package identity change", () => {
  assert.throws(() => synchronizedEntry({
    package: "dsh-theme",
    version: "1.0.0",
    source: { repository: "https://github.com/example/dsh-theme" }
  }, {
    commit: "abcdef0123456789abcdef0123456789abcdef01",
    updatedAt: "2026-08-18T12:00:00Z",
    manifest: { name: "different-package", version: "1.0.0", dsh: { client: {} } }
  }), /package name/);
});

test("resolves the default branch to a full commit SHA", async () => {
  const commit = "abcdef0123456789abcdef0123456789abcdef01";
  const manifest = { name: "dsh-theme", version: "1.0.0", dsh: { client: {} } };
  const responses = [
    { default_branch: "main" },
    { sha: commit, commit: { committer: { date: "2026-08-18T12:00:00Z" } } },
    { encoding: "base64", content: Buffer.from(JSON.stringify(manifest)).toString("base64") }
  ];
  const urls = [];
  const result = await latestGitHubSource({ repository: "https://github.com/example/dsh-theme" }, {
    fetcher: async url => {
      urls.push(url);
      return { ok: true, json: async () => responses.shift() };
    }
  });
  assert.equal(result.commit, commit);
  assert.deepEqual(result.manifest, manifest);
  assert.deepEqual(urls, [
    "https://api.github.com/repos/example/dsh-theme",
    "https://api.github.com/repos/example/dsh-theme/commits/main",
    `https://api.github.com/repos/example/dsh-theme/contents/package.json?ref=${commit}`
  ]);
});

test("renders a decodable local repository card", async () => {
  const card = renderRepositoryCard(source, {
    full_name: "example/dsh-theme",
    name: "dsh-theme",
    description: "A DSH theme",
    stargazers_count: 12,
    forks_count: 3,
    open_issues_count: 1
  });
  const metadata = await sharp(card).metadata();
  assert.equal(metadata.format, "svg");
  assert.equal(metadata.width, 960);
  assert.equal(metadata.height, 540);
});

test("catalog entries pass the offline validator", () => {
  const output = execFileSync(process.execPath, ["scripts/build-catalog.mjs", "--check", "--offline"], {
    cwd: new URL("..", import.meta.url),
    encoding: "utf8"
  });
  if (!output.includes("validated")) throw new Error(`unexpected validator output: ${output}`);
});
